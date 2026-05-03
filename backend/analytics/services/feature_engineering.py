from tracking.models import LearningEvent

from .behavior_features import (
    compute_scroll_completion,
    compute_avg_page_time,
    compute_tab_switch_rate,
    compute_page_revisit_rate,
    compute_attention_ratio,
    compute_engagement_proxy,
)


def extract_features_for_session(session):

    events = LearningEvent.objects.filter(
        session=session
    ).order_by("created_at")

    scroll_completion = compute_scroll_completion(events)

    avg_page_time = compute_avg_page_time(events)

    tab_switch_rate = compute_tab_switch_rate(events)

    revisit_rate = compute_page_revisit_rate(events)

    attention_ratio = compute_attention_ratio(
        scroll_completion,
        tab_switch_rate
    )

    engagement_proxy = compute_engagement_proxy(
        scroll_completion,
        revisit_rate
    )

    duration = 0

    if session.ended_at:
        duration = (
            session.ended_at - session.started_at
        ).total_seconds()

    return {

        "session_id": session.id,

        "user_id": session.user_id,

        "duration": duration,

        "avg_page_time": avg_page_time,

        "scroll_completion": scroll_completion,

        "tab_switch_rate": tab_switch_rate,

        "page_revisit_rate": revisit_rate,

        "attention_ratio": attention_ratio,

        "engagement_proxy": engagement_proxy,
    }
