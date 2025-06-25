# add_score_columns.py
import pandas as pd

INPUT_FILE = "resume_data.xlsx"
OUTPUT_FILE = "resume_data_with_scores.xlsx"

# 1) Đọc file gốc
df = pd.read_excel(INPUT_FILE)

# 2) Xác định vị trí cột 'matched_score'
idx = df.columns.get_loc("matched_score")  # vị trí (0-based)

# 3) Danh sách cột mới (theo thứ tự mong muốn)
new_cols = ["skills_score", "experience_score", "designation_score", "degree_score"]

# 4) Chèn từng cột mới (giá trị mặc định là NaN) ngay trước 'matched_score'
for col in reversed(new_cols):  # chèn ngược để giữ đúng thứ tự
    df.insert(idx, col, pd.NA)

# 5) Ghi ra file Excel mới
df.to_excel(OUTPUT_FILE, index=False)
print(f"Đã tạo file {OUTPUT_FILE} với 4 cột điểm mới trước 'matched_score'.")
