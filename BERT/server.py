import torch
import numpy as np
from scipy.special import softmax
import re
from datetime import datetime
import hashlib
import random
import os
from functools import lru_cache
from flask import Flask, request, jsonify
from pytorch_pretrained_bert import BertForTokenClassification, BertTokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

# ========== DETERMINISTIC SETUP ==========
def set_deterministic_behavior():
    """Thiết lập để đảm bảo kết quả nhất quán."""
    seed = 42
    torch.manual_seed(seed)
    np.random.seed(seed) 
    random.seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False
    os.environ['PYTHONHASHSEED'] = str(seed)

# Gọi ngay lập tức
set_deterministic_behavior()

# ========== TAG DEFINITIONS ==========
tag2idx = {
    "U-DESIG": 0,
    "U-PHONE": 1,
    "I-CERTIFICATION": 2,
    "O": 3,
    "I-UNI": 4,
    "U-GITHUB": 5,
    "I-PROJECT_DESCRIPTION": 6,
    "B-GRADUATION_YEAR": 7,
    "I-GRADUATION_YEAR": 8,
    "L-GITHUB": 9,
    "I-LOC": 10,
    "B-WORKING_DESCRIPTION": 11,
    "L-LOC": 12,
    "I-WORKING_COMPANY_EXPERIENCES": 13,
    "B-CERTIFICATION": 14,
    "I-NAME": 15,
    "[SEP]": 16,
    "U-WORKING_COMPANY_EXPERIENCES": 17,
    "L-UNI": 18,
    "B-WORKING_TIME_EXPERIENCES": 19,
    "L-PROJECT": 20,
    "B-PROJECT": 21,
    "B-NAME": 22,
    "I-WORKING_DESCRIPTION": 23,
    "L-TECHSTACK_SKILLS": 24,
    "U-TECHSTACK_SKILLS": 25,
    "B-DEG": 26,
    "U-LOC": 27,
    "L-WORKING_TIME_EXPERIENCES": 28,
    "L-CERTIFICATION": 29,
    "L-DEG": 30,
    "L-GRADUATION_YEAR": 31,
    "B-TECHSTACK_SKILLS": 32,
    "L-DESIG": 33,
    "L-WORKING_DESCRIPTION": 34,
    "I-DEG": 35,
    "I-PROJECT": 36,
    "U-EMAIL": 37,
    "I-TECHSTACK_SKILLS": 38,
    "L-PROJECT_DESCRIPTION": 39,
    "B-GITHUB": 40,
    "B-UNI": 41,
    "[CLS]": 42,
    "I-DESIG": 43,
    "B-DESIG": 44,
    "I-WORKING_TIME_EXPERIENCES": 45,
    "B-LOC": 46,
    "L-NAME": 47,
    "B-PROJECT_DESCRIPTION": 48,
    "B-WORKING_COMPANY_EXPERIENCES": 49,
    "L-WORKING_COMPANY_EXPERIENCES": 50,
    "U-GPA": 51,
    "U-CERTIFICATION": 52,
    "X": 53,
}

idx2tag = {
    0: "U-DESIG",
    1: "U-PHONE",
    2: "I-CERTIFICATION",
    3: "O",
    4: "I-UNI",
    5: "U-GITHUB",
    6: "I-PROJECT_DESCRIPTION",
    7: "B-GRADUATION_YEAR",
    8: "I-GRADUATION_YEAR",
    9: "L-GITHUB",
    10: "I-LOC",
    11: "B-WORKING_DESCRIPTION",
    12: "L-LOC",
    13: "I-WORKING_COMPANY_EXPERIENCES",
    14: "B-CERTIFICATION",
    15: "I-NAME",
    16: "[SEP]",
    17: "U-WORKING_COMPANY_EXPERIENCES",
    18: "L-UNI",
    19: "B-WORKING_TIME_EXPERIENCES",
    20: "L-PROJECT",
    21: "B-PROJECT",
    22: "B-NAME",
    23: "I-WORKING_DESCRIPTION",
    24: "L-TECHSTACK_SKILLS",
    25: "U-TECHSTACK_SKILLS",
    26: "B-DEG",
    27: "U-LOC",
    28: "L-WORKING_TIME_EXPERIENCES",
    29: "L-CERTIFICATION",
    30: "L-DEG",
    31: "L-GRADUATION_YEAR",
    32: "B-TECHSTACK_SKILLS",
    33: "L-DESIG",
    34: "L-WORKING_DESCRIPTION",
    35: "I-DEG",
    36: "I-PROJECT",
    37: "U-EMAIL",
    38: "I-TECHSTACK_SKILLS",
    39: "L-PROJECT_DESCRIPTION",
    40: "B-GITHUB",
    41: "B-UNI",
    42: "[CLS]",
    43: "I-DESIG",
    44: "B-DESIG",
    45: "I-WORKING_TIME_EXPERIENCES",
    46: "B-LOC",
    47: "L-NAME",
    48: "B-PROJECT_DESCRIPTION",
    49: "B-WORKING_COMPANY_EXPERIENCES",
    50: "L-WORKING_COMPANY_EXPERIENCES",
    51: "U-GPA",
    52: "U-CERTIFICATION",
    53: "X",
}

# ========== MODEL SETUP ==========
MAX_LEN = 512
bert_out_address = "models"

bert_model = BertForTokenClassification.from_pretrained(
    bert_out_address, num_labels=len(tag2idx)
).cpu()

# Đảm bảo model ở chế độ eval và tắt dropout
bert_model.eval()
for module in bert_model.modules():
    if module.__class__.__name__.startswith('Dropout'):
        module.p = 0

tokenizer = BertTokenizer.from_pretrained("bert-base-cased", do_lower_case=False)

# ========== HELPER FUNCTIONS ==========
def preprocess_text(text: str) -> str:
    """Tiền xử lý văn bản trước khi đưa vào model - deterministic version."""
    text = " ".join(text.split())
    
    # Collect all patterns with their positions first
    replacements = []
    
    # Email pattern
    email_pattern = r"([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)"
    for match in re.finditer(email_pattern, text):
        replacements.append((match.start(), match.end(), f" {match.group()} "))
    
    # Phone pattern  
    phone_pattern = r"(\d{3}[-.]?\d{3}[-.]?\d{4}|\d{10})"
    for match in re.finditer(phone_pattern, text):
        replacements.append((match.start(), match.end(), f" {match.group()} "))
    
    # GitHub pattern
    github_pattern = r"(github\.com/[a-zA-Z0-9-]+)"
    for match in re.finditer(github_pattern, text):
        replacements.append((match.start(), match.end(), f" {match.group()} "))
    
    # Sort by position (descending) and apply replacements
    replacements.sort(key=lambda x: x[0], reverse=True)
    
    for start, end, replacement in replacements:
        text = text[:start] + replacement + text[end:]
    
    return text

def custom_tokenize(text: str) -> list:
    """Tokenize với xử lý đặc biệt cho một số trường."""
    words = text.split()
    tokens = []

    for word in words:
        # Giữ nguyên email
        if "@" in word and "." in word:
            tokens.append(word)
            continue

        # Giữ nguyên số điện thoại
        if re.match(r"\d{3}[-.]?\d{3}[-.]?\d{4}|\d{10}", word):
            tokens.append(word)
            continue

        # Giữ nguyên GitHub URL
        if "github.com" in word.lower():
            tokens.append(word)
            continue

        # Tokenize bình thường cho các từ khác
        tokens.extend(tokenizer.tokenize(word))

    return tokens

def validate_input(text: str) -> bool:
    """Kiểm tra tính hợp lệ của input."""
    if not text or len(text.strip()) == 0:
        return False
    if len(text) > 10000:  # Giới hạn độ dài input
        return False
    return True

# ========== PREDICTION FUNCTIONS ==========
@lru_cache(maxsize=1000)
def bert_predict_cached(text_hash: str, cv_data: str):
    """Version có cache của bert_predict."""
    return bert_predict_internal(cv_data)

def bert_predict_internal(cv_data: str):
    """Dự đoán NER tags cho CV."""
    # Tiền xử lý văn bản
    cv_data = preprocess_text(cv_data)

    # Token id embedding, mask word embedding
    tokenized_texts = []
    temp_token = []

    # Add [CLS] at the front
    temp_token.append("[CLS]")

    # Sử dụng custom tokenization
    token_list = custom_tokenize(cv_data)
    temp_token.extend(token_list)

    # Trim the token to fit the length requirement
    if len(temp_token) > MAX_LEN - 1:
        temp_token = temp_token[: MAX_LEN - 1]

    # Add [SEP] at the end
    temp_token.append("[SEP]")
    tokenized_texts.append(temp_token)

    # Make id embedding
    input_ids = pad_sequences(
        [tokenizer.convert_tokens_to_ids(txt) for txt in tokenized_texts],
        maxlen=MAX_LEN,
        dtype="long",
        truncating="post",
        padding="post",
    )

    # Make mask embedding
    attention_masks = [[float(i > 0) for i in ii] for ii in input_ids]
    segment_ids = [[0] * len(input_id) for input_id in input_ids]

    # Convert to torch tensors
    input_ids = torch.tensor(input_ids)
    attention_masks = torch.tensor(attention_masks)
    segment_ids = torch.tensor(segment_ids)

    # Predict
    with torch.no_grad():
        bert_model.eval()
        outputs = bert_model(
            input_ids,
            token_type_ids=None,
            attention_mask=attention_masks,
        )
        logits = outputs[0]

    predict_results = logits.detach().cpu().numpy()
    results_arrays_soft = softmax(predict_results)
    confidence_scores = np.max(results_arrays_soft, axis=-1)
    result_list = np.argmax(results_arrays_soft, axis=-1)

    token_tag_pairs = []
    for i, mark in enumerate(attention_masks[0]):
        if mark > 0:
            confidence = float(confidence_scores[0][i])
            token_tag_pairs.append(
                {
                    "token": temp_token[i],
                    "tag": idx2tag[result_list[0][i]],
                    "position": i,
                    "confidence": round(confidence, 4),
                }
            )

    return token_tag_pairs

def bert_predict(cv_data: str):
    """Dự đoán NER tags cho CV với caching."""
    # Tạo hash để cache
    text_hash = hashlib.md5(cv_data.encode('utf-8')).hexdigest()
    return bert_predict_cached(text_hash, cv_data)

# ========== FLASK APP ==========
app = Flask(__name__)

@app.route("/resume_parsing", methods=["POST"])
def parse_resume():
    """API endpoint để parse CV."""
    try:
        data = request.get_json()

        if "cv" not in data:
            return jsonify({"error": "Missing cv field"}), 400

        cv_content = data["cv"]

        if not validate_input(cv_content):
            return jsonify({"error": "Invalid input text"}), 400

        tokens = bert_predict(cv_content)
        print(f"Generated {len(tokens)} tokens")
        print("Sample tokens:", tokens[:5])

        return jsonify(
            {
                "tokens": tokens,
                "status": "success",
                "processed_at": datetime.now().isoformat(),
            }
        )

    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=6969, host="0.0.0.0")
