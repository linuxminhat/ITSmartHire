from sentence_transformers import SentenceTransformer, InputExample, losses, evaluation
from torch.utils.data import DataLoader
import pandas as pd, math

# hyper-params
BATCH = 16
EPOCHS = 3
MODEL_OUT = "all_mpnet_ft_cv_jd_multitask"

train_df = pd.read_csv("train_flat.csv")
valid_df = pd.read_csv("valid_flat.csv")

# package
train_samples = [
    InputExample(texts=[row.cv_text, row.jd_text], label=row.score)
    for row in train_df.itertuples()
]
valid_samples = [
    InputExample(texts=[row.cv_text, row.jd_text], label=row.score)
    for row in valid_df.itertuples()
]

# Shuffle is only enabled with train so that each epoch of data is shuffled, avoiding learning “order”.
train_loader = DataLoader(train_samples, shuffle=True, batch_size=BATCH)
valid_loader = DataLoader(valid_samples, shuffle=False, batch_size=BATCH)

model = SentenceTransformer("all-mpnet-base-v2")
loss_fn = losses.CosineSimilarityLoss(model)

# EmbeddingSimilarityEvaluator is a utility of SentenceTransformer to determine the embedding quality value when validating files.
evaluator = evaluation.EmbeddingSimilarityEvaluator.from_input_examples(
    valid_samples, name="valid"
)
warmup_steps = math.ceil(len(train_loader) * EPOCHS * 0.1)

model.fit(
    train_objectives=[(train_loader, loss_fn)],
    epochs=EPOCHS,
    warmup_steps=warmup_steps,
    evaluator=evaluator,
    evaluation_steps=1000,
    output_path=MODEL_OUT,
    show_progress_bar=True,
)
