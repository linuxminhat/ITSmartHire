
# 🚀 Quy Trình Làm Việc Với Git Branch (Solo Dev - NestJS Project)

Tài liệu hướng dẫn tạo, làm việc, và merge nhánh khi phát triển tính năng mới trong dự án backend NestJS.

---

## 🧱 1. Tạo nhánh mới từ `main`

```bash
git checkout main
git pull origin main  # Đảm bảo đang có bản mới nhất
git checkout -b be-nestjs-mongoose-plugins
```

> Tên nhánh nên có tiền tố như `be-` (backend), `fe-` (frontend), hoặc `feature-`, `fix-`,...

---

## ✍️ 2. Code, Commit và Push

Sau khi code xong (ví dụ cập nhật `timestamps: true` trong schema), thực hiện:

```bash
git add .
git commit -m "feat: add timestamps option to mongoose schema"
git push origin be-nestjs-mongoose-plugins
```

---

## 🔀 3. Merge vào `main` sau khi hoàn thành

### Bước 1: Chuyển về nhánh `main` và cập nhật

```bash
git checkout main
git pull origin main
```

### Bước 2: Merge nhánh mới vào `main`

```bash
git merge be-nestjs-mongoose-plugins
```

> 📝 Hoặc dùng `--no-ff` để giữ lịch sử rõ ràng:
```bash
git merge --no-ff be-nestjs-mongoose-plugins -m "merge plugin mongoose timestamps update"
```

---

## 🚀 4. Push `main` lên GitHub

```bash
git push origin main
```

---

## 🛟 BONUS: Tạo tag backup trước khi merge (tuỳ chọn)

```bash
git tag backup-before-merge
```

Nếu cần quay lại:

```bash
git checkout backup-before-merge
```

---

## ✅ Tổng kết

| Hành động | Lệnh |
|-----------|------|
| Tạo nhánh mới | `git checkout -b <branch-name>` |
| Push nhánh | `git push origin <branch-name>` |
| Merge vào main | `git checkout main && git pull && git merge <branch>` |
| Push lên GitHub | `git push origin main` |

---

**Tip:** Luôn `pull` trước khi merge và luôn `commit` đầy đủ trước khi `checkout` để tránh mất code.

 