# import os
# import json
# import re
# from datetime import datetime
# from flask import Flask, request, jsonify
# import google.generativeai as genai
# from dotenv import load_dotenv

# load_dotenv()

# app = Flask(__name__)
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# genai.configure(api_key=GEMINI_API_KEY)

# model = genai.GenerativeModel("gemini-1.5-pro")

# EXTRACTION_PROMPT = """
# Bạn là một AI chuyên gia trích xuất thông tin từ CV. Hãy phân tích nội dung CV dưới đây và TRẢ VỀ DUY NHẤT KẾT QUẢ JSON, đúng format:

# CV Content:
# {cv_content}

# FORMAT JSON:
# {{
#     "name": "tên đầy đủ của ứng viên",
#     "email": "địa chỉ email của ứng viên",
#     "phone": "số điện thoại",
#     "github": "github username hoặc URL",
#     "location": "địa chỉ/thành phố",
#     "university": "tên trường đại học",
#     "degree": "bằng cấp/chuyên ngành",
#     "gpa": "điểm GPA",
#     "graduationYear": "năm tốt nghiệp",
#     "workExperiences": [
#         {{
#             "company": "tên công ty",
#             "position": "vị trí công việc",
#             "duration": "thời gian làm việc (VD: Jan 2021 - Dec 2022)",
#             "description": ["mô tả công việc 1", "mô tả công việc 2"],
#             "workExperiences_time": "Tổng số tháng kinh nghiệm (VD: 12)"
#         }}
#     ],
#     "projects": [
#         {{
#             "name": "tên dự án",
#             "description": ["mô tả dự án chi tiết"],
#             "projects_techstacks": "liệt kê công nghệ dự án"
#         }}
#     ],
#     "skills": ["skill1", "skill2"],
#     "certifications": ["cert1", "cert2"]
# }}

# LƯU Ý:
# - CHỈ trả về khối JSON, KHÔNG text/markdown giải thích.
# - Nếu không có thông tin, để "" hoặc [].
# """


# def clean_json_response(response_text: str) -> str:
#     """
#     1) Loại bỏ các đoạn ````` và markdown nếu có
#     2) Tìm vị trí ngoặc nhọn bắt đầu '{' và đóng '}' tương ứng (theo đếm ngoặc)
#     3) Lấy đúng khối JSON nguyên vẹn
#     """
#     # Bước 1: Loại bỏ block markdown ```json ... ``` nếu có
#     if response_text.startswith("```json"):
#         # Loại bỏ 7 ký tự '```json' đầu, rồi tìm vị trí '```' tiếp theo
#         idx_start = response_text.find("```json") + len("```json")
#         idx_end = response_text.find("```", idx_start)
#         if idx_end != -1:
#             response_text = response_text[idx_start:idx_end]
#     elif response_text.startswith("```"):
#         # Nếu chỉ có ``` (không có json tag)
#         idx_start = response_text.find("```") + len("```")
#         idx_end = response_text.find("```", idx_start)
#         if idx_end != -1:
#             response_text = response_text[idx_start:idx_end]

#     response_text = response_text.strip()

#     # Bước 2: Tìm vị trí ngoặc nhọn đầu tiên
#     start = response_text.find("{")
#     if start == -1:
#         # Không tìm thấy dấu '{' nào => trả nguyên response (có thể rỗng hoặc text)
#         return response_text

#     # Bước 3: Đếm ngoặc để tìm '}' phù hợp
#     depth = 0
#     end = start
#     for i, ch in enumerate(response_text[start:], start):
#         if ch == "{":
#             depth += 1
#         elif ch == "}":
#             depth -= 1
#             if depth == 0:
#                 end = i
#                 break

#     # Nếu depth != 0, thì JSON không cân bằng, ta vẫn cắt đến end (nếu tìm được) hoặc trả nguyên
#     if depth == 0:
#         cleaned = response_text[start : end + 1]
#     else:
#         cleaned = response_text[start:]

#     return cleaned.strip()


# def validate_json_structure(data: dict) -> dict:
#     """Validate và fix JSON structure nếu cần"""
#     required_fields = {
#         "name": "",
#         "email": "",
#         "phone": "",
#         "github": "",
#         "location": "",
#         "university": "",
#         "degree": "",
#         "gpa": "",
#         "graduationYear": "",
#         "workExperiences": [],
#         "projects": [],
#         "skills": [],
#         "certifications": [],
#     }
#     for field, default_value in required_fields.items():
#         if field not in data:
#             data[field] = default_value
#         elif data[field] is None:
#             data[field] = default_value
#     array_fields = ["workExperiences", "projects", "skills", "certifications"]
#     for field in array_fields:
#         if not isinstance(data[field], list):
#             data[field] = []
#     if data["workExperiences"]:
#         for i, exp in enumerate(data["workExperiences"]):
#             if not isinstance(exp, dict):
#                 data["workExperiences"][i] = {
#                     "company": "",
#                     "position": "",
#                     "duration": "",
#                     "description": [],
#                 }
#             else:
#                 exp.setdefault("company", "")
#                 exp.setdefault("position", "")
#                 exp.setdefault("duration", "")
#                 exp.setdefault("description", [])
#                 if not isinstance(exp["description"], list):
#                     exp["description"] = (
#                         [str(exp["description"])] if exp["description"] else []
#                     )
#     if data["projects"]:
#         for i, proj in enumerate(data["projects"]):
#             if not isinstance(proj, dict):
#                 data["projects"][i] = {"name": "", "description": []}
#             else:
#                 proj.setdefault("name", "")
#                 proj.setdefault("description", [])
#                 if not isinstance(proj["description"], list):
#                     proj["description"] = (
#                         [str(proj["description"])] if proj["description"] else []
#                     )

#     return data


# def extract_with_gemini(cv_content: str) -> dict:
#     """Extract CV information using Gemini API"""
#     try:
#         prompt = EXTRACTION_PROMPT.format(cv_content=cv_content)
#         response = model.generate_content(
#             prompt,
#             generation_config=genai.types.GenerationConfig(
#                 temperature=0.1,
#                 top_p=0.8,
#                 top_k=40,
#                 max_output_tokens=4096,
#             ),
#         )
#         response_text = response.text.strip()
#         print(f"Raw Gemini response: {response_text[:200]}...")
#         cleaned_json = clean_json_response(response_text)
#         print(f"Cleaned JSON: {cleaned_json[:200]}...")
#         try:
#             data = json.loads(cleaned_json)
#         except json.JSONDecodeError as e:
#             print(f"JSON decode error: {e}")
#             print(f"Problematic JSON: {cleaned_json}")
#             return create_empty_result()
#         validated_data = validate_json_structure(data)

#         print(
#             f"Successfully extracted data with {len(validated_data.get('skills', []))} skills"
#         )
#         return validated_data

#     except Exception as e:
#         print(f"Gemini API Error: {e}")
#         return create_empty_result()


# def create_empty_result() -> dict:
#     """Tạo kết quả rỗng khi API fail"""
#     return {
#         "name": "",
#         "email": "",
#         "phone": "",
#         "github": "",
#         "location": "",
#         "university": "",
#         "degree": "",
#         "gpa": "",
#         "graduationYear": "",
#         "workExperiences": [],
#         "projects": [],
#         "skills": [],
#         "certifications": [],
#     }


# @app.route("/resume_parsing", methods=["POST"])
# def parse_resume():
#     """API endpoint tương thích với NestJS service"""
#     try:
#         data = request.get_json()

#         if "cv" not in data:
#             return jsonify({"error": "Missing cv field"}), 400

#         cv_content = data["cv"]

#         if not cv_content or len(cv_content.strip()) == 0:
#             return jsonify({"error": "Empty CV content"}), 400

#         print(f"Processing CV content (length: {len(cv_content)})")
#         result = extract_with_gemini(cv_content)

#         return jsonify(
#             {
#                 "success": True,
#                 "data": result,
#                 "processed_at": datetime.now().isoformat(),
#                 "method": "gemini-pro",
#             }
#         )

#     except Exception as e:
#         print(f"Error processing request: {str(e)}")
#         return jsonify({"error": "Internal server error", "details": str(e)}), 500


# @app.route("/health", methods=["GET"])
# def health_check():
#     """Health check endpoint"""
#     return jsonify(
#         {
#             "status": "healthy",
#             "service": "LLM Resume Parser",
#             "model": "gemini-pro",
#             "timestamp": datetime.now().isoformat(),
#         }
#     )


# if __name__ == "__main__":
#     print("🚀 Starting LLM Resume Parser Server with Gemini...")
#     print("🔑 Gemini API configured")
#     print("📡 Server running on http://localhost:6969")
#     app.run(debug=True, port=6969, host="0.0.0.0")
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

EXTRACTION_PROMPT = """
Bạn là một AI chuyên gia trích xuất thông tin từ CV. Hãy phân tích nội dung CV dưới đây và TRẢ VỀ DUY NHẤT KẾT QUẢ JSON, đúng format:

CV Content:
{cv_content}

FORMAT JSON:
{{
    "name": "tên đầy đủ của ứng viên",
    "email": "địa chỉ email của ứng viên",
    "phone": "số điện thoại",
    "github": "github của ứng viên. Nếu chỉ có tên github thì đính kèm URL để HR có thể click vào. Nếu không có github thì nền tảng khác như linkedln cũng chấp nh",
    "location": "địa chỉ/thành phố",
    "university": "tên trường đại học",
    "degree": "bằng cấp/chuyên ngành",
    "gpa": "điểm GPA",
    "graduationYear": "năm tốt nghiệp",
    "workExperiences": [
        {{
            "company": "tên công ty",
            "position": "vị trí công việc",
            "duration": "thời gian làm việc (VD: Jan 2021 - Dec 2022)",
            "description": ["mô tả công việc 1", "mô tả công việc 2"],
            "workExperiences_time": "Tổng số tháng kinh nghiệm (VD: 12)"
        }}
    ],
    "projects": [
        {{
            "name": "tên dự án",
            "description": ["mô tả dự án chi tiết"],
            "projects_techstacks": "liệt kê công nghệ dự án"
        }}
    ],
    "skills": ["skill1", "skill2"],
    "certifications": ["cert1", "cert2"]
}}

LƯU Ý:
- CHỈ trả về khối JSON, KHÔNG text/markdown giải thích.
- Nếu không có thông tin, để "" hoặc [].
"""


def clean_json_response(response_text: str) -> str:
    """Loại bỏ markdown, lấy đúng block JSON đầu tiên."""
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
