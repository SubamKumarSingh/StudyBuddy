import os

from .embedding_service import generate_embedding
from .vector_store import search_all_chunks, search_chunks

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
        return "AI response unavailable in the current environment. Relevant material was found, but the LLM provider is not configured."
    return "AI response unavailable in the current environment, and no indexed study material matched the request."

def answer_question(question, pdf_id):

    query_embedding = generate_embedding(question)
    chunks = search_chunks(pdf_id, query_embedding)

    context = "\n\n".join([c.text for c in chunks])

    prompt = f"""
You are a strict AI study assistant.

You MUST answer ONLY using the provided study material.

Rules:
- Do NOT use any outside knowledge
- Do NOT generalize

- Quote or closely reference the material when possible

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
        temperature=0.3
    )

    return response.choices[0].message.content

def answer_across_pdfs(user, question):

    # 🔹 Step 1: Embed query
    query_embedding = generate_embedding(question)

    # 🔹 Step 2: Retrieve chunks across PDFs
    chunks = search_all_chunks(
        query_embedding=query_embedding,
        k=10,
        user=user
    )

    # 🔹 Step 3: Deduplicate (important)
    seen = set()
    unique_chunks = []

    for c in chunks:
        key = c.text[:100]
        if key not in seen:
            unique_chunks.append(c)
            seen.add(key)

    # 🔹 Step 4: Build structured context
    context = "\n\n".join([
        f"""
SOURCE: {c.pdf.name}
PAGE: {c.page_number}
CHUNK: {c.chunk_index}

CONTENT:
{c.text}
"""
        for c in unique_chunks
    ])

    # 🔹 Prevent overflow
    context = context[:12000]

    # 🔹 Step 5: Prompt
    prompt = f"""
You are a strict AI study assistant.

You MUST answer ONLY using the provided study material.

Rules:
- Do NOT use outside knowledge
- Do NOT hallucinate
- If answer is not found, say: "Not found in provided material"

- Always mention the SOURCE (PDF name)
- Quote or closely reference content

Study Material:
{context}

Question:
{question}

Give a clear, student-friendly answer.
"""

    # 🔹 Step 6: LLM call
    groq_client = _get_client()
    if not groq_client:
        return _fallback_answer(context)

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content

def tutor_chat(user, question, history=None):
    from ai.services.focus_model import compute_focus_state
    from knowledge.models import MCQAttempt
    from resources.models import PDFResource

    # 🔹 Get user context
    focus = compute_focus_state(user)

    weak_attempt = (
        MCQAttempt.objects
        .filter(user=user, is_correct=False)
        .order_by("-created_at")
        .first()
    )

    weak_topic = weak_attempt.topic if weak_attempt else "general"

    recent_pdf = (
        PDFResource.objects
        .filter(user=user)
        .order_by("-last_viewed_at")
        .first()
    )

    # 🔹 Embed query
    query_embedding = generate_embedding(question)

    # 🔹 Retrieve chunks across PDFs
    chunks = search_all_chunks(
        query_embedding=query_embedding,
        k=8,
        user=user
    )

    context = "\n\n".join([c.text for c in chunks])[:8000]

    # 🔹 Adjust behavior based on focus
    if focus["focus_score"] < 30:
        style = "Keep answers SHORT. Ask questions. Be interactive."
    else:
        style = "Give deeper explanations with examples."

    # 🔹 Chat history
    history_text = ""
    if history:
        history_text = "\n".join([
            f"{m['role']}: {m['content']}" for m in history[-5:]
        ])

    # 🔹 Prompt
    prompt = f"""
You are an AI Tutor helping a student learn.

Student Context:
- Weak topic: {weak_topic}
- Focus score: {focus['focus_score']}
- Recent document: {recent_pdf.name if recent_pdf else "None"}

Style Rules:
{style}

Behavior Rules:
- Ask follow-up questions
- Be interactive
- Guide learning step-by-step
- Use study material only when needed

Conversation History:
{history_text}

Study Material:
{context}

Student Question:
{question}

Respond like a tutor, not a textbook.
"""

    groq_client = _get_client()
    if not groq_client:
        return _fallback_answer(context)

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4
    )

    return response.choices[0].message.content
