import pandas as pd
import re, ast
from sklearn.model_selection import train_test_split

SRC_XLSX = "resume_data_with_scores.xlsx"


# remove extra spaces in string
def clean(s: str) -> str:
    if pd.isna(s):
        return ""
    return re.sub(r"\s+", " ", str(s)).strip()


# ["Python", "Java"] =>"[\"Python\", \"Java\"]"
def list2txt(cell):
    if pd.isna(cell):
        return ""
    try:
        lst = ast.literal_eval(cell)
        if isinstance(lst, list):
            return ", ".join(map(str, lst))
    except:
        pass
    return str(cell)


df = pd.read_excel(SRC_XLSX)
print(f"Đã đọc {len(df):,} bản ghi từ {SRC_XLSX}")


rows = []
for _, r in df.iterrows():
    cv = f"Skills: {list2txt(r['skills'])}"
    jd = f"Related skills: {list2txt(r['related_skils_in_job'])}"
    rows.append(
        {
            "cv_text": cv,
            "jd_text": jd,
            "score": pd.to_numeric(r["skills_score"], errors="coerce"),
        }
    )

    cv = (
        f"Start dates: {list2txt(r['start_dates'])}. "
        f"End dates: {list2txt(r['end_dates'])}. "
        f"Positions: {list2txt(r['positions'])}"
    )
    jd = f"Experience requirement: {clean(r['experience_requirement'])}"
    rows.append(
        {
            "cv_text": cv,
            "jd_text": jd,
            "score": pd.to_numeric(r["experience_score"], errors="coerce"),
        }
    )

    cv = f"Positions: {list2txt(r['positions'])}"
    jd = f"Job title: {clean(r['job_position_name'])}"
    rows.append(
        {
            "cv_text": cv,
            "jd_text": jd,
            "score": pd.to_numeric(r["designation_score"], errors="coerce"),
        }
    )

    cv = f"Degrees: {list2txt(r['degree_names'])}"
    jd = f"Education requirement: {clean(r['educational_requirements'])}"
    rows.append(
        {
            "cv_text": cv,
            "jd_text": jd,
            "score": pd.to_numeric(r["degree_score"], errors="coerce"),
        }
    )

# Collect the results into a DataFrame, then randomly split it into a training set and a validation set.
flat_df = pd.DataFrame(rows)
flat_df = flat_df.dropna(subset=["cv_text", "jd_text", "score"])
# limit score in [0,1]
flat_df["score"] = flat_df["score"].clip(0, 1)
print(f"Tổng cộng {len(flat_df):,} mẫu sau khi flatten")


train, valid = train_test_split(flat_df, test_size=0.1, random_state=42)
train.to_csv("train_flat.csv", index=False)
valid.to_csv("valid_flat.csv", index=False)
print(f"Đã lưu train_flat.csv ({len(train)}) & valid_flat.csv ({len(valid)})")
