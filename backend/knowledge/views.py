from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services.rag_pipeline import answer_question, tutor_chat
from tracking.services.review_scheduler import record_quiz_result


class ChatTutorView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        question = request.data.get("question")

        pdf_id = request.data.get("pdf_id")

        answer = answer_question(
            question,
            pdf_id
        )

        return Response({
            "answer": answer
        })


# GLOBAL AI PAGE VIEWS
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .services.ai_dashboard import build_dashboard
from .services.mcq_generator import generate_mcqs
from .services.performance_analyzer import analyze_performance

from knowledge.services.rag_pipeline import answer_across_pdfs

from .models import MCQAttempt


class AIDashboardView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = build_dashboard(request.user)

        return Response(data)


class GlobalChatView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        question = request.data.get("question")

        answer = answer_across_pdfs(
            request.user,
            question
        )

        return Response({"answer": answer})

class TutorChatView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        question = request.data.get("question")
        history = request.data.get("history", [])

        answer = tutor_chat(
            request.user,
            question,
            history
        )

        return Response({
            "answer": answer
        })


class MCQGenerationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        topic = request.data.get("topic", "")

        mcqs = generate_mcqs(
            request.user,
            topic
        )

        return Response({"mcqs": mcqs})


from resources.models import PDFResource


# class SubmitMCQView(APIView):

#     permission_classes = [IsAuthenticated]

#     def post(self, request):

#         data = request.data

#         pdf = None

#         if data.get("pdf_name"):
#             pdf = PDFResource.objects.filter(
#                 name__icontains=data["pdf_name"],
#                 user=request.user
#             ).first()

#         attempt = MCQAttempt.objects.create(
#             user=request.user,
#             pdf=pdf,
#             topic=data.get("topic", "general"),
#             question=data["question"],
#             selected=data["selected"],
#             correct=data["correct"],
#             is_correct=(data["selected"] == data["correct"]),
#             explanation=data.get("explanation", "")
#         )

#         return Response({
#             "correct": attempt.is_correct
#         })


from .services.mcq_explainer import explain_mcq


class SubmitMCQView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        data = request.data

        pdf = None

        if data.get("pdf_name"):
            pdf = PDFResource.objects.filter(
                name__icontains=data["pdf_name"],
                user=request.user
            ).first()

        is_correct = (data["selected"] == data["correct"])

        explanation = ""

        #ONLY GENERATE EXPLAINATION IF WRONG IS SELECTED
        if not is_correct:
            explanation = explain_mcq(
                request.user,
                data["question"],
                data["correct"]
            )

        attempt = MCQAttempt.objects.create(
            user=request.user,
            pdf=pdf,
            topic=data.get("topic", "general"),
            question=data["question"],
            selected=data["selected"],
            correct=data["correct"],
            is_correct=is_correct,
            explanation=explanation
        )

        if pdf:
            record_quiz_result(request.user, pdf, is_correct)

        return Response({
            "correct": is_correct,
            "explanation": explanation
        })


from django.db.models import Count


from django.db.models import Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from knowledge.models import MCQAttempt


class MCQHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        attempts = MCQAttempt.objects.filter(
            user=request.user
        ).order_by("-created_at")

        # ---------- ATTEMPTS LIST ----------
        attempts_data = []

        for a in attempts:
            attempts_data.append({
                "question": a.question,
                "selected": a.selected,
                "correct": a.correct,
                "is_correct": a.is_correct,
                "pdf": a.pdf.name if a.pdf else "Unknown",
                "topic": a.topic,
                "explanation": a.explanation,
                "created_at": a.created_at
            })

        # ---------- SUMMARY ----------
        total = attempts.count()
        correct = attempts.filter(is_correct=True).count()
        accuracy = int((correct / total) * 100) if total else 0

        # ---------- WEAK TOPICS ----------
        topic_stats = (
            attempts
            .values("topic")
            .annotate(
                total=Count("id"),
                correct=Count("id", filter=Q(is_correct=True))
            )
        )

        weak_topics = []

        for t in topic_stats:
            topic_accuracy = (t["correct"] / t["total"]) * 100
            if topic_accuracy < 60:
                weak_topics.append({
                    "topic": t["topic"],
                    "accuracy": int(topic_accuracy)
                })

        return Response({
            "summary": {
                "total": total,
                "correct": correct,
                "accuracy": accuracy
            },
            "weak_topics": weak_topics,
            "attempts": attempts_data
        })
