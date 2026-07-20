package org.example.stallrental.controller;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.ChatMessage;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.security.principal.UserPrincipal;
import org.example.stallrental.service.ChatMessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @GetMapping
    public ResponseEntity<List<ChatMessage>> getHistory(
            @RequestParam Long contactId,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(chatMessageService.getChatHistory(principal.getUser().getId(), contactId));
    }

    @PostMapping
    public ResponseEntity<ChatMessage> sendMessage(
            @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(chatMessageService.sendMessage(
                principal.getUser().getId(),
                request.getReceiverId(),
                request.getContent()
        ));
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<User>> getContacts(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(chatMessageService.getChatContacts(principal.getUser()));
    }

    @Data
    public static class MessageRequest {
        private Long receiverId;
        private String content;
    }
}
