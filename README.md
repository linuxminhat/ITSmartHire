# 🚀 ITFsmarthire

Dự án tuyển dụng & tìm kiếm việc làm IT, phát triển bằng **NestJS** (Backend cho đồ án tốt nghiệp). Website tích hợp 2 dự án website phụ, gồm có:

* **Mock Interview**: trang phỏng vấn thử với các câu hỏi lập trình mô phỏng.
* **CV Autogeneration**: trang hỗ trợ tạo CV tự động dựa trên mẫu có sẵn.

---

## 📦 Cài đặt

Chạy lệnh sau để cài đặt tất cả phụ thuộc:

```bash
npm install
```

## 🚀 Khởi chạy dự án

```bash
npm run start
```

---

## 🌟 Tính năng chính của website tìm việc làm IT :

* **Đăng ký / Đăng nhập**: bảo mật bằng JWT và hash mật khẩu.
* **ROLE HR : Quản lý hồ sơ ứng viên, Tạo trang công ty và trang việc làm, tạo công việc, xem hồ sơ ứng viên, đặt lịch phỏng vấn gửi về email ứng viên**: CRUD
* **ROLE USER : Tìm kiếm việc làm, chỉnh sửa hồ sơ cá nhân, tìm công việc**
* Tính năng AI nổi bật
* **Resume Parsing**: trích xuất hồ sơ ứng viên
* **Chấm điểm hồ sơ ứng viên**: cải tiến mô hình học máy SentenceTransformer allmpnet-base-v2
* **Mock Interview**: phỏng vấn giả lập với bộ câu hỏi lập trình được sinh ra tự động ở gemini API
* **CV Autogeneration**: tạo CV tự động dựa trên mẫu và thông tin ứng viên.

---

## 📄 Bảo mật & cấu hình

* Sử dụng file `.env` để cấu hình biến môi trường.
* Các biến quan trọng:

  * `DB_URI`: kết nối cơ sở dữ liệu MongoDB.
  * `JWT_SECRET`: khóa JWT.

---

## ❤️ Đóng góp

Mọi đóng góp vui lòng tạo PR hoặc issue trong repository GitHub.

---

Tóm lại: Dự án ITFsmarthire cung cấp nền tảng tuyển dụng IT toàn diện, kết hợp tính năng phỏng vấn thử và hỗ trợ tạo CV tự động.
