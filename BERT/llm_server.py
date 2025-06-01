import os
import json
import re
from datetime import datetime
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")

EXTRACTION_PROMPT = """
Bạn là một AI chuyên gia trích xuất thông tin từ CV. Hãy phân tích CV sau và trích xuất thông tin theo định dạng JSON chính xác:

CV Content:
{cv_content}

Hãy trả về JSON với format CHÍNH XÁC sau (không thêm text khác, chỉ JSON):
{{
    "name": "tên đầy đủ của ứng viên",
    "email": "địa chỉ email của ứng viên",
    "phone": "số điện thoại", 
    "github": "github username. Nếu có URL thì để URL, còn username thì cũng cập nhật URL để HR có thể nhấn vào link",
    "location": "địa chỉ/thành phố đầy đủ trong hồ sơ ứng viên",
    "university": "tên trường đại học",
    "degree": "bằng cấp/chuyên ngành",
    "gpa": "điểm GPA (thang 4.0 hoặc thang 10)",
    "graduationYear": "năm tốt nghiệp của ứng viên",
    "workExperiences": [
        {{
            "company": "tên công ty",
            "position": "vị trí công việc", 
            "duration": "thời gian làm việc (VD: Jan 2021 - Dec 2022)",
            "description": ["mô tả công việc 1", "mô tả công việc 2"]
            "workExperiences_time: Tổng thời gian mà ứng viên làm việc". Ghi thời gian theo tháng.
        }}
    ],
    "projects": [
        {{
            "name": "tên dự án",
            "description": ["mô tả dự án chi tiết"],
            "projects_techstacks" : "liệt kê công nghệ được nêu ở trong dự án"
        }}
    ],
    "skills": ["skill1", "skill2", "skill3"],
    "certifications": ["certification1", "certification2"]
}}

QUAN TRỌNG:
- CHỈ trả về JSON hợp lệ, KHÔNG thêm markdown, text giải thích hay ký tự khác
- Nếu không tìm thấy thông tin thì để chuỗi rỗng "" hoặc mảng rỗng []
- Skills phải tách riêng từng item (VD: ["Python", "Java", "React"])
- Work experiences phải group theo từng công ty riêng biệt
- Duration phải có format rõ ràng (VD: "Jun 2022 - Dec 2022")
- workExperiences_time : được tính như sau. Nếu hồ sơ ứng viên là Jan 2021 - March 2021 thì ứng viên có 3 tháng kinh nghiệm.
"""


def clean_json_response(response_text: str) -> str:
    try:
        if "```json" in response_text:
            start = response_text.find("```json") + 7
            end = response_text.find("```", start)
            if end != -1:
                response_text = response_text[start:end]
        elif "```" in response_text:
            start = response_text.find("```") + 3
            end = response_text.find("```", start)
            if end != -1:
                response_text = response_text[start:end]

        response_text = response_text.strip()
        start_brace = response_text.find("{")
        end_brace = response_text.rfind("}")

        if start_brace != -1 and end_brace != -1:
            response_text = response_text[start_brace : end_brace + 1]

        return response_text
    except Exception as e:
        print(f"Error cleaning JSON response: {e}")
        return response_text


def validate_json_structure(data: dict) -> dict:
    """Validate và fix JSON structure nếu cần"""
    required_fields = {
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
    for field, default_value in required_fields.items():
        if field not in data:
            data[field] = default_value
        elif data[field] is None:
            data[field] = default_value
    array_fields = ["workExperiences", "projects", "skills", "certifications"]
    for field in array_fields:
        if not isinstance(data[field], list):
            data[field] = []
    if data["workExperiences"]:
        for i, exp in enumerate(data["workExperiences"]):
            if not isinstance(exp, dict):
                data["workExperiences"][i] = {
                    "company": "",
                    "position": "",
                    "duration": "",
                    "description": [],
                }
            else:
                exp.setdefault("company", "")
                exp.setdefault("position", "")
                exp.setdefault("duration", "")
                exp.setdefault("description", [])
                if not isinstance(exp["description"], list):
                    exp["description"] = (
                        [str(exp["description"])] if exp["description"] else []
                    )
    if data["projects"]:
        for i, proj in enumerate(data["projects"]):
            if not isinstance(proj, dict):
                data["projects"][i] = {"name": "", "description": []}
            else:
                proj.setdefault("name", "")
                proj.setdefault("description", [])
                if not isinstance(proj["description"], list):
                    proj["description"] = (
                        [str(proj["description"])] if proj["description"] else []
                    )

    return data


def extract_with_gemini(cv_content: str) -> dict:
    """Extract CV information using Gemini API"""
    try:
        prompt = EXTRACTION_PROMPT.format(cv_content=cv_content)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                top_p=0.8,
                top_k=40,
                max_output_tokens=2048,
            ),
        )
        response_text = response.text.strip()
        print(f"Raw Gemini response: {response_text[:200]}...")
        cleaned_json = clean_json_response(response_text)
        print(f"Cleaned JSON: {cleaned_json[:200]}...")
        try:
            data = json.loads(cleaned_json)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Problematic JSON: {cleaned_json}")
            return create_empty_result()
        validated_data = validate_json_structure(data)

        print(
            f"Successfully extracted data with {len(validated_data.get('skills', []))} skills"
        )
        return validated_data

    except Exception as e:
        print(f"Gemini API Error: {e}")
        return create_empty_result()


def create_empty_result() -> dict:
    """Tạo kết quả rỗng khi API fail"""
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
    """API endpoint tương thích với NestJS service"""
    try:
        data = request.get_json()

        if "cv" not in data:
            return jsonify({"error": "Missing cv field"}), 400

        cv_content = data["cv"]

        if not cv_content or len(cv_content.strip()) == 0:
            return jsonify({"error": "Empty CV content"}), 400

        print(f"Processing CV content (length: {len(cv_content)})")
        result = extract_with_gemini(cv_content)

        return jsonify(
            {
                "success": True,
                "data": result,
                "processed_at": datetime.now().isoformat(),
                "method": "gemini-pro",
            }
        )

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "LLM Resume Parser",
            "model": "gemini-pro",
            "timestamp": datetime.now().isoformat(),
        }
    )


if __name__ == "__main__":
    print("🚀 Starting LLM Resume Parser Server with Gemini...")
    print("🔑 Gemini API configured")
    print("📡 Server running on http://localhost:6969")
    app.run(debug=True, port=6969, host="0.0.0.0")
