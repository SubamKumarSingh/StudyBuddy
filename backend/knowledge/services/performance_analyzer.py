from django.db.models import Count, Q

from knowledge.models import MCQAttempt


def analyze_performance(user):

    attempts = MCQAttempt.objects.filter(user=user)

    if not attempts.exists():
        return {
            "accuracy": 0,
            "weak_topics": [],
            "total_attempts": 0
        }

    total = attempts.count()

    correct = attempts.filter(is_correct=True).count()

    accuracy = (correct / total) * 100

    topic_stats = (
        attempts
        .values("topic")
        .annotate(
            correct=Count("id", filter=Q(is_correct=True)),
            total=Count("id")
        )
    )

    weak_topics = []

    for t in topic_stats:
        if t["total"] == 0:
            continue

        acc = t["correct"] / t["total"]

        if acc < 0.6:
            weak_topics.append(t["topic"])

    return {
        "accuracy": round(accuracy),
        "weak_topics": weak_topics,
        "total_attempts": total
    }