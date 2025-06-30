# 🚀 ITFsmarthire : Website tuyển dụng và tìm việc làm IT 

Dự án tuyển dụng & tìm kiếm việc làm IT, phát triển bằng **NodeJS** **NestJS** **ReactJS** **FireBase** . Website tích hợp 2 dự án website phụ, gồm có:

* **Mock Interview**: Link dự án : https://github.com/linuxminhat/ITsmartinterview.git : Website hỗ trợ phỏng vấn giả lập với các câu hỏi lập trình mô phỏng, công nghệ sử dụng gồm **google-cloud texttospeech** hỗ trợ chuyển giọng nói thành văn bản, hỗ trợ tiếng Anh và tiếng Việt, **gemini API** hỗ trợ sinh câu hỏi và nhận xét.
* **CV Autogeneration**: Link dự án : https://github.com/linuxminhat/ITsmartresume-prj.git : Website hỗ trợ tạo CV tự động dựa trên mẫu có sẵn sử dụng **gemini API**.

Tính năng AI nổi bật : 
* **Chấm điểm hồ sơ ứng viên so với mô tả công việc**: cải tiến mô hình học máy **SentenceTransformer allmpnet-base-v2** nhằm chấm điểm hồ sơ là file excel được trích xuất so khớp với JD (mô tả công việc). Repository cung cấp Dataset và mô hình output. Thư mục mô hình đã được tinh chỉnh và lưu : BERT/finetune-score-cv-jd. Chạy Server : **cv_scoring_server.py**. 
* **ResumeParsing**: trích xuất hồ sơ ứng viên, sử dụng **gemini API**. Chạy Server **llm_server.py**. 
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
* **Vai trò  HR : Quản lý hồ sơ ứng viên, tạo trang công ty và trang việc làm, tạo công việc, xem hồ sơ ứng viên, đặt lịch phỏng vấn gửi về email ứng viên tích hợp Google Meet vào thông báo**: CRUD
* **Vai trò USER : Tìm kiếm việc làm, chỉnh sửa hồ sơ cá nhân, tìm kiếm công việc**

## 🌟 Tính năng AI nổi bật :
* **Resume Parsing**: trích xuất hồ sơ ứng viên sử dụng công nghệ gemini API, mô hình gemini-1.5-pro. 
* **Chấm điểm hồ sơ ứng viên**: cải tiến mô hình học máy SentenceTransformer allmpnet-base-v2 với tập dataset gồm 9546 bản ghi mô tả công việc và hồ sơ ứng viên, nhằm so khớp hồ sơ ứng viên và mô tả công việc. 
* **Mock Interview**: phỏng vấn giả lập với bộ câu hỏi lập trình được sinh ra tự động ở gemini API. Tích hợp Repository này : https://github.com/linuxminhat/ITsmartinterview.git
* **CV Autogeneration**: tạo CV tự động dựa trên mẫu và thông tin ứng viên nhập vào. Tích hợp Repository này : https://github.com/linuxminhat/ITsmartresume-prj.git
---
## 🔧 Cấu hình file `.env` backend của dự án website tìm việc IT 

Tạo file `.env` trong thư mục gốc của backend và khai báo các biến môi trường sau:

| Biến môi trường               | Mô tả                                                                                  |
|-------------------------------|----------------------------------------------------------------------------------------|
| `PORT`                        | Cổng ứng dụng (ví dụ: `8000`)                                                          |
| `MONGO_URL`                   | URL kết nối MongoDB (gồm username, password, host, database)                           |
| `JWT_ACCESS_TOKEN_SECRET`     | Khóa bí mật để tạo JWT access token                                                    |
| `JWT_ACCESS_EXPIRE`           | Thời gian hết hạn của access token (ví dụ: `365d`)                                     |
| `JWT_REFRESH_TOKEN_SECRET`    | Khóa bí mật để tạo JWT refresh token                                                   |
| `JWT_REFRESH_EXPIRE`          | Thời gian hết hạn của refresh token (ví dụ: `365d`)                                    |
| `IS_PUBLIC_KEY`               | Khóa công khai cho JWT (nếu có)                                                        |
| `SHOULD_INIT`                 | Cờ khởi tạo dữ liệu ban đầu (true/false)                                               |
| `INIT_PASSWORD`               | Mật khẩu mặc định khi khởi tạo dữ liệu                                                 |
| `REDIS_HOST`                  | Địa chỉ host của Redis                                                                 |
| `REDIS_PORT`                  | Cổng Redis                                                                             |
| `SMTP_HOST`                   | Host SMTP gửi email (ví dụ: `smtp.gmail.com`)                                         |
| `SMTP_PORT`                   | Cổng SMTP (ví dụ: `465`)                                                               |
| `SMTP_USER`                   | Tài khoản email gửi                                                                    |
| `SMTP_PASS`                   | Mật khẩu ứng dụng (app password)                                                        |
| `GCAL_CLIENT_ID`              | Client ID OAuth2 của Google Calendar                                                  |
| `GCAL_CLIENT_SECRET`          | Client Secret OAuth2 của Google Calendar                                              |
| `GCAL_REFRESH_TOKEN`          | Refresh token OAuth2 của Google Calendar                                               |
| `REDIRECT_URI`                | URL callback OAuth2 (ví dụ: `http://localhost:8000/oauth2callback`)                    |
| `GEMINI_API_KEY`              | API key cho Gemini (hoặc Google Cloud)                                                 |

---
## 🔧 Cấu hình file `.env` (Frontend)

Tạo file `.env` trong thư mục gốc của frontend và khai báo các biến môi trường sau:

| Biến môi trường                | Mô tả                                                       |
|--------------------------------|-------------------------------------------------------------|
| `NODE_ENV`                     | Chế độ chạy ứng dụng (`development` / `production`)         |
| `PORT`                         | Cổng chạy dev server (ví dụ: `3000`)                        |
| `VITE_BACKEND_URL`             | URL của backend API (ví dụ: `http://localhost:8000`)        |
| `VITE_GOOGLE_MAPS_API_KEY`     | API key Google Maps để hiển thị bản đồ                      |

---
## 🔧 Cấu hình file `.env` (Mock Interview)

Tạo file `.env` trong thư mục gốc của dự án Mock Interview và khai báo các biến môi trường sau:

| Biến môi trường                             | Mô tả                                                                                         |
|---------------------------------------------|-----------------------------------------------------------------------------------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`         | Publishable Key của Clerk (frontend)                                                          |
| `CLERK_SECRET_KEY`                          | Secret Key của Clerk (backend)                                                                |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`             | Đường dẫn trang đăng nhập của Clerk                                                           |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`             | Đường dẫn trang đăng ký của Clerk                                                             |
| `NEXT_PUBLIC_DRIZZLE_DB_URL`                | URL kết nối tới cơ sở dữ liệu Drizzle/Neon                                                   |
| `NEXT_PUBLIC_GEMINI_API_KEY`                | API key cho Gemini API (text generation)                                                      |
| `NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT`      | Số lượng câu hỏi phỏng vấn mặc định được sinh                                                |
| `GOOGLE_APPLICATION_CREDENTIALS`            | Tên file JSON chứa credentials của Google Service Account (Text-to-Speech)                    |
| `NEXT_PUBLIC_GOOGLE_TTS_API_KEY`            | API key cho Google Cloud Text-to-Speech                                                      |

---
## 🔧 Cấu hình file `.env` (Resume AI)

Tạo file `.env` trong thư mục gốc của dự án Resume AI và khai báo các biến môi trường sau:

| Biến môi trường                             | Mô tả                                                                                         |
|---------------------------------------------|-----------------------------------------------------------------------------------------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`         | Publishable Key của Clerk (frontend)                                                          |
| `CLERK_SECRET_KEY`                          | Secret Key của Clerk (backend)                                                                |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`             | Đường dẫn trang đăng nhập của Clerk                                                           |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`             | Đường dẫn trang đăng ký của Clerk                                                             |
| `MONGODB_URL`                               | URL kết nối MongoDB riêng cho Resume AI (khác với project tuyển dụng IT)                     |
| `GEMINI_API_KEY`                            | API key cho Gemini (hoặc Google Cloud)                                                        |
| `BASE_URL`                                  | URL gốc của ứng dụng (vd. `http://localhost:3000`)                                            |

---

## ❤️ Đóng góp

Mọi đóng góp vui lòng tạo PR hoặc issue trong repository GitHub.

---

Tóm lại: Dự án ITFsmarthire cung cấp nền tảng tuyển dụng IT toàn diện, kết hợp tính năng phỏng vấn thử và hỗ trợ tạo CV tự động.
