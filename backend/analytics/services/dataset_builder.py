import csv

from tracking.models import StudySession

from .feature_engineering import extract_features_for_session


def build_dataset(output_file="study_behavior.csv"):

    sessions = StudySession.objects.filter(
        status="COMPLETED"
    )

    rows = []

    for session in sessions:

        features = extract_features_for_session(session)

        rows.append(features)

    if not rows:
        print("No sessions found.")
        return None

    keys = rows[0].keys()

    with open(output_file, "w", newline="") as f:

        writer = csv.DictWriter(
            f,
            fieldnames=keys
        )

        writer.writeheader()

        for r in rows:
            writer.writerow(r)

    print(f"Dataset built: {output_file}")

    return output_file
