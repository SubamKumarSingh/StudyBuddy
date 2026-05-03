import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor

from feature_builder import build_feature_matrix


DATASET_PATH = "study_behavior.csv"


def compute_engagement(row):

    score = (
        0.4 * row["scroll_completion"]
        + 0.4 * row["attention_ratio"]
        - 0.2 * (row["tab_switch_rate"] / 10)
    )

    return max(0, min(1, score))


def train():

    df = pd.read_csv(DATASET_PATH)

    df["engagement"] = df.apply(compute_engagement, axis=1)

    X = build_feature_matrix(df)

    y = df["engagement"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2
    )

    model = GradientBoostingRegressor()

    model.fit(X_train, y_train)

    joblib.dump(
        model,
        "ml/models/engagement_model.pkl"
    )


if __name__ == "__main__":
    train()
