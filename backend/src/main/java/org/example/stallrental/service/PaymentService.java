package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Payment;
import org.example.stallrental.model.enumType.PaymentStatus;
import org.example.stallrental.repository.PaymentRepository;
import org.example.stallrental.security.principal.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;

    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }

    public List<Payment> getAllForUser(UserPrincipal principal) {
        if (principal.getUser().getRole() == org.example.stallrental.model.enumType.Role.ROLE_CUSTOMER) {
            return paymentRepository.findByCustomerId(principal.getUser().getId());
        }
        return paymentRepository.findAll();
    }

    public Payment getById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
    }

    public List<Payment> getByContractId(Long contractId) {
        return paymentRepository.findByContractId(contractId);
    }

    public Payment save(Payment payment) {
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }
        if (payment.getStatus() == null) {
            payment.setStatus(PaymentStatus.UNPAID);
        }
        return paymentRepository.save(payment);
    }

    public Payment pay(Long id, String method, String note) {
        Payment payment = getById(id);
        payment.setStatus(PaymentStatus.PAID);
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentMethod(org.example.stallrental.model.enumType.PaymentMethod.valueOf(method));
        if (note != null) {
            payment.setNote(note);
        }
        return paymentRepository.save(payment);
    }

    public void delete(Long id) {
        paymentRepository.deleteById(id);
    }
}
