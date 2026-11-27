# ⚽ WebBD - Hệ Thống Bán Giày Bóng Đá Trực Tuyến (SoccerStore Clone)

> Đồ án môn: **Phát triển ứng dụng trên nền Web** (Năm 3 - Kỳ 1)  
> Kiến trúc: **Next.js 16 (App Router) + Spring Boot 3 (Java 17) + MySQL 8.0 + Docker**

---

## ✅ 1. NHỮNG CHỨC NĂNG CỐT LÕI ĐÃ HOÀN THÀNH (ĐÃ MERGE VÀO `develop`)
- **Database & Docker:** Thiết kế CSDL MySQL 8.0 (10 bảng chuẩn 3NF), tự động khởi tạo schema và dữ liệu giày bóng đá thật (`01_init_schema.sql`, `02_seed_data.sql`).
- **Bảo mật & Phân quyền (Leader):** Tích hợp Spring Security 6, JWT (`JwtUtils`), mã hóa BCrypt, mở CORS `3000 <-> 8080`, API `/api/v1/auth/register` & `/api/v1/auth/login`.
- **Storefront (Khách hàng):** Trang chủ `SoccerStore` đồng bộ giao diện Dark Navy, bộ lọc hãng/giá/size/danh mục, trang chi tiết `/san-pham/[id]` chọn size theo tồn kho thực tế, giỏ hàng `/gio-hang` và đặt hàng trừ kho.
- **Admin Dashboard (`/admin`):** Đăng nhập phân quyền `ROLE_ADMIN`, thống kê tổng quan, **Biểu đồ doanh thu 12 tháng**, phân bổ thương hiệu, cảnh báo sắp hết size, quản lý sản phẩm (`/admin/products`), quản lý đơn hàng & xuất phiếu giao hàng A4 (`/admin/orders`).

---

## 🎯 2. PHÂN CÔNG NHIỆM VỤ HOÀN THIỆN & TỰ NGHIÊN CỨU (GIAI ĐOẠN CUỐI)

> **Quy trình làm việc bắt buộc:**  
> 1. Kéo code mới nhất: `git checkout develop && git pull origin develop`  
> 2. Tạo nhánh riêng cho task của mình: `git checkout -b feat/ten-nhiem-vu`  
> 3. Tự nghiên cứu theo **Từ khóa gợi ý**, test chạy thực tế, chụp ảnh kết quả khi mở Pull Request về `develop`.

### 1. MINH (Leader, Core Security & DevOps/Hosting)
- **Vai trò:** Giám sát chất lượng code toàn nhóm (Review & Merge PR), bảo mật hệ thống Auth/JWT, trực tiếp triển khai Hosting thực tế và hỗ trợ hoàn thiện báo cáo.
- **Nhiệm vụ:**
  - [x] Hoàn thiện JWT Security, CORS, đồng bộ Docker khởi tạo tự động Database (`docker-compose.yml`).
  - [x] Viết `Dockerfile` cho `backend/` và `frontend/` để chạy toàn hệ thống bằng 1 lệnh `docker compose up -d --build`.
  - [x] Đưa cấu hình nhạy cảm (DB password, JWT Secret, API URL) sang biến môi trường `.env` thay vì hardcode `localhost` (mẫu tại `.env.example`, cấu hình Nginx tại `deploy/nginx/webbd.conf`).
  - [ ] Triển khai hệ thống lên **VPS Ubuntu + Nginx Reverse Proxy + SSL HTTPS (Certbot)** lấy tên miền thật phục vụ bảo vệ đồ án (đã có hướng dẫn chi tiết tại `deploy/DEPLOY.md`).
  - [ ] Hỗ trợ Thành viên 5 rà soát kịch bản demo & tài liệu báo cáo.

### 2. HÀO (Backend Developer)
- **Nhánh làm việc:** `feat/be-audit-and-enhance` (từ `develop`)
- **Nhiệm vụ (Kế thừa, kiểm thử & nâng cấp Backend hiện có):**
  - [ ] **Kiểm thử & chuẩn hóa API:** Rà soát toàn bộ `StorefrontController`, `AdminProductController`, `OrderController`; test lại bằng **Postman** và xuất file `postman_collection.json` vào thư mục `postman/`.
  - [ ] **An toàn giao dịch & Bắt lỗi chuẩn:** Kiểm tra luồng đặt hàng (`@Transactional`), đảm bảo không bị âm tồn kho khi đặt quá số lượng/đặt đồng thời; viết `@RestControllerAdvice` trả lỗi JSON chuẩn (`400`, `401`, `403`, `404`).
  - [ ] **Tài liệu API tự động:** Tích hợp **Swagger UI (`springdoc-openapi`)** để xem và test trực tiếp toàn bộ API trên trình duyệt.
  - [ ] *(Nâng cao cộng điểm)* Nghiên cứu tích hợp thanh toán **VNPAY Sandbox** cho đơn hàng.
- **Từ khóa tự nghiên cứu:** `Spring Boot @Transactional rollback`, `JPA Pessimistic Lock`, `@RestControllerAdvice`, `springdoc-openapi Swagger UI Spring Boot 3`.

### 3. TRÁNG (Frontend Shop - Giao diện khách hàng & SEO)
- **Nhánh làm việc:** `feat/fe-shop-polish` (từ `develop`)
- **Nhiệm vụ (Hoàn thiện trải nghiệm mua sắm & tối ưu SEO):**
  - [ ] **Kiểm tra dữ liệu thật & Luồng mua hàng:** Đảm bảo 100% sản phẩm hiển thị từ API thật (xóa sạch dữ liệu mẫu sneaker nếu còn ở fallback), test kỹ luồng Tìm kiếm, Lọc hãng/size/giá, Thêm giỏ hàng & Đặt hàng.
  - [ ] **Bổ sung trang cho Khách hàng:** Hoàn thiện trang **Lịch sử đơn hàng của tôi** (`/don-hang`) để khách theo dõi trạng thái `PENDING -> SHIPPING -> DELIVERED`.
  - [ ] **Tối ưu UX & SEO Next.js:** Bổ sung `generateMetadata()` cho `/san-pham/[id]` để tiêu đề tab hiển thị đúng tên đôi giày; thêm Loading Skeleton, sửa ô Email ở Modal Đăng ký khỏi bị cắt chữ, và kiểm tra giao diện trên màn hình điện thoại (Responsive).
- **Từ khóa tự nghiên cứu:** `Next.js App Router generateMetadata`, `React debounce search input`, `Tailwind responsive grid`, `Next.js loading skeleton UI`.

### 4. ĐỨC (Frontend Admin - Giao diện quản trị & Bảo mật)
- **Nhánh làm việc:** `feat/fe-admin-polish` (từ `develop`)
- **Nhiệm vụ (Rà soát tính năng quản trị & Bảo mật trước khi nộp):**
  - [ ] **Kiểm tra CRUD & Upload ảnh:** Test lại luồng Thêm/Sửa/Xóa sản phẩm (`/admin/products/new`), chỉnh sửa tồn kho từng size và API `/api/upload` đảm bảo ảnh mới hiển thị đúng cả ở Trang chủ lẫn Trang chi tiết.
  - [ ] **Test vòng đời Đơn hàng & Biểu đồ:** Test đổi trạng thái đơn hàng từ `PENDING` -> `DELIVERED` ở `/admin/orders` và kiểm tra **Biểu đồ doanh thu 12 tháng** trên `/admin` nhảy số chính xác.
  - [x] **Bảo mật giao diện Admin:** Xác nhận tài khoản `ROLE_CUSTOMER` không thể truy cập `/admin/**`; **xóa mật khẩu điền sẵn** ở trang `/admin/login` trước ngày bảo vệ; đảm bảo `npm run build` xanh sạch.
- **Từ khóa tự nghiên cứu:** `Next.js protected route role guard`, `React Hook Form Zod validation`, `Axios interceptor handle 401 403`.

### 5. THÀNH VIÊN 5 (BA, QA Testing, Dữ liệu chuẩn & Báo cáo)
- **Nhánh làm việc:** `feat/qa-seed-and-docs` (từ `develop`)
- **Nhiệm vụ (Đóng góp trực tiếp trên GitHub + Hoàn thiện hồ sơ bảo vệ):**
  - [ ] **Làm giàu dữ liệu mẫu (`database/02_seed_data.sql`):** Bổ sung thêm các mẫu giày bóng đá/phụ kiện (lên 12–15 sản phẩm) và thêm sẵn **3–4 đơn hàng mẫu (`DELIVERED`, `PENDING`)** để khi mở Dashboard Admin biểu đồ doanh thu hiển thị cột dữ liệu đẹp ngay từ đầu.
  - [ ] **QA Testing (Kiểm thử chéo):** Lập bảng Test Case và trực tiếp bấm test các tình huống lỗi (đặt số lượng vượt tồn kho, bỏ trống thông tin giao hàng, user thường vào `/admin`, tìm kiếm ký tự đặc biệt...) để báo cho các thành viên sửa.
  - [ ] **Báo cáo cuối kỳ & Sơ đồ:** Hoàn thiện tài liệu báo cáo (Đặc tả nghiệp vụ, **Sơ đồ Use Case**, **ERD 10 bảng 3NF**, **Sequence Diagram** luồng JWT & Đặt hàng trừ kho), chụp ảnh sản phẩm thật đưa vào `README.md` và Slide thuyết trình.
- **Từ khóa tự nghiên cứu:** `Black-box testing ecommerce checklist`, `UML Sequence Diagram JWT Authentication`, `MySQL 3NF ERD`, `Draw.io / PlantUML`.

---

## 🧪 3. TÀI KHOẢN MẪU TEST HỆ THỐNG
- **Admin:** `admin@gmail.com` / `123456` (Đăng nhập tại `/admin/login`)
- **Khách hàng:** `customer@gmail.com` / `123456` (Đăng nhập tại Trang chủ `/`)