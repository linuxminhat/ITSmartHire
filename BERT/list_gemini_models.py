import google.generativeai as genai

for m in genai.list_models():
    print(m.name, m.supported_generation_methods)
