package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.CallSession;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.repository.CallSessionRepository;
import org.example.stallrental.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CallSessionService {

    private final CallSessionRepository callSessionRepository;
    private final UserRepository userRepository;

    public Optional<CallSession> getActiveCall(Long userId) {
        List<CallSession> activeCalls = callSessionRepository.findActiveCallsForUser(userId);
        return activeCalls.isEmpty() ? Optional.empty() : Optional.of(activeCalls.get(0));
    }

    @Transactional
    public CallSession startCall(Long callerId, Long receiverId, String type) {
        // End any active calls for caller or receiver first
        List<CallSession> callerActive = callSessionRepository.findActiveCallsForUser(callerId);
        for (CallSession c : callerActive) {
            c.setStatus("ENDED");
            callSessionRepository.save(c);
        }
        
        List<CallSession> receiverActive = callSessionRepository.findActiveCallsForUser(receiverId);
        for (CallSession c : receiverActive) {
            c.setStatus("ENDED");
            callSessionRepository.save(c);
        }

        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new RuntimeException("Caller not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        CallSession session = new CallSession();
        session.setCaller(caller);
        session.setReceiver(receiver);
        session.setType(type);
        session.setStatus("RINGING");
        session.setCreatedAt(LocalDateTime.now());

        return callSessionRepository.save(session);
    }

    @Transactional
    public CallSession acceptCall(Long callId) {
        CallSession session = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call session not found"));
        if ("RINGING".equals(session.getStatus())) {
            session.setStatus("CONNECTED");
            session.setConnectedAt(LocalDateTime.now());
            return callSessionRepository.save(session);
        }
        return session;
    }

    @Transactional
    public CallSession rejectCall(Long callId) {
        CallSession session = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call session not found"));
        session.setStatus("REJECTED");
        return callSessionRepository.save(session);
    }

    @Transactional
    public CallSession endCall(Long callId) {
        CallSession session = callSessionRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Call session not found"));
        session.setStatus("ENDED");
        return callSessionRepository.save(session);
    }
}
