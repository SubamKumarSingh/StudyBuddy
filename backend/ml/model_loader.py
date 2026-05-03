# import joblib


# focus_model = joblib.load("ml/models/focus_model.pkl")
# engagement_model = joblib.load("ml/models/engagement_model.pkl")
# difficulty_model = joblib.load("ml/models/difficulty_model.pkl")

import os

try:
    import joblib
except Exception:
    joblib = None

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

focus_model_path = os.path.join(BASE_DIR, "ml", "models", "focus_model.pkl")
difficulty_model_path = os.path.join(BASE_DIR, "ml", "models", "difficulty_model.pkl")
engagement_model_path = os.path.join(BASE_DIR, "ml", "models", "engagement_model.pkl")

focus_model = None
difficulty_model = None
engagement_model = None

if joblib and os.path.exists(focus_model_path):
    try:
        focus_model = joblib.load(focus_model_path)
    except Exception:
        focus_model = None

if joblib and os.path.exists(difficulty_model_path):
    try:
        difficulty_model = joblib.load(difficulty_model_path)
    except Exception:
        difficulty_model = None

if joblib and os.path.exists(engagement_model_path):
    try:
        engagement_model = joblib.load(engagement_model_path)
    except Exception:
        engagement_model = None
