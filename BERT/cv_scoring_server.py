import os
import json
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
from flask import Flask, request, send_file, jsonify
from io import BytesIO
from flask_cors import CORS
import torch
import re, unicodedata
from dotenv import load_dotenv
import requests
import math
from langdetect import detect
import logging
import google.generativeai as genai
from pathlib import Path

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("cv-score-api")
app = Flask(__name__)
CORS(app)


load_dotenv()
os.environ["TRANSFORMERS_OFFLINE"] = "1"
log.info("Loading SentenceTransformer model for scoring...")
try:
    model_dir = Path(__file__).resolve().parent / "finetune-score-cv-jd"
    assert model_dir.exists(), f"Không tìm thấy thư mục model: {model_dir}"

    # SentenceTransformer chấp nhận cả str lẫn Path, nhưng truyền str là chắc ăn:
    model = SentenceTransformer(str(model_dir))
    log.info("SentenceTransformer model loaded successfully.")
except Exception as e:
    log.error(f"Failed to load SentenceTransformer model: {e}")
    model = None

log.info("Configuring Gemini API for JD extraction...")
try:
    GEMINI_API_KEY_SCORING = os.getenv("GEMINI_API_KEY_SCORING")
    if not GEMINI_API_KEY_SCORING:
        raise ValueError("GEMINI_API_KEY_SCORING not found in .env file.")
    genai.configure(api_key=GEMINI_API_KEY_SCORING)
    gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    log.info("Gemini API configured successfully.")
except Exception as e:
    log.error(f"Failed to configure Gemini API: {e}")
    gemini_model = None


JD_EXTRACTION_PROMPT = """
You are an HR-AI. From the JD below, extract the following and return **ONLY** the JSON shown.

JD:
{jd_text}

Rules:
• designation  → most specific title; infer from skills if absent; "" if none.  
• required_experience_years  → smallest years mentioned (e.g. "3-5" → 3); 0 if none.  
• required_degree  → full degree string; "GENERIC_IT_DEGREE" for generic mentions; "" if none.  
• required_skills  → list every tech software skill (languages, frameworks, DBs, tools, methods).  
• required_gpa  → highest GPA number required found (on a 4.0 scale); 0 if none.  
• required_languages  → list any language requirements; [] if none.  
• required_certifications  → list certifications explicitly required; [] if none.  
• required_awards  → list awards/honors mentioned; [] if none.

Output JSON (no markdown, no extra text):
{{
  "designation": "",
  "required_experience_years": 0,
  "required_degree": "",
  "required_skills": [],
  "required_gpa": 0,
  "required_languages": [],
  "required_certifications": [],
  "required_awards": []
}}
"""


def extract_jd_info_with_gemini(jd_text: str) -> dict:
    if not gemini_model:
        raise ConnectionError("Gemini API is not configured.")

    prompt = JD_EXTRACTION_PROMPT.format(jd_text=jd_text)
    default_response = {
        "designation": "",
        "required_experience_years": 0,
        "required_degree": "",
        "required_skills": [],
        "required_gpa": 0,
        "required_languages": [],
        "required_certifications": [],
        "required_awards": [],
    }
    try:
        log.info("Sending JD to Gemini API for extraction...")
        response = gemini_model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.0, response_mime_type="application/json"
            ),
        )
        response_text = response.text
        log.info("Received response from Gemini.")
        data = json.loads(response_text)
        # Validate and structure the data
        validated_data = {
            "designation": data.get("designation", ""),
            "required_experience_years": float(
                data.get("required_experience_years", 0)
            ),
            "required_degree": data.get("required_degree", ""),
            "required_skills": data.get("required_skills", []),
            "required_gpa": float(data.get("required_gpa", 0)),
            "required_languages": data.get("required_languages", []),
            "required_certifications": data.get("required_certifications", []),
            "required_awards": data.get("required_awards", []),
        }
        return validated_data

    except Exception as e:
        log.error(f"[Gemini API Error]: {e}")
        return default_response


def calculate_list_match_score(candidate_list, jd_list, threshold=0.7):
    """Calculates match score for lists like skills, certs, awards."""
    if not jd_list:
        return -1.0  # Not required by JD
    if (
        pd.isna(candidate_list)
        or not candidate_list
        or str(candidate_list) == "Ứng viên không cung cấp thông tin này"
        or not model
    ):
        return 0.0

    if isinstance(candidate_list, str):
        candidate_list = [
            item.strip() for item in candidate_list.split(",") if item.strip()
        ]
    if not candidate_list:
        return 0.0

    candidate_list = [item.lower().strip() for item in candidate_list]
    jd_list = [item.lower().strip() for item in jd_list]

    candidate_embeddings = model.encode(candidate_list)
    jd_embeddings = model.encode(jd_list)
    similarities = util.cos_sim(candidate_embeddings, jd_embeddings)

    matches = 0
    for i in range(len(jd_list)):
        if torch.any(similarities[:, i] > threshold):
            matches += 1

    score = (float(matches) / len(jd_list)) if len(jd_list) > 0 else 1.0
    return min(score, 1.0)


def calculate_experience_score(candidate_years, required_years):
    if (
        pd.isna(candidate_years)
        or str(candidate_years) == "Ứng viên không cung cấp thông tin này"
        or not candidate_years
    ):
        candidate_years = 0
    try:
        candidate_years = float(candidate_years)
        required_years = float(required_years)

        if required_years == 0:
            return 1.0  # 100% fit if no experience is required
        if candidate_years >= required_years:
            return 1.0
        elif candidate_years > 0:
            return candidate_years / required_years
        return 0.0
    except (ValueError, TypeError):
        return 0.0


def calculate_designation_score(
    candidate_designation: str, jd_designation: str
) -> float:
    if (
        pd.isna(candidate_designation)
        or str(candidate_designation) == "Ứng viên không cung cấp thông tin này"
        or not candidate_designation
        or not jd_designation
        or not model
    ):
        return 0.0
    cand = _normalize(candidate_designation)
    jd = _normalize(jd_designation)
    sim = util.cos_sim(model.encode([cand]), model.encode([jd]))[0][0].item()

    # Keep the bonus/penalty logic as it refines the raw similarity
    tags_cand, tags_jd = _tag_set(cand), _tag_set(jd)
    if tags_cand & tags_jd:
        sim = min(sim + TAG_BONUS, 1.0)
    elif {"backend", "frontend"} <= (tags_cand | tags_jd) and not (tags_cand & tags_jd):
        sim = max(sim - TAG_PENALTY, 0.0)

    return sim


def calculate_degree_score(candidate_degree: str, jd_degree: str) -> float:
    if not model:
        return 0.0
    if not jd_degree or jd_degree.strip() == "":
        return -1.0  # Not required
    if (
        pd.isna(candidate_degree)
        or str(candidate_degree) == "Ứng viên không cung cấp thông tin này"
        or not str(candidate_degree).strip()
    ):
        return 0.0

    it_prototype_vector = np.mean(
        model.encode(
            [
                "bachelor of science in computer science",
                "associate in information technology",
            ]
        ),
        axis=0,
    )

    if jd_degree == "GENERIC_IT_DEGREE":
        similarity = util.cos_sim(model.encode(candidate_degree), it_prototype_vector)[
            0
        ][0].item()
        return 1.0 if similarity > 0.5 else 0.0

    similarity = util.cos_sim(model.encode(candidate_degree), model.encode(jd_degree))[
        0
    ][0].item()
    return similarity


def calculate_gpa_score(gpa_str, required_gpa):
    if required_gpa == 0:
        return -1.0  # Not required
    if (
        pd.isna(gpa_str)
        or str(gpa_str) == "Ứng viên không cung cấp thông tin này"
        or not str(gpa_str).strip()
    ):
        return 0.0

    gpa_str = str(gpa_str).strip()
    try:
        gpa_value_str = gpa_str.split("/")[0].strip()
        gpa = float(gpa_value_str)
        is_10_point_scale = ("/10" in gpa_str) or (gpa > 4.0 and gpa <= 10.0)

        normalized_gpa = gpa
        if is_10_point_scale:
            normalized_gpa = gpa / 2.5  # Convert to 4.0 scale

        return 1.0 if normalized_gpa >= required_gpa else 0.0
    except (ValueError, TypeError):
        return 0.0


def calculate_language_score(candidate_langs, required_langs):
    if not required_langs:
        return -1.0  # Not required
    if (
        pd.isna(candidate_langs)
        or not str(candidate_langs).strip()
        or str(candidate_langs) == "Ứng viên không cung cấp thông tin này"
    ):
        return 0.0

    # If we are here, it means the cell is not empty and not the placeholder text.
    # Simple existence check as requested. For more complex logic, this can be expanded.
    return 1.0


# Helper functions _normalize and _tag_set remain the same
NORMALIZE_PATTERNS = [
    (r"\b(full[\s\-]?stack|mern|mean|lamp)\b", "full stack"),
    (r"\bfront[\s\-]?end\b", "frontend"),
    (r"\bback[\s\-]?end\b", "backend"),
    (r"\bdev[\s\-]?ops\b", "devops"),
    (r"\bsite reliability( engineer|)\b", "sre"),
    (r"\bquality[\s\-]?assurance\b", "qa"),
    (r"\b(machine[\s\-]?learning|ml engineer)\b", "ml"),
    (r"\bdata[\s\-]?science\b", "data"),
    (r"\b(cyber[\s\-]?security|info[\s\-]?sec)\b", "security"),
    (r"\bios\b", "ios"),
]
ROLE_TAGS: dict[str, set[str]] = {
    "frontend": {
        "frontend",
        "react",
        "angular",
        "vue",
        "svelte",
        "javascript",
        "typescript",
        "tailwind",
        "bootstrap",
        "material-ui",
    },
    "backend": {
        "backend",
        "java",
        "spring",
        "node",
        ".net",
        "python",
        "django",
        "flask",
        "fastapi",
        "php",
        "laravel",
        "ruby",
        "rails",
        "go",
    },
    "fullstack": {"full stack"},
    "mobile": {
        "mobile",
        "android",
        "ios",
        "swift",
        "kotlin",
        "flutter",
        "react native",
        "xamarin",
        "cordova",
        "ionic",
    },
    "devops": {
        "devops",
        "sre",
        "docker",
        "kubernetes",
        "ci/cd",
        "jenkins",
        "terraform",
        "ansible",
        "aws",
        "azure",
        "gcp",
        "prometheus",
        "grafana",
    },
    "data": {
        "data",
        "ml",
        "etl",
        "hadoop",
        "spark",
        "kafka",
        "pandas",
        "numpy",
        "tensorflow",
        "pytorch",
        "sql",
        "mysql",
        "postgres",
        "snowflake",
        "bigquery",
        "airflow",
    },
    "qa": {
        "qa",
        "tester",
        "selenium",
        "cypress",
        "playwright",
        "junit",
        "pytest",
        "robot",
    },
    "security": {
        "security",
        "jwt",
        "oauth2",
        "saml",
        "keycloak",
        "owasp",
        "pentest",
        "burp",
        "zap",
        "sonarqube",
    },
    "uiux": {
        "ui",
        "ux",
        "figma",
        "sketch",
        "adobe xd",
        "product designer",
        "interaction designer",
        "graphic designer",
    },
}
TAG_BONUS = 0.07
TAG_PENALTY = 0.05


def _normalize(text) -> str:
    if text is None or (isinstance(text, float) and math.isnan(text)):
        text = ""
    text = str(text)
    text = unicodedata.normalize("NFKD", text).lower()
    for pat, repl in NORMALIZE_PATTERNS:
        text = re.sub(pat, repl, text)
    text = re.sub(r"[^\w+#/\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _tag_set(text: str) -> set[str]:
    tokens = set(text.split())
    return {role for role, kws in ROLE_TAGS.items() if tokens & kws}


def translate_text_azure(text: str) -> str:
    log.info("--- AZURE TRANSLATION ---")
    try:
        if detect(text) == "en":
            log.info("Detected EN – skip translate")
            return text

        key = os.getenv("AZURE_TRANSLATOR_KEY")
        ep = os.getenv("AZURE_TRANSLATOR_ENDPOINT").rstrip("/")
        loc = os.getenv("AZURE_TRANSLATOR_REGION")
        if not all([key, ep, loc]):
            log.warning("Azure Translator credentials missing. Skipping translation.")
            return text

        url = f"{ep}/translate"
        params = {"api-version": "3.0", "from": "vi", "to": "en"}
        headers = {
            "Ocp-Apim-Subscription-Key": key,
            "Ocp-Apim-Subscription-Region": loc,
            "Content-Type": "application/json",
        }
        resp = requests.post(
            url, params=params, headers=headers, json=[{"text": text}], timeout=15
        )
        resp.raise_for_status()
        result = resp.json()[0]["translations"][0]["text"]
        log.info("Translation OK")
        return result
    except Exception as e:
        log.error(f"Translation error: {e}")
        return text


@app.route("/score", methods=["POST"])
def score_cvs():
    if not model or not gemini_model:
        return (
            jsonify(
                {
                    "error": "A required model (SentenceTransformer or Gemini) failed to load. Check server logs."
                }
            ),
            503,
        )
    try:
        log.info("Received scoring request to /score")

        # Safer access to file and form data
        if "file" not in request.files:
            return jsonify({"error": "No 'file' part in the request"}), 400
        excel_file = request.files["file"]

        jd_text = request.form.get("jd")  # Use .get() for safer access
        if not jd_text:
            return (
                jsonify(
                    {
                        "error": "Job Description text ('jd' field) is missing from the form."
                    }
                ),
                400,
            )

        # Step 1: Translate JD if necessary
        translated_jd = translate_text_azure(jd_text)
        log.info(f"Translated JD: {translated_jd[:100]}...")

        # Step 2: Extract JD info using Gemini API
        jd_info = extract_jd_info_with_gemini(translated_jd)
        log.info(f"Extracted JD Info from Gemini: {jd_info}")

        # Step 3: Process CVs and Score
        df = pd.read_excel(excel_file)
        scores_for_df = []

        log.info(f"Found {len(df)} CVs. Starting scoring...")
        for idx, row in df.iterrows():
            log.debug(f"\n--- CV {idx + 1}/{len(df)}: Processing ---")
            row_dict = row.to_dict()
            try:
                # --- DETAILED LOGGING ---
                log.debug(
                    f"  [SKILLS]        CV: {row_dict.get('Kỹ năng')} | JD: {jd_info['required_skills']}"
                )
                skills_score = calculate_list_match_score(
                    row_dict.get("Kỹ năng"), jd_info["required_skills"]
                )

                exp_years_candidate_str = str(
                    row_dict.get("Tổng số năm kinh nghiệm", "0")
                ).strip()
                log.debug(
                    f"  [EXPERIENCE]    CV: {exp_years_candidate_str} | JD: {jd_info['required_experience_years']}"
                )
                exp_score = calculate_experience_score(
                    exp_years_candidate_str, jd_info["required_experience_years"]
                )

                log.debug(
                    f"  [DESIGNATION]   CV: {row_dict.get('Chức danh')} | JD: {jd_info['designation']}"
                )
                designation_score = calculate_designation_score(
                    row_dict.get("Chức danh"), jd_info["designation"]
                )

                log.debug(
                    f"  [DEGREE]        CV: {row_dict.get('Bằng cấp')} | JD: {jd_info['required_degree']}"
                )
                degree_score = calculate_degree_score(
                    row_dict.get("Bằng cấp"), jd_info["required_degree"]
                )

                log.debug(
                    f"  [GPA]           CV: {row_dict.get('Điểm GPA')} | JD: {jd_info['required_gpa']}"
                )
                gpa_score = calculate_gpa_score(
                    row_dict.get("Điểm GPA"), jd_info["required_gpa"]
                )

                candidate_langs_value = row_dict.get("Ngoại ngữ")
                log.debug(
                    f"  [LANGUAGE]      CV: {candidate_langs_value} (type: {type(candidate_langs_value)}) | JD: {jd_info['required_languages']}"
                )
                language_score = calculate_language_score(
                    candidate_langs_value, jd_info["required_languages"]
                )

                log.debug(
                    f"  [CERTIFICATION] CV: {row_dict.get('Chứng chỉ')} | JD: {jd_info['required_certifications']}"
                )
                certification_score = calculate_list_match_score(
                    row_dict.get("Chứng chỉ"), jd_info["required_certifications"]
                )

                log.debug(
                    f"  [AWARD]         CV: {row_dict.get('Giải thưởng')} | JD: {jd_info['required_awards']}"
                )
                award_score = calculate_list_match_score(
                    row_dict.get("Giải thưởng"), jd_info["required_awards"]
                )

                log.debug(
                    f"  => Scores (raw): skills={skills_score:.2f}, exp={exp_score:.2f}, design={designation_score:.2f}, degree={degree_score:.2f}, gpa={gpa_score:.2f}, lang={language_score:.2f}, cert={certification_score:.2f}, award={award_score:.2f}"
                )

                # Calculate total score (average of applicable scores)
                raw_scores = [
                    skills_score,
                    exp_score,
                    designation_score,
                    degree_score,
                    gpa_score,
                    language_score,
                    certification_score,
                    award_score,
                ]
                valid_scores = [s for s in raw_scores if s != -1.0]
                total_score = (
                    (sum(valid_scores) / len(valid_scores)) if valid_scores else 0.0
                )

                # Format scores for Excel output
                def format_score(score):
                    if score == -1.0:
                        return "JD không yêu cầu"
                    return f"{score:.0%}"

                scores_for_df.append(
                    {
                        "Điểm Kỹ năng": format_score(skills_score),
                        "Điểm Kinh nghiệm": format_score(exp_score),
                        "Điểm Chức danh": format_score(designation_score),
                        "Điểm Bằng cấp": format_score(degree_score),
                        "Điểm GPA": format_score(gpa_score),
                        "Điểm Ngôn ngữ": format_score(language_score),
                        "Điểm Chứng chỉ": format_score(certification_score),
                        "Điểm Giải thưởng": format_score(award_score),
                        "Tổng điểm phù hợp": format_score(total_score),
                    }
                )

            except Exception as e:
                log.error(f"Error processing CV {idx + 1}: {str(e)}", exc_info=True)
                scores_for_df.append(
                    {
                        "Điểm Kỹ năng": "Error",
                        "Điểm Kinh nghiệm": "Error",
                        "Điểm Chức danh": "Error",
                        "Điểm Bằng cấp": "Error",
                        "Điểm GPA": "Error",
                        "Điểm Ngôn ngữ": "Error",
                        "Điểm Chứng chỉ": "Error",
                        "Điểm Giải thưởng": "Error",
                        "Tổng điểm phù hợp": "Error",
                    }
                )

        # Append new score columns to the original DataFrame
        if scores_for_df:
            scores_df = pd.DataFrame(scores_for_df)
            # --- FIX: Drop existing score columns from the original df to avoid duplicates ---
            cols_to_drop = [col for col in scores_df.columns if col in df.columns]
            if cols_to_drop:
                log.warning(
                    f"Dropping pre-existing score columns from input file: {cols_to_drop}"
                )
                df = df.drop(columns=cols_to_drop)

            df = pd.concat([df, scores_df], axis=1)

        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            # Manually create worksheet to have control over it
            worksheet = writer.book.add_worksheet("CV Scores")
            writer.sheets["CV Scores"] = worksheet

            # --- Define Formats ---
            header_format = writer.book.add_format(
                {
                    "bold": True,
                    "font_color": "black",
                    "font_size": 11,
                    "align": "center",
                    "valign": "vcenter",
                    "border": 1,
                    "bg_color": "#DDEBF7",  # Light Blue
                }
            )
            no_info_format = writer.book.add_format(
                {
                    "italic": True,
                    "font_color": "#9C4500",
                    "bg_color": "#FFE5CC",
                    "border": 1,
                    "align": "center",
                    "valign": "vcenter",  # Removed wrap
                }
            )
            jd_not_required_format = writer.book.add_format(
                {
                    "italic": True,
                    "font_color": "#666666",
                    "bg_color": "#EFEFEF",
                    "border": 1,
                    "align": "center",
                    "valign": "vcenter",  # Removed wrap
                }
            )
            percent_format = writer.book.add_format(
                {
                    "num_format": "0%",
                    "border": 1,
                    "align": "center",
                    "valign": "vcenter",
                    "bg_color": "white",
                }
            )
            default_format = writer.book.add_format(
                {"border": 1, "valign": "top", "bg_color": "white"}  # No wrap
            )
            long_text_format = writer.book.add_format(
                {
                    "border": 1,
                    "valign": "top",
                    "text_wrap": True,
                    "bg_color": "white",  # Wrap for specific columns
                }
            )
            error_format = writer.book.add_format(
                {
                    "bg_color": "#FFC7CE",
                    "font_color": "#9C0006",
                    "border": 1,
                    "valign": "vcenter",
                }
            )

            # --- Write Data ONLY (header will be in the table) ---
            long_text_columns = ["Kinh nghiệm làm việc", "Dự án", "Bằng cấp"]

            # Write data rows starting from the first row (index 0)
            for r_idx, row in enumerate(df.itertuples(index=False), 0):
                for c_idx, cell_value in enumerate(row):
                    col_name = df.columns[c_idx]
                    current_format = default_format

                    if pd.isna(cell_value):
                        cell_value = ""

                    if cell_value == "Ứng viên không cung cấp thông tin này":
                        current_format = no_info_format
                    elif cell_value == "JD không yêu cầu":
                        current_format = jd_not_required_format
                    elif cell_value == "Error":
                        current_format = error_format
                    elif isinstance(cell_value, str) and cell_value.endswith("%"):
                        try:
                            numeric_val = float(cell_value.strip("%")) / 100
                            worksheet.write_number(
                                r_idx + 1, c_idx, numeric_val, percent_format
                            )
                            continue  # Skip the generic write at the end
                        except (ValueError, TypeError):
                            current_format = default_format
                    elif col_name in long_text_columns:
                        current_format = long_text_format

                    worksheet.write(r_idx + 1, c_idx, cell_value, current_format)

            # --- Final Touches: Table, Column Widths, Freeze Panes ---
            (max_row, max_col) = df.shape

            # 1. Create a Table (adds filters and defines headers explicitly)
            column_headers = [{"header": str(col)} for col in df.columns]
            worksheet.add_table(
                0,
                0,
                max_row,
                max_col - 1,
                {
                    "columns": column_headers,
                    "style": "Table Style Medium 9",
                    "banded_rows": False,
                    "name": "ScoredCVs",
                },
            )

            # 2. Set Header Row Format and Height
            worksheet.set_row(0, 25, header_format)

            # 3. Set Column Widths
            for idx, col_name in enumerate(df.columns):
                if col_name in long_text_columns:
                    worksheet.set_column(idx, idx, 60)  # Fixed width for long text
                else:
                    # Auto-fit other columns
                    series = df[col_name]
                    max_len = 0
                    if not series.dropna().empty:
                        # Find max length of data or header
                        max_len = max(
                            (series.astype(str).map(len).max()), len(str(col_name))
                        )
                    else:
                        max_len = len(str(col_name))
                    worksheet.set_column(idx, idx, max_len + 2)  # Add a little padding

            # 4. Freeze Top Row
            worksheet.freeze_panes(1, 0)

        output.seek(0)

        log.info("Sending response back")
        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="cv_scores.xlsx",
        )

    except Exception as e:
        log.error(f"Critical error in /score: {str(e)}", exc_info=True)
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500


if __name__ == "__main__":
    log.info("Starting CV Scoring Server with Gemini API on port 6970")
    app.run(host="127.0.0.1", port=6970, debug=True, use_reloader=False)
