from datetime import timedelta

def calculate_effective_time(session):
    events = list(session.events.order_by("timestamp"))

    pause_time = timedelta()
    idle_time = timedelta()

    pause_start = None
    idle_start = None

    for event in events:
        if event.event_type == "PAUSE":
            pause_start = event.timestamp

        elif event.event_type == "RESUME" and pause_start:
            pause_time += event.timestamp - pause_start
            pause_start = None

        elif event.event_type == "IDLE_START":
            idle_start = event.timestamp

        elif event.event_type == "IDLE_END" and idle_start:
            idle_time += event.timestamp - idle_start
            idle_start = None

    raw_time = session.ended_at - session.started_at

    effective_time = raw_time - pause_time - idle_time

    return {
        "raw_seconds": int(raw_time.total_seconds()),
        "pause_seconds": int(pause_time.total_seconds()),
        "idle_seconds": int(idle_time.total_seconds()),
        "effective_seconds": max(0, int(effective_time.total_seconds())),
    }
