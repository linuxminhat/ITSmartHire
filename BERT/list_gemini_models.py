import google.generativeai as genai

genai.configure(api_key="AIzaSyC5FiQ6fusm8y3HMdIb7ae1buPGrioYYxw")

for m in genai.list_models():
    print(m.name, m.supported_generation_methods)
