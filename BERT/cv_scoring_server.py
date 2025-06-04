import os
import json
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
from flask import Flask, request, send_file
from io import BytesIO
from flask_cors import CORS
import torch

app = Flask(__name__)
CORS(app)

# Load SBERT model
model = SentenceTransformer("all-MiniLM-L6-v2")


def calculate_skills_score(candidate_skills, jd_skills, weight=25):

    if not candidate_skills or not jd_skills:
        return 0
    # Java -> java
    candidate_skills = [skill.lower().strip() for skill in candidate_skills]
    jd_skills = [skill.lower().strip() for skill in jd_skills]

    # Embedding :Mã hoá một khái niệm (từ, câu, ảnh, v.v.) thành vector số thực,những thứ giống nhau nằm gần nhau trong không gian số
    candidate_embeddings = model.encode(candidate_skills)
    jd_embeddings = model.encode(jd_skills)

    similarities = util.cos_sim(candidate_embeddings, jd_embeddings)

    # ReactJS same as react
    threshold = 0.7
    matches = torch.sum(similarities > threshold).item()
    score = (float(matches) / len(jd_skills)) * weight
    return min(score, weight)


def calculate_experience_score(candidate_years, required_years, weight=20):

    if not candidate_years:
        return 0

    try:
        candidate_years = float(candidate_years)
        required_years = float(required_years)

        if candidate_years >= required_years:
            return weight
        elif candidate_years > 0:
            return (candidate_years / required_years) * weight
        return 0
    except:
        return 0


def calculate_designation_score(candidate_designation, jd_designation, weight=15):

    if not candidate_designation or not jd_designation:
        return 0

    candidate_designation = str(candidate_designation).lower().strip()
    jd_designation = str(jd_designation).lower().strip()

    candidate_emb = model.encode([candidate_designation])
    jd_emb = model.encode([jd_designation])

    similarity = util.cos_sim(candidate_emb, jd_emb)[0][0].item()

    # Score based on similarity
    if similarity > 0.85:
        return weight
    elif similarity > 0.7:
        return weight * 0.67
    return 0


def calculate_degree_score(candidate_degree, jd_degree, weight=10):

    if not candidate_degree or not jd_degree:
        return 0

    candidate_emb = model.encode(candidate_degree)
    jd_emb = model.encode(jd_degree)
    similarity = util.cos_sim(candidate_emb, jd_emb)[0][0].item()

    return weight if similarity > 0.7 else 0


def calculate_gpa_score(gpa_str, weight=10):

    if not gpa_str:
        return 0

    try:
        gpa = float(gpa_str.split("/")[0])

        if gpa >= 3.5:
            return weight
        elif 3.0 <= gpa < 3.5:
            return weight * 0.5
        elif gpa < 3.0:
            return weight * 0.3
        return 0
    except:
        return 0


def calculate_bonus_scores(cv_data, weights):

    score = 0

    # Languages
    if cv_data.get("languages") and str(cv_data["languages"]).strip():
        score += weights["languages"]

    # Awards
    if cv_data.get("awards") and str(cv_data["awards"]).strip():
        score += weights["awards"]

    # GitHub
    if cv_data.get("github") and str(cv_data["github"]).strip():
        score += weights["github"]

    # Certifications
    if cv_data.get("certifications") and str(cv_data["certifications"]).strip():
        score += weights["certifications"]

    # Projects
    if cv_data.get("projects") and str(cv_data["projects"]).strip():
        score += weights["projects"]

    return score


def extract_skills_from_jd(jd_text):
    # List of common technical skills to look for
    # Ngôn ngữ lập trình – Programming Languages
    prog_langs = [
        "Java",
        "Kotlin",
        "Scala",
        "Groovy",
        "Python",
        "TypeScript",
        "JavaScript",
        "Dart",
        "Go",
        "Rust",
        "C",
        "C++",
        "C#",
        "VB.NET",
        "PHP",
        "Ruby",
        "Elixir",
        "Swift",
        "Objective-C",
        "R",
        "MATLAB",
        "Perl",
        "Lua",
    ]

    # Backend Frameworks / Runtimes
    backend_fw = [
        "Spring Framework",
        "Spring Boot",
        "Micronaut",
        "Quarkus",
        "JHipster",
        "Jakarta EE",
        "Struts",
        "Hibernate",
        ".NET Core",
        "ASP.NET",
        "Entity Framework",
        "Express.js",
        "NestJS",
        "Fastify",
        "HapiJS",
        "Django",
        "Flask",
        "FastAPI",
        "Tornado",
        "Rails",
        "Sinatra",
        "Laravel",
        "Symfony",
        "Phoenix",
        "Fiber (Go)",
        "Gin (Go)",
        "Actix",
        "Rocket",
        "Ktor",
        "Vert.x",
    ]

    # Frontend / Web Frameworks & Libraries
    frontend_fw = [
        "ReactJS",
        "Next.js",
        "Remix",
        "AngularJS",
        "Angular",
        "Vue.js",
        "Nuxt.js",
        "Svelte",
        "SvelteKit",
        "SolidJS",
        "Bootstrap",
        "Tailwind CSS",
        "Material-UI",
        "jQuery",
        "Lit",
        "Stencil",
    ]

    # Mobile & Cross-platform
    mobile = [
        "Android",
        "iOS",
        "SwiftUI",
        "Jetpack Compose",
        "React Native",
        "Flutter",
        "Ionic",
        "Cordova",
        "Xamarin",
        "Kotlin Multiplatform",
        "Capacitor",
    ]

    # Databases & Data Stores
    databases = [
        "MySQL",
        "PostgreSQL",
        "Oracle",
        "SQL Server",
        "MongoDB",
        "Cassandra",
        "Redis",
        "Memcached",
        "Elasticsearch",
        "OpenSearch",
        "Solr",
        "DynamoDB",
        "Firebase Realtime DB",
        "Firestore",
        "Neo4j",
        "ArangoDB",
        "TimescaleDB",
        "InfluxDB",
        "ClickHouse",
        "Snowflake",
        "BigQuery",
    ]

    # DevOps / Cloud / Container
    devops_cloud = [
        "DevOps",
        "CI/CD",
        "Jenkins",
        "GitHub Actions",
        "GitLab CI",
        "Docker",
        "Docker Compose",
        "Podman",
        "Kubernetes",
        "Helm",
        "ArgoCD",
        "FluxCD",
        "AWS",
        "Azure",
        "Google Cloud",
        "Oracle Cloud",
        "Heroku",
        "Terraform",
        "Pulumi",
        "Ansible",
        "Chef",
        "Puppet",
        "OpenShift",
        "Rancher",
        "Istio",
        "Linkerd",
        "Prometheus",
        "Grafana",
    ]

    # Testing & QA
    testing = [
        "JUnit",
        "TestNG",
        "Mockito",
        "Cypress",
        "Playwright",
        "Selenium",
        "Jest",
        "Vitest",
        "Mocha",
        "Chai",
        "PyTest",
        "Robot Framework",
        "Cucumber",
        "Postman",
        "Gatling",
        "k6",
        "JMeter",
    ]

    # Security & Auth
    security = [
        "OAuth2",
        "JWT",
        "Keycloak",
        "Okta",
        "OpenID Connect",
        "SAML",
        "Spring Security",
        "OWASP",
        "Burp Suite",
        "SonarQube",
        "Zap",
    ]

    # Big Data & Streaming
    bigdata = [
        "Hadoop",
        "Spark",
        "Flink",
        "Kafka",
        "RabbitMQ",
        "Kinesis",
        "Pulsar",
        "Hive",
        "Presto",
        "Trino",
    ]

    # Machine Learning / AI
    ml_ai = [
        "TensorFlow",
        "PyTorch",
        "Keras",
        "Scikit-learn",
        "pandas",
        "NumPy",
        "spaCy",
        "Hugging Face",
        "LangChain",
        "OpenCV",
        "ONNX",
        "MLflow",
        "Airflow",
    ]

    # Miscellaneous Tools & Concepts
    others = [
        "Linux",
        "Unix",
        "Bash",
        "PowerShell",
        "Git",
        "GitHub",
        "Bitbucket",
        "SVN",
        "REST",
        "GraphQL",
        "gRPC",
        "WebSocket",
        "Microservices",
        "Serverless",
        "Event Driven",
        "TDD",
        "DDD",
        "Clean Architecture",
        "Agile",
        "Scrum",
        "Kanban",
    ]

    # Gộp nhanh thành một list để dùng ngay
    common_skills = (
        prog_langs
        + backend_fw
        + frontend_fw
        + mobile
        + databases
        + devops_cloud
        + testing
        + security
        + bigdata
        + ml_ai
        + others
    )

    found_skills = []
    for skill in common_skills:
        if skill.lower() in jd_text.lower():
            found_skills.append(skill)

    return found_skills


@app.route("/score", methods=["POST"])
def score_cvs():
    try:
        print("Received scoring request")

        excel_file = request.files["file"]
        jd_data = json.loads(request.form["jd"])
        weights = json.loads(request.form["weights"])

        jd_text = jd_data["position"]
        required_skills = extract_skills_from_jd(jd_text)
        jd_data["required_skills"] = required_skills

        print("Extracted required skills:", required_skills)

        df = pd.read_excel(excel_file)

        scores = []
        for idx, row in df.iterrows():
            row_dict = row.to_dict()
            try:

                skills_data = str(row_dict.get("Kỹ năng", ""))
                candidate_skills = (
                    [s.strip() for s in skills_data.split(",")] if skills_data else []
                )
                skills_score = calculate_skills_score(
                    candidate_skills, required_skills, weights["skills"]
                )
                exp_years = str(row_dict.get("Năm kinh nghiệm", "0"))

                if "năm" in exp_years:
                    exp_years = float(exp_years.replace("năm", "").strip())
                exp_score = calculate_experience_score(
                    exp_years, jd_data["required_experience"], weights["experience"]
                )

                designation_score = calculate_designation_score(
                    row_dict.get("Kinh nghiệm làm việc", ""),
                    jd_data["position"],
                    weights["designation"],
                )

                degree_score = calculate_degree_score(
                    str(row_dict.get("Bằng cấp", "")),
                    jd_data.get("required_degree", ""),
                    weights["degree"],
                )

                gpa_str = str(row_dict.get("Điểm GPA", ""))
                gpa_score = calculate_gpa_score(gpa_str, weights["gpa"])

                bonus_score = calculate_bonus_scores(
                    {
                        "languages": row_dict.get("Ngoại ngữ", ""),
                        "awards": row_dict.get("Giải thưởng", ""),
                        "github": row_dict.get("GitHub", ""),
                        "certifications": row_dict.get("Chứng chỉ", ""),
                        "projects": row_dict.get("Dự án", ""),
                    },
                    weights,
                )

                cv_score = {
                    "skills_score": round(skills_score, 2),
                    "experience_score": round(exp_score, 2),
                    "designation_score": round(designation_score, 2),
                    "degree_score": round(degree_score, 2),
                    "gpa_score": round(gpa_score, 2),
                    "bonus_score": round(bonus_score, 2),
                    "total_score": round(
                        skills_score
                        + exp_score
                        + designation_score
                        + degree_score
                        + gpa_score
                        + bonus_score,
                        2,
                    ),
                }
                scores.append(cv_score)

            except Exception as e:
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

        # Add scores to DataFrame
        for key in scores[0].keys():
            df[key] = [score[key] for score in scores]

        # Save to Excel with proper encoding
        output = BytesIO()
        with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False)
        output.seek(0)

        print("Sending response back")

        return send_file(
            output,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            as_attachment=True,
            download_name="fit_cv_score.xlsx",
        )

    except Exception as e:
        print("Error occurred:", str(e))
        return {"error": str(e)}, 500


if __name__ == "__main__":
    print("Starting CV Scoring Server on port 6970")
    app.run(host="127.0.0.1", port=6970, debug=True)
