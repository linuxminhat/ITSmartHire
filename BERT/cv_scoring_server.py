import os
import json
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
from flask import Flask, request, send_file
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

logging.basicConfig(
    level=logging.INFO,
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
    #        "all-mpnet-base-v2", cache_folder="D:/hf-cache",
    # model = SentenceTransformer(
    #     "D:\pretrained model\all_mpnet_ft_cv_jd",
    # )
    model_dir = os.path.join(
        os.path.dirname(__file__),
        "pretrained_model",
        "all_mpnet_ft_cv_jd",
    )

    model = SentenceTransformer(model_dir)
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
As an expert HR AI, analyze the following job description (JD) and extract the key recruitment information.
**Job Description:**
{jd_text}
**Instructions:**
1.**Extract the main job title.** Be specific (e.g., "Senior Java Developer" instead of just "Developer"). If no specific title is mentioned but can be inferred from skills (e.g., "requires proficiency in Laravel"), create a logical title like "Laravel Developer". If no title can be found, return "".
2.**Extract the required years of experience.** Find the minimum number of years required (e.g., "at least 3 years" -> 3, "3-5 years" -> 3). If not mentioned, return 0.
3. **Extract the required degree.**
*If a specific degree is mentioned (e.g., "Bachelor of Science in Computer Science"), return that full string.
*If a generic requirement is mentioned (e.g., "University degree in related fields", "Tốt nghiệp đại học chuyên ngành liên quan"), return the special token "GENERIC_IT_DEGREE".
*If no degree is mentioned, return "".
4. **Extract all required technical skills.** List all programming languages, frameworks, databases, tools, and methodologies mentioned.
**Return ONLY a valid JSON object in the following format. Do not include any explanatory text or markdown.**
```json
{{
    "designation": "string",
    "required_experience_years": "number",
    "required_degree": "string",
    "required_skills": ["string", "string", ...]
}}
```
"""


def extract_jd_info_with_gemini(jd_text: str) -> dict:
    if not gemini_model:
        raise ConnectionError("Gemini API is not configured.")

    prompt = JD_EXTRACTION_PROMPT.format(jd_text=jd_text)
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
        validated_data = {
            "designation": data.get("designation", ""),
            "required_experience_years": str(
                data.get("required_experience_years", "0")
            ),
            "required_degree": data.get("required_degree", ""),
            "required_skills": data.get("required_skills", []),
        }
        return validated_data

    except Exception as e:
        log.error(f"[Gemini API Error]: {e}")
        return {
            "designation": "",
            "required_experience_years": "0",
            "required_degree": "",
            "required_skills": [],
        }


def calculate_skills_score(candidate_skills, jd_skills, weight=25):
    if not candidate_skills or not jd_skills or not model:
        return 0
    candidate_skills = [skill.lower().strip() for skill in candidate_skills]
    jd_skills = [skill.lower().strip() for skill in jd_skills]
    candidate_embeddings = model.encode(candidate_skills)
    jd_embeddings = model.encode(jd_skills)
    similarities = util.cos_sim(candidate_embeddings, jd_embeddings)
    threshold = 0.7
    matches = torch.sum(similarities > threshold).item()
    score = (float(matches) / len(jd_skills)) * weight if len(jd_skills) > 0 else 0
    return min(score, weight)


def calculate_experience_score(candidate_years, required_years, weight=20):
    if not candidate_years:
        return 0
    try:
        candidate_years = float(candidate_years)
        required_years = float(required_years)

        if required_years == 0:
            return weight if candidate_years >= 0 else 0
        if candidate_years >= required_years:
            return weight
        elif candidate_years > 0:
            return (candidate_years / required_years) * weight
        return 0
    except (ValueError, TypeError):
        return 0


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


def calculate_designation_score(
    candidate_designation: str, jd_designation: str, weight: float = 15
) -> float:
    if not candidate_designation or not jd_designation or not model:
        log.debug("designation empty → 0 đ")
        return 0.0
    cand = _normalize(candidate_designation)
    jd = _normalize(jd_designation)
    sim = util.cos_sim(model.encode([cand]), model.encode([jd]))[0][0].item()
    tags_cand, tags_jd = _tag_set(cand), _tag_set(jd)
    log.debug(
        "cand='%s' | jd='%s' | raw_sim=%.3f | tags=%s/%s",
        cand,
        jd,
        sim,
        tags_cand,
        tags_jd,
    )
    if tags_cand & tags_jd:
        sim = min(sim + TAG_BONUS, 1)
        log.debug("   bonus  → %.3f", sim)
    elif {"backend", "frontend"} <= (tags_cand | tags_jd) and not (tags_cand & tags_jd):
        sim = max(sim - TAG_PENALTY, 0)
        log.debug("   penalty→ %.3f", sim)
    score = weight / (1 + math.exp(-12 * (sim - 0.5)))
    log.debug("designation_score=%.2f", score)
    return round(score, 2)


def calculate_degree_score(
    candidate_degree: str, jd_degree: str, weight: float = 10
) -> float:
    if not model:
        return 0.0
    if not jd_degree or jd_degree.strip() == "":
        log.debug("JD does not specify degree. Awarding full points.")
        return float(weight)
    if not candidate_degree or candidate_degree.strip() == "":
        log.debug(f"JD requires a degree, but candidate has none. 0 points.")
        return 0.0
    it_prototype_vector = model.encode(
        [
            "bachelor of science in computer science",
            "associate in information technology",
        ]
    )
    it_prototype_vector = np.mean(it_prototype_vector, axis=0)

    if jd_degree == "GENERIC_IT_DEGREE":
        log.debug("JD requires a generic IT degree. Validating candidate's degree.")
        candidate_emb = model.encode(candidate_degree)
        similarity = util.cos_sim(candidate_emb, it_prototype_vector)[0][0].item()
        it_degree_threshold = 0.5
        log.debug(
            f"CV degree '{candidate_degree}' vs IT prototype similarity: {similarity:.3f}"
        )
        return float(weight) if similarity > it_degree_threshold else 0.0

    candidate_emb = model.encode(candidate_degree)
    jd_emb = model.encode(jd_degree)
    similarity = util.cos_sim(candidate_emb, jd_emb)[0][0].item()
    log.debug(
        f"Specific match: JD='{jd_degree}' vs CV='{candidate_degree}'. Similarity: {similarity:.3f}"
    )
    match_threshold = 0.6
    return float(weight) if similarity > match_threshold else 0.0


def calculate_gpa_score(gpa_str, weight=10):
    if not gpa_str or not str(gpa_str).strip():
        return 0
    gpa_str = str(gpa_str).strip()
    try:
        gpa_value_str = gpa_str.split("/")[0].strip()
        gpa = float(gpa_value_str)
        is_10_point_scale = ("10" in gpa_str) or (gpa > 4.0 and gpa <= 10.0)
        if is_10_point_scale:
            gpa = min(max(gpa, 0.0), 10.0)
            if gpa >= 9.0:
                return weight
            elif 8.0 <= gpa < 9.0:
                return weight * 0.7
            elif 7.0 <= gpa < 8.0:
                return weight * 0.4
            return 0
        else:
            gpa = min(max(gpa, 0.0), 4.0)
            if gpa >= 3.6:
                return weight
            elif 3.2 <= gpa < 3.6:
                return weight * 0.7
            elif 2.8 <= gpa < 3.2:
                return weight * 0.4
            return 0
    except (ValueError, TypeError):
        return 0


def calculate_bonus_scores(cv_data, weights):
    score = 0
    if cv_data.get("languages") and str(cv_data["languages"]).strip():
        score += weights["languages"]
    if cv_data.get("awards") and str(cv_data["awards"]).strip():
        score += weights["awards"]
    if cv_data.get("certifications") and str(cv_data["certifications"]).strip():
        score += weights["certifications"]
    if cv_data.get("github") and str(cv_data["github"]).strip():
        score += weights["github"]
    if cv_data.get("projects") and str(cv_data["projects"]).strip():
        score += weights["projects"]
    return score


def translate_text_azure(text: str) -> str:
    log.info("--- AZURE TRANSLATION ---")
    try:
        if detect(text) == "en":
            log.info("Detected EN – skip translate")
            return text

        key = os.getenv("AZURE_TRANSLATOR_KEY")
        ep = os.getenv("AZURE_TRANSLATOR_ENDPOINT").rstrip("/")
        loc = os.getenv("AZURE_TRANSLATOR_REGION")

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
        return {
            "error": "A required model (SentenceTransformer or Gemini) failed to load. Check server logs."
        }, 503

    try:
        log.info("Received scoring request to /score")
        excel_file = request.files["file"]
        jd_text = request.form["jd"]
        weights = json.loads(request.form["weights"])

        if not jd_text:
            return {"error": "Job Description text (position) is missing."}, 400

        translated_jd = translate_text_azure(jd_text)
        log.info(f"Translated JD: {translated_jd[:100]}...")

        # Step 2: Extract JD info using Gemini API
        jd_info = extract_jd_info_with_gemini(translated_jd)
        log.info(f"Extracted JD Info from Gemini: {jd_info}")

        required_designation_str = jd_info["designation"]
        required_skills = jd_info["required_skills"]
        required_experience_str = jd_info["required_experience_years"]
        required_degree_str = jd_info["required_degree"]

        # Step 3: Process CVs and Score
        df = pd.read_excel(excel_file)
        scores = []
        total_cvs = len(df)
        log.info(f"Found {total_cvs} CVs. Starting scoring for each...")
        for idx, row in df.iterrows():
            log.debug(f"\n--- CV {idx + 1}/{total_cvs}: Processing ---")
            row_dict = row.to_dict()
            try:
                # Skills Score
                skills_data = str(row_dict.get("Kỹ năng", ""))
                candidate_skills = (
                    [s.strip() for s in skills_data.split(",")] if skills_data else []
                )
                log.debug(
                    f"  [Skills] CV='{candidate_skills}' vs JD='{required_skills}'"
                )
                skills_score = calculate_skills_score(
                    candidate_skills, required_skills, weights["skills"]
                )
                log.debug(f"  => skills_score: {skills_score:.2f}")

                # Experience Score
                exp_years_candidate_str = (
                    str(row_dict.get("Năm kinh nghiệm", "0")).replace("năm", "").strip()
                )
                log.debug(
                    f"  [Experience] CV='{exp_years_candidate_str}' vs JD='{required_experience_str}'"
                )
                exp_score = calculate_experience_score(
                    exp_years_candidate_str,
                    required_experience_str,
                    weights["experience"],
                )
                log.debug(f"  => experience_score: {exp_score:.2f}")

                # Designation Score
                candidate_designation = row_dict.get("Chức danh", "")
                log.debug(
                    f"  [Designation] CV='{candidate_designation}' vs JD='{required_designation_str}'"
                )
                designation_score = calculate_designation_score(
                    candidate_designation,
                    required_designation_str,
                    weights["designation"],
                )
                log.debug(f"  => designation_score: {designation_score:.2f}")

                # Degree Score
                candidate_degree = str(row_dict.get("Bằng cấp", ""))
                log.debug(
                    f"  [Degree] CV='{candidate_degree}' vs JD='{required_degree_str}'"
                )
                degree_score = calculate_degree_score(
                    candidate_degree,
                    required_degree_str,
                    weights["degree"],
                )
                log.debug(f"  => degree_score: {degree_score:.2f}")

                # GPA Score
                candidate_gpa = str(row_dict.get("Điểm GPA", ""))
                log.debug(f"  [GPA] CV='{candidate_gpa}'")
                gpa_score = calculate_gpa_score(candidate_gpa, weights["gpa"])
                log.debug(f"  => gpa_score: {gpa_score:.2f}")

                # Bonus Score
                log.debug("  [Bonus] Checking for bonus points...")
                bonus_score = calculate_bonus_scores(row_dict, weights)
                log.debug(f"  => bonus_score: {bonus_score:.2f}")

                total = (
                    skills_score
                    + exp_score
                    + designation_score
                    + degree_score
                    + gpa_score
                    + bonus_score
                )
                log.info(f"--- CV {idx + 1}/{total_cvs}: Total Score = {total:.2f} ---")
                cv_score = {
                    "skills_score": round(skills_score, 2),
                    "experience_score": round(exp_score, 2),
                    "designation_score": round(designation_score, 2),
                    "degree_score": round(degree_score, 2),
                    "gpa_score": round(gpa_score, 2),
                    "bonus_score": round(bonus_score, 2),
                    "total_score": round(total, 2),
                }
                scores.append(cv_score)
            except Exception as e:
                log.error(f"Error processing row {idx}: {e}", exc_info=True)
                scores.append(
                    {
                        "skills_score": 0,
                        "experience_score": 0,
                        "designation_score": 0,
                        "degree_score": 0,
                        "gpa_score": 0,
                        "bonus_score": 0,
                        "total_score": 0,
                    }
                )

        if scores and df.shape[0] == len(scores):
            for key in scores[0].keys():
                df[key] = [score[key] for score in scores]
        else:
            log.warning(
                "Number of scores does not match number of CVs, or no scores were generated. Scores will not be added to the Excel file."
            )

        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False)
        output.seek(0)

        log.info("Sending response back")
        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="fit_cv_score.xlsx",
        )

    except Exception as e:
        log.error(f"Critical error in /score: {str(e)}", exc_info=True)
        return {"error": str(e)}, 500


if __name__ == "__main__":
    log.info("Starting CV Scoring Server with Gemini API on port 6970")
    app.run(host="127.0.0.1", port=6970, debug=True, use_reloader=False)
