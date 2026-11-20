# SoccerStore Vietnam - Hệ thống Thương mại điện tử Giày Bóng Đá

Dự án website bán giày bóng đá và phụ kiện thể thao tích hợp trang khách hàng (Storefront) và trang quản trị (Admin Dashboard).

## Công nghệ sử dụng
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Java, Spring Boot, Spring Security (JWT), Spring Data JPA
- **Database:** MySQL

## Các tính năng chính
### 1. Trang khách hàng (Storefront)
- Giao diện nền tối **Dark Navy** đồng bộ với hệ thống banner thể thao.
- Hiển thị danh mục sản phẩm, lọc theo hãng sản xuất, mức giá, kích cỡ (size) và sản phẩm khuyến mãi.
- Giỏ hàng (`/gio-hang`) và quy trình đặt hàng trực tuyến (COD), tự động trừ tồn kho theo từng size khi đặt đơn thành công.

### 2. Trang quản trị (Admin Dashboard)
- **Quản lý sản phẩm:** Thêm, sửa, xóa sản phẩm, quản lý biến thể size và tồn kho.
- **Quản lý đơn hàng (`/admin/orders`):**
  - Theo dõi danh sách đơn hàng theo thời gian thực từ MySQL, lọc theo trạng thái (`PENDING`, `SHIPPING`, `DELIVERED`).
  - Cập nhật trạng thái giao hàng trực tiếp.
  - **Xuất phiếu giao hàng khổ A4:** Mẫu chứng từ bảng biểu 7 cột (Stt, Tên mặt hàng kèm size, Đvt, Số lượng, Đơn giá, Thành tiền, Ghi chú), tự động đọc tổng tiền bằng chữ tiếng Việt và hỗ trợ in/xuất PDF trực tiếp.

## Hướng dẫn chạy dự án
1. **Khởi chạy Backend (Cổng 8080):** Vào thư mục `backend` và chạy `./mvnw spring-boot:run`
2. **Khởi chạy Frontend (Cổng 3000):** Vào thư mục `frontend` và chạy `npm install && npm run dev`

## Thành viên thực hiện
- Minh (Trưởng nhóm)
- Lê Minh Đức
- Hào
- Trần Quốc Tráng