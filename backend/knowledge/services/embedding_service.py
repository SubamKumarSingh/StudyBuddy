model = None


def _load_model():
    global model
    if model is not None:
        return model

    try:
        from sentence_transformers import SentenceTransformer
    except Exception:
        model = False
        return model

    try:
        model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    except Exception:
        model = False

    return model


def generate_embedding(text):
    loaded_model = _load_model()
    if loaded_model:
        embedding = loaded_model.encode(text)
        return embedding.tolist()

    text = text or ""
    vector = [0.0] * 12
    for index, char in enumerate(text[:120]):
        vector[index % len(vector)] += (ord(char) % 97) / 100
    return vector
