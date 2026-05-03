import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

from feature_builder import build_feature_matrix


DATASET_PATH = "study_behavior.csv"


def estimate_difficulty(row):

    difficulty = (
        row["avg_page_time"] / 120
        + row["tab_switch_rate"] * 0.02
    )

    return min(1, difficulty)


def train():

    df = pd.read_csv(DATASET_PATH)

    df["difficulty"] = df.apply(
        estimate_difficulty,
        axis=1
    )

    X = build_feature_matrix(df)

    y = df["difficulty"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2
    )

    model = RandomForestRegressor(
        n_estimators=200
    )

    model.fit(X_train, y_train)

    joblib.dump(
        model,
        "ml/models/difficulty_model.pkl"
    )

    print("Difficulty model trained")


if __name__ == "__main__":
    train()
