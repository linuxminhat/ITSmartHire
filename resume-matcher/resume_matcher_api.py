from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel, PeftConfig

app = Flask(__name__)

# Load models (nên làm khi khởi động để tránh tải lại mỗi request)
print("Loading models...")
base_model_name = "akjindal53244/Llama-3.1-Storm-8B"
base_model = AutoModelForCausalLM.from_pretrained(base_model_name)
tokenizer = AutoTokenizer.from_pretrained(base_model_name)
peft_model_id = "LlamaFactoryAI/cv-job-description-matching"
model = PeftModel.from_pretrained(base_model, peft_model_id)
print("Models loaded successfully!")

@app.route('/match-cv', methods=['POST'])
def match_cv():
    data = request.json
    cv = data.get('cv', '')
    job_description = data.get('job_description', '')
    
    messages = [
        {
            "role": "system",
            "content": """You are an advanced AI model designed to analyze the compatibility between a CV and a job description. You will receive a CV and a job description. Your task is to output a structured JSON format that includes the following:
1. matching_analysis: Analyze the CV against the job description to identify key strengths and gaps.
2. description: Summarize the relevance of the CV to the job description in a few concise sentences.
3. score: Provide a numerical compatibility score (0-100) based on qualifications, skills, and experience.
4. recommendation: Suggest actions for the candidate to improve their match or readiness for the role.
Your output must be in JSON format as follows:
{
  "matching_analysis": "Your detailed analysis here.",
  "description": "A brief summary here.",
  "score": 85,
  "recommendation": "Your suggestions here."
}
""",
        },
        {"role": "user", "content": f"<CV> {cv} </CV>\n<job_description> {job_description} </job_description>"},
    ]
    
    inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt")
    outputs = model.generate(inputs, max_new_tokens=128)
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Parse kết quả thành JSON
    try:
        # Tìm phần JSON trong generated_text
        json_start = generated_text.find('{')
        json_end = generated_text.rfind('}') + 1
        
        if json_start != -1 and json_end != -1:
            json_str = generated_text[json_start:json_end]
            result = json.loads(json_str)
        else:
            result = {"result": generated_text}
    except Exception as e:
        result = {"result": generated_text, "error": str(e)}
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)