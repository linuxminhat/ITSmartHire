# import os
# import json
# import pandas as pd
# import numpy as np
# from sentence_transformers import SentenceTransformer, util, CrossEncoder
# from flask import Flask, request, send_file
# from io import BytesIO
# from flask_cors import CORS
# import torch
# import re, unicodedata
# from dotenv import load_dotenv
# import requests
# import math
# from langdetect import detect
# import logging

# logging.basicConfig(
#     level=logging.INFO,
#     format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
#     datefmt="%H:%M:%S",
# )
# log = logging.getLogger("cv-score")
# app = Flask(__name__)
# CORS(app)

# load_dotenv()

# # model = SentenceTransformer("all-mpnet-base-v2 ", cache_folder="D:\hf-cache")
# model = SentenceTransformer("BAAI/bge-large-en-v1.5", cache_folder="D:\hf-cache")
# os.environ["TRANSFORMERS_OFFLINE"] = "1"
# try:
#     log.info("Loading Cross-Encoder re-ranking model...")
#     cross_encoder = CrossEncoder(
#         "cross-encoder/ms-marco-MiniLM-L-6-v2", device="cpu", max_length=512
#     )
#     log.info("Cross-Encoder model loaded successfully.")
# except Exception as e:
#     log.error(f"Failed to load Cross-Encoder model: {e}")
#     cross_encoder = None

# prog_langs = [
#     "Java",
#     "Kotlin",
#     "Scala",
#     "Groovy",
#     "Python",
#     "TypeScript",
#     "JavaScript",
#     "Dart",
#     "Go",
#     "Rust",
#     "C",
#     "C++",
#     "C#",
#     "VB.NET",
#     "PHP",
#     "Ruby",
#     "Elixir",
#     "Swift",
#     "Objective-C",
#     "R",
#     "MATLAB",
#     "Perl",
#     "Lua",
# ]
# backend_fw = [
#     "Spring Framework",
#     "Spring Boot",
#     "Micronaut",
#     "Quarkus",
#     "JHipster",
#     "Jakarta EE",
#     "Struts",
#     "Hibernate",
#     ".NET Core",
#     "ASP.NET",
#     "Entity Framework",
#     "Express.js",
#     "NestJS",
#     "Fastify",
#     "HapiJS",
#     "Django",
#     "Flask",
#     "FastAPI",
#     "Tornado",
#     "Rails",
#     "Sinatra",
#     "Laravel",
#     "Symfony",
#     "Phoenix",
#     "Fiber (Go)",
#     "Gin (Go)",
#     "Actix",
#     "Rocket",
#     "Ktor",
#     "Vert.x",
# ]
# frontend_fw = [
#     "ReactJS",
#     "Next.js",
#     "Remix",
#     "AngularJS",
#     "Angular",
#     "Vue.js",
#     "Nuxt.js",
#     "Svelte",
#     "SvelteKit",
#     "SolidJS",
#     "Bootstrap",
#     "Tailwind CSS",
#     "Material-UI",
#     "jQuery",
#     "Lit",
#     "Stencil",
# ]
# mobile = [
#     "Android",
#     "iOS",
#     "SwiftUI",
#     "Jetpack Compose",
#     "React Native",
#     "Flutter",
#     "Ionic",
#     "Cordova",
#     "Xamarin",
#     "Kotlin Multiplatform",
#     "Capacitor",
# ]
# databases = [
#     "MySQL",
#     "PostgreSQL",
#     "Oracle",
#     "SQL Server",
#     "MongoDB",
#     "Cassandra",
#     "Redis",
#     "Memcached",
#     "Elasticsearch",
#     "OpenSearch",
#     "Solr",
#     "DynamoDB",
#     "Firebase Realtime DB",
#     "Firestore",
#     "Neo4j",
#     "ArangoDB",
#     "TimescaleDB",
#     "InfluxDB",
#     "ClickHouse",
#     "Snowflake",
#     "BigQuery",
# ]
# devops_cloud = [
#     "DevOps",
#     "CI/CD",
#     "Jenkins",
#     "GitHub Actions",
#     "GitLab CI",
#     "Docker",
#     "Docker Compose",
#     "Podman",
#     "Kubernetes",
#     "Helm",
#     "ArgoCD",
#     "FluxCD",
#     "AWS",
#     "Azure",
#     "Google Cloud",
#     "Oracle Cloud",
#     "Heroku",
#     "Terraform",
#     "Pulumi",
#     "Ansible",
#     "Chef",
#     "Puppet",
#     "OpenShift",
#     "Rancher",
#     "Istio",
#     "Linkerd",
#     "Prometheus",
#     "Grafana",
# ]
# testing = [
#     "JUnit",
#     "TestNG",
#     "Mockito",
#     "Cypress",
#     "Playwright",
#     "Selenium",
#     "Jest",
#     "Vitest",
#     "Mocha",
#     "Chai",
#     "PyTest",
#     "Robot Framework",
#     "Cucumber",
#     "Postman",
#     "Gatling",
#     "k6",
#     "JMeter",
# ]
# security = [
#     "OAuth2",
#     "JWT",
#     "Keycloak",
#     "Okta",
#     "OpenID Connect",
#     "SAML",
#     "Spring Security",
#     "OWASP",
#     "Burp Suite",
#     "SonarQube",
#     "Zap",
# ]
# bigdata = [
#     "Hadoop",
#     "Spark",
#     "Flink",
#     "Kafka",
#     "RabbitMQ",
#     "Kinesis",
#     "Pulsar",
#     "Hive",
#     "Presto",
#     "Trino",
# ]
# ml_ai = [
#     "TensorFlow",
#     "PyTorch",
#     "Keras",
#     "Scikit-learn",
#     "pandas",
#     "NumPy",
#     "spaCy",
#     "Hugging Face",
#     "LangChain",
#     "OpenCV",
#     "ONNX",
#     "MLflow",
#     "Airflow",
# ]
# others = [
#     "Linux",
#     "Unix",
#     "Bash",
#     "PowerShell",
#     "Git",
#     "GitHub",
#     "Bitbucket",
#     "SVN",
#     "REST",
#     "GraphQL",
#     "gRPC",
#     "WebSocket",
#     "Microservices",
#     "Serverless",
#     "Event Driven",
#     "TDD",
#     "DDD",
#     "Clean Architecture",
#     "Agile",
#     "Scrum",
#     "Kanban",
# ]

# NON_SKILL_WORDS_LOWER = {
#     "job description",
#     "your skills and experience",
#     "skills and experience",
#     "information technology",
#     "basic qualifications",
#     "preferred qualifications",
#     "responsibilities",
#     "requirements",
#     "qualifications",
#     "benefits",
#     "company",
#     "inc",
#     "ltd",
#     "corp",
#     "llc",
#     "university",
#     "college",
#     "street",
#     "road",
#     "avenue",
#     "salary",
#     "location",
#     "address",
#     "city",
#     "country",
#     "contact",
#     "phone",
#     "email",
#     "website",
#     "application",
#     "deadline",
#     "develop",
#     "design",
#     "build",
#     "manage",
#     "set",
#     "work",
#     "coordinate",
#     "have",
#     "package",
#     "master",
#     "ensure",
#     "support",
#     "analyze",
#     "test",
#     "deploy",
#     "maintain",
#     "implement",
#     "write",
#     "experience",
#     "skills",
#     "knowledge",
#     "education",
#     "priority",
#     "applicants",
#     "graduated",
#     "good",
#     "we",
#     "the",
#     "our",
#     "an",
#     "this",
#     "that",
#     "he",
#     "she",
#     "it",
#     "they",
#     "your",
#     "if",
#     "when",
#     "while",
#     "although",
#     "as",
#     "in",
#     "for",
#     "to",
#     "on",
#     "by",
#     "with",
#     "job",
#     "korean",
#     "english",
#     "relational",
#     "understand",
#     "priority",
#     "and",
#     "or",
#     "of",
#     "a",
#     "is",
#     "monday",
#     "tuesday",
#     "wednesday",
#     "thursday",
#     "friday",
#     "saturday",
#     "sunday",
#     "january",
#     "february",
#     "march",
#     "april",
#     "may",
#     "june",
#     "july",
#     "august",
#     "september",
#     "october",
#     "november",
#     "december",
#     "mr",
#     "mrs",
#     "ms",
#     "dr",
# }
# ALL_PREDEFINED_SKILLS = (
#     prog_langs
#     + backend_fw
#     + frontend_fw
#     + mobile
#     + databases
#     + devops_cloud
#     + testing
#     + security
#     + bigdata
#     + ml_ai
#     + others
# )
# ALL_PREDEFINED_DESIGNATIONS = [
#     "Software Engineer",
#     "Software Developer",
#     "Application Developer",
#     "Web Developer",
#     "Frontend Developer",
#     "Front-End Developer",
#     "Backend Developer",
#     "Back-End Developer",
#     "Full Stack Developer",
#     "Full-Stack Developer",
#     "Fullstack Developer",
#     "Mobile Developer",
#     "iOS Developer",
#     "Android Developer",
#     "Data Scientist",
#     "Data Analyst",
#     "Data Engineer",
#     "Business Analyst",
#     "Systems Analyst",
#     "Product Manager",
#     "Project Manager",
#     "Program Manager",
#     "QA Engineer",
#     "Test Engineer",
#     "Software Test Engineer",
#     "Tester",
#     "QA Analyst",
#     "DevOps Engineer",
#     "Cloud Engineer",
#     "Site Reliability Engineer",
#     "SRE",
#     "System Administrator",
#     "Network Engineer",
#     "Network Administrator",
#     "Security Engineer",
#     "Cybersecurity Analyst",
#     "UX Designer",
#     "UI Designer",
#     "UX/UI Designer",
#     "Product Designer",
#     "Graphic Designer",
#     "Team Lead",
#     "Technical Lead",
#     "Tech Lead",
#     "Engineering Manager",
#     "Development Manager",
#     "Architect",
#     "Software Architect",
#     "Solutions Architect",
#     "Cloud Architect",
#     "Data Architect",
#     "Manager",
#     "Director",
#     "VP of Engineering",
#     "Chief Technology Officer",
#     "CTO",
#     "Specialist",
#     "Consultant",
#     "Associate",
#     "Intern",
#     "Internship",
#     "Trainee",
#     "Graduate Engineer",
#     "Junior Developer",
#     "Junior Engineer",
#     "Senior Developer",
#     "Senior Engineer",
#     "Senior Software Engineer",
#     "Principal Engineer",
#     "Staff Engineer",
#     "Marketing Executive",
#     "Sales Executive",
#     "Accountant",
#     "HR Specialist",
#     "Recruiter",
#     "Customer Support Engineer",
#     "Technical Support Engineer",
#     "Support Engineer",
#     "Programmer",
#     "Java Developer",
#     "Python Developer",
#     ".NET Developer",
#     "PHP Developer",
#     "C++ Developer",
#     "Javascript Developer",
#     "Machine Learning Engineer",
#     "Deep Learning Engineer",
#     "AI Researcher",
#     "Computer Vision Engineer",
#     "NLP Engineer",
#     "Big Data Engineer",
#     "Big Data Analyst",
#     "Database Administrator (DBA)",
#     "Database Developer",
#     "Embedded Systems Engineer",
#     "Firmware Engineer",
#     "IoT Developer",
#     "Blockchain Developer",
#     "Blockchain Engineer",
#     "DevSecOps Engineer",
#     "Security Architect",
#     "Information Security Manager",
#     "Penetration Tester",
#     "Ethical Hacker",
#     "Compliance Analyst",
#     "Chief Information Officer (CIO)",
#     "Technical Program Manager",
#     "Release Manager",
#     "Build and Release Engineer",
#     "Configuration Manager",
#     "Scrum Master",
#     "Agile Coach",
#     "DevOps Manager",
#     "Site Reliability Manager",
#     "Engineering Manager",
#     "Cloud Security Engineer",
#     "Infrastructure Engineer",
#     "Platform Engineer",
#     "API Engineer",
#     "Solutions Engineer",
#     "Customer Success Engineer",
#     "Implementation Engineer",
#     "Technical Writer",
#     "Documentation Specialist",
#     "Localization Engineer",
#     "Game Developer",
#     "Game Engineer",
#     "Game Designer",
#     "QA Lead",
#     "Test Automation Engineer",
#     "Automation Engineer",
#     "Performance Engineer",
#     "Robotics Engineer",
#     "Quantum Computing Researcher",
# ]
# ALL_PREDEFINED_DEGREES = [
#     # Associate / College
#     "Associate of Applied Science in Information Technology",
#     "Associate of Science in Computer Science",
#     "Associate of Science in Information Systems",
#     "College Degree",
#     "Associate Degree",
#     "Diploma",
#     # Bachelor
#     "Bachelor of Science in Computer Science",
#     "Bachelor of Science in Software Engineering",
#     "Bachelor of Science in Information Technology",
#     "Bachelor of Science in Data Science",
#     "Bachelor of Science in Cybersecurity",
#     "Bachelor of Science in Computer Engineering",
#     "Bachelor of Science in Information Systems",
#     "University Degree",
#     "Bachelor's Degree",
#     "Bachelor",
#     # Master
#     "Master of Science in Computer Science",
#     "Master of Science in Data Science",
#     "Master of Science in Artificial Intelligence",
#     "Master of Science in Cybersecurity",
#     "Master of Science in Software Engineering",
#     "Master of Science in Information Systems",
#     "Master of Engineering in Computer Engineering",
#     "Master of Engineering in Software Engineering",
#     "Master's Degree",
#     "Master",
#     "Postgraduate",
#     # PhD
#     "Doctor of Philosophy in Computer Science",
#     "Doctor of Philosophy in Information Systems",
#     "Doctor of Philosophy in Data Science",
#     "Doctor of Philosophy in Artificial Intelligence",
#     "Doctor of Philosophy in Cybersecurity",
#     "PhD",
#     "Doctorate",
#     # Certificates
#     "Professional Certificate in Cloud Computing",
#     "Professional Certificate in Data Analytics",
#     "Professional Certificate in Cybersecurity",
#     "Professional Certificate in DevOps",
#     "Professional Certificate in Machine Learning",
#     "Professional Certificate",
#     "Vocational Certificate",
# ]

# log.info("Calculating prototype skill vector for AI-based validation...")
# try:
#     predefined_skill_embeddings = model.encode(
#         ALL_PREDEFINED_SKILLS, show_progress_bar=False
#     )
#     prototype_skill_vector = np.mean(predefined_skill_embeddings, axis=0)
#     log.info("Prototype skill vector created successfully.")
# except Exception as e:
#     log.error(f"Failed to create prototype skill vector: {e}")
#     prototype_skill_vector = np.array([])

# log.info("Calculating prototype designation vector for AI-based validation...")
# try:
#     predefined_designation_embeddings = model.encode(
#         ALL_PREDEFINED_DESIGNATIONS, show_progress_bar=False
#     )
#     prototype_designation_vector = np.mean(predefined_designation_embeddings, axis=0)
#     log.info("Prototype designation vector created successfully.")
# except Exception as e:
#     log.error(f"Failed to create prototype designation vector: {e}")
#     prototype_designation_vector = np.array([])
# log.info("Calculating prototype degree vector for AI-based validation...")
# try:
#     predefined_degree_embeddings = model.encode(
#         ALL_PREDEFINED_DEGREES, show_progress_bar=False
#     )
#     prototype_degree_vector = np.mean(predefined_degree_embeddings, axis=0)
#     log.info("Prototype degree vector created successfully.")
# except Exception as e:
#     log.error(f"Failed to create prototype degree vector: {e}")
#     prototype_degree_vector = np.array([])
# DEGREE_ANTI_KEYWORDS_LOWER = {
#     "programming",
#     "oop",
#     "api",
#     "architecture",
#     "model",
#     "experience",
#     "skill",
#     "knowledge",
#     "understanding",
#     "proficient",
#     "working with",
#     "language",
#     "framework",
#     "database",
#     "system",
#     "platform",
#     "tool",
#     "library",
# }


# # --- Heuristic-based Designation Extraction Setup ---
# DESIGNATION_LEVELS = [
#     "Senior",
#     "Junior",
#     "Lead",
#     "Principal",
#     "Staff",
#     "Head of",
#     "Trainee",
#     "Intern",
#     "Manager",
#     "Director",
#     "Mid-level",
#     "Associate",
#     "VP",
# ]
# DESIGNATION_DOMAINS = [
#     "Backend",
#     "Frontend",
#     "Front-end",
#     "Back-end",
#     "Full Stack",
#     "Full-Stack",
#     "Fullstack",
#     "Mobile",
#     "Data",
#     "Cloud",
#     "DevOps",
#     "UI/UX",
#     "UI-UX",
#     "QA",
#     "Security",
#     "Enterprise",
#     "Platform",
#     "Infrastructure",
#     "Solutions",
#     "Engineering",
#     "Project",
# ]
# DESIGNATION_SKILLS = [
#     "Java",
#     "Python",
#     ".NET",
#     "PHP",
#     "C#",
#     "C++",
#     "Javascript",
#     "React",
#     "Angular",
#     "Vue",
#     "Node",
#     "Go",
#     "iOS",
#     "Android",
#     "AWS",
#     "Azure",
#     "GCP",
#     "Google Cloud",
#     "Kubernetes",
#     "Docker",
#     "SQL",
#     "IS",
#     "ERP",
#     "Laravel",
# ]
# DESIGNATION_CORE_TITLES = sorted(
#     [
#         "Software Engineer",
#         "Software Developer",
#         "Application Developer",
#         "Web Developer",
#         "Frontend Developer",
#         "Front-End Developer",
#         "Backend Developer",
#         "Back-End Developer",
#         "Full Stack Developer",
#         "Full-Stack Developer",
#         "Fullstack Developer",
#         "Mobile Developer",
#         "Data Scientist",
#         "Data Analyst",
#         "Data Engineer",
#         "Business Analyst",
#         "Systems Analyst",
#         "Product Manager",
#         "Project Manager",
#         "Program Manager",
#         "QA Engineer",
#         "Test Engineer",
#         "Software Test Engineer",
#         "Tester",
#         "QA Analyst",
#         "DevOps Engineer",
#         "Cloud Engineer",
#         "Site Reliability Engineer",
#         "SRE",
#         "System Administrator",
#         "Network Engineer",
#         "Network Administrator",
#         "Security Engineer",
#         "Cybersecurity Analyst",
#         "UX Designer",
#         "UI Designer",
#         "UX/UI Designer",
#         "Product Designer",
#         "Graphic Designer",
#         "Team Lead",
#         "Technical Lead",
#         "Tech Lead",
#         "Engineering Manager",
#         "Development Manager",
#         "Architect",
#         "Software Architect",
#         "Solutions Architect",
#         "Cloud Architect",
#         "Data Architect",
#         "Engineer",
#         "Developer",
#         "Scientist",
#         "Analyst",
#         "Manager",
#         "Consultant",
#         "Specialist",
#         "Intern",
#         "Internship",
#         "Trainee",
#         "Programmer",
#         "Executive",
#         "Recruiter",
#         "Accountant",
#         "Head",
#         "Engineering",
#         "Member",
#         "Coordinator",
#     ],
#     key=len,
#     reverse=True,
# )


# def calculate_skills_score(candidate_skills, jd_skills, weight=25):
#     if not candidate_skills or not jd_skills:
#         return 0
#     candidate_skills = [skill.lower().strip() for skill in candidate_skills]
#     jd_skills = [skill.lower().strip() for skill in jd_skills]
#     candidate_embeddings = model.encode(candidate_skills)
#     jd_embeddings = model.encode(jd_skills)

#     similarities = util.cos_sim(candidate_embeddings, jd_embeddings)
#     threshold = 0.7
#     matches = torch.sum(similarities > threshold).item()
#     score = (float(matches) / len(jd_skills)) * weight
#     return min(score, weight)


# def calculate_experience_score(candidate_years, required_years, weight=20):
#     if not candidate_years:
#         return 0
#     try:
#         candidate_years = float(candidate_years)
#         required_years = float(required_years)

#         if candidate_years >= required_years:
#             return weight
#         elif candidate_years > 0:
#             return (candidate_years / required_years) * weight
#         return 0
#     except:
#         return 0


# NORMALIZE_PATTERNS = [
#     (r"\b(full[\s\-]?stack|mern|mean|lamp)\b", "full stack"),
#     (r"\bfront[\s\-]?end\b", "frontend"),
#     (r"\bback[\s\-]?end\b", "backend"),
#     (r"\bdev[\s\-]?ops\b", "devops"),
#     (r"\bsite reliability( engineer|)\b", "sre"),
#     (r"\bquality[\s\-]?assurance\b", "qa"),
#     (r"\b(machine[\s\-]?learning|ml engineer)\b", "ml"),
#     (r"\bdata[\s\-]?science\b", "data"),
#     (r"\b(cyber[\s\-]?security|info[\s\-]?sec)\b", "security"),
#     (r"\bios\b", "ios"),
# ]

# ROLE_TAGS: dict[str, set[str]] = {
#     "frontend": {
#         "frontend",
#         "react",
#         "angular",
#         "vue",
#         "svelte",
#         "javascript",
#         "typescript",
#         "tailwind",
#         "bootstrap",
#         "material-ui",
#     },
#     "backend": {
#         "backend",
#         "java",
#         "spring",
#         "node",
#         ".net",
#         "python",
#         "django",
#         "flask",
#         "fastapi",
#         "php",
#         "laravel",
#         "ruby",
#         "rails",
#         "go",
#     },
#     "fullstack": {"full stack"},
#     "mobile": {
#         "mobile",
#         "android",
#         "ios",
#         "swift",
#         "kotlin",
#         "flutter",
#         "react native",
#         "xamarin",
#         "cordova",
#         "ionic",
#     },
#     "devops": {
#         "devops",
#         "sre",
#         "docker",
#         "kubernetes",
#         "ci/cd",
#         "jenkins",
#         "terraform",
#         "ansible",
#         "aws",
#         "azure",
#         "gcp",
#         "prometheus",
#         "grafana",
#     },
#     "data": {
#         "data",
#         "ml",
#         "etl",
#         "hadoop",
#         "spark",
#         "kafka",
#         "pandas",
#         "numpy",
#         "tensorflow",
#         "pytorch",
#         "sql",
#         "mysql",
#         "postgres",
#         "snowflake",
#         "bigquery",
#         "airflow",
#     },
#     "qa": {
#         "qa",
#         "tester",
#         "selenium",
#         "cypress",
#         "playwright",
#         "junit",
#         "pytest",
#         "robot",
#     },
#     "security": {
#         "security",
#         "jwt",
#         "oauth2",
#         "saml",
#         "keycloak",
#         "owasp",
#         "pentest",
#         "burp",
#         "zap",
#         "sonarqube",
#     },
#     "uiux": {
#         "ui",
#         "ux",
#         "figma",
#         "sketch",
#         "adobe xd",
#         "product designer",
#         "interaction designer",
#         "graphic designer",
#     },
# }


# TAG_BONUS = 0.07
# TAG_PENALTY = 0.05


# def _normalize(text) -> str:

#     if text is None or (isinstance(text, float) and math.isnan(text)):
#         text = ""
#     text = str(text)

#     text = unicodedata.normalize("NFKD", text).lower()

#     for pat, repl in NORMALIZE_PATTERNS:
#         text = re.sub(pat, repl, text)

#     text = re.sub(r"[^\w+#/\s]", " ", text)
#     return re.sub(r"\s+", " ", text).strip()


# def _tag_set(text: str) -> set[str]:
#     tokens = set(text.split())
#     return {role for role, kws in ROLE_TAGS.items() if tokens & kws}


# def calculate_designation_score(
#     candidate_designation: str,
#     jd_designation: str,
#     weight: float = 15,
# ) -> float:
#     if not candidate_designation or not jd_designation:
#         log.debug("designation empty → 0 đ")
#         return 0.0

#     cand = _normalize(candidate_designation)
#     jd = _normalize(jd_designation)
#     sim = util.cos_sim(model.encode([cand]), model.encode([jd]))[0][0].item()
#     tags_cand, tags_jd = _tag_set(cand), _tag_set(jd)
#     log.debug(
#         "cand='%s' | jd='%s' | raw_sim=%.3f | tags=%s/%s",
#         cand,
#         jd,
#         sim,
#         tags_cand,
#         tags_jd,
#     )
#     if tags_cand & tags_jd:
#         sim = min(sim + TAG_BONUS, 1)
#         log.debug("   bonus  → %.3f", sim)
#     elif {"backend", "frontend"} <= (tags_cand | tags_jd) and not (tags_cand & tags_jd):
#         sim = max(sim - TAG_PENALTY, 0)
#         log.debug("   penalty→ %.3f", sim)
#     score = weight / (1 + math.exp(-12 * (sim - 0.5)))
#     log.debug("designation_score=%.2f", score)
#     return round(score, 2)


# def calculate_degree_score(
#     candidate_degree: str, jd_degree: str, weight: float = 10
# ) -> float:
#     """
#     Calculates the degree score based on the JD requirements.
#     - If the JD does not specify a degree, all candidates get full points.
#     - If the JD specifies a "GENERIC_IT_DEGREE", candidates with an IT-related degree get full points.
#     - If the JD specifies a specific degree, the candidate's degree is compared for a match.
#     """
#     # Case 1: JD does not specify degree. Award full points.
#     if not jd_degree or jd_degree.strip() == "":
#         log.debug("JD does not specify degree. Awarding full points.")
#         return float(weight)

#     # Case 2: JD requires a generic IT degree.
#     if jd_degree == "GENERIC_IT_DEGREE":
#         log.debug(
#             "JD requires a generic IT degree. Validating candidate's degree against IT prototype."
#         )
#         if not candidate_degree or candidate_degree.strip() == "":
#             log.debug("Candidate has no degree listed. 0 points.")
#             return 0.0

#         candidate_emb = model.encode(candidate_degree)
#         similarity = util.cos_sim(candidate_emb, prototype_degree_vector)[0][0].item()

#         it_degree_threshold = 0.5
#         log.debug(
#             f"CV degree '{candidate_degree}' vs IT prototype similarity: {similarity:.3f}"
#         )
#         return float(weight) if similarity > it_degree_threshold else 0.0

#     # Case 3: JD requires a specific degree, but candidate has none listed.
#     if not candidate_degree or candidate_degree.strip() == "":
#         log.debug(f"JD requires '{jd_degree}', but candidate has no degree. 0 points.")
#         return 0.0

#     # Case 4: Both JD and candidate have a specific degree. Compare them.
#     candidate_emb = model.encode(candidate_degree)
#     jd_emb = model.encode(jd_degree)
#     similarity = util.cos_sim(candidate_emb, jd_emb)[0][0].item()
#     log.debug(
#         f"Specific match: JD='{jd_degree}' vs CV='{candidate_degree}'. Similarity: {similarity:.3f}"
#     )

#     match_threshold = 0.6
#     return float(weight) if similarity > match_threshold else 0.0


# def calculate_gpa_score(gpa_str, weight=10):

#     if not gpa_str or not str(gpa_str).strip():
#         return 0

#     gpa_str = str(gpa_str).strip()

#     try:
#         gpa_value_str = gpa_str.split("/")[0].strip()
#         gpa = float(gpa_value_str)

#         is_10_point_scale = False

#         if "/" in gpa_str:
#             parts = gpa_str.split("/")
#             if len(parts) > 1:
#                 denominator_str = parts[1].strip()
#                 if denominator_str == "10":
#                     is_10_point_scale = True
#                 elif denominator_str == "4":
#                     is_10_point_scale = False
#                 else:
#                     if gpa > 4.0 and gpa <= 10.0:
#                         is_10_point_scale = True

#             else:
#                 if gpa > 4.0 and gpa <= 10.0:
#                     is_10_point_scale = True

#         else:
#             if gpa > 4.0 and gpa <= 10.0:
#                 is_10_point_scale = True

#         if is_10_point_scale:

#             if gpa > 10.0:
#                 gpa = 10.0
#             if gpa < 0.0:
#                 gpa = 0.0

#             if gpa >= 9.0:
#                 return weight
#             elif 8.0 <= gpa < 9.0:
#                 return weight * 0.7
#             elif 7.0 <= gpa < 8.0:
#                 return weight * 0.4
#             return 0
#         else:

#             if gpa > 4.0:
#                 gpa = 4.0
#             if gpa < 0.0:
#                 gpa = 0.0

#             if gpa >= 3.6:
#                 return weight
#             elif 3.2 <= gpa < 3.6:
#                 return weight * 0.7
#             elif 2.8 <= gpa < 3.2:
#                 return weight * 0.4
#             return 0

#     except ValueError:
#         return 0
#     except Exception:
#         return 0


# def calculate_bonus_scores(cv_data, weights):

#     score = 0
#     if cv_data.get("languages") and str(cv_data["languages"]).strip():
#         score += weights["languages"]

#     # Awards
#     if cv_data.get("awards") and str(cv_data["awards"]).strip():
#         score += weights["awards"]

#     # GitHub
#     if cv_data.get("github") and str(cv_data["github"]).strip():
#         score += weights["github"]

#     # Certifications
#     if cv_data.get("certifications") and str(cv_data["certifications"]).strip():
#         score += weights["certifications"]

#     # Projects
#     if cv_data.get("projects") and str(cv_data["projects"]).strip():
#         score += weights["projects"]

#     return score


# def _extract_skills_from_jd_regex_fallback(jd_text: str) -> list[str]:
#     found_skills_from_list = set()
#     for skill in ALL_PREDEFINED_SKILLS:
#         pattern = r"\b" + re.escape(skill) + r"\b"
#         if re.search(pattern, jd_text, re.IGNORECASE):
#             found_skills_from_list.add(skill)
#     potential_new_skills_by_heuristic = set()
#     regex_capitalized_phrases = (
#         r"\b[A-Z][a-zA-Z0-9.#+/]*(?:\s+[A-Z][a-zA-Z0-9.#+/]*)*\b"
#     )
#     denylist_lower = {
#         "job description",
#         "your skills and experience",
#         "you need",
#         "we are looking for",
#         "hcmc",
#         "hanoi",
#         "district",
#         "ward",
#         "street",
#         "city",
#         "university",
#         "college",
#         "optional",
#         "main",
#         "long",
#         "good",
#     }

#     for match in re.finditer(regex_capitalized_phrases, jd_text):
#         skill_candidate = match.group(0).strip()
#         if len(skill_candidate) < 2 or len(skill_candidate.split()) > 4:
#             continue
#         if skill_candidate.lower() in denylist_lower:
#             continue
#         if any(char.isdigit() for char in skill_candidate) and not any(
#             term in skill_candidate for term in ["C#", "C++", "OAuth2", "3"]
#         ):
#             continue

#         potential_new_skills_by_heuristic.add(skill_candidate)
#     validated_heuristic_skills = set()
#     if prototype_skill_vector.size > 0 and potential_new_skills_by_heuristic:
#         unseen_heuristic_skills = list(
#             {
#                 skill
#                 for skill in potential_new_skills_by_heuristic
#                 if skill.lower() not in {s.lower() for s in found_skills_from_list}
#             }
#         )

#         if unseen_heuristic_skills:
#             log.debug(
#                 f"AI Validation: Found {len(unseen_heuristic_skills)} potential new skills to validate."
#             )

#             candidate_embeddings = model.encode(
#                 unseen_heuristic_skills, show_progress_bar=False
#             )
#             similarities = util.cos_sim(candidate_embeddings, prototype_skill_vector)

#             validation_threshold = 0.4  # Adjusted threshold for better recall

#             for i, skill in enumerate(unseen_heuristic_skills):
#                 sim_score = similarities[i][0].item()
#                 if sim_score > validation_threshold:
#                     validated_heuristic_skills.add(skill)
#                     log.debug(f"  ✔️ Accepted '{skill}' (sim: {sim_score:.2f})")
#                 else:
#                     log.debug(f"  ❌ Rejected '{skill}' (sim: {sim_score:.2f})")

#     final_skills = found_skills_from_list.union(validated_heuristic_skills)
#     return list(final_skills)


# def extract_skills_from_jd(jd_text: str) -> list[str]:
#     return _extract_skills_from_jd_regex_fallback(jd_text)


# def extract_experience_years_from_jd(jd_text: str) -> str:
#     if not jd_text or not isinstance(jd_text, str):
#         return "0"

#     patterns = [
#         r"(?:ít nhất|tối thiểu|kinh nghiệm|có)\s*(\d+(?:\.\d+)?)\s*năm",
#         r"(\d+(?:\.\d+)?)\s*năm kinh nghiệm",
#         r"(\d+(?:\.\d+)?)\s*\+\s*năm",
#         r"(?:at least|minimum|more than|over)\s*(\d+(?:\.\d+)?)\s*years?",
#         r"(\d+(?:\.\d+)?)\s*years?\s*(?:of)?\s*experience",
#         r"(\d+(?:\.\d+)?)\s*\+\s*years?",
#     ]

#     for pattern in patterns:
#         match = re.search(pattern, jd_text, re.IGNORECASE)
#         if match and match.group(1):
#             return match.group(1)

#     simple_match_vn = re.search(
#         r"(\d+(?:\.\d+)?)\s*(?:năm kinh nghiệm|năm KN|năm exp)", jd_text, re.IGNORECASE
#     )
#     if simple_match_vn and simple_match_vn.group(1):
#         return simple_match_vn.group(1)

#     simple_match_en = re.search(
#         r"(\d+(?:\.\d+)?)\s*(?:years experience|years exp|yrs exp)",
#         jd_text,
#         re.IGNORECASE,
#     )
#     if simple_match_en and simple_match_en.group(1):
#         return simple_match_en.group(1)
#     return "0"


# def extract_degree_from_jd(jd_text: str) -> str:
#     """
#     Extracts the required degree from the JD text using an improved hybrid approach:
#     1.  Iterates through lines to find headers (e.g., "Education", "Required conditions").
#     2.  Once a header is found, it scans the subsequent lines for degree-related keywords.
#     3.  When a match is found, the entire meaningful sentence is extracted and validated against anti-keywords.
#     4.  Checks for "generic" phrases and returns a special token if found.
#     5.  Filters candidates to prioritize longer, more specific phrases.
#     6.  Uses a powerful Cross-Encoder model to re-rank the best candidates based on full JD context.
#     """
#     if not jd_text or not isinstance(jd_text, str):
#         return ""
#     if not cross_encoder:
#         log.warning(
#             "Cross-Encoder model not available. Degree extraction will be unreliable."
#         )
#         return ""

#     candidate_phrases = set()

#     # --- Pattern 1: Find candidates by looking for sentences after education-related headers ---
#     keywords_list = [
#         "Yêu cầu bằng cấp",
#         "Bằng cấp",
#         "Trình độ",
#         "Học vấn",
#         "Tốt nghiệp",
#         "Degree",
#         "Education",
#         "Qualifications",
#         "Academic Background",
#         "Graduated",
#         "Requirements",
#         "Required conditions",
#     ]
#     degree_sub_keywords = [
#         "degree",
#         "bachelor",
#         "master",
#         "phd",
#         "doctorate",
#         "college",
#         "university",
#         "diploma",
#         "đại học",
#         "cao đẳng",
#     ]

#     lines = jd_text.splitlines()
#     for i, line in enumerate(lines):
#         # Check if the line is a header
#         if any(re.search(rf"\b{k}\b", line, re.IGNORECASE) for k in keywords_list):
#             # Scan the header line itself and the next few lines
#             for j in range(i, min(i + 4, len(lines))):
#                 scan_line = lines[j].strip()
#                 # Check if this line contains a core degree term
#                 if any(
#                     re.search(rf"\b{sub_k}\b", scan_line, re.IGNORECASE)
#                     for sub_k in degree_sub_keywords
#                 ):
#                     # Found a line with a degree. Extract the full meaningful phrase.
#                     phrase = re.sub(r"^\s*[\d\.\-•*]+\s*", "", scan_line).strip(" .,;")

#                     # NEW: Context validation to filter out skill descriptions
#                     lower_phrase = phrase.lower()
#                     if any(
#                         anti_keyword in lower_phrase
#                         for anti_keyword in DEGREE_ANTI_KEYWORDS_LOWER
#                     ):
#                         log.debug(
#                             f"Rejecting degree candidate '{phrase}' due to anti-keyword."
#                         )
#                         continue

#                     if (
#                         len(phrase.split()) > 2
#                     ):  # Ensure it's more than just the keyword
#                         candidate_phrases.add(phrase)

#     # --- Pattern 2: Find standalone degree keywords as a fallback ---
#     for keyword in ALL_PREDEFINED_DEGREES:
#         if re.search(rf"\b{re.escape(keyword)}\b", jd_text, re.IGNORECASE):
#             candidate_phrases.add(keyword)

#     if not candidate_phrases:
#         log.info("No candidate phrases found for degree in JD.")
#         return ""

#     # --- Filtering Step: Prioritize longer, more complete phrases ---
#     sorted_candidates = sorted(list(candidate_phrases), key=len, reverse=True)
#     final_candidates = []
#     for cand in sorted_candidates:
#         if not any(
#             cand.lower() in existing_cand.lower() and len(cand) < len(existing_cand)
#             for existing_cand in final_candidates
#         ):
#             final_candidates.append(cand)

#     log.debug(
#         f"Found {len(final_candidates)} unique, long candidate degrees: {final_candidates}"
#     )
#     if not final_candidates:
#         return ""

#     # --- Check for generic degree requirement before AI validation ---
#     generic_keywords = [
#         "chuyên ngành liên quan",
#         "related fields",
#         "or equivalent",
#         "hoặc tương đương",
#     ]
#     for candidate in final_candidates:
#         if any(keyword in candidate.lower() for keyword in generic_keywords):
#             log.info("Detected a generic IT-related degree requirement.")
#             return "GENERIC_IT_DEGREE"

#     # --- AI Re-ranking with Cross-Encoder ---
#     jd_candidate_pairs = [[jd_text, cand] for cand in final_candidates]
#     scores = cross_encoder.predict(jd_candidate_pairs, show_progress_bar=False)
#     scored_candidates = sorted(zip(scores, final_candidates), reverse=True)

#     log.debug("Cross-Encoder Degree Ranking:")
#     for score, cand in scored_candidates:
#         log.debug(f"  - Score: {score:.4f}, Candidate: '{cand}'")

#     if not scored_candidates:
#         return ""

#     best_score, best_degree = scored_candidates[0]
#     validation_threshold = 0.0  # A positive score indicates a likely match
#     if best_score > validation_threshold:
#         log.info(
#             f"Best degree match (Cross-Encoder): '{best_degree}' (Score: {best_score:.3f})"
#         )
#         return best_degree
#     else:
#         log.info(
#             f"No degree found by Cross-Encoder above threshold {validation_threshold}. Best attempt was '{best_degree}' with score {best_score:.3f}"
#         )
#         return ""


# def extract_designation_from_jd(jd_text: str) -> str:
#     """
#     Extracts the job designation by combining component-based heuristics with fallback patterns.
#     1.  Builds a primary heuristic pattern from known levels, domains, skills, and core titles.
#     2.  Uses fallback patterns (keywords, first lines, general capitalization) for robustness.
#     3.  Filters candidates using word-set logic to prioritize longer, more specific phrases.
#     4.  Uses a powerful Cross-Encoder model to re-rank the best candidates based on full JD context.
#     """
#     if not jd_text or not isinstance(jd_text, str):
#         return ""
#     if not cross_encoder:
#         log.warning(
#             "Cross-Encoder model not available. Designation extraction will be unreliable."
#         )
#         return ""

#     candidate_phrases = set()

#     # --- Pattern 1: Heuristic based on combining title components ---
#     modifier_re = r"(?:\b(?:{})\b)".format(
#         "|".join(DESIGNATION_LEVELS + DESIGNATION_DOMAINS + DESIGNATION_SKILLS)
#     )
#     core_title_re = r"(?:\b(?:{})\b)".format(
#         "|".join(re.escape(t) + "s?" for t in DESIGNATION_CORE_TITLES)
#     )

#     heuristic_pattern = re.compile(
#         rf"((?:{modifier_re}[ \t]+){{0,4}}{core_title_re})", re.IGNORECASE
#     )
#     for match in re.finditer(heuristic_pattern, jd_text):
#         phrase = match.group(0).strip()
#         start_pos = match.start()

#         # Context check to avoid picking items from a list in parentheses
#         left_paren_pos = jd_text.rfind("(", 0, start_pos)
#         if left_paren_pos != -1:
#             right_paren_pos = jd_text.find(")", match.end())
#             if right_paren_pos != -1 and "," in jd_text[left_paren_pos:right_paren_pos]:
#                 log.debug(
#                     f"Rejecting '{phrase}' as it appears to be in a list inside parentheses."
#                 )
#                 continue

#         if phrase.lower() not in {
#             m.lower()
#             for m in (DESIGNATION_LEVELS + DESIGNATION_DOMAINS + DESIGNATION_SKILLS)
#         }:
#             candidate_phrases.add(phrase)

#     # --- Fallback Patterns ---
#     denylist = {
#         "job description",
#         "your skills and experience",
#         "requirements",
#         "technical requirements",
#         "interpersonal requirements",
#         "added advantage",
#         "description",
#         "responsibilities",
#         "qualifications",
#         "about the role",
#         "what you'll do",
#         "we offer",
#         "nice to have",
#         "must have",
#         "our ideal candidate",
#         "job requirements",
#         "your profile",
#         "main tasks",
#     }

#     structured_pattern = r"(?i)(?:we are seeking|we're hiring|hiring|seeking|position|job title|role|designation)\s*[:\-–]?.*?\b([A-Z][A-Za-z0-9/\-'.&]+(?:[ \t]+[A-Z][a-zA-Z0-9/\-'.&]+){1,5})\b"
#     for match in re.finditer(structured_pattern, jd_text):
#         candidate_phrases.add(match.group(1).strip())

#     lines = jd_text.splitlines()
#     for line in lines[:5]:
#         line = line.strip(" -*:")
#         if 1 < len(line.split()) < 8 and line.lower() not in denylist:
#             if sum(1 for word in line.split() if word and word[0].isupper()) >= 2:
#                 candidate_phrases.add(line)

#     # --- NEW: Pattern for Inferred Titles from Requirements ---
#     tech_pattern = "|".join(re.escape(k) for k in ALL_PREDEFINED_SKILLS if len(k) > 2)
#     inference_pattern = re.compile(
#         rf"(?i)(?:proficient in|experience with|thành thạo|kinh nghiệm với)\s+(?:the\s+)?({tech_pattern})\b"
#     )
#     for match in re.finditer(inference_pattern, jd_text):
#         tech_name = match.group(1).strip()
#         # Clean up common additions like "Framework"
#         tech_name = tech_name.replace(" Framework", "").strip()
#         inferred_title = f"{tech_name} Developer"
#         log.debug(f"Inferred title from proficiency requirement: '{inferred_title}'")
#         candidate_phrases.add(inferred_title)

#     if not candidate_phrases:
#         log.debug("No candidate phrases found for designation.")
#         return ""

#     # --- New, smarter filtering step ---
#     def normalize_words(phrase):
#         return {word.rstrip("s") for word in phrase.lower().split()}

#     cleaned_phrases = {
#         re.sub(r"[.,;:]\s*$", "", phrase).strip() for phrase in candidate_phrases
#     }
#     sorted_candidates = sorted(list(cleaned_phrases), key=len, reverse=True)

#     final_candidates = []
#     for cand in sorted_candidates:
#         cand_words = normalize_words(cand)
#         if not any(
#             cand_words.issubset(normalize_words(existing_cand))
#             and len(cand_words) < len(normalize_words(existing_cand))
#             for existing_cand in final_candidates
#         ):
#             final_candidates.append(cand)

#     log.debug(
#         f"Found {len(final_candidates)} unique, long candidate designations: {final_candidates}"
#     )

#     if not final_candidates:
#         return ""

#     # --- AI Re-ranking with Cross-Encoder ---
#     jd_candidate_pairs = [[jd_text, cand] for cand in final_candidates]
#     scores = cross_encoder.predict(jd_candidate_pairs, show_progress_bar=False)
#     scored_candidates = sorted(zip(scores, final_candidates), reverse=True)

#     log.debug("Cross-Encoder Designation Ranking:")
#     for score, cand in scored_candidates:
#         log.debug(f"  - Score: {score:.4f}, Candidate: '{cand}'")
#     if not scored_candidates:
#         return ""

#     best_score, best_designation = scored_candidates[0]
#     # The score is a logit, higher is better. A positive score is a good sign.
#     # For designations, we can be a bit more strict to avoid false positives.
#     validation_threshold = 1.0
#     if best_score > validation_threshold:
#         final_designation = re.sub(r"\s*\(.*\)\s*$", "", best_designation).strip()
#         final_designation = re.sub(
#             r"\s+in\s+.*", "", final_designation, flags=re.IGNORECASE
#         ).strip()

#         log.info(
#             f"Best designation match (Cross-Encoder): '{final_designation}' (Score: {best_score:.3f})"
#         )
#         return final_designation
#     else:
#         log.warning(
#             f"No designation found by Cross-Encoder above threshold {validation_threshold}. Best attempt was '{best_designation}' with score {best_score:.3f}"
#         )
#         return ""


# def translate_text_azure(text: str) -> str:
#     print("\n=== AZURE TRANSLATION DEBUG ===")
#     try:
#         if detect(text) == "en":
#             print("Detected EN – skip translate")
#             return text

#         key = os.getenv("AZURE_TRANSLATOR_KEY")
#         ep = os.getenv("AZURE_TRANSLATOR_ENDPOINT").rstrip("/")
#         loc = os.getenv("AZURE_TRANSLATOR_REGION")

#         url = f"{ep}/translate"
#         params = {"api-version": "3.0", "from": "vi", "to": "en"}
#         headers = {
#             "Ocp-Apim-Subscription-Key": key,
#             "Ocp-Apim-Subscription-Region": loc,
#             "Content-Type": "application/json",
#         }

#         max_chars = 5000
#         parts = [text[i : i + max_chars] for i in range(0, len(text), max_chars)]
#         out_parts = []

#         for part in parts:
#             resp = requests.post(
#                 url, params=params, headers=headers, json=[{"text": part}], timeout=10
#             )
#             resp.raise_for_status()
#             out_parts.append(resp.json()[0]["translations"][0]["text"])

#         result = " ".join(out_parts)
#         print("Translation OK")
#         return result

#     except Exception as e:
#         print(f"Translation error ► {e}")
#         return text


# @app.route("/score", methods=["POST"])
# def score_cvs():
#     try:
#         print("Received scoring request")

#         excel_file = request.files["file"]
#         jd_data_from_request = json.loads(request.form["jd"])
#         weights = json.loads(request.form["weights"])

#         jd_text = jd_data_from_request.get("position", "")
#         if not jd_text:
#             return {"error": "Job Description text (position) is missing."}, 400

#         print("\n=== TRANSLATION DEBUG ===")
#         print("Original JD:", jd_text)
#         translated_jd = translate_text_azure(jd_text)
#         print("Translated JD:", translated_jd)

#         print("\n=== DESIGNATION DEBUG ===")
#         required_designation_str = extract_designation_from_jd(translated_jd)
#         print("Extracted designation:", required_designation_str)

#         required_skills = extract_skills_from_jd(translated_jd)
#         print("Extracted required skills (Regex + Heuristic):", required_skills)

#         required_experience_str = extract_experience_years_from_jd(translated_jd)
#         print(f"Extracted required experience (str): {required_experience_str}")

#         required_degree_str = extract_degree_from_jd(translated_jd)
#         print(f"Extracted required degree (str): {required_degree_str}")

#         required_designation_str = extract_designation_from_jd(translated_jd)
#         print(f"Extracted required designation (str): {required_designation_str}")

#         df = pd.read_excel(excel_file)

#         scores = []
#         for idx, row in df.iterrows():
#             row_dict = row.to_dict()
#             try:
#                 skills_data = str(row_dict.get("Kỹ năng", ""))
#                 candidate_skills = (
#                     [s.strip() for s in skills_data.split(",")] if skills_data else []
#                 )
#                 skills_score = calculate_skills_score(
#                     candidate_skills, required_skills, weights["skills"]
#                 )

#                 exp_years_candidate_str = str(row_dict.get("Năm kinh nghiệm", "0"))
#                 if "năm" in exp_years_candidate_str:
#                     exp_years_candidate_str = exp_years_candidate_str.replace(
#                         "năm", ""
#                     ).strip()

#                 exp_score = calculate_experience_score(
#                     exp_years_candidate_str,
#                     required_experience_str,
#                     weights["experience"],
#                 )

#                 designation_score = calculate_designation_score(
#                     row_dict.get("Chức danh", ""),
#                     required_designation_str,
#                     weights["designation"],
#                 )

#                 degree_score = calculate_degree_score(
#                     str(row_dict.get("Bằng cấp", "")),
#                     required_degree_str,
#                     weights["degree"],
#                 )

#                 gpa_str = str(row_dict.get("Điểm GPA", ""))
#                 gpa_score = calculate_gpa_score(gpa_str, weights["gpa"])

#                 bonus_score = calculate_bonus_scores(
#                     {
#                         "languages": row_dict.get("Ngoại ngữ", ""),
#                         "awards": row_dict.get("Giải thưởng", ""),
#                         "github": row_dict.get("GitHub", ""),
#                         "certifications": row_dict.get("Chứng chỉ", ""),
#                         "projects": row_dict.get("Dự án", ""),
#                     },
#                     weights,
#                 )

#                 cv_score = {
#                     "skills_score": round(skills_score, 2),
#                     "experience_score": round(exp_score, 2),
#                     "designation_score": round(designation_score, 2),
#                     "degree_score": round(degree_score, 2),
#                     "gpa_score": round(gpa_score, 2),
#                     "bonus_score": round(bonus_score, 2),
#                     "total_score": round(
#                         skills_score
#                         + exp_score
#                         + designation_score
#                         + degree_score
#                         + gpa_score
#                         + bonus_score,
#                         2,
#                     ),
#                 }
#                 scores.append(cv_score)

#             except Exception as e:
#                 print(f"Lỗi khi xử lý dòng {idx} trong CV: {e}")
#                 scores.append(
#                     {
#                         "skills_score": 0,
#                         "experience_score": 0,
#                         "designation_score": 0,
#                         "degree_score": 0,
#                         "gpa_score": 0,
#                         "bonus_score": 0,
#                         "total_score": 0,
#                     }
#                 )

#         if scores and df.shape[0] == len(scores):
#             for key in scores[0].keys():
#                 df[key] = [score[key] for score in scores]
#         else:
#             print(
#                 "Cảnh báo: Số lượng scores không khớp với DataFrame hoặc không có scores."
#             )

#         output = BytesIO()
#         with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
#             df.to_excel(writer, index=False)
#         output.seek(0)

#         print("Sending response back")
#         return send_file(
#             output,
#             mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
#             as_attachment=True,
#             download_name="fit_cv_score.xlsx",
#         )

#     except Exception as e:
#         print(f"Lỗi nghiêm trọng trong route /score: {str(e)}")
#         import traceback

#         traceback.print_exc()
#         return {"error": str(e)}, 500


# if __name__ == "__main__":
#     print("Starting CV Scoring Server on port 6970")
#     app.run(host="127.0.0.1", port=6970, debug=True, use_reloader=False)
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
    model = SentenceTransformer("all-mpnet-base-v2", cache_folder="D:/hf-cache")
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
