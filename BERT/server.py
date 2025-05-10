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

MAX_LEN = 512
# Load back the bert model
from pytorch_pretrained_bert import BertForTokenClassification

bert_out_address = "models"

bert_model = BertForTokenClassification.from_pretrained(
    bert_out_address, num_labels=len(tag2idx)
).cpu()

from pytorch_pretrained_bert import BertTokenizer

tokenizer = BertTokenizer.from_pretrained("bert-base-cased", do_lower_case=False)

from tensorflow.keras.preprocessing.sequence import pad_sequences
import torch
import numpy as np
from scipy.special import softmax


def bert_predict(cv_data: str):
    # Token id embedding, mask word embedding
    tokenized_texts = []
    temp_token = []

    # Add [CLS] at the front
    temp_token.append("[CLS]")
    token_list = tokenizer.tokenize(cv_data)

    for m, token in enumerate(token_list):
        temp_token.append(token)

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
    # Make mask embeeding -> For fine tune of predict, with token mask is 1, pad token is 0
    attention_masks = [[float(i > 0) for i in ii] for ii in input_ids]
    segment_ids = [[0] * len(input_id) for input_id in input_ids]

    # Make embeddings into torch tensor
    input_ids = torch.tensor(input_ids)
    attention_masks = torch.tensor(attention_masks)
    segment_ids = torch.tensor(segment_ids)

    with torch.no_grad():
        outputs = bert_model(
            input_ids,
            token_type_ids=None,
            attention_mask=None,
        )
        # For eval mode, the first result of outputs is logits
        logits = outputs[0]

    predict_results = logits.detach().cpu().numpy()
    results_arrays_soft = softmax(
        predict_results
    )  # Make each token predict result into softmax mode
    result_array = results_arrays_soft
    result_list = np.argmax(result_array, axis=-1)

    # #Get token predict tag
    # for i, mark in enumerate(attention_masks[0]):
    #     if mark>0:
    #         print(f'{temp_token[i]:50} {idx2tag[result_list[i]]}')
    # Build token-tag pairs
    token_tag_pairs = []
    for i, mark in enumerate(attention_masks[0]):
        if mark > 0:
            token_tag_pairs.append(
                {"token": temp_token[i], "tag": idx2tag[result_list[i]], "position": i}
            )

    return token_tag_pairs


from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/resume_parsing", methods=["POST"])
def parse_resume():
    # Get JSON data from request body
    data = request.get_json()

    # Check if 'cv' key exists in the request
    if "cv" not in data:
        return jsonify({"error": "Missing cv field"}), 400

    # Extract the cv value
    cv_content = data["cv"]

    # Return the cv content (you can add your parsing logic here)
    return jsonify({"tokens": bert_predict(cv_content)})


if __name__ == "__main__":
    app.run(debug=True, port=6969, host="0.0.0.0")
