import os
from collections import Counter

from django.utils import timezone

from ai.models import StudyPlan
from ai.services.focus_model import compute_focus_state
from ai.services.pedagogy import pedagogical_engine
from ai.services.target_service import get_active_target
from knowledge.models import MCQAttempt
from resources.models import PDFResource
from tracking.models import ReviewItem

from .embedding_service import generate_embedding
from .vector_store import (
    search_all_chunks_scored,
    search_chunks_scored,
)

client = None


def _get_client():
    global client
    if client is not None:
        return client

    try:
        from groq import Groq
    except Exception:
        client = False
        return client

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        client = False
        return client

    client = Groq(api_key=api_key)
    return client


def _fallback_answer(context):
    if context:
        return (
            "AI response unavailable in the current environment. Relevant material "
            "was found, but the LLM provider is not configured."
        )
    return (
        "AI response unavailable in the current environment, and no indexed study "
        "material matched the request."
    )


def _serialize_history(history, limit=8):
    if not history:
        return "No prior conversation."

    lines = []

    for message in history[-limit:]:
        role = (message.get("role") or "user").upper()
        content = (message.get("content") or "").strip()
        if content:
            lines.append(f"{role}: {content}")

    return "\n".join(lines) if lines else "No prior conversation."


def _select_diverse_chunks(scored_chunks, max_chunks=8, max_per_pdf=2):
    selected = []
    seen_text = set()
    per_pdf_counts = Counter()

    for score, chunk in scored_chunks:
        normalized_text = " ".join((chunk.text or "").split())[:180]
        if not normalized_text or normalized_text in seen_text:
            continue

        if per_pdf_counts[chunk.pdf_id] >= max_per_pdf:
            continue

        selected.append((score, chunk))
        seen_text.add(normalized_text)
        per_pdf_counts[chunk.pdf_id] += 1

        if len(selected) >= max_chunks:
            break

    return selected


def _format_chunk_context(scored_chunks):
    if not scored_chunks:
        return "No indexed study material matched the request."

    sections = []

    for index, (score, chunk) in enumerate(scored_chunks, start=1):
        sections.append(
            "\n".join(
                [
                    f"[Source {index}]",
                    f"PDF: {chunk.pdf.display_title()}",
                    f"Page: {chunk.page_number or 'Unknown'}",
                    f"Relevance: {score:.3f}",
                    "Excerpt:",
                    (chunk.text or "").strip(),
                ]
            )
        )

    return "\n\n".join(sections)


def _format_source_list(scored_chunks):
    if not scored_chunks:
        return "No sources retrieved."

    lines = []
    seen = set()

    for score, chunk in scored_chunks:
        key = (chunk.pdf_id, chunk.page_number)
        if key in seen:
            continue
        seen.add(key)
        lines.append(
            f"- {chunk.pdf.display_title()} (page {chunk.page_number or 'Unknown'}, relevance {score:.2f})"
        )

    return "\n".join(lines)


def _get_recent_pdfs(user, limit=3):
    return list(
        PDFResource.objects.filter(user=user)
        .order_by("-last_viewed_at", "-created_at")[:limit]
    )


def _get_due_reviews(user):
    return list(
        ReviewItem.objects.filter(
            user=user,
            next_review_at__lte=timezone.now(),
        )
        .select_related("pdf")
        .order_by("next_review_at")[:3]
    )


def _get_weak_topics(user, limit=3):
    attempts = (
        MCQAttempt.objects.filter(user=user, is_correct=False)
        .exclude(topic__isnull=True)
        .exclude(topic__exact="")
        .order_by("-created_at")[:20]
    )

    counts = Counter(attempt.topic for attempt in attempts if attempt.topic)
    return [topic for topic, _count in counts.most_common(limit)]


def _get_active_plan(user):
    return (
        StudyPlan.objects.filter(user=user, status="ACTIVE")
        .prefetch_related("items__pdf")
        .order_by("-target_date", "-updated_at")
        .first()
    )


def _build_study_snapshot(user):
    focus = compute_focus_state(user)
    target = get_active_target(user)
    plan = _get_active_plan(user)
    recent_pdfs = _get_recent_pdfs(user)
    weak_topics = _get_weak_topics(user)
    due_reviews = _get_due_reviews(user)

    try:
        strategy = pedagogical_engine(user)
    except Exception:
        strategy = {}

    plan_lines = []
    if plan:
        for item in plan.items.all()[:3]:
            pdf_title = item.pdf.display_title() if item.pdf else "No PDF"
            plan_lines.append(
                f"- {item.title} ({item.task_type}, {item.status}, {item.estimated_minutes} min, pdf: {pdf_title})"
            )

    recent_lines = []
    for pdf in recent_pdfs:
        recent_lines.append(
            f"- {pdf.display_title()} | views: {pdf.view_count} | last viewed: {pdf.last_viewed_at or 'never'}"
        )

    review_lines = []
    for item in due_reviews:
        review_lines.append(
            f"- {item.pdf.display_title()} | review count: {item.review_count} | next review: {item.next_review_at}"
        )

    target_summary = "No active target."
    if target:
        target_summary = (
            f"{target.title} | subject: {target.subject or 'general'} | "
            f"progress: {round(target.progress_percent, 1)}% | "
            f"recommended: {target.recommended_minutes_per_day} min/day"
        )

    strategy_summary = "No current strategy recommendation."
    if strategy and strategy.get("strategy"):
        strategy_summary = (
            f"{strategy['strategy']} on "
            f"{strategy.get('pdf_title') or 'the top-priority material'}"
        )

    return {
        "focus_score": focus.get("focus_score", 0),
        "recent_pdfs": recent_pdfs,
        "due_reviews": due_reviews,
        "strategy": strategy,
        "summary_text": "\n".join(
            [
                f"Focus score: {focus.get('focus_score', 0)}",
                f"Focus explanation: {focus.get('explanation', 'No recent focus summary.')}",
                f"Active target: {target_summary}",
                f"Recommended strategy: {strategy_summary}",
                "Recent PDFs:",
                "\n".join(recent_lines) if recent_lines else "- None",
                "Weak topics:",
                "\n".join(f"- {topic}" for topic in weak_topics) if weak_topics else "- None",
                "Due reviews:",
                "\n".join(review_lines) if review_lines else "- None",
                "Current plan:",
                "\n".join(plan_lines) if plan_lines else "- No active plan items",
            ]
        ),
    }


def _get_priority_pdf_ids(snapshot):
    pdf_ids = []

    strategy_pdf_id = snapshot.get("strategy", {}).get("pdf_id")
    if strategy_pdf_id:
        pdf_ids.append(strategy_pdf_id)

    for pdf in snapshot.get("recent_pdfs", []):
        pdf_ids.append(pdf.id)

    for review in snapshot.get("due_reviews", []):
        pdf_ids.append(review.pdf_id)

    deduped = []
    seen = set()

    for pdf_id in pdf_ids:
        if pdf_id in seen:
            continue
        seen.add(pdf_id)
        deduped.append(pdf_id)

    return deduped


def answer_question(question, pdf_id):
    query_embedding = generate_embedding(question)
    scored_chunks = _select_diverse_chunks(
        search_chunks_scored(pdf_id, query_embedding, k=8),
        max_chunks=5,
        max_per_pdf=5,
    )

    context = _format_chunk_context(scored_chunks)

    prompt = f"""
You are a strict AI study assistant.

You must answer only from the provided study material.

Rules:
- Do not use outside knowledge.
- If the answer is not supported by the material, say so clearly.
- Quote or closely reference the material when possible.

Study Material:
{context}

Question:
{question}

Explain clearly for a student.
"""

    groq_client = _get_client()
    if not groq_client:
        return _fallback_answer(context)

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    answer = response.choices[0].message.content
    source_list = _format_source_list(scored_chunks)

    if scored_chunks and "Sources used" not in answer:
        answer = f"{answer.rstrip()}\n\nSources used:\n{source_list}"

    return answer


def answer_across_pdfs(user, question):
    query_embedding = generate_embedding(question)
    scored_chunks = _select_diverse_chunks(
        search_all_chunks_scored(
            query_embedding=query_embedding,
            k=14,
            user=user,
        ),
        max_chunks=8,
        max_per_pdf=3,
    )

    context = _format_chunk_context(scored_chunks)[:12000]
    source_list = _format_source_list(scored_chunks)

    prompt = f"""
You are a strict AI study assistant.

You must answer only using the provided study material.

Rules:
- Do not use outside knowledge.
- Do not hallucinate.
- If the answer is not found, say: "Not found in provided material."
- Mention the source PDF when you use it.

Study Material:
{context}

Question:
{question}

Give a clear, student-friendly answer.
End with a short "Sources used" section only if material was found.
"""

    groq_client = _get_client()
    if not groq_client:
        return _fallback_answer(context)

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    answer = response.choices[0].message.content

    if scored_chunks and "Sources used" not in answer:
        answer = f"{answer.rstrip()}\n\nSources used:\n{source_list}"

    return answer


def tutor_chat(user, question, history=None):
    snapshot = _build_study_snapshot(user)
    query_embedding = generate_embedding(question)

    priority_pdf_ids = _get_priority_pdf_ids(snapshot)
    scored_chunks = []

    if priority_pdf_ids:
        scored_chunks.extend(
            search_all_chunks_scored(
                query_embedding=query_embedding,
                k=10,
                user=user,
                pdf_ids=priority_pdf_ids,
            )
        )

    scored_chunks.extend(
        search_all_chunks_scored(
            query_embedding=query_embedding,
            k=14,
            user=user,
        )
    )

    scored_chunks = _select_diverse_chunks(
        scored_chunks,
        max_chunks=8,
        max_per_pdf=2,
    )

    context = _format_chunk_context(scored_chunks)[:10000]
    source_list = _format_source_list(scored_chunks)

    if snapshot["focus_score"] < 30:
        style = "Keep answers short, concrete, and calm. Prefer one step at a time."
    else:
        style = "Give fuller explanations with examples, but stay grounded in the student's materials."

    history_text = _serialize_history(history)

    prompt = f"""
You are an AI tutor helping a student learn.

Student context:
{snapshot['summary_text']}

Style rules:
{style}

Behavior rules:
- Answer the student's actual question first.
- Use the student context to personalize the answer.
- When study material is relevant, rely on it and name the document.
- If the question is ambiguous, make a reasonable inference and state it briefly.
- Avoid generic filler.
- Ask at most one follow-up question, and only if it helps the next step.
- If the retrieved evidence is weak or missing, say that clearly instead of pretending.

Conversation history:
{history_text}

Study material:
{context}

Student question:
{question}

Respond like a thoughtful tutor, not a textbook.
Preferred structure:
1. Direct answer
2. Why this matters for the student's current study situation
3. One next step
If study material was used, end with a short "Sources used" section.
"""

    groq_client = _get_client()
    if not groq_client:
        return _fallback_answer(context)

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.35,
    )

    answer = response.choices[0].message.content

    if scored_chunks and "Sources used" not in answer:
        answer = f"{answer.rstrip()}\n\nSources used:\n{source_list}"

    return answer
