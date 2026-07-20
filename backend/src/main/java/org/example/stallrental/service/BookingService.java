package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Booking;
import org.example.stallrental.model.entity.Booth;
import org.example.stallrental.model.enumType.BookingStatus;
import org.example.stallrental.model.enumType.BoothStatus;
import org.example.stallrental.repository.BookingRepository;
import org.example.stallrental.repository.BoothRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.example.stallrental.security.principal.UserPrincipal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final BoothRepository boothRepository;
    private final org.example.stallrental.repository.ManagerRepository managerRepository;

    public List<Booking> getAll() {
        return bookingRepository.findAll();
    }

    public List<Booking> getAllForUser(UserPrincipal principal) {
        if (principal.getUser().getRole() == org.example.stallrental.model.enumType.Role.ROLE_CUSTOMER) {
            return bookingRepository.findByCustomerId(principal.getUser().getId());
        }
        if (principal.getUser().getRole() == org.example.stallrental.model.enumType.Role.ROLE_MANAGER) {
            java.util.Optional<org.example.stallrental.model.entity.Manager> managerOpt = managerRepository.findByUserId(principal.getUser().getId());
            if (managerOpt.isPresent()) {
                org.example.stallrental.model.entity.Area managedArea = managerOpt.get().getArea();
                if (managedArea != null) {
                    return bookingRepository.findAll().stream()
                            .filter(b -> b.getBooth() != null && b.getBooth().getArea() != null &&
                                    b.getBooth().getArea().getId().equals(managedArea.getId()))
                            .toList();
                } else {
                    return java.util.Collections.emptyList();
                }
            }
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

        return bookingRepository.save(booking);
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

        return bookingRepository.save(booking);
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
