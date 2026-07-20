package org.example.stallrental.controller;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.service.AIService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String userPrompt = request.get("message");
        String aiResponse = aiService.getAIResponse(userPrompt);
        return ResponseEntity.ok(Map.of("response", aiResponse));
    }

    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamChat(@RequestBody Map<String, String> request) {
        String userPrompt = request.get("message");
        return aiService.streamAIResponse(userPrompt);
    }
}
