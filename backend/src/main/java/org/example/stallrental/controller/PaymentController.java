package org.example.stallrental.controller;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.Payment;
import org.example.stallrental.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.example.stallrental.security.principal.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(paymentService.getAllForUser(principal));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getById(id));
    }

    @GetMapping("/contract/{contractId}")
    public ResponseEntity<List<Payment>> getByContractId(@PathVariable Long contractId) {
        return ResponseEntity.ok(paymentService.getByContractId(contractId));
    }

    @PostMapping
    public ResponseEntity<Payment> create(@RequestBody Payment payment) {
        return ResponseEntity.ok(paymentService.save(payment));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(@PathVariable Long id, @RequestBody Payment payment) {
        payment.setId(id);
        return ResponseEntity.ok(paymentService.save(payment));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Payment> pay(
            @PathVariable Long id,
            @RequestParam String method,
            @RequestParam(required = false) String note
    ) {
        return ResponseEntity.ok(paymentService.pay(id, method, note));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        paymentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
