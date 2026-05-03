import os

from knowledge.services.embedding_service import generate_embedding
from knowledge.services.vector_store import search_all_chunks

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


def explain_mcq(user, question, correct_answer):

    # Embed question
    query_embedding = generate_embedding(question)

    # Retrieve relevant chunks
    # chunks = search_all_chunks(user, query_embedding, k=5)
    chunks = search_all_chunks(
    query_embedding,
    k=5,
    user=user
)

    context = "\n\n".join([
        f"[{c.pdf.name} | Page {c.page_number}] {c.text}"
        for c in chunks
    ])

    # Build prompt
    prompt = f"""
You are an AI tutor.

A student answered a question incorrectly.

Question:
{question}

Correct Answer:
{correct_answer}

Use the study material below to explain:
- why the correct answer is correct
- why other options are wrong (if possible)
- keep it clear and student-friendly

Study Material:
{context}
"""

    groq_client = _get_client()
    if not groq_client:
        return "Explanation unavailable because the LLM provider is not configured in this environment."

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    return response.choices[0].message.content
