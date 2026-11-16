## 1. NHỮNG GÌ ĐÃ HOÀN THÀNH
- **Database:** Đã kết nối thành công với MySQL 8.0 trong Docker (`WebBD_db`), quản lý 10 bảng chuẩn 3NF.
- **Bảo mật:** Tích hợp Spring Security 6 và cỗ máy sinh vé JWT Token (`JwtUtils`).
- **Mã hóa:** Toàn bộ mật khẩu người dùng được băm tự động bằng chuẩn an toàn `BCrypt`.
- **CORS:** Đã mở quyền cho Frontend Next.js (chạy cổng `3000`) gọi sang cổng `8080` không bị chặn.
- **2 API cốt lõi đã chạy thành công 100% trên Postman:**
  - `POST http://localhost:8080/api/v1/auth/register` (Đăng ký tài khoản)
  - `POST http://localhost:8080/api/v1/auth/login` (Đăng nhập và nhận chuỗi JWT Token)

---

## 2. PHÂN CÔNG NHIỆM VỤ CỤ THỂ CHO 3 AE

### HÀO (BACKEND DEV - NGHIỆP VỤ BÁN HÀNG)
*Nhánh làm việc:* Tạo nhánh `feature/product-api` từ `develop`.
- **Nhiệm vụ 1:** Tạo các Entity trong thư mục `entity/` tương ứng với các bảng đã có sẵn trong MySQL:
  - `Brand.java` (Thương hiệu: Nike, Adidas...)
  - `Category.java` (Danh mục: Giày cỏ nhân tạo, tự nhiên...)
  - `Product.java` (Thông tin giày chính)
  - `ProductVariant.java` (Biến thể: Size 39, 40, màu sắc, loại đinh, tồn kho)
- **Nhiệm vụ 2:** Tạo các Repository tương ứng trong `repository/` kế thừa `JpaRepository`.
- **Nhiệm vụ 3:** Viết `ProductController.java` cung cấp 2 API cho Frontend:
  - `GET /api/v1/products` (Lấy danh sách tất cả các đôi giày kèm ảnh và giá).
  - `GET /api/v1/products/{id}` (Lấy chi tiết 1 đôi giày kèm các size còn hàng).
- **Lưu ý:** Tự test bằng Postman đạt mã `200 OK` trước khi gửi cho Frontend.

---

### TRÁNG (FRONTEND SHOP - GIAO DIỆN KHÁCH HÀNG & SEO)
*Nhánh làm việc:* Tạo nhánh `feature/storefront-ui` từ `develop`.
- **Nhiệm vụ 1:** Mở thư mục `frontend/`, chạy `npm run dev` để bật giao diện cổng 3000.
- **Nhiệm vụ 2 (Trang chủ `app/page.tsx`):** Dựng Header (Logo, ô tìm kiếm, icon giỏ hàng), Banner trượt và danh sách thẻ sản phẩm (Card) lấy từ API của Bạn 2.
- **Nhiệm vụ 3 (Trang chi tiết `app/san-pham/[id]/page.tsx`):** Hiển thị ảnh giày, giá tiền, bảng chọn size (39, 40, 41, 42).
- **Nhiệm vụ 4:** Gọi API `POST /api/v1/auth/login` của Leader khi khách bấm Đăng nhập. Lưu token nhận được vào `localStorage`.

---

### ĐỨC (FRONTEND ADMIN - GIAO DIỆN QUẢN TRỊ & MỞ RỘNG API SẢN PHẨM)

- **Nhánh làm việc:** `feature/admin-dashboard` và `feature/storefront-filter` (tách từ `develop`).
- **Các tính năng đã hoàn thành & vị trí file:**
  1. **Đăng nhập Admin & Phân quyền bảo mật (`/admin/login`):**
     - Giao diện đăng nhập riêng cho quản trị viên: `frontend/src/app/admin/login/page.tsx`
     - Kiểm tra quyền `ROLE_ADMIN`, chặn tài khoản khách hàng truy cập trái phép: `frontend/src/app/admin/layout.tsx`
     - Tự động đính kèm Header `Authorization: Bearer <token>` cho mọi API quản trị: `frontend/src/lib/api.ts`
  2. **Trang Tổng quan Dashboard (`/admin`):**
     - Kết nối API thật thống kê Tổng sản phẩm, Đơn hàng chờ xử lý và Doanh thu tháng: `frontend/src/app/admin/page.tsx`
  3. **Quản lý Sản phẩm & Khuyến mãi (`/admin/products` & `/admin/products/new`):**
     - Thanh điều hướng Danh mục & Thương hiệu phong cách SoccerStore, thanh tìm kiếm/lọc đa tiêu chí (hãng, size, loại mặt sân, khoảng giá, sắp xếp) trên 1 hàng: `frontend/src/app/admin/products/page.tsx`
     - Tính năng **Giảm giá (%)** tự động tính giá sau giảm và hiển thị nhãn khuyến mãi trên bảng sản phẩm: `frontend/src/app/admin/products/page.tsx`, `frontend/src/app/admin/products/new/page.tsx`
     - Form thêm sản phẩm mới kèm upload ảnh và bảng chỉnh sửa thông tin, quản lý size/trạng thái hết hàng: `frontend/src/app/admin/products/new/page.tsx`, `frontend/src/app/admin/products/page.tsx`
  4. **Quản lý Đơn hàng (`/admin/orders`):**
     - Bảng theo dõi danh sách đơn hàng và cập nhật trạng thái (`PENDING`, `SHIPPING`, `DELIVERED`): `frontend/src/app/admin/orders/page.tsx`
  5. **Tối ưu giao diện & Bổ sung Backend hỗ trợ:**
     - Cấu hình phông chữ tiếng Việt `Be Vietnam Pro`: `frontend/src/app/layout.tsx`
     - Bổ sung trường `discount_percent` và logic tính `salePrice` ở Backend/Database: `Product.java`, `ProductCardDTO.java`, `AdminProductController.java`, `StorefrontController.java`


## 3. TÀI KHOẢN MẪU CÓ SẴN ĐỂ CẢ NHÓM TEST
- **Tài khoản Admin:** `admin@gmail.com` / Mật khẩu: `123456`
- **Tài khoản Khách hàng:** `khachhangmoi@gmail.com` / Mật khẩu: `matkhaucuatoi123`
