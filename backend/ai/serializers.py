from rest_framework import serializers

from .models import (
    LearningTarget,
    LearningTargetMilestone,
    PopulationBenchmark,
    StudyPlan,
    StudyPlanItem,
)


class LearningTargetMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningTargetMilestone
        fields = [
            "id",
            "title",
            "description",
            "sort_order",
            "due_date",
            "planned_minutes",
            "status",
            "progress_percent",
            "completed_at",
            "metadata",
        ]


class LearningTargetSerializer(serializers.ModelSerializer):
    milestones = LearningTargetMilestoneSerializer(many=True, read_only=True)
    next_milestone = serializers.SerializerMethodField()

    class Meta:
        model = LearningTarget
        fields = [
            "id",
            "raw_text",
            "title",
            "goal_type",
            "status",
            "source_type",
            "subject",
            "scope_label",
            "goal_summary",
            "success_metric_label",
            "target_value",
            "current_value",
            "target_unit",
            "time_horizon_days",
            "start_date",
            "target_date",
            "ai_confidence",
            "estimated_total_minutes",
            "completed_minutes",
            "completed_sessions",
            "progress_percent",
            "mastery_percent",
            "pace_multiplier",
            "recommended_minutes_per_day",
            "recommended_sessions_per_week",
            "benchmark_context",
            "interpretation",
            "completed_at",
            "created_at",
            "updated_at",
            "next_milestone",
            "milestones",
        ]

    def get_next_milestone(self, obj):
        milestone = obj.milestones.filter(status="PENDING").order_by("sort_order").first()
        if not milestone:
            milestone = obj.milestones.filter(status="IN_PROGRESS").order_by("sort_order").first()
        if not milestone:
            return None
        return LearningTargetMilestoneSerializer(milestone).data


class PopulationBenchmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = PopulationBenchmark
        fields = [
            "benchmark_key",
            "goal_type",
            "subject",
            "sample_size",
            "median_days_to_completion",
            "median_minutes_per_day",
            "median_sessions_per_week",
            "median_mastery_percent",
            "median_progress_percent",
            "completion_rate",
            "recommended_minutes_per_day",
            "recommended_sessions_per_week",
            "payload",
            "updated_at",
        ]


class StudyPlanItemSerializer(serializers.ModelSerializer):
    pdf_title = serializers.SerializerMethodField()
    action_url = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlanItem
        fields = [
            "id",
            "pdf",
            "pdf_title",
            "title",
            "description",
            "topic",
            "task_type",
            "status",
            "estimated_minutes",
            "priority_score",
            "rationale",
            "sort_order",
            "completed_at",
            "action_url",
        ]

    def get_pdf_title(self, obj):
        return obj.pdf.display_title() if obj.pdf else None

    def get_action_url(self, obj):
        if obj.pdf_id:
            return f"/dashboard/study/{obj.pdf_id}"
        return "/dashboard/aitutor"


class StudyPlanSerializer(serializers.ModelSerializer):
    items = StudyPlanItemSerializer(many=True, read_only=True)
    completion = serializers.SerializerMethodField()

    class Meta:
        model = StudyPlan
        fields = [
            "id",
            "target_date",
            "status",
            "plan_score",
            "summary",
            "generation_context",
            "completion",
            "items",
            "created_at",
            "updated_at",
        ]

    def get_completion(self, obj):
        total = obj.items.count()
        if total == 0:
            return 0
        completed = obj.items.filter(status="COMPLETED").count()
        return round((completed / total) * 100)
