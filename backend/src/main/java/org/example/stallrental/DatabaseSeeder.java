package org.example.stallrental;

import lombok.RequiredArgsConstructor;
import org.example.stallrental.model.entity.*;
import org.example.stallrental.model.enumType.*;
import org.example.stallrental.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final AreaRepository areaRepository;
    private final BoothRepository boothRepository;
    private final UserRepository userRepository;
    private final ManagerRepository managerRepository;
    private final BookingRepository bookingRepository;
    private final ContractRepository contractRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Areas if empty
        if (areaRepository.count() == 0) {
            System.out.println("Seeding default Areas...");
            Area areaA = new Area(null, "Khu A - Tầng Trệt", "Khu thời trang, mỹ phẩm và trang sức cao cấp", true);
            Area areaB = new Area(null, "Khu B - Tầng 1", "Khu ẩm thực, nhà hàng ăn uống và cà phê", true);
            Area areaC = new Area(null, "Khu C - Tầng 2", "Khu siêu thị gia dụng, đồ chơi điện tử và công nghệ", true);
            Area areaD = new Area(null, "Khu D - Ngoài Trời", "Khu ẩm thực đường phố, hội chợ và sự kiện ngắn hạn", true);

            areaRepository.saveAll(List.of(areaA, areaB, areaC, areaD));
        }

        // 2. Seed Booths if empty
        if (boothRepository.count() == 0) {
            System.out.println("Seeding default Booths...");
            List<Area> areas = areaRepository.findAll();
            Area areaA = areas.stream().filter(a -> a.getName().contains("Khu A")).findFirst().orElse(null);
            Area areaB = areas.stream().filter(a -> a.getName().contains("Khu B")).findFirst().orElse(null);
            Area areaC = areas.stream().filter(a -> a.getName().contains("Khu C")).findFirst().orElse(null);
            Area areaD = areas.stream().filter(a -> a.getName().contains("Khu D")).findFirst().orElse(null);

            if (areaA != null) {
                boothRepository.save(new Booth(null, "GH-A01", "Gian hàng Thời trang Converse", areaA, 25.0, BigDecimal.valueOf(8000000), BigDecimal.valueOf(500000), BoothStatus.AVAILABLE, null, "Vị trí gần cửa ra vào chính."));
                boothRepository.save(new Booth(null, "GH-A02", "Gian hàng Mỹ phẩm Shiseido", areaA, 15.5, BigDecimal.valueOf(6000000), BigDecimal.valueOf(300000), BoothStatus.AVAILABLE, null, "Phù hợp kinh doanh mỹ phẩm, trưng bày nhỏ."));
                boothRepository.save(new Booth(null, "GH-A03", "Gian hàng Trang sức PNJ", areaA, 20.0, BigDecimal.valueOf(10000000), BigDecimal.valueOf(600000), BoothStatus.AVAILABLE, null, "Mặt tiền lớn hướng sảnh phụ."));
                boothRepository.save(new Booth(null, "GH-A04", "Gian hàng Adidas Sport", areaA, 50.0, BigDecimal.valueOf(18000000), BigDecimal.valueOf(1000000), BoothStatus.AVAILABLE, null, "Gian hàng góc rộng 2 mặt tiền."));
                boothRepository.save(new Booth(null, "GH-A05", "Gian hàng Nike Outlet", areaA, 45.0, BigDecimal.valueOf(16000000), BigDecimal.valueOf(800000), BoothStatus.AVAILABLE, null, "Vị trí sát cầu thang cuốn."));
            }

            if (areaB != null) {
                boothRepository.save(new Booth(null, "GH-B01", "Nhà hàng Kichi Kichi", areaB, 80.0, BigDecimal.valueOf(25000000), BigDecimal.valueOf(2000000), BoothStatus.AVAILABLE, null, "Có hệ thống hút mùi và bếp sẵn."));
                boothRepository.save(new Booth(null, "GH-B02", "Quầy trà sữa Gong Cha", areaB, 15.0, BigDecimal.valueOf(7000000), BigDecimal.valueOf(500000), BoothStatus.AVAILABLE, null, "Khu vực sảnh ẩm thực đông đúc."));
                boothRepository.save(new Booth(null, "GH-B03", "Cà phê Highland Coffee", areaB, 60.0, BigDecimal.valueOf(20000000), BigDecimal.valueOf(1500000), BoothStatus.AVAILABLE, null, "Gần sảnh ngồi chung của tầng."));
                boothRepository.save(new Booth(null, "GH-B04", "Quầy Bánh mì Minh Nhật", areaB, 12.0, BigDecimal.valueOf(5000000), BigDecimal.valueOf(300000), BoothStatus.AVAILABLE, null, "Quầy kiosk nhỏ gọn."));
                boothRepository.save(new Booth(null, "GH-B05", "Quầy gà rán KFC", areaB, 75.0, BigDecimal.valueOf(22000000), BigDecimal.valueOf(1800000), BoothStatus.AVAILABLE, null, "Vị trí đắc địa cạnh khu vui chơi."));
            }

            if (areaC != null) {
                boothRepository.save(new Booth(null, "GH-C01", "Cửa hàng Đồ chơi My Kingdom", areaC, 40.0, BigDecimal.valueOf(12000000), BigDecimal.valueOf(800000), BoothStatus.AVAILABLE, null, "Trưng bày đồ chơi trẻ em."));
                boothRepository.save(new Booth(null, "GH-C02", "Điện máy xanh mini", areaC, 100.0, BigDecimal.valueOf(30000000), BigDecimal.valueOf(2500000), BoothStatus.AVAILABLE, null, "Gian hàng siêu rộng mặt tiền sảnh điện máy."));
                boothRepository.save(new Booth(null, "GH-C03", "Phụ kiện điện thoại Anker", areaC, 10.0, BigDecimal.valueOf(4500000), BigDecimal.valueOf(200000), BoothStatus.AVAILABLE, null, "Kiosk kính trưng bày."));
                boothRepository.save(new Booth(null, "GH-C04", "Nhà sách Fahasa", areaC, 90.0, BigDecimal.valueOf(20000000), BigDecimal.valueOf(1200000), BoothStatus.AVAILABLE, null, "Khu vực yên tĩnh cạnh sảnh nghỉ."));
                boothRepository.save(new Booth(null, "GH-C05", "Đồ gia dụng Lock&Lock", areaC, 55.0, BigDecimal.valueOf(15000000), BigDecimal.valueOf(900000), BoothStatus.AVAILABLE, null, "Gian hàng trưng bày đồ gia dụng cao cấp."));
            }

            if (areaD != null) {
                boothRepository.save(new Booth(null, "GH-D01", "Kiosk Kem Tràng Tiền", areaD, 8.0, BigDecimal.valueOf(3500000), BigDecimal.valueOf(150000), BoothStatus.AVAILABLE, null, "Kiosk di động ngoài trời."));
                boothRepository.save(new Booth(null, "GH-D02", "Bánh tráng nướng Đà Lạt", areaD, 6.0, BigDecimal.valueOf(3000000), BigDecimal.valueOf(100000), BoothStatus.AVAILABLE, null, "Xe đẩy ẩm thực di động."));
                boothRepository.save(new Booth(null, "GH-D03", "Kiosk Nước mía cốt dừa", areaD, 6.0, BigDecimal.valueOf(3000000), BigDecimal.valueOf(100000), BoothStatus.AVAILABLE, null, "Phục vụ giải khát ngoài trời."));
                boothRepository.save(new Booth(null, "GH-D04", "Sân khấu Hội chợ Xuân", areaD, 150.0, BigDecimal.valueOf(45000000), BigDecimal.valueOf(5000000), BoothStatus.AVAILABLE, null, "Không gian biểu diễn sự kiện."));
                boothRepository.save(new Booth(null, "GH-D05", "Xe đồ nướng Xiên que", areaD, 8.0, BigDecimal.valueOf(4000000), BigDecimal.valueOf(200000), BoothStatus.AVAILABLE, null, "Khu phố đi bộ ngoài trời."));
            }
        }

        // 3. Seed Users if empty
        if (userRepository.count() == 0) {
            System.out.println("Seeding default Users...");
            
            // Seed Admin User
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@stallrental.com");
            admin.setFullName("Ban Quản Lý Trung Tâm");
            admin.setPhone("0988888888");
            admin.setAddress("Trung tâm Thương mại Stall Rental");
            admin.setTaxCode("0102030405");
            admin.setIdentityNumber("079090000001");
            admin.setRole(Role.ROLE_ADMIN);
            admin.setStatus(true);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);

            // Seed Customer User
            User customerUser = new User();
            customerUser.setUsername("customer");
            customerUser.setPassword(passwordEncoder.encode("customer123"));
            customerUser.setEmail("customer@gmail.com");
            customerUser.setFullName("Nguyễn Văn A - Thời trang Converse");
            customerUser.setPhone("0912345678");
            customerUser.setAddress("123 Đường Lê Lợi, Quận 1, TP. HCM");
            customerUser.setTaxCode("0102030405");
            customerUser.setIdentityNumber("079090123456");
            customerUser.setRole(Role.ROLE_CUSTOMER);
            customerUser.setStatus(true);
            customerUser.setCreatedAt(LocalDateTime.now());
            userRepository.save(customerUser);

            // Seed Manager User
            User managerUser = new User();
            managerUser.setUsername("manager");
            managerUser.setPassword(passwordEncoder.encode("manager123"));
            managerUser.setEmail("manager@stallrental.com");
            managerUser.setFullName("Nguyễn Văn Quản Lý");
            managerUser.setPhone("0977777777");
            managerUser.setAddress("Khu A - Tầng Trệt");
            managerUser.setRole(Role.ROLE_MANAGER);
            managerUser.setStatus(true);
            managerUser.setCreatedAt(LocalDateTime.now());
            userRepository.save(managerUser);

            // Fetch Area 1 (Khu A)
            List<Area> areas = areaRepository.findAll();
            Area areaA = areas.stream().filter(a -> a.getName().contains("Khu A")).findFirst().orElse(null);

            if (areaA != null) {
                Manager manager = new Manager();
                manager.setUser(managerUser);
                manager.setArea(areaA);
                managerRepository.save(manager);

                // Fetch Booth GH-A01
                List<Booth> booths = boothRepository.findAll();
                Booth boothA01 = booths.stream().filter(b -> b.getCode().equals("GH-A01")).findFirst().orElse(null);

                if (boothA01 != null && bookingRepository.count() == 0) {
                    Booking booking = new Booking();
                    booking.setCustomer(customerUser);
                    booking.setBooth(boothA01);
                    booking.setBookingDate(LocalDate.now());
                    booking.setStartDate(LocalDate.now().minusDays(5));
                    booking.setEndDate(LocalDate.now().plusMonths(6));
                    booking.setDeposit(BigDecimal.valueOf(1000000));
                    booking.setTotalPrice(BigDecimal.valueOf(8000000));
                    booking.setStatus(BookingStatus.CONFIRMED);
                    bookingRepository.save(booking);

                    Contract contract = new Contract();
                    contract.setContractCode("HD-A01-0001");
                    contract.setBooking(booking);
                    contract.setStartDate(booking.getStartDate());
                    contract.setEndDate(booking.getEndDate());
                    contract.setRentPrice(booking.getTotalPrice());
                    contract.setDeposit(booking.getDeposit());
                    contract.setStatus(ContractStatus.ACTIVE);
                    contract.setCreatedAt(LocalDateTime.now());
                    contractRepository.save(contract);
                }
            }
        }

        // Fix local database inconsistencies for managers
        userRepository.findByUsername("manager").ifPresent(managerUserObj -> {
            if (managerUserObj.getRole() == Role.ROLE_MANAGER) {
                if (managerRepository.findByUserId(managerUserObj.getId()).isEmpty()) {
                    System.out.println("Self-Healing Database: Creating Manager record for user 'manager'...");
                    Area areaA = areaRepository.findAll().stream()
                            .filter(a -> a.getName().contains("Khu A"))
                            .findFirst().orElse(null);
                    if (areaA != null) {
                        managerRepository.findByAreaId(areaA.getId()).ifPresent(m -> {
                            System.out.println("Self-Healing: Removing mismatched manager: " + m.getUser().getUsername());
                            managerRepository.delete(m);
                        });

                        Manager manager = new Manager();
                        manager.setUser(managerUserObj);
                        manager.setArea(areaA);
                        managerRepository.save(manager);
                    }
                }
            }
        });
    }
}
