import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error

from feature_builder import build_feature_matrix


DATASET_PATH = "study_behavior.csv"


def train():

    df = pd.read_csv(DATASET_PATH)

    X = build_feature_matrix(df)

    y = df["attention_ratio"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2
    )

    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=8
    )

    model.fit(X_train, y_train)

    preds = model.predict(X_test)

    error = mean_squared_error(y_test, preds)

    print("Focus model MSE:", error)

    joblib.dump(
        model,
        "ml/models/focus_model.pkl"
    )


if __name__ == "__main__":
    train()
