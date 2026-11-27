# Hướng Dẫn Chạy Toàn Hệ Thống (Docker) & Triển Khai VPS Ubuntu

## 1. Chạy trọn bộ trên máy local bằng 1 lệnh Docker
```bash
cd webbd_project
cp .env.example .env
docker compose up -d --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8080`
- MySQL 8.0: `localhost:3306` (Database: `WebBD_db`)
- Nếu cần nạp lại toàn bộ `database/*.sql` từ đầu:
  ```bash
  docker compose down -v && docker compose up -d --build
  ```

---

## 2. Triển khai thực tế lên VPS Ubuntu + Nginx + SSL HTTPS

### Bước 1: Chuẩn bị `.env` trên VPS
```bash
cp .env.example .env
nano .env
```
Cập nhật các giá trị thật trước khi build:
- `MYSQL_ROOT_PASSWORD`, `DB_PASSWORD`: đổi mật khẩu mạnh
- `JWT_SECRET`: chuỗi ngẫu nhiên dài tối thiểu 32 ký tự (`openssl rand -hex 32`)
- `CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com`
- `NEXT_PUBLIC_API_URL=` *(để trống để Frontend gọi cùng domain `https://yourdomain.com/api/...` qua Nginx, tránh lỗi Mixed Content & CORS)*

### Bước 2: Build và khởi chạy container
```bash
docker compose up -d --build
```

### Bước 3: Cấu hình Nginx Reverse Proxy + SSL Certbot
```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx/webbd.conf /etc/nginx/sites-available/webbd
sudo sed -i 's/yourdomain.com/tenmien-that.com/g' /etc/nginx/sites-available/webbd
sudo ln -s /etc/nginx/sites-available/webbd /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# Cấp chứng chỉ SSL HTTPS miễn phí từ Let's Encrypt
sudo certbot --nginx -d tenmien-that.com -d www.tenmien-that.com
```

> **Lưu ý kiến trúc quan trọng:** Trong dự án này `/api/upload` là Next.js Route Handler (cổng `3000`), còn `/api/v1/**` là Spring Boot (cổng `8080`). File `deploy/nginx/webbd.conf` đã đặt `location = /api/upload` ưu tiên trước `location /api/` để upload ảnh không bị định tuyến nhầm sang Java Backend.
