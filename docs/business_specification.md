# TÀI LIỆU ĐẶC TẢ NGHIỆP VỤ
## Hệ thống quản lý thuê gian hàng

| Thông tin | Giá trị |
| :--- | :--- |
| **Người thực hiện** | Nhóm phân tích nghiệp vụ |
| **Ngày ban hành** | 07/07/2026 |
| **Mã tài liệu** | BRS-QLTGH-001 |
| **Phiên bản** | 0.1 |

### Trạng thái tài liệu
| Thuộc tính | Giá trị |
| :--- | :--- |
| **Trạng thái** | DRAFT |
| **Người viết** | Nhóm phân tích nghiệp vụ |
| **Người review** | Đại diện bộ phận vận hành |
| **Người phê duyệt** | Chủ đầu tư / Ban quản lý |
| **QA** | Nhóm kiểm thử |
| **Phiên bản** | 0.1 |
| **Ngày phát hành** | 07/07/2026 |

---

### KIỂM SOÁT TÀI LIỆU

#### Thông tin kiểm soát
| Ngày | Người lập | Người kiểm tra / Kết quả | Người phê duyệt / Kết quả |
| :--- | :--- | :--- | :--- |
| 07/07/2026 | Nhóm phân tích nghiệp vụ | Chờ review | Chờ phê duyệt |

#### Thông tin lịch sử
| Ngày | Người thực hiện | Phiên bản | Nội dung |
| :--- | :--- | :--- | :--- |
| 07/07/2026 | Nhóm phân tích nghiệp vụ | 0.1 | Khởi tạo tài liệu đặc tả nghiệp vụ cho hệ thống quản lý thuê gian hàng. |

#### Tài liệu liên quan, tham khảo
| Ngày | Tên tài liệu | Nguồn |
| :--- | :--- | :--- |
| 07/07/2026 | Nhu cầu nghiệp vụ quản lý cho thuê gian hàng | Trao đổi nghiệp vụ |
| 07/07/2026 | Biểu mẫu hợp đồng, thanh toán và đối soát | Ban quản lý / Kế toán |

---

## MỤC LỤC
* [PHẦN 1: GIỚI THIỆU](#phần-1-giới-thiệu)
* [PHẦN 2: YÊU CẦU TỔNG THỂ](#phần-2-yêu-cầu-tổng-thể)
* [PHẦN 3: CHỨC NĂNG](#phần-3-chức-năng)
* [PHẦN 4: CÁC COMPONENT, THÔNG BÁO, CẢNH BÁO](#phần-4-các-component-thông-báo-cảnh-báo)
* [PHẦN 5: LINK ISSUE](#phần-5-link-issue)

---

## PHẦN 1: GIỚI THIỆU

### 1.1 Mục đích tài liệu
Tài liệu này mô tả yêu cầu nghiệp vụ cho Hệ thống quản lý thuê gian hàng, làm cơ sở để các nhóm phân tích, thiết kế, phát triển, kiểm thử và vận hành thống nhất phạm vi triển khai.

### 1.2 Phạm vi tài liệu
* Quản lý danh mục mặt bằng, khu vực, gian hàng và trạng thái khai thác.
* Quản lý khách thuê, hồ sơ thuê, hợp đồng, phụ lục và vòng đời hợp đồng.
* Quản lý đặt chỗ, báo giá, đặt cọc, bàn giao gian hàng, thanh toán định kỳ và công nợ.
* Quản lý yêu cầu vận hành phát sinh trong quá trình thuê gian hàng.
* Cung cấp báo cáo doanh thu, tỷ lệ lấp đầy, công nợ và hiệu quả khai thác.

### 1.3 Tổng quan ứng dụng
Hệ thống hỗ trợ ban quản lý trung tâm thương mại, chợ, hội chợ hoặc khu kinh doanh theo dõi toàn bộ vòng đời thuê gian hàng từ khởi tạo danh mục, tiếp nhận nhu cầu thuê, ký hợp đồng, ghi nhận thanh toán đến tất toán và bàn giao lại mặt bằng. Ứng dụng hướng tới việc giảm thao tác thủ công trên bảng tính, chuẩn hóa dữ liệu hợp đồng và tăng khả năng kiểm soát doanh thu.

### 1.4 Thuật ngữ viết tắt
| STT | Từ viết tắt | Diễn giải |
| :--- | :--- | :--- |
| 1 | ID | Mã định danh bản ghi trong hệ thống |
| 2 | UUID | Mã định danh duy nhất toàn cục |
| 3 | BQL | Ban quản lý mặt bằng / khu kinh doanh |
| 4 | KH | Khách thuê gian hàng |
| 5 | HĐ | Hợp đồng thuê gian hàng |
| 6 | NCC | Nhà cung cấp dịch vụ vận hành |
| 7 | VAT | Thuế giá trị gia tăng |
| 8 | SLA | Cam kết thời gian xử lý yêu cầu |

---

## PHẦN 2: YÊU CẦU TỔNG THỂ

### 2.1 Sơ đồ quan hệ đối tượng
📌 **Ghi chú sơ đồ ERD:**
* **Khu vực (Area):** Phân vùng mặt bằng theo tầng, dãy, khu chức năng hoặc sự kiện.
* **Gian hàng (Booth):** Đơn vị mặt bằng có diện tích, vị trí, giá thuê và trạng thái khai thác.
* **Khách thuê (Customer):** Cá nhân hoặc tổ chức thuê gian hàng.
* **Hợp đồng (Contract):** Thỏa thuận thuê, kỳ hạn, đơn giá, đặt cọc, phí dịch vụ và điều khoản.
* **Lịch thanh toán:** Các khoản phải thu theo kỳ hoặc phát sinh.
* **Phiếu thu / Công nợ (Payment):** Ghi nhận thu, số dư còn lại và trạng thái công nợ.
* **Yêu cầu vận hành (MaintenanceRequest):** Sửa chữa, hỗ trợ điện nước, vệ sinh, an ninh hoặc bàn giao.

### 2.2 Sơ đồ Use Case
*(Sơ đồ Use Case — xem file gốc hoặc Figma)*

### 2.3 Sơ đồ luồng
*(Business Flow Diagram — xem file gốc)*

### 2.4 Sơ đồ chuyển trạng thái
*(State Diagram — xem file gốc)*

### 2.5 Phân quyền

#### 2.5.1 Phân quyền chức năng
| Chức năng | Admin | Quản lý | Kinh doanh | Hợp đồng | Kế toán | Vận hành |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Quản lý danh mục gian hàng** | CRUD | Xem | Xem | Xem | Xem | Cập nhật trạng thái |
| **Quản lý khách thuê** | CRUD | Xem | CRUD | Xem | Xem | Xem |
| **Báo giá / đặt chỗ** | CRUD | Duyệt | CRUD | Xem | Xem | Xem |
| **Hợp đồng** | CRUD | Duyệt | Tạo yêu cầu | CRUD | Xem | Xem |
| **Thanh toán / công nợ** | CRUD | Xem | Xem | Xem | CRUD | Xem |
| **Yêu cầu vận hành** | CRUD | Xem | Tạo | Xem | Xem | CRUD |
| **Báo cáo** | Xem | Xem | Theo phạm vi | Theo phạm vi | Theo phạm vi | Theo phạm vi |

#### 2.5.2 Phân quyền dữ liệu
* Người dùng chỉ được xem dữ liệu thuộc khu vực, dự án hoặc đơn vị được phân quyền.
* Dữ liệu tài chính chi tiết chỉ hiển thị cho vai trò kế toán, quản lý và quản trị hệ thống.
* Lịch sử thay đổi hợp đồng, giá thuê và công nợ phải được lưu audit log.
* Thông tin cá nhân của khách thuê phải được kiểm soát theo vai trò và mục đích xử lý.

#### Entity: Tài khoản người dùng (User)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Tên đăng nhập | `username` | Text | Có | Tên đăng nhập duy nhất trong hệ thống. |
| Mật khẩu | `password` | Text | Có | Mật khẩu đã được mã hóa. |
| Họ tên | `fullName` | Text | Có | Họ tên đầy đủ của người dùng. |
| Email | `email` | Email | Không | Email liên hệ và nhận thông báo. |
| Số điện thoại | `phone` | Text | Không | Số điện thoại liên hệ. |
| Vai trò | `role` | Select | Có | Admin, Quản lý, Kinh doanh, Hợp đồng, Kế toán, Vận hành. |
| Trạng thái | `status` | Boolean | Có | Tài khoản đang hoạt động hay bị khóa. |
| Ngày tạo | `createdAt` | DateTime | Tự động | Thời điểm tạo tài khoản. |

### 2.6 Site Map
| Nhóm màn hình | Màn hình / Chức năng |
| :--- | :--- |
| **Dashboard** | Tổng quan lấp đầy, doanh thu, công nợ, hợp đồng sắp hết hạn, yêu cầu tồn đọng. |
| **Danh mục** | Khu vực, gian hàng, loại gian hàng, bảng giá, phí dịch vụ, mẫu hợp đồng. |
| **Kinh doanh** | Khách thuê, báo giá, đặt chỗ, lịch hẹn, pipeline thuê. |
| **Hợp đồng** | Danh sách hợp đồng, tạo hợp đồng, phụ lục, gia hạn, thanh lý. |
| **Tài chính** | Lịch thanh toán, phiếu thu, công nợ, nhắc nợ, đối soát. |
| **Vận hành** | Bàn giao, yêu cầu hỗ trợ, bảo trì, biên bản hiện trạng. |
| **Báo cáo** | Doanh thu, công nợ, tỷ lệ lấp đầy, hiệu quả theo khu vực, nhật ký thay đổi. |
| **Hệ thống** | Tài khoản, vai trò, phân quyền, cấu hình thông báo, tham số hệ thống. |

---

## PHẦN 3: CHỨC NĂNG
*Ghi chú chuẩn hóa dữ liệu: Toàn bộ mô tả chi tiết trong Phần 3 được chuẩn hóa theo đúng 9 entity dữ liệu của hệ thống: User, Area, Booth, Customer, Booking, Contract, Payment, MaintenanceRequest, Notification. Khái niệm "báo giá" trước đây được hợp nhất vào entity Booking (đặt chỗ); "khoản phải thu / công nợ" được ghi nhận trực tiếp qua entity Payment gắn với Contract.*

### Danh sách Use Case
| Mã | Tên chức năng | Phân hệ | Tác nhân |
| :--- | :--- | :--- | :--- |
| **UC-01** | Quản lý danh mục gian hàng | Danh mục | Admin, Vận hành, Quản lý |
| **UC-02** | Quản lý khách thuê | Kinh doanh | Kinh doanh, Hợp đồng, Kế toán |
| **UC-03** | Tạo báo giá và đặt chỗ | Kinh doanh | Kinh doanh, Quản lý |
| **UC-04** | Quản lý hợp đồng thuê | Hợp đồng | Hợp đồng, Quản lý, Kế toán |
| **UC-05** | Quản lý thanh toán và công nợ | Tài chính | Kế toán, Quản lý |
| **UC-06** | Bàn giao và yêu cầu vận hành | Vận hành | Vận hành, Khách thuê |
| **UC-07** | Báo cáo quản trị | Báo cáo | Quản lý, Admin |

### UC-01. Quản lý danh mục gian hàng
#### Đặc tả Use Case
* **Use Case ID:** UC-01
* **Mô tả:** Quản lý danh mục gian hàng
* **Tác nhân (Actor):** Admin, Nhân viên vận hành, Quản lý
* **Sự ưu tiên:** Cao
* **Trigger:** Người dùng cần tạo mới hoặc cập nhật thông tin gian hàng trước khi khai thác cho thuê.
* **Điều kiện cần:** Người dùng đã đăng nhập và có quyền quản lý danh mục.
* **Điều kiện sau:** Thông tin gian hàng được lưu, có trạng thái khai thác và sẵn sàng sử dụng trong báo giá / hợp đồng.

#### Luồng cơ bản
1. Người dùng mở màn hình Danh mục gian hàng.
2. Hệ thống hiển thị danh sách gian hàng theo khu vực, trạng thái và loại hình.
3. Người dùng tạo mới hoặc chỉnh sửa thông tin gian hàng.
4. Hệ thống kiểm tra mã gian hàng, diện tích, giá thuê, trạng thái và thông tin khu vực.
5. Người dùng lưu dữ liệu.
6. Hệ thống cập nhật danh mục và ghi nhận lịch sử thay đổi.

#### Luồng thay thế
* Nếu gian hàng đang có hợp đồng hiệu lực, hệ thống không cho xóa mà chỉ cho cập nhật một số thông tin mô tả.
* Nếu gian hàng chuyển sang Bảo trì, hệ thống chặn tạo báo giá hoặc đặt chỗ mới.

#### Luồng ngoại lệ
* Mã gian hàng bị trùng: hệ thống báo lỗi và yêu cầu nhập mã khác.
* Thiếu khu vực hoặc diện tích: hệ thống không cho lưu.

#### Ràng buộc nghiệp vụ
* Mỗi gian hàng phải thuộc đúng một khu vực.
* Gian hàng chỉ được xóa khi chưa phát sinh giao dịch.
* Giá thuê mặc định có thể được kế thừa từ bảng giá theo khu vực hoặc loại gian hàng.

#### Yêu cầu phi chức năng
* Thời gian tải danh sách không quá 3 giây với 5.000 gian hàng.
* Mọi thay đổi trạng thái phải được ghi audit log.

#### Giao diện
* Danh sách gian hàng có bộ lọc theo khu vực, loại gian hàng, trạng thái và khoảng diện tích.
* Form thông tin gồm mã gian hàng, tên, khu vực, diện tích, giá thuê, phí dịch vụ, trạng thái, hình ảnh / ghi chú.
* Có thao tác xuất danh sách gian hàng ra Excel nếu người dùng có quyền.

#### Entity: Gian hàng (Booth)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Mã gian hàng | `code` | Text | Có | Mã duy nhất trong toàn hệ thống. |
| Tên gian hàng | `name` | Text | Có | Tên hiển thị của gian hàng. |
| Khu vực | `area` | Select | Có | Khu vực chứa gian hàng (liên kết Area). |
| Diện tích | `size` | Number | Có | Diện tích tính theo m². |
| Giá thuê | `rentPrice` | Currency | Có | Đơn giá thuê theo kỳ. |
| Phí dịch vụ | `serviceFee` | Currency | Không | Phí dịch vụ đi kèm gian hàng theo kỳ. |
| Trạng thái | `status` | Select | Có | Trống, Giữ chỗ, Đang thuê, Bảo trì, Ngừng khai thác. |
| Hình ảnh | `image` | Image | Không | Ảnh minh họa gian hàng. |
| Mô tả | `description` | Text Area | Không | Ghi chú, mô tả thêm về gian hàng. |

#### Entity: Khu vực (Area)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Tên khu vực | `name` | Text | Có | Tên khu vực, tầng hoặc phân khu chức năng. |
| Mô tả | `description` | Text Area | Không | Mô tả thêm về khu vực. |
| Trạng thái | `status` | Boolean | Có | Khu vực đang hoạt động hay ngừng sử dụng. |

---

### UC-02. Quản lý khách thuê
#### Đặc tả Use Case
* **Use Case ID:** UC-02
* **Mô tả:** Quản lý khách thuê
* **Tác nhân (Actor):** Nhân viên kinh doanh, Nhân viên hợp đồng, Kế toán
* **Sự ưu tiên:** Cao
* **Trigger:** Phát sinh khách hàng có nhu cầu thuê hoặc đang thuê gian hàng.
* **Điều kiện cần:** Người dùng có quyền tạo hoặc cập nhật hồ sơ khách thuê.
* **Điều kiện sau:** Hồ sơ khách thuê được lưu và có thể liên kết với báo giá, hợp đồng, thanh toán.

#### Luồng cơ bản
1. Người dùng mở màn hình Khách thuê.
2. Hệ thống hiển thị danh sách và bộ lọc khách thuê.
3. Người dùng tạo mới hồ sơ cá nhân hoặc tổ chức.
4. Hệ thống kiểm tra số điện thoại, email, mã số thuế hoặc giấy tờ định danh.
5. Người dùng lưu hồ sơ.
6. Hệ thống tạo mã khách thuê và cho phép liên kết với giao dịch thuê.

#### Luồng thay thế
* Nếu khách thuê đã tồn tại, người dùng có thể cập nhật hồ sơ thay vì tạo mới.
* Nếu khách thuê là tổ chức, hệ thống yêu cầu thêm thông tin người đại diện.

#### Luồng ngoại lệ
* Thông tin định danh không hợp lệ: hệ thống hiển thị lỗi tại trường nhập.
* Người dùng không có quyền xem dữ liệu nhạy cảm: hệ thống ẩn số giấy tờ hoặc thông tin tài chính.

#### Ràng buộc nghiệp vụ
* Một khách thuê có thể có nhiều hợp đồng.
* Khách thuê đang có công nợ quá hạn phải được cảnh báo khi tạo báo giá mới.
* Không cho xóa khách thuê đã phát sinh hợp đồng hoặc phiếu thu.

#### Yêu cầu phi chức năng
* Dữ liệu cá nhân phải được phân quyền truy cập.
* Tìm kiếm theo tên, số điện thoại hoặc mã số thuế phải trả kết quả trong 3 giây.

#### Giao diện
* Màn hình danh sách có tìm kiếm nhanh và nhãn trạng thái khách thuê.
* Form hồ sơ chia nhóm: thông tin chung, định danh, liên hệ, hóa đơn, ghi chú.
* Tab lịch sử hiển thị báo giá, hợp đồng, thanh toán và yêu cầu vận hành liên quan.

#### Entity: Khách thuê (Customer)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Tên khách thuê | `fullName` | Text | Có | Tên cá nhân hoặc tên pháp nhân. |
| Số điện thoại | `phone` | Text | Có | Số liên hệ chính. |
| Email | `email` | Email | Không | Email nhận thông báo. |
| Địa chỉ | `address` | Text Area | Không | Địa chỉ liên hệ hoặc địa chỉ xuất hóa đơn. |
| Mã số thuế | `taxCode` | Text | Không | Bắt buộc với tổ chức nếu xuất hóa đơn. |
| Số giấy tờ định danh | `identityNumber` | Text | Không | CMND/CCCD/hộ chiếu hoặc mã số đăng ký kinh doanh. |

---

### UC-03. Tạo báo giá và đặt chỗ
#### Đặc tả Use Case
* **Use Case ID:** UC-03
* **Mô tả:** Tạo báo giá và đặt chỗ
* **Tác nhân (Actor):** Nhân viên kinh doanh, Quản lý
* **Sự ưu tiên:** Cao
* **Trigger:** Khách thuê chọn gian hàng và yêu cầu báo giá hoặc giữ chỗ.
* **Điều kiện cần:** Gian hàng ở trạng thái Trống và khách thuê đã có hồ sơ hợp lệ.
* **Điều kiện sau:** Báo giá được tạo, gian hàng có thể chuyển sang Giữ chỗ trong thời hạn cấu hình.

#### Luồng cơ bản
1. Kinh doanh tra cứu gian hàng trống theo nhu cầu khách thuê.
2. Hệ thống hiển thị giá tham khảo, phí dịch vụ và điều kiện thuê.
3. Kinh doanh tạo báo giá và chọn thời hạn hiệu lực.
4. Hệ thống tính tổng tiền dự kiến, đặt cọc và lịch thanh toán mẫu.
5. Kinh doanh gửi báo giá hoặc chuyển sang giữ chỗ.
6. Quản lý phê duyệt nếu giá giảm vượt ngưỡng cấu hình.

#### Luồng thay thế
* Nếu khách yêu cầu nhiều gian hàng, hệ thống cho tạo báo giá nhiều dòng.
* Nếu hết hạn giữ chỗ mà chưa ký hợp đồng, hệ thống tự trả gian hàng về trạng thái Trống.

#### Luồng ngoại lệ
* Gian hàng đã được người khác giữ chỗ: hệ thống báo xung đột và yêu cầu chọn gian hàng khác.
* Mức chiết khấu vượt quyền: hệ thống yêu cầu trình duyệt.

#### Ràng buộc nghiệp vụ
* Một gian hàng chỉ có một đặt chỗ hiệu lực tại một thời điểm.
* Thời hạn giữ chỗ mặc định do Admin cấu hình.
* Giá thuê sau chiết khấu không được thấp hơn mức sàn nếu không có phê duyệt.

#### Yêu cầu phi chức năng
* Cập nhật trạng thái giữ chỗ phải gần thời gian thực.
* Báo giá phải có mã duy nhất và lịch sử phiên bản.

#### Giao diện
* Màn hình tra cứu mặt bằng có bộ lọc diện tích, khu vực, ngành hàng và giá thuê.
* Form báo giá hiển thị bảng dòng gian hàng và tổng tiền dự kiến.
* Có nút Gửi báo giá, Giữ chỗ, Hủy giữ chỗ và Tạo hợp đồng.

#### Entity: Đặt chỗ (Booking)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Khách thuê | `customer` | Select | Có | Khách thuê thực hiện đặt chỗ. |
| Gian hàng | `booth` | Select | Có | Gian hàng được đặt chỗ. |
| Ngày đặt chỗ | `bookingDate` | Date | Tự động | Ngày tạo đặt chỗ trong hệ thống. |
| Ngày bắt đầu | `startDate` | Date | Có | Ngày dự kiến bắt đầu thuê. |
| Ngày kết thúc | `endDate` | Date | Có | Ngày dự kiến kết thúc thuê. |
| Tiền đặt cọc | `deposit` | Currency | Không | Khoản giữ chỗ hoặc bảo đảm. |
| Tổng tiền | `totalPrice` | Currency | Có | Tổng tiền dự kiến của đặt chỗ. |
| Trạng thái | `status` | Select | Có | Nháp, Đã gửi, Chờ duyệt, Đã duyệt, Đã hủy. |
| Ghi chú | `note` | Text Area | Không | Ghi chú thêm cho đặt chỗ. |

---

### UC-04. Quản lý hợp đồng thuê
#### Đặc tả Use Case
* **Use Case ID:** UC-04
* **Mô tả:** Quản lý hợp đồng thuê
* **Tác nhân (Actor):** Nhân viên hợp đồng, Quản lý, Kế toán
* **Sự ưu tiên:** Cao
* **Trigger:** Báo giá đã được khách thuê chấp nhận hoặc cần lập hợp đồng trực tiếp.
* **Điều kiện cần:** Có khách thuê, gian hàng hợp lệ và thông tin kỳ hạn thuê.
* **Điều kiện sau:** Hợp đồng được lưu, phê duyệt và phát sinh lịch thanh toán.

#### Luồng cơ bản
1. Nhân viên hợp đồng tạo hợp đồng từ báo giá hoặc tạo mới.
2. Hệ thống tự điền thông tin khách thuê, gian hàng, giá thuê và đặt cọc.
3. Người dùng nhập điều khoản, ngày hiệu lực, kỳ thanh toán và tệp đính kèm.
4. Hệ thống kiểm tra xung đột thời gian thuê và dữ liệu bắt buộc.
5. Người dùng trình duyệt hợp đồng.
6. Quản lý phê duyệt, hệ thống chuyển hợp đồng sang Hiệu lực và tạo lịch thu.

#### Luồng thay thế
* Có thể tạo phụ lục điều chỉnh diện tích, giá thuê, thời hạn hoặc chính sách phí.
* Có thể gia hạn hợp đồng từ hợp đồng hiệu lực trước ngày hết hạn.

#### Luồng ngoại lệ
* Ngày thuê trùng với hợp đồng khác của cùng gian hàng: hệ thống chặn lưu.
* Thiếu tệp hợp đồng ký hoặc thông tin pháp lý: hệ thống không cho chuyển hiệu lực nếu cấu hình bắt buộc.

#### Ràng buộc nghiệp vụ
* Hợp đồng hiệu lực phải có ít nhất một gian hàng, một khách thuê và ngày bắt đầu/kết thúc.
* Không cho sửa trực tiếp giá trị tài chính của hợp đồng hiệu lực nếu không tạo phụ lục.
* Thanh lý hợp đồng chỉ hoàn tất khi công nợ được đối soát.

#### Yêu cầu phi chức năng
* File hợp đồng đính kèm phải được kiểm soát quyền tải xuống.
* Mọi thay đổi điều khoản tài chính phải lưu lịch sử.

#### Giao diện
* Danh sách hợp đồng có trạng thái: Nháp, Chờ duyệt, Hiệu lực, Sắp hết hạn, Chờ thanh lý, Đã thanh lý.
* Màn hình chi tiết gồm thông tin chung, gian hàng, điều khoản tài chính, lịch thanh toán, tệp đính kèm.
* Có thao tác Tạo phụ lục, Gia hạn, Thanh lý và Xuất hợp đồng theo mẫu.

#### Entity: Hợp đồng (Contract)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Mã hợp đồng | `contractCode` | Text | Tự động | Mã duy nhất theo quy tắc cấu hình. |
| Đặt chỗ | `booking` | Select | Có | Đặt chỗ làm căn cứ lập hợp đồng. |
| Ngày bắt đầu | `startDate` | Date | Có | Ngày hợp đồng có hiệu lực thuê. |
| Ngày kết thúc | `endDate` | Date | Có | Ngày kết thúc thuê. |
| Giá thuê | `rentPrice` | Currency | Có | Đơn giá thuê áp dụng theo hợp đồng. |
| Tiền đặt cọc | `deposit` | Currency | Có | Khoản cọc theo hợp đồng. |
| Trạng thái | `status` | Select | Có | Nháp, Chờ duyệt, Hiệu lực, Sắp hết hạn, Chờ thanh lý, Đã thanh lý. |
| Tệp hợp đồng | `contractFile` | File | Không | Bản scan hoặc file hợp đồng đã ký. |
| Ngày tạo | `createdAt` | DateTime | Tự động | Thời điểm tạo hợp đồng trong hệ thống. |

---

### UC-05. Quản lý thanh toán và công nợ
#### Đặc tả Use Case
* **Use Case ID:** UC-05
* **Mô tả:** Quản lý thanh toán và công nợ
* **Tác nhân (Actor):** Kế toán, Quản lý
* **Sự ưu tiên:** Cao
* **Trigger:** Hợp đồng hiệu lực phát sinh các khoản phải thu theo kỳ hoặc theo chi phí phát sinh.
* **Điều kiện cần:** Hợp đồng đã hiệu lực và có lịch thanh toán.
* **Điều kiện sau:** Khoản phải thu, phiếu thu và trạng thái công nợ được cập nhật chính xác.

#### Luồng cơ bản
1. Kế toán mở màn hình Lịch thanh toán / Công nợ.
2. Hệ thống hiển thị các khoản phải thu theo hợp đồng, kỳ hạn và trạng thái.
3. Kế toán ghi nhận thanh toán hoặc tạo khoản phát sinh.
4. Hệ thống đối chiếu số tiền, cập nhật số dư còn lại và trạng thái khoản thu.
5. Hệ thống gửi cảnh báo nhắc nợ theo cấu hình.

#### Luồng thay thế
* Cho phép thu một phần và ghi nhận nhiều phiếu thu cho một khoản phải thu.
* Cho phép điều chỉnh công nợ bằng phiếu điều chỉnh nếu người dùng có quyền.

#### Luồng ngoại lệ
* Số tiền thanh toán vượt quá số phải thu: hệ thống yêu cầu xác nhận hoặc phân bổ sang kỳ khác.
* Khoản phải thu đã khóa đối soát: hệ thống không cho chỉnh sửa trực tiếp.

#### Ràng buộc nghiệp vụ
* Mỗi phiếu thu phải liên kết với khách thuê, hợp đồng và khoản phải thu.
* Công nợ quá hạn được xác định dựa trên ngày đến hạn và số dư còn lại.
* Điều chỉnh giảm công nợ phải có lý do và người phê duyệt nếu vượt ngưỡng.

#### Yêu cầu phi chức năng
* Dữ liệu tài chính cần phân quyền nghiêm ngặt và lưu audit log.
* Báo cáo công nợ phải có thể lọc theo kỳ, khu vực, khách thuê và trạng thái.

#### Giao diện
* Danh sách công nợ có bộ lọc: quá hạn, sắp đến hạn, đã thu, thu một phần.
* Form phiếu thu gồm phương thức thanh toán, số tiền, ngày thu, tài khoản nhận, chứng từ.
* Màn hình chi tiết hợp đồng có tab lịch sử thanh toán và công nợ.

#### Entity: Thanh toán (Payment)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Hợp đồng | `contract` | Select | Có | Hợp đồng phát sinh khoản thanh toán. |
| Số tiền | `amount` | Currency | Có | Số tiền thanh toán. |
| Phương thức thanh toán | `paymentMethod` | Select | Có | Tiền mặt, Chuyển khoản, Thẻ, Ví điện tử. |
| Ngày thanh toán | `paymentDate` | Date | Có | Ngày ghi nhận thanh toán. |
| Trạng thái | `status` | Select | Có | Chờ xử lý, Đã thanh toán, Thất bại, Đã hoàn tiền. |
| Ghi chú | `note` | Text Area | Không | Ghi chú thêm cho khoản thanh toán. |

---

### UC-06. Bàn giao và yêu cầu vận hành
#### Đặc tả Use Case
* **Use Case ID:** UC-06
* **Mô tả:** Bàn giao và yêu cầu vận hành
* **Tác nhân (Actor):** Nhân viên vận hành, Khách thuê, Quản lý
* **Sự ưu tiên:** Trung bình
* **Trigger:** Hợp đồng bắt đầu hiệu lực hoặc khách thuê phát sinh yêu cầu hỗ trợ trong quá trình thuê.
* **Điều kiện cần:** Gian hàng thuộc hợp đồng hiệu lực hoặc có lịch bàn giao.
* **Điều kiện sau:** Biên bản bàn giao / yêu cầu vận hành được tạo và theo dõi đến khi hoàn tất.

#### Luồng cơ bản
1. Vận hành tạo lịch bàn giao gian hàng.
2. Hệ thống hiển thị thông tin hợp đồng, gian hàng và checklist bàn giao.
3. Vận hành ghi nhận hiện trạng, chỉ số điện nước, tài sản kèm theo và hình ảnh.
4. Khách thuê hoặc đại diện xác nhận bàn giao.
5. Trong quá trình thuê, người dùng tạo yêu cầu hỗ trợ và theo dõi trạng thái xử lý.

#### Luồng thay thế
* Nếu phát sinh chi phí sửa chữa, vận hành có thể tạo khoản phí phát sinh chuyển kế toán xử lý.
* Nếu yêu cầu vượt SLA, hệ thống cảnh báo quản lý.

#### Luồng ngoại lệ
* Không có hợp đồng hiệu lực: hệ thống không cho tạo biên bản bàn giao chính thức.
* Thiếu hình ảnh hoặc checklist bắt buộc: hệ thống không cho hoàn tất bàn giao nếu cấu hình yêu cầu.

#### Ràng buộc nghiệp vụ
* Bàn giao chỉ được hoàn tất khi các hạng mục checklist bắt buộc đã được xác nhận.
* Yêu cầu vận hành phải có loại yêu cầu, mức độ ưu tiên và người phụ trách.
* Yêu cầu đã đóng chỉ được mở lại bởi người có quyền.

#### Yêu cầu phi chức năng
* Ảnh đính kèm cần nén phù hợp nhưng vẫn đủ chất lượng kiểm tra hiện trạng.
* Thông báo trạng thái yêu cầu phải gửi đến người liên quan trong vòng 1 phút.

#### Giao diện
* Màn hình bàn giao có checklist theo mẫu và khu vực tải ảnh hiện trạng.
* Màn hình yêu cầu vận hành có kanban hoặc danh sách theo trạng thái: Mới, Đang xử lý, Chờ phản hồi, Hoàn tất.
* Có trường phân công nhân sự, mức độ ưu tiên, SLA và chi phí phát sinh.

#### Entity: Yêu cầu vận hành (MaintenanceRequest)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Gian hàng | `booth` | Select | Có | Gian hàng liên quan đến yêu cầu vận hành. |
| Khách thuê | `customer` | Select | Không | Khách thuê liên quan đến yêu cầu (nếu có). |
| Tiêu đề | `title` | Text | Có | Tiêu đề ngắn gọn của yêu cầu. |
| Mức độ ưu tiên | `priority` | Select | Có | Thấp, Trung bình, Cao, Khẩn cấp. |
| Mô tả | `description` | Text Area | Có | Mô tả chi tiết yêu cầu vận hành. |
| Trạng thái | `status` | Select | Có | Mới, Đang xử lý, Chờ phản hồi, Hoàn tất, Đã hủy. |
| Ngày tạo | `createdAt` | DateTime | Tự động | Thời điểm tạo yêu cầu vận hành. |
| Ngày hoàn tất | `completedAt` | DateTime | Không | Thời điểm yêu cầu được xử lý xong. |

---

### UC-07. Báo cáo quản trị
Chức năng báo cáo cung cấp dashboard và báo cáo chi tiết cho quản lý, bao gồm doanh thu theo kỳ, tỷ lệ lấp đầy, công nợ quá hạn, hợp đồng sắp hết hạn, hiệu quả khai thác theo khu vực và số lượng yêu cầu vận hành tồn đọng.

#### Danh sách báo cáo chính
| Báo cáo | Chỉ tiêu chính | Bộ lọc |
| :--- | :--- | :--- |
| **Tổng quan khai thác** | Số gian hàng, tỷ lệ lấp đầy, gian hàng trống, gian hàng bảo trì | Khu vực, thời điểm |
| **Doanh thu** | Doanh thu phải thu, đã thu, còn phải thu, doanh thu theo loại gian hàng | Kỳ, khu vực, khách thuê |
| **Công nợ** | Nợ quá hạn, nợ sắp đến hạn, tuổi nợ, top khách thuê còn nợ | Kỳ, trạng thái, khách thuê |
| **Hợp đồng** | Hợp đồng hiệu lực, sắp hết hạn, đã thanh lý, gia hạn | Kỳ hạn, trạng thái, khu vực |
| **Vận hành** | Số yêu cầu mới, đang xử lý, quá SLA, chi phí phát sinh | Loại yêu cầu, người phụ trách, trạng thái |

---

## PHẦN 4: CÁC COMPONENT, THÔNG BÁO, CẢNH BÁO
| Mã | Loại | Nội dung / Mục đích | Kích hoạt |
| :--- | :--- | :--- | :--- |
| **MSG-01** | Thông báo | Tạo mới dữ liệu thành công. | Sau khi lưu bản ghi hợp lệ. |
| **MSG-02** | Cảnh báo | Gian hàng đã được giữ chỗ hoặc đang có hợp đồng hiệu lực. | Khi chọn gian hàng không khả dụng. |
| **MSG-03** | Cảnh báo | Hợp đồng sắp hết hạn trong {n} ngày. | Theo lịch chạy hằng ngày. |
| **MSG-04** | Cảnh báo | Khoản thanh toán đã quá hạn. | Sau ngày đến hạn và còn dư nợ. |
| **MSG-05** | Xác nhận | Bạn có chắc muốn hủy giữ chỗ gian hàng này? | Khi người dùng bấm Hủy giữ chỗ. |
| **CMP-01** | Component | Bộ lọc khu vực - trạng thái - kỳ hạn dùng chung. | Các danh sách gian hàng, hợp đồng, công nợ. |
| **CMP-02** | Component | Bộ tải tệp đính kèm có kiểm tra định dạng và dung lượng. | Hợp đồng, bàn giao, yêu cầu vận hành. |

### Yêu cầu thông báo
* Thông báo trong hệ thống hiển thị rõ đối tượng liên quan, thời điểm phát sinh và hành động tiếp theo.
* Thông báo email/SMS/Zalo chỉ gửi khi đã cấu hình kênh và có thông tin liên hệ hợp lệ.
* Các cảnh báo tài chính không hiển thị cho người dùng không có quyền xem số tiền.

#### Entity: Thông báo (Notification)
| Tên tiếng Việt | Tên tiếng Anh | Loại | Bắt buộc? | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| Người nhận | `user` | Select | Có | Người dùng nhận thông báo (liên kết User). |
| Tiêu đề | `title` | Text | Có | Tiêu đề thông báo. |
| Nội dung | `content` | Text Area | Có | Nội dung chi tiết thông báo. |
| Đã đọc | `isRead` | Boolean | Tự động | Trạng thái đã đọc hay chưa. |
| Ngày tạo | `createdAt` | DateTime | Tự động | Thời điểm phát sinh thông báo. |

---

## PHẦN 5: LINK ISSUE
| Mã issue | Mô tả | Trạng thái | Ghi chú |
| :--- | :--- | :--- | :--- |
| **TBD-001** | Xác nhận quy tắc mã hợp đồng, mã phiếu thu và mã gian hàng. | Open | Cần thống nhất với chủ đầu tư. |
| **TBD-002** | Xác nhận kênh thông báo nhắc nợ và hợp đồng sắp hết hạn. | Open | Email/SMS/Zalo/App notification. |
| **TBD-003** | Xác nhận mẫu hợp đồng và mẫu biên bản bàn giao. | Open | Cần file mẫu chính thức. |
| **TBD-004** | Xác nhận tích hợp kế toán hoặc hóa đơn điện tử nếu có. | Open | Phạm vi tích hợp chưa chốt. |
