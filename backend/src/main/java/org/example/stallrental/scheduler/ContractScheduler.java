package org.example.stallrental.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stallrental.model.entity.Contract;
import org.example.stallrental.model.entity.Notification;
import org.example.stallrental.model.entity.User;
import org.example.stallrental.model.enumType.ContractStatus;
import org.example.stallrental.model.enumType.Role;
import org.example.stallrental.repository.ContractRepository;
import org.example.stallrental.repository.NotificationRepository;
import org.example.stallrental.repository.UserRepository;
import org.example.stallrental.service.ContractService;
import org.example.stallrental.service.NotificationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContractScheduler {

    private final ContractRepository contractRepository;
    private final ContractService contractService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    // Quét định kỳ mỗi giờ
    // Sử dụng fixedDelay để chạy sau mỗi 1 giờ
    @Scheduled(fixedDelay = 3600000)
    public void scanContracts() {
        log.info("Bắt đầu quét thời hạn hợp đồng: {}", LocalDateTime.now());
        LocalDate today = LocalDate.now();

        // 1. Quét các hợp đồng đã quá hạn để tự động thanh lý (ACTIVE và ngày kết thúc trước ngày hôm nay)
        List<Contract> expiredContracts = contractRepository.findByStatusAndEndDateBefore(ContractStatus.ACTIVE, today);
        for (Contract contract : expiredContracts) {
            try {
                log.info("Tự động thanh lý hợp đồng số {} do hết hạn ngày {}", contract.getContractCode(), contract.getEndDate());
                
                // Cập nhật trạng thái thành TERMINATED
                contract.setStatus(ContractStatus.TERMINATED);
                contractService.save(contract); // Sẽ tự động giải phóng gian hàng (Status = AVAILABLE)

                // Tạo thông báo cho khách thuê
                User customer = contract.getBooking().getCustomer();
                if (customer != null) {
                    sendNotification(
                        customer,
                        "Hợp đồng số " + contract.getContractCode() + " đã tự động thanh lý",
                        "Hợp đồng thuê gian hàng " + contract.getBooking().getBooth().getCode() +
                                " của quý khách đã tự động thanh lý do hết thời hạn thuê vào ngày " + contract.getEndDate() + "."
                    );
                }

                // Tạo thông báo cho Admin & Manager
                List<User> staffUsers = userRepository.findAll().stream()
                        .filter(u -> u.getRole() == Role.ROLE_ADMIN || u.getRole() == Role.ROLE_MANAGER)
                        .toList();
                
                for (User staff : staffUsers) {
                    sendNotification(
                        staff,
                        "Hợp đồng " + contract.getContractCode() + " đã tự động thanh lý",
                        "Hợp đồng số " + contract.getContractCode() + " của khách thuê " +
                                (customer != null ? customer.getFullName() : "N/A") + " tại gian hàng " +
                                contract.getBooking().getBooth().getCode() + " đã tự động thanh lý do hết thời hạn thuê."
                    );
                }
            } catch (Exception e) {
                log.error("Lỗi khi tự động thanh lý hợp đồng {}: {}", contract.getContractCode(), e.getMessage());
            }
        }

        // 2. Nhắc nhở trước 1 ngày khi hợp đồng sắp hết hạn (ACTIVE và ngày kết thúc là ngày mai)
        LocalDate tomorrow = today.plusDays(1);
        List<Contract> expiringTomorrowContracts = contractRepository.findByStatusAndEndDateBefore(ContractStatus.ACTIVE, tomorrow.plusDays(1))
                .stream()
                .filter(c -> c.getEndDate().equals(tomorrow))
                .toList();

        for (Contract contract : expiringTomorrowContracts) {
            try {
                User customer = contract.getBooking().getCustomer();
                if (customer != null) {
                    String title = "Hợp đồng " + contract.getContractCode() + " sắp hết hạn";
                    if (!isNotificationAlreadySent(customer, title)) {
                        sendNotification(
                            customer,
                            title,
                            "Hợp đồng thuê gian hàng " + contract.getBooking().getBooth().getCode() +
                                    " của quý khách sẽ hết hạn vào ngày mai (" + contract.getEndDate() +
                                    "). Quý khách vui lòng liên hệ Ban quản lý để làm thủ tục gia hạn hoặc bàn giao mặt bằng."
                        );
                        log.info("Đã gửi thông báo nhắc nhở trước 1 ngày cho khách thuê của hợp đồng {}", contract.getContractCode());
                    }
                }

                // Nhắc nhở cho Ban quản lý (Admin & Manager)
                List<User> staffUsers = userRepository.findAll().stream()
                        .filter(u -> u.getRole() == Role.ROLE_ADMIN || u.getRole() == Role.ROLE_MANAGER)
                        .toList();

                for (User staff : staffUsers) {
                    String title = "Hợp đồng " + contract.getContractCode() + " sắp hết hạn";
                    if (!isNotificationAlreadySent(staff, title)) {
                        sendNotification(
                            staff,
                            title,
                            "Hợp đồng số " + contract.getContractCode() + " của khách thuê " +
                                    (customer != null ? customer.getFullName() : "N/A") + " tại gian hàng " +
                                    contract.getBooking().getBooth().getCode() + " sẽ hết hạn vào ngày mai (" + contract.getEndDate() + ")."
                        );
                    }
                }
            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo nhắc nhở hợp đồng {}: {}", contract.getContractCode(), e.getMessage());
            }
        }
    }

    private void sendNotification(User user, String title, String content) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notificationService.save(notification);
    }

    private boolean isNotificationAlreadySent(User user, String title) {
        List<Notification> notifications = notificationRepository.findByUserId(user.getId());
        return notifications.stream().anyMatch(n -> n.getTitle().equals(title));
    }
}
