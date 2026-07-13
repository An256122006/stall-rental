package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Booking;
import org.example.stallrental.model.entity.Booth;
import org.example.stallrental.model.entity.Contract;
import org.example.stallrental.model.entity.Payment;
import org.example.stallrental.model.enumType.BookingStatus;
import org.example.stallrental.model.enumType.BoothStatus;
import org.example.stallrental.model.enumType.ContractStatus;
import org.example.stallrental.model.enumType.PaymentStatus;
import org.example.stallrental.repository.BookingRepository;
import org.example.stallrental.repository.BoothRepository;
import org.example.stallrental.repository.ContractRepository;
import org.example.stallrental.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.stallrental.security.principal.UserPrincipal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BoothRepository boothRepository;
    private final ContractRepository contractRepository;
    private final PaymentRepository paymentRepository;

    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    public List<Booking> getAllForUser(UserPrincipal principal) {
        if (principal.getUser().getRole() == org.example.stallrental.model.enumType.Role.ROLE_CUSTOMER) {
            return bookingRepository.findByCustomerId(principal.getUser().getId());
        }
        return bookingRepository.findAll();
    }

    public Booking getById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    @Transactional
    public Booking save(Booking booking) {
        if (booking.getBookingDate() == null) {
            booking.setBookingDate(LocalDate.now());
        }
        if (booking.getStatus() == null) {
            booking.setStatus(BookingStatus.PENDING);
        }

        // Validate overlapping bookings
        Booth booth = boothRepository.findById(booking.getBooth().getId())
                .orElseThrow(() -> new RuntimeException("Booth not found"));
        
        List<Booking> overlaps = bookingRepository.findOverlappingBookings(
                booth.getId(),
                booking.getStartDate(),
                booking.getEndDate(),
                BookingStatus.CANCELLED
        );

        // Exclude current booking if we are updating it
        boolean hasOverlap = overlaps.stream()
                .anyMatch(b -> !b.getId().equals(booking.getId()));

        if (hasOverlap) {
            throw new RuntimeException("Booth is already reserved or rented for the selected dates!");
        }

        // Update booth status if booking is confirmed
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            booth.setStatus(BoothStatus.RESERVED);
            boothRepository.save(booth);
        }

        Booking savedBooking = bookingRepository.save(booking);
        if (savedBooking.getStatus() == BookingStatus.CONFIRMED) {
            createContractForBooking(savedBooking);
        }
        return savedBooking;
    }

    @Transactional
    public Booking updateStatus(Long id, BookingStatus status) {
        Booking booking = getById(id);
        booking.setStatus(status);

        Booth booth = booking.getBooth();
        if (status == BookingStatus.CANCELLED) {
            // Free the booth
            booth.setStatus(BoothStatus.AVAILABLE);
            boothRepository.save(booth);
        } else if (status == BookingStatus.CONFIRMED) {
            booth.setStatus(BoothStatus.RESERVED);
            boothRepository.save(booth);
        } else if (status == BookingStatus.COMPLETED) {
            booth.setStatus(BoothStatus.RENTED);
            boothRepository.save(booth);
        }

        Booking savedBooking = bookingRepository.save(booking);
        if (status == BookingStatus.CONFIRMED) {
            createContractForBooking(savedBooking);
        }
        return savedBooking;
    }

    private void createContractForBooking(Booking booking) {
        if (contractRepository.findByBookingId(booking.getId()).isPresent()) {
            return;
        }

        Contract contract = new Contract();
        contract.setBooking(booking);
        contract.setContractCode("HD-" + System.currentTimeMillis());
        contract.setStartDate(booking.getStartDate());
        contract.setEndDate(booking.getEndDate());
        contract.setRentPrice(booking.getBooth().getRentPrice());
        contract.setDeposit(booking.getDeposit());
        contract.setStatus(ContractStatus.ACTIVE);
        contract.setCreatedAt(LocalDateTime.now());
        
        Contract saved = contractRepository.save(contract);

        // Update booth status to RENTED
        Booth booth = booking.getBooth();
        booth.setStatus(BoothStatus.RENTED);
        boothRepository.save(booth);

        // Create initial payments
        // Deposit payment
        if (saved.getDeposit() != null && saved.getDeposit().compareTo(java.math.BigDecimal.ZERO) > 0) {
            Payment depositPayment = new Payment();
            depositPayment.setContract(saved);
            depositPayment.setAmount(saved.getDeposit());
            depositPayment.setPaymentDate(saved.getStartDate());
            depositPayment.setStatus(PaymentStatus.UNPAID);
            depositPayment.setNote("Tiền đặt cọc hợp đồng " + saved.getContractCode());
            paymentRepository.save(depositPayment);
        }

        // Rent payment
        if (saved.getRentPrice() != null && saved.getRentPrice().compareTo(java.math.BigDecimal.ZERO) > 0) {
            Payment rentPayment = new Payment();
            rentPayment.setContract(saved);
            rentPayment.setAmount(saved.getRentPrice());
            rentPayment.setPaymentDate(saved.getStartDate());
            rentPayment.setStatus(PaymentStatus.UNPAID);
            rentPayment.setNote("Tiền thuê kỳ 1 hợp đồng " + saved.getContractCode());
            paymentRepository.save(rentPayment);
        }
    }

    @Transactional
    public void delete(Long id) {
        Booking booking = getById(id);
        Booth booth = booking.getBooth();
        booth.setStatus(BoothStatus.AVAILABLE);
        boothRepository.save(booth);
        bookingRepository.deleteById(id);
    }
}
