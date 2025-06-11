import os
import json
from datetime import datetime
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env and configure Gemini
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
app = Flask(__name__)

MODEL_NAME = "gemini-1.5-pro"
model = genai.GenerativeModel(MODEL_NAME)
SKILLS_FILE_PATH = "skills_catalog.yaml"

EXTRACTION_PROMPT = """
Bạn là một AI chuyên gia trích xuất thông tin từ CV. Hãy phân tích nội dung CV dưới đây và TRẢ VỀ DUY NHẤT KẾT QUẢ JSON, đúng format:

CV Content:
{cv_content}

FORMAT JSON:
{{
    "name": "tên đầy đủ của ứng viên",
    "email": "địa chỉ email của ứng viên",
    "phone": "số điện thoại",
    "github": "github username hoặc URL github để người dùng ấn vào",
    "location": "địa chỉ/thành phố",
    "university": "tên trường đại học",
    "degree": "bằng cấp/chuyên ngành",
    "gpa": "điểm GPA",
    "graduationYear": "năm tốt nghiệp",
    "workExperiences": [
        {{
            "company": "tên công ty",
            "position": "vị trí công việc",
            "designation": "chức danh",
            "duration": "thời gian làm việc (VD: Jan 2021 - Dec 2022)",
            "description": ["mô tả công việc 1", "mô tả công việc 2"],
            "workExperiences_time": "Tổng số tháng kinh nghiệm (VD: 12)"
        }}
    ],
    "designations": ["Backend Developer", "DevOps Engineer"],
    "totalExperienceYears": "Tổng số năm kinh nghiệm (tính từ tổng các workExperiences_time)",
    "projects": [
        {{
            "name": "tên dự án",
            "description": ["mô tả dự án chi tiết"],
            "projects_techstacks": "liệt kê công nghệ dự án"
        }}
    ],
    "skills": ["skill1", "skill2"],
    "languages": ["Tiếng Anh - TOEIC 700", "Tiếng Nhật - N2", "Tiếng Việt - Bản ngữ"],
    "awards": ["Giải nhất cuộc thi ABC", "Học bổng XYZ"],
    "certifications": ["cert1", "cert2"]
}}

LƯU Ý:
- CHỈ trả về khối JSON, KHÔNG text/markdown giải thích.
- Nếu không có thông tin, để "" hoặc [].
- Với workExperiences_time: Tính số tháng dựa trên duration (VD: Jan 2021 - Dec 2022 = 24 tháng)
- Với totalExperienceYears: Tính bằng tổng các workExperiences_time chia 12, làm tròn 1 chữ số thập phân
"""


def clean_json_response(response_text: str) -> str:

    # Xóa markdown code block
    response_text = response_text.strip()
    if response_text.startswith("```json"):
        response_text = response_text[len("```json") :].strip()
    elif response_text.startswith("```"):
        response_text = response_text[len("```") :].strip()
    if response_text.endswith("```"):
        response_text = response_text[:-3].strip()
    # Lấy khối JSON đầu tiên
    start = response_text.find("{")
    if start == -1:
        return response_text
    depth = 0
    for i in range(start, len(response_text)):
        if response_text[i] == "{":
            depth += 1
        elif response_text[i] == "}":
            depth -= 1
            if depth == 0:
                return response_text[start : i + 1].strip()
    return response_text[start:].strip()


def validate_json_structure(data: dict) -> dict:
    """Đảm bảo đủ trường, đúng dạng."""
    required = {
        "name": "",
        "email": "",
        "phone": "",
        "github": "",
        "location": "",
        "university": "",
        "degree": "",
        "gpa": "",
        "graduationYear": "",
        "workExperiences": [],
        "projects": [],
        "skills": [],
        "certifications": [],
    }
    for k, v in required.items():
        if k not in data or data[k] is None:
            data[k] = v
    # Đảm bảo array field luôn là list
    for arr_field in ["workExperiences", "projects", "skills", "certifications"]:
        if not isinstance(data[arr_field], list):
            data[arr_field] = []
    # Chuẩn hóa description/project
    for i, exp in enumerate(data["workExperiences"]):
        if not isinstance(exp, dict):
            continue
        exp.setdefault("company", "")
        exp.setdefault("position", "")
        exp.setdefault("duration", "")
        exp.setdefault("description", [])
        exp.setdefault("workExperiences_time", "")
        if not isinstance(exp["description"], list):
            exp["description"] = [str(exp["description"])] if exp["description"] else []
    for i, proj in enumerate(data["projects"]):
        if not isinstance(proj, dict):
            continue
        proj.setdefault("name", "")
        proj.setdefault("description", [])
        proj.setdefault("projects_techstacks", "")
        if not isinstance(proj["description"], list):
            proj["description"] = (
                [str(proj["description"])] if proj["description"] else []
            )
    return data


def extract_with_gemini(cv_content: str) -> dict:
    """Gọi Gemini, trích xuất JSON."""
    try:
        prompt = EXTRACTION_PROMPT.format(cv_content=cv_content)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1, top_p=0.8, top_k=40, max_output_tokens=2048
            ),
        )
        response_text = response.text.strip()
        print(f"Raw Gemini response: {response_text[:120]}...")
        cleaned_json = clean_json_response(response_text)
        try:
            data = json.loads(cleaned_json)
        except Exception as e:
            print(f"[ERROR] JSON decode: {e}\nContent: {cleaned_json[:100]}")
            return create_empty_result()
        return validate_json_structure(data)
    except Exception as e:
        print(f"[Gemini API Error]: {e}")
        return create_empty_result()


def create_empty_result() -> dict:
    return {
        "name": "",
        "email": "",
        "phone": "",
        "github": "",
        "location": "",
        "university": "",
        "degree": "",
        "gpa": "",
        "graduationYear": "",
        "workExperiences": [],
        "projects": [],
        "skills": [],
        "certifications": [],
    }


@app.route("/resume_parsing", methods=["POST"])
def parse_resume():
    try:
        data = request.get_json(force=True)
        cv_content = data.get("cv", "")
        if not cv_content or not cv_content.strip():
            return jsonify({"error": "Empty CV content"}), 400
        print(f"Processing CV (len: {len(cv_content)}) at {datetime.now()}")
        result = extract_with_gemini(cv_content)
        return jsonify(
            {
                "success": True,
                "data": result,
                "processed_at": datetime.now().isoformat(),
                "method": MODEL_NAME,
            }
        )
    except Exception as e:
        print(f"[SERVER ERROR] {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "service": "LLM Resume Parser",
            "model": MODEL_NAME,
            "timestamp": datetime.now().isoformat(),
        }
    )


if __name__ == "__main__":
    print("🚀 Starting Gemini Resume Parser API!")
    app.run(debug=True, port=6969, host="0.0.0.0")
