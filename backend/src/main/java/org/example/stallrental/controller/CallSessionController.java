package org.example.stallrental.controller;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.CallSession;
import org.example.stallrental.security.principal.UserPrincipal;
import org.example.stallrental.service.CallSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/calls")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class CallSessionController {

    private final CallSessionService callSessionService;

    @GetMapping("/active")
    public ResponseEntity<CallSession> getActiveCall(@AuthenticationPrincipal UserPrincipal principal) {
        return callSessionService.getActiveCall(principal.getUser().getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/start")
    public ResponseEntity<CallSession> startCall(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam Long receiverId,
            @RequestParam String type) {
        return ResponseEntity.ok(callSessionService.startCall(principal.getUser().getId(), receiverId, type));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<CallSession> acceptCall(@PathVariable Long id) {
        return ResponseEntity.ok(callSessionService.acceptCall(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<CallSession> rejectCall(@PathVariable Long id) {
        return ResponseEntity.ok(callSessionService.rejectCall(id));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<CallSession> endCall(@PathVariable Long id) {
        return ResponseEntity.ok(callSessionService.endCall(id));
    }
}
