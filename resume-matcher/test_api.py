import requests
import json

# Mẫu CV đơn giản
sample_cv = """
John Doe
Software Engineer
Email: john@example.com

SKILLS
- Python, JavaScript, React
- Machine Learning
- Data Analysis

EXPERIENCE
Senior Developer at Tech Corp (2020-Present)
- Developed web applications using React
- Implemented machine learning models

EDUCATION
Bachelor of Computer Science, University Tech (2016-2020)
"""

# Mẫu job description
sample_job = """
Job Title: Senior Software Engineer

Requirements:
- 3+ years experience with Python
- Experience with web frameworks
- Machine learning knowledge is a plus

Responsibilities:
- Develop and maintain web applications
- Implement machine learning models
- Work with cross-functional teams
"""

# Gửi request đến API
url = "http://localhost:5000/match-cv"
headers = {"Content-Type": "application/json"}
data = {
    "cv": sample_cv,
    "job_description": sample_job
}

response = requests.post(url, headers=headers, data=json.dumps(data))
print("Status Code:", response.status_code)
print("Response:")
print(json.dumps(response.json(), indent=2))

 
