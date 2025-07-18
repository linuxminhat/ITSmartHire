import pandas as pd

INPUT_FILE = "resume_data.xlsx"
OUTPUT_FILE = "resume_data_with_scores.xlsx"


df = pd.read_excel(INPUT_FILE)


idx = df.columns.get_loc("matched_score")

new_cols = ["skills_score", "experience_score", "designation_score", "degree_score"]

for col in reversed(new_cols):
    df.insert(idx, col, pd.NA)

df.to_excel(OUTPUT_FILE, index=False)
print(f"Đã tạo file {OUTPUT_FILE} với 4 cột điểm mới trước 'matched_score'.")
