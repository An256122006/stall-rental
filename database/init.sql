-- Create Database
CREATE DATABASE IF NOT EXISTS `stall_rental` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `stall_rental`;

-- Table structure for table `area`
CREATE TABLE IF NOT EXISTS `area` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `status` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `booth`
CREATE TABLE IF NOT EXISTS `booth` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `area_id` bigint DEFAULT NULL,
  `size` double NOT NULL,
  `rent_price` decimal(19,2) NOT NULL,
  `service_fee` decimal(19,2) DEFAULT '0.00',
  `status` varchar(50) NOT NULL DEFAULT 'AVAILABLE',
  `image` varchar(255) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_booth_area` FOREIGN KEY (`area_id`) REFERENCES `area` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `user`
CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `tax_code` varchar(50) DEFAULT NULL,
  `identity_number` varchar(50) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'ROLE_CUSTOMER',
  `status` bit(1) NOT NULL DEFAULT b'1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `booking`
CREATE TABLE IF NOT EXISTS `booking` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `booth_id` bigint DEFAULT NULL,
  `booking_date` date DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `deposit` decimal(19,2) DEFAULT NULL,
  `total_price` decimal(19,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `note` text,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_booking_booth` FOREIGN KEY (`booth_id`) REFERENCES `booth` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `contract`
CREATE TABLE IF NOT EXISTS `contract` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract_code` varchar(100) NOT NULL UNIQUE,
  `booking_id` bigint DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `rent_price` decimal(19,2) NOT NULL,
  `deposit` decimal(19,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'DRAFT',
  `contract_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_contract_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `payment`
CREATE TABLE IF NOT EXISTS `payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `contract_id` bigint DEFAULT NULL,
  `amount` decimal(19,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'UNPAID',
  `note` text,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_payment_contract` FOREIGN KEY (`contract_id`) REFERENCES `contract` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `maintenance_request`
CREATE TABLE IF NOT EXISTS `maintenance_request` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `booth_id` bigint DEFAULT NULL,
  `user_id` bigint DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` varchar(50) NOT NULL DEFAULT 'MEDIUM',
  `status` varchar(50) NOT NULL DEFAULT 'NEW',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `completed_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_maintenance_booth` FOREIGN KEY (`booth_id`) REFERENCES `booth` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_maintenance_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed default Areas
INSERT INTO `area` (`id`, `name`, `description`, `status`) VALUES
(1, 'Khu A - Tầng Trệt', 'Khu thời trang, mỹ phẩm và trang sức cao cấp', b'1'),
(2, 'Khu B - Tầng 1', 'Khu ẩm thực, nhà hàng ăn uống và cà phê', b'1'),
(3, 'Khu C - Tầng 2', 'Khu siêu thị gia dụng, đồ chơi điện tử và công nghệ', b'1'),
(4, 'Khu D - Ngoài Trời', 'Khu ẩm thực đường phố, hội chợ và sự kiện ngắn hạn', b'1')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`);

-- Seed default Booths
INSERT INTO `booth` (`code`, `name`, `area_id`, `size`, `rent_price`, `service_fee`, `status`, `image`, `description`) VALUES
('GH-A01', 'Gian hàng Thời trang Converse', 1, 25.0, 8000000.00, 500000.00, 'AVAILABLE', NULL, 'Vị trí gần cửa ra vào chính.'),
('GH-A02', 'Gian hàng Mỹ phẩm Shiseido', 1, 15.5, 6000000.00, 300000.00, 'AVAILABLE', NULL, 'Phù hợp kinh doanh mỹ phẩm, trưng bày nhỏ.'),
('GH-A03', 'Gian hàng Trang sức PNJ', 1, 20.0, 10000000.00, 600000.00, 'AVAILABLE', NULL, 'Mặt tiền lớn hướng sảnh phụ.'),
('GH-A04', 'Gian hàng Adidas Sport', 1, 50.0, 18000000.00, 1000000.00, 'AVAILABLE', NULL, 'Gian hàng góc rộng 2 mặt tiền.'),
('GH-A05', 'Gian hàng Nike Outlet', 1, 45.0, 16000000.00, 800000.00, 'AVAILABLE', NULL, 'Vị trí sát cầu thang cuốn.'),
('GH-B01', 'Nhà hàng Kichi Kichi', 2, 80.0, 25000000.00, 2000000.00, 'AVAILABLE', NULL, 'Có hệ thống hút mùi và bếp sẵn.'),
('GH-B02', 'Quầy trà sữa Gong Cha', 2, 15.0, 7000000.00, 500000.00, 'AVAILABLE', NULL, 'Khu vực sảnh ẩm thực đông đúc.'),
('GH-B03', 'Cà phê Highland Coffee', 2, 60.0, 20000000.00, 1500000.00, 'AVAILABLE', NULL, 'Gần sảnh ngồi chung của tầng.'),
('GH-B04', 'Quầy Bánh mì Minh Nhật', 2, 12.0, 5000000.00, 300000.00, 'AVAILABLE', NULL, 'Quầy kiosk nhỏ gọn.'),
('GH-B05', 'Quầy gà rán KFC', 2, 75.0, 22000000.00, 1800000.00, 'AVAILABLE', NULL, 'Vị trí đắc địa cạnh khu vui chơi.'),
('GH-C01', 'Cửa hàng Đồ chơi My Kingdom', 3, 40.0, 12000000.00, 800000.00, 'AVAILABLE', NULL, 'Trưng bày đồ chơi trẻ em.'),
('GH-C02', 'Điện máy xanh mini', 3, 100.0, 30000000.00, 2500000.00, 'AVAILABLE', NULL, 'Gian hàng siêu rộng mặt tiền sảnh điện máy.'),
('GH-C03', 'Phụ kiện điện thoại Anker', 3, 10.0, 4500000.00, 200000.00, 'AVAILABLE', NULL, 'Kiosk kính trưng bày.'),
('GH-C04', 'Nhà sách Fahasa', 3, 90.0, 20000000.00, 1200000.00, 'AVAILABLE', NULL, 'Khu vực yên tĩnh cạnh sảnh nghỉ.'),
('GH-C05', 'Đồ gia dụng Lock&Lock', 3, 55.0, 15000000.00, 900000.00, 'AVAILABLE', NULL, 'Gian hàng trưng bày đồ gia dụng cao cấp.'),
('GH-D01', 'Kiosk Kem Tràng Tiền', 4, 8.0, 3500000.00, 150000.00, 'AVAILABLE', NULL, 'Kiosk di động ngoài trời.'),
('GH-D02', 'Bánh tráng nướng Đà Lạt', 4, 6.0, 3000000.00, 100000.00, 'AVAILABLE', NULL, 'Xe đẩy ẩm thực di động.'),
('GH-D03', 'Kiosk Nước mía cốt dừa', 4, 6.0, 3000000.00, 100000.00, 'AVAILABLE', NULL, 'Phục vụ giải khát ngoài trời.'),
('GH-D04', 'Sân khấu Hội chợ Xuân', 4, 150.0, 45000000.00, 5000000.00, 'AVAILABLE', NULL, 'Không gian biểu diễn sự kiện.'),
('GH-D05', 'Xe đồ nướng Xiên que', 4, 8.0, 4000000.00, 200000.00, 'AVAILABLE', NULL, 'Khu phố đi bộ ngoài trời.')
ON DUPLICATE KEY UPDATE `rent_price`=VALUES(`rent_price`), `service_fee`=VALUES(`service_fee`);

-- Seed default Users (password is admin123 and customer123)
INSERT INTO `user` (`id`, `username`, `password`, `email`, `full_name`, `phone`, `address`, `tax_code`, `identity_number`, `role`, `status`) VALUES
(1, 'admin', '$2a$10$3z.OcrH/sA3q9.29J.D6qOuFomF2X.Lym.313yX1tP3.e.oD5Gf.e', 'admin@stallrental.com', 'Ban Quản Lý Trung Tâm', '0988888888', 'Trung tâm Thương mại Stall Rental', '0102030405', '079090000001', 'ROLE_ADMIN', b'1'),
(2, 'customer', '$2a$10$w09aVn6Z5Y2c.C4GomF2XOlm31yX1tP3.e.oD5Gf.e234yX1tP3.e', 'customer@gmail.com', 'Nguyễn Văn A - Thời trang Converse', '0912345678', '123 Đường Lê Lợi, Quận 1, TP. HCM', '0102030405', '079090123456', 'ROLE_CUSTOMER', b'1')
ON DUPLICATE KEY UPDATE `password`=VALUES(`password`), `full_name`=VALUES(`full_name`), `address`=VALUES(`address`);
