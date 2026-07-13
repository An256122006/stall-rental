package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Booking;
import org.example.stallrental.model.entity.Booth;
import org.example.stallrental.model.entity.Contract;
import org.example.stallrental.model.entity.Payment;
import org.example.stallrental.model.enumType.BoothStatus;
import org.example.stallrental.model.enumType.ContractStatus;
import org.example.stallrental.model.enumType.PaymentStatus;
import org.example.stallrental.repository.BoothRepository;
import org.example.stallrental.repository.ContractRepository;
import org.example.stallrental.repository.PaymentRepository;
import org.example.stallrental.security.principal.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractService {
    private final ContractRepository contractRepository;
    private final BoothRepository boothRepository;
    private final PaymentRepository paymentRepository;

    public List<Contract> getAll() {
        return contractRepository.findAll();
    }

    public List<Contract> getAllForUser(UserPrincipal principal) {
        if (principal.getUser().getRole() == org.example.stallrental.model.enumType.Role.ROLE_CUSTOMER) {
            return contractRepository.findByCustomerId(principal.getUser().getId());
        }
        return contractRepository.findAll();
    }

    public Contract getById(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found with id: " + id));
    }

    @Transactional
    public Contract save(Contract contract) {
        if (contract.getContractCode() == null || contract.getContractCode().trim().isEmpty()) {
            contract.setContractCode("HD-" + System.currentTimeMillis());
        }
        if (contract.getCreatedAt() == null) {
            contract.setCreatedAt(LocalDateTime.now());
        }
        if (contract.getStatus() == null) {
            contract.setStatus(ContractStatus.DRAFT);
        }

        Contract saved = contractRepository.save(contract);

        if (saved.getStatus() == ContractStatus.ACTIVE) {
            // Update booth status to RENTED
            Booking booking = saved.getBooking();
            if (booking != null && booking.getBooth() != null) {
                Booth booth = booking.getBooth();
                booth.setStatus(BoothStatus.RENTED);
                boothRepository.save(booth);
            }

            // Create initial payment request if not already present
            List<Payment> existingPayments = paymentRepository.findByContractId(saved.getId());
            if (existingPayments.isEmpty()) {
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
        }
        return saved;
    }

    @Transactional
    public Contract updateStatus(Long id, ContractStatus status) {
        Contract contract = getById(id);
        contract.setStatus(status);
        return save(contract);
    }

    @Transactional
    public void delete(Long id) {
        Contract contract = getById(id);
        Booking booking = contract.getBooking();
        if (booking != null && booking.getBooth() != null) {
            Booth booth = booking.getBooth();
            booth.setStatus(BoothStatus.AVAILABLE);
            boothRepository.save(booth);
        }
        contractRepository.deleteById(id);
    }
}
