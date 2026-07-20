package org.example.stallrental.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class SignalingHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket connection established: {}", session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        try {
            SignalMessage signal = objectMapper.readValue(payload, SignalMessage.class);
            log.info("Received signaling message: type={}, sender={}, receiver={}", 
                    signal.getType(), signal.getSenderId(), signal.getReceiverId());

            if ("join".equalsIgnoreCase(signal.getType())) {
                if (signal.getSenderId() != null) {
                    userSessions.put(signal.getSenderId(), session);
                    session.getAttributes().put("userId", signal.getSenderId());
                    log.info("User {} joined with WebSocket session {}", signal.getSenderId(), session.getId());
                }
            } else if ("leave".equalsIgnoreCase(signal.getType())) {
                if (signal.getSenderId() != null) {
                    userSessions.remove(signal.getSenderId());
                    log.info("User {} left", signal.getSenderId());
                }
            } else {
                // Forward signaling message (offer, answer, candidate) to the receiver
                String receiverId = signal.getReceiverId();
                if (receiverId != null) {
                    WebSocketSession receiverSession = userSessions.get(receiverId);
                    if (receiverSession != null && receiverSession.isOpen()) {
                        receiverSession.sendMessage(new TextMessage(payload));
                        log.info("Forwarded signal message of type {} to user {}", signal.getType(), receiverId);
                    } else {
                        log.warn("Receiver session for user {} not found or is closed", receiverId);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse signaling message: {}", payload, e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            userSessions.remove(userId);
            log.info("WebSocket connection closed for user {}: {}", userId, session.getId());
        } else {
            log.info("WebSocket connection closed for unknown user: {}", session.getId());
        }
    }

    @Data
    public static class SignalMessage {
        private String type;       // join, offer, answer, candidate, leave
        private String senderId;
        private String receiverId;
        private Object data;       // SDP or Candidate details
    }
}
