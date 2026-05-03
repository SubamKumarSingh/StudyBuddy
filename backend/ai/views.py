from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .services.focus_model import compute_focus_state
from .serializers import StudyPlanSerializer
from .services.study_planner import (
    get_or_create_today_plan,
    update_plan_item_status,
)
from .models import LearningTarget, LearningTargetMilestone, StudyPlanItem
from .services.target_benchmarks import benchmark_to_dict, build_population_benchmark
from .services.target_parser import parse_learning_target
from .services.target_service import (
    complete_target,
    create_or_update_target_from_text,
    get_active_target,
    get_target_overview,
    serialize_learning_target,
)


class FocusStateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = compute_focus_state(request.user)
        return Response(data)


from .services.pedagogy import pedagogical_engine


class PedagogicalDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(pedagogical_engine(request.user))


class TodayStudyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        plan = get_or_create_today_plan(request.user)
        return Response(StudyPlanSerializer(plan).data)


class GenerateStudyPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan = get_or_create_today_plan(request.user, force_refresh=True)
        return Response(StudyPlanSerializer(plan).data)


class StudyPlanItemActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        action = request.data.get("action")
        if action not in {"start", "complete", "skip"}:
            return Response(
                {"error": "Unsupported action"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        item = StudyPlanItem.objects.filter(
            id=item_id,
            plan__user=request.user,
        ).select_related("plan", "pdf").first()

        if not item:
            return Response(
                {"error": "Plan item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        update_plan_item_status(item, action)
        item.refresh_from_db()

        return Response({
            "plan": StudyPlanSerializer(item.plan).data,
        })


class LearningTargetOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(get_target_overview(request.user))


class LearningTargetInterpretView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_text = request.data.get("raw_text", "")
        try:
            parsed = parse_learning_target(raw_text)
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        benchmark = build_population_benchmark(parsed["goal_type"], parsed["subject"])

        return Response({
            "interpretation": parsed,
            "benchmark": benchmark_to_dict(benchmark),
        })


class LearningTargetCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        raw_text = request.data.get("raw_text", "")
        replace_current = request.data.get("replace_current", True)
        try:
            target = create_or_update_target_from_text(
                request.user,
                raw_text,
                replace_current=bool(replace_current),
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(serialize_learning_target(target), status=status.HTTP_201_CREATED)


class LearningTargetCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, target_id):
        target = LearningTarget.objects.filter(
            id=target_id,
            user=request.user,
        ).prefetch_related("milestones").first()

        if not target:
            return Response(
                {"detail": "Target not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        complete_target(target)
        return Response(serialize_learning_target(target))


class LearningTargetMilestoneActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, milestone_id):
        action = request.data.get("action")
        if action not in {"complete", "skip"}:
            return Response(
                {"detail": "Unsupported action."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        milestone = LearningTargetMilestone.objects.filter(
            id=milestone_id,
            target__user=request.user,
        ).select_related("target").first()

        if not milestone:
            return Response(
                {"detail": "Milestone not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if action == "complete":
            milestone.status = "COMPLETED"
            milestone.progress_percent = 100
            milestone.completed_at = timezone.now()
        else:
            milestone.status = "SKIPPED"
            milestone.completed_at = None

        milestone.save(update_fields=["status", "progress_percent", "completed_at", "updated_at"])

        target = milestone.target
        total = target.milestones.count() or 1
        completed = target.milestones.filter(status="COMPLETED").count()
        milestone_progress = round((completed / total) * 100, 1)
        target.progress_percent = max(target.progress_percent, milestone_progress)
        if target.progress_percent >= 100:
            target.status = "COMPLETED"
            target.completed_at = timezone.now()
        target.save(update_fields=["progress_percent", "status", "completed_at", "updated_at"])

        return Response({
            "target": serialize_learning_target(target),
        })


class PopulationBenchmarkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        goal_type = request.query_params.get("goal_type", "")
        subject = request.query_params.get("subject", "")
        benchmark = build_population_benchmark(goal_type, subject)
        return Response(benchmark_to_dict(benchmark))



# LLM VIEW
# from rest_framework.views import APIView
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

# from .services.llm.coach import generate_study_advice


# class StudyCoachView(APIView):

#     permission_classes = [IsAuthenticated]

#     def get(self, request):

#         advice = generate_study_advice(request.user)

#         return Response({
#             "advice": advice
#         })

# from .services.llm.recommendation import generate_recommendation


# class RecommendationView(APIView):

#     permission_classes = [IsAuthenticated]

#     def get(self, request):

#         recommendation = generate_recommendation(request.user)

#         return Response({
#             "recommendation": recommendation
#         })
