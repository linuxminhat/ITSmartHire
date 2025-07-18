import pandas as pd
import re
from pathlib import Path

RAW_CSV = "resume_data.csv"
PRETTY_XL = "resume_data_pretty.xlsx"

df = pd.read_csv(RAW_CSV)


def clean(col):
    col = re.sub(r"\ufeff", "", col)
    return col.strip()


df.columns = [clean(c) for c in df.columns]

rename_map = {
    "educationaL_requirements": "educational_requirements",
    "experiencere_requirement": "experience_requirement",
}
df = df.rename(columns=rename_map)

cols_keep = [
    "address",
    "career_objective",
    "skills",
    "educational_institution_name",
    "degree_names",
    "passing_years",
    "educational_results",
    "result_types",
    "major_field_of_studies",
    "professional_company_names",
    "company_urls",
    "start_dates",
    "end_dates",
    "related_skils_in_job",
    "positions",
    "locations",
    "responsibilities",
    "extra_curricular_activity_types",
    "extra_curricular_organization_names",
    "extra_curricular_organization_links",
    "role_positions",
    "languages",
    "proficiency_levels",
    "certification_providers",
    "certification_skills",
    "online_links",
    "issue_dates",
    "expiry_dates",
    "job_position_name",
    "educational_requirements",
    "experience_requirement",
    "age_requirement",
    "responsibilities.1",
    "skills_required",
    "matched_score",
]

missing = [c for c in cols_keep if c not in df.columns]
for col in missing:
    df[col] = ""

df = df[cols_keep]

with pd.ExcelWriter(PRETTY_XL, engine="xlsxwriter") as writer:
    df.to_excel(writer, sheet_name="ResumeData", index=False)
    wb, ws = writer.book, writer.sheets["ResumeData"]

    hdr = wb.add_format(
        {"bold": True, "text_wrap": True, "valign": "top", "bg_color": "#D9E1F2"}
    )
    body = wb.add_format({"text_wrap": True, "valign": "top"})
    zebra = wb.add_format({"bg_color": "#F9F9F9"})

    for col, _ in enumerate(df.columns):
        ws.write(0, col, df.columns[col], hdr)
        ws.set_column(col, col, 28, body)
        ws.conditional_format(
            1,
            col,
            len(df),
            col,
            {"type": "formula", "criteria": "=MOD(ROW(),2)=0", "format": zebra},
        )

    ws.freeze_panes(1, 0)

print(f"✔  Xuất '{PRETTY_XL}' hoàn tất.")
print(f"   → Rows: {len(df):,} | Cols: {len(df.columns)}")
if missing:
    print(f"   * Đã thêm cột trống: {missing}")
else:
    print("   * Không thiếu cột nào.")
