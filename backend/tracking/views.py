from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from tracking.analytics import calculate_effective_time

from .models import StudySession, SessionEvent
from .utils import get_active_session
from django.utils import timezone
from datetime import timedelta
from .summary import get_summary_for_range
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import LearningEvent, StudySession
from resources.models import PDFResource
from .services.review_scheduler import (
    get_review_queue,
    record_review_outcome,
)

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import LearningEvent, StudySession
from resources.models import PDFResource


class LearningEventView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        event_type = data.get("event_type")

        if not event_type:
            return Response(
                {"error": "event_type required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        session = None
        resource = None

        session_id = data.get("session_id")
        resource_id = data.get("resource_id")

        if session_id:
            session = StudySession.objects.filter(
                id=session_id,
                user=request.user
            ).first()

        if resource_id:
            resource = PDFResource.objects.filter(
                id=resource_id,
                user=request.user
            ).first()

        # event = LearningEvent.objects.create(
        #     user=request.user,
        #     session=session,
        #     resource=resource,
        #     event_type=event_type,
        #     page_number=data.get("page_number"),
        #     duration=data.get("duration"),
        #     scroll_depth=data.get("scroll_depth"),
        #     tab_active=data.get("tab_active", True),
        #     metadata=data.get("metadata", {})
        # )
        event = LearningEvent.objects.create(
    user=request.user,
    session=session,
    resource=resource,
    event_type=event_type,
    page_number=data.get("page_number"),
    duration=data.get("duration"),
    scroll_depth=data.get("scroll_depth"),
    metadata={
        "tab_active": data.get("tab_active", True),
        **data.get("metadata", {})
    }
)
        return Response({
            "status": "event logged",
            "event_id": event.id
        })


class ReviewQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(get_review_queue(request.user))


class ReviewCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pdf_id):
        pdf = PDFResource.objects.filter(id=pdf_id, user=request.user).first()

        if not pdf:
            return Response({"error": "PDF not found"}, status=404)

        score = request.data.get("score", 0.85)
        try:
            score = float(score)
        except (TypeError, ValueError):
            score = 0.85

        review = record_review_outcome(request.user, pdf, score, source="manual")

        return Response({
            "status": "completed",
            "review": {
                "pdf_id": review.pdf_id,
                "pdf_title": review.pdf.display_title(),
                "next_review_at": review.next_review_at,
                "mastery_level": round(review.mastery_level * 100),
                "interval_days": review.interval_days,
            }
        })
# START SESSION API
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_session(request):
    if get_active_session(request.user):
        return Response({"error": "Session already running"}, status=400)

    session = StudySession.objects.create(
        user=request.user,
        last_heartbeat=timezone.now()
    )

    SessionEvent.objects.create(session=session, event_type="START")

    return Response({"session_id": session.id})


# PAUSE SESSION API
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pause_session(request, session_id):
    session = StudySession.objects.get(id=session_id, user=request.user)

    if session.status != "ACTIVE":
        return Response({"error": "Cannot pause"}, status=400)

    session.status = "PAUSED"
    session.save()

    SessionEvent.objects.create(session=session, event_type="PAUSE")

    return Response({"status": "paused"})

# RESUME SESSION API
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def resume_session(request, session_id):
    session = StudySession.objects.get(id=session_id, user=request.user)

    if session.status not in ["PAUSED", "IDLE"]:
        return Response({"error": "Cannot resume"}, status=400)

    session.status = "ACTIVE"
    session.save()

    SessionEvent.objects.create(session=session, event_type="RESUME")

    return Response({"status": "active"})

# END SESSION API
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_session(request, session_id):
    session = StudySession.objects.get(id=session_id, user=request.user)

    if session.status in ["COMPLETED", "ABANDONED"]:
        return Response({"error": "Already ended"}, status=400)

    session.status = "COMPLETED"
    session.ended_at = timezone.now()
    session.save()

    SessionEvent.objects.create(session=session, event_type="END")

    return Response({"status": "completed"})

# ACTIVE SESSION API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_session(request):
    session = get_active_session(request.user)

    if not session:
        return Response({"active": False})

    return Response({
        "active": True,
        "session_id": session.id,
        "started_at": session.started_at,
        "status": session.status
    })

# IDLE START API
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def idle_start(request, session_id):
    session = StudySession.objects.get(id=session_id, user=request.user)

    if session.status == "ACTIVE":
        session.status = "IDLE"
        session.save()
        SessionEvent.objects.create(session=session, event_type="IDLE_START")

    return Response({"ok": True})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def idle_end(request, session_id):
    session = StudySession.objects.get(id=session_id, user=request.user)

    if session.status == "IDLE":
        session.status = "ACTIVE"
        session.save()
        SessionEvent.objects.create(session=session, event_type="IDLE_END")

    return Response({"ok": True})

# HEARTBEAT API
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def heartbeat(request, session_id):
    session = StudySession.objects.get(id=session_id, user=request.user)
    session.last_heartbeat = timezone.now()
    session.save(update_fields=["last_heartbeat"])

    SessionEvent.objects.create(session=session, event_type="HEARTBEAT")

    return Response({"ok": True})


# ANALYTICS API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_analytics(request, session_id):
    session = StudySession.objects.get(id=session_id, user=request.user)

    if session.status != "COMPLETED":
        return Response({"error": "Session not completed"}, status=400)

    data = calculate_effective_time(session)

    return Response(data)


# SUMMARY API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def study_summary(request):
    now = timezone.now()

    # Today (from midnight)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    # Start of week (Monday)
    week_start = today_start - timedelta(days=today_start.weekday())

    today_summary = get_summary_for_range(
        request.user, today_start, now
    )

    week_summary = get_summary_for_range(
        request.user, week_start, now
    )

    return Response({
        "today": today_summary,
        "this_week": week_summary
    })
