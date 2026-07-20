package org.example.stallrental;

import org.example.stallrental.model.entity.Booking;
import org.example.stallrental.model.entity.Manager;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.repository.BookingRepository;
import org.example.stallrental.repository.ManagerRepository;
import org.example.stallrental.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class InspectDbTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    public void inspect() {
        System.out.println("=== SYSTEM USERS ===");
        List<User> users = userRepository.findAll();
        for (User u : users) {
            System.out.println(String.format("User: id=%d, username=%s, role=%s, name=%s", u.getId(), u.getUsername(), u.getRole(), u.getFullName()));
        }

        System.out.println("=== SYSTEM MANAGERS ===");
        List<Manager> managers = managerRepository.findAll();
        for (Manager m : managers) {
            System.out.println(String.format("Manager: id=%d, username=%s, area=%s", m.getId(), m.getUser().getUsername(), m.getArea() != null ? m.getArea().getName() : "None"));
        }

        System.out.println("=== SYSTEM BOOKINGS ===");
        List<Booking> bookings = bookingRepository.findAll();
        for (Booking b : bookings) {
            System.out.println(String.format("Booking: id=%d, customer=%s, booth=%s, area=%s, status=%s", 
                    b.getId(), 
                    b.getCustomer().getUsername(), 
                    b.getBooth() != null ? b.getBooth().getCode() : "None", 
                    b.getBooth() != null && b.getBooth().getArea() != null ? b.getBooth().getArea().getName() : "None",
                    b.getStatus()));
        }
    }

    @Autowired
    private org.example.stallrental.repository.CallSessionRepository callSessionRepository;

    @Test
    public void testCallSession() {
        System.out.println("Testing CallSession repository...");
        List<User> users = userRepository.findAll();
        if (users.size() >= 2) {
            User caller = users.get(0);
            User receiver = users.get(1);
            
            org.example.stallrental.model.entity.CallSession session = new org.example.stallrental.model.entity.CallSession();
            session.setCaller(caller);
            session.setReceiver(receiver);
            session.setType("VIDEO");
            session.setStatus("RINGING");
            session.setCreatedAt(java.time.LocalDateTime.now());
            
            org.example.stallrental.model.entity.CallSession saved = callSessionRepository.save(session);
            System.out.println("Saved call session ID: " + saved.getId());
            
            List<org.example.stallrental.model.entity.CallSession> activeCaller = callSessionRepository.findActiveCallsForUser(caller.getId());
            System.out.println("Active calls for caller: " + activeCaller.size());
            
            List<org.example.stallrental.model.entity.CallSession> activeReceiver = callSessionRepository.findActiveCallsForUser(receiver.getId());
            System.out.println("Active calls for receiver: " + activeReceiver.size());
            
            callSessionRepository.delete(saved);
        }
    }
}
