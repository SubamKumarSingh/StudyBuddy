from django.shortcuts import render
from datetime import timedelta
from django.utils import timezone

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.db.models.functions import TruncDate
from django.db.models import F, ExpressionWrapper, DurationField, Sum, Avg, Count

from resources.models import PDFResource, ResourceInteraction
from tracking.models import StudySession

from ai.services.analytics_formatter import (
    format_focus_state,
    format_content_diagnosis
)

from ai.services.focus_model import compute_focus_state
from ai.services.content_diagnosis import diagnose_content
from ai.services.insight_engine import generate_insights

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from tracking.models import StudySession
from analytics.services.feature_engineering import extract_features_for_session


class SessionFeaturesView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):

        session = StudySession.objects.get(
            id=session_id,
            user=request.user
        )

        features = extract_features_for_session(session)

        return Response(features)
# -------------------------------------------------
# AI INSIGHTS
# -------------------------------------------------

class AIInsightsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        focus = compute_focus_state(request.user)

        resources = [
            diagnose_content(pdf)
            for pdf in PDFResource.objects.filter(user=request.user)
        ]

        insights = generate_insights(focus, resources)

        return Response({
            "insights": insights
        })


# -------------------------------------------------
# FOCUS HISTORY (FOR GRAPH)
# -------------------------------------------------

class FocusHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        sessions = (
            StudySession.objects
            .filter(user=request.user, ended_at__isnull=False)
            .order_by("started_at")[:30]
        )

        data = []

        for s in sessions:

            duration = (s.ended_at - s.started_at).total_seconds()

            # simple heuristic focus score
            focus_score = min(100, int(duration / 60))

            data.append({
                "session": s.id,
                "focus": focus_score
            })

        return Response(data)


# -------------------------------------------------
# STUDY HEATMAP
# -------------------------------------------------

class StudyHeatmapView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        sessions = (
            StudySession.objects
            .filter(user=request.user, ended_at__isnull=False)
            .annotate(
                duration=ExpressionWrapper(
                    F("ended_at") - F("started_at"),
                    output_field=DurationField()
                )
            )
            .annotate(day=TruncDate("started_at"))
            .values("day")
            .annotate(total_duration=Sum("duration"))
            .order_by("day")
        )

        data = []

        for s in sessions:

            minutes = 0

            if s["total_duration"]:
                minutes = int(s["total_duration"].total_seconds() / 60)

            data.append({
                "date": s["day"],
                "minutes": minutes
            })

        return Response(data)


# -------------------------------------------------
# WEEKLY STUDY TIME
# -------------------------------------------------

class StudyTimeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        now = timezone.now()
        start = now - timedelta(days=7)

        interactions = ResourceInteraction.objects.filter(
            user=request.user,
            event_type="view_closed",
            duration__isnull=False,
            timestamp__gte=start
        )

        data = []

        for i in range(7):

            day = start + timedelta(days=i)

            seconds = (
                interactions
                .filter(timestamp__date=day.date())
                .aggregate(total=Sum("duration"))["total"] or 0
            )

            data.append({
                "day": day.strftime("%a"),
                "minutes": int(seconds / 60)
            })

        return Response(data)


# -------------------------------------------------
# FOCUS ANALYTICS
# -------------------------------------------------

class FocusAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        focus = compute_focus_state(request.user)

        return Response(
            format_focus_state(focus)
        )


# -------------------------------------------------
# CONTENT ANALYTICS
# -------------------------------------------------

class ContentAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        pdfs = PDFResource.objects.filter(user=request.user)

        data = []

        for pdf in pdfs:

            diagnosis = diagnose_content(pdf)

            formatted = format_content_diagnosis(diagnosis)

            data.append({
                "name": pdf.name,
                **formatted
            })

        return Response(data)


# -------------------------------------------------
# GLOBAL ANALYTICS
# -------------------------------------------------

class GlobalAnalyticsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        avg_session = StudySession.objects.filter(
            ended_at__isnull=False
        ).annotate(
            duration=ExpressionWrapper(
                F("ended_at") - F("started_at"),
                output_field=DurationField()
            )
        ).aggregate(avg=Avg("duration"))["avg"]

        avg_session_minutes = 0

        if avg_session:
            avg_session_minutes = int(avg_session.total_seconds() / 60)

        avg_focus = ResourceInteraction.objects.values("user").annotate(
            sessions=Count("id")
        ).aggregate(avg=Avg("sessions"))["avg"] or 0

        return Response({
            "avg_session": avg_session_minutes,
            "avg_focus": round(avg_focus, 2)
        })