import statistics
from collections import defaultdict


def compute_scroll_completion(events):

    depths = [e.scroll_depth for e in events if e.scroll_depth]

    if not depths:
        return 0

    return max(depths)


def compute_avg_page_time(events):

    page_times = [
        e.duration
        for e in events
        if e.duration and e.event_type == "PAGE_VIEW"
    ]

    if not page_times:
        return 0

    return statistics.mean(page_times)


def compute_tab_switch_rate(events):

    hidden = sum(1 for e in events if e.event_type == "TAB_HIDDEN")
    visible = sum(1 for e in events if e.event_type == "TAB_VISIBLE")

    switches = hidden + visible

    if switches == 0:
        return 0

    return switches


def compute_page_revisit_rate(events):

    page_counts = defaultdict(int)

    for e in events:
        if e.page_number:
            page_counts[e.page_number] += 1

    revisits = sum(v for v in page_counts.values() if v > 1)

    if not page_counts:
        return 0

    return revisits / len(page_counts)


# -------- NEW FEATURES --------


def compute_attention_ratio(scroll_completion, tab_switch_rate):

    return (1 - min(tab_switch_rate / 10, 1)) * scroll_completion


def compute_engagement_proxy(scroll_completion, revisit_rate):

    return min(
        (scroll_completion * 0.6) +
        (revisit_rate * 0.4),
        1
    )
