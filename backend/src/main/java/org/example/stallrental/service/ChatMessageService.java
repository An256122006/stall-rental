package org.example.stallrental.service;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.*;
import org.example.stallrental.model.enumType.Role;
import org.example.stallrental.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ManagerRepository managerRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public List<ChatMessage> getChatHistory(Long user1Id, Long user2Id) {
        return chatMessageRepository.findChatHistory(user1Id, user2Id);
    }

    @Transactional
    public ChatMessage sendMessage(Long senderId, Long receiverId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = new ChatMessage();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = chatMessageRepository.save(message);

        // Create a notification for the receiver
        Notification notification = new Notification();
        notification.setUser(receiver);
        notification.setTitle("Tin nhắn mới từ " + sender.getFullName());
        String preview = content.length() > 50 ? content.substring(0, 47) + "..." : content;
        notification.setContent(preview);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationService.save(notification);

        return savedMessage;
    }

    public List<User> getChatContacts(User currentUser) {
        List<User> contacts = new ArrayList<>();

        if (currentUser.getRole() == Role.ROLE_CUSTOMER) {
            // In customer chat: show accounts with ROLE_MANAGER
            List<User> managers = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ROLE_MANAGER)
                    .toList();
            contacts.addAll(managers);
        } else if (currentUser.getRole() == Role.ROLE_MANAGER) {
            // In manager chat: show admin accounts and customer accounts renting in their managed area
            List<User> admins = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ROLE_ADMIN)
                    .toList();
            contacts.addAll(admins);

            Optional<Manager> managerOpt = managerRepository.findByUserId(currentUser.getId());
            if (managerOpt.isPresent()) {
                Long areaId = managerOpt.get().getArea() != null ? managerOpt.get().getArea().getId() : null;
                if (areaId != null) {
                    List<Booking> bookings = bookingRepository.findAll().stream()
                            .filter(b -> b.getBooth() != null && b.getBooth().getArea() != null &&
                                    b.getBooth().getArea().getId().equals(areaId))
                            .toList();
                    Set<User> customers = bookings.stream()
                            .map(Booking::getCustomer)
                            .collect(Collectors.toSet());
                    contacts.addAll(customers.stream()
                            .filter(c -> !contacts.contains(c))
                            .toList());
                }
            }
        } else if (currentUser.getRole() == Role.ROLE_ADMIN) {
            // In admin chat: show all accounts except themselves
            List<User> allUsers = userRepository.findAll();
            List<User> activeContacts = allUsers.stream()
                    .filter(u -> !u.getId().equals(currentUser.getId()))
                    .toList();
            contacts.addAll(activeContacts);
        }

        return contacts;
    }
}
