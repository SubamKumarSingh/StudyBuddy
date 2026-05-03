import os
import json
import re

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


# ==============================
# 🔧 SAFE JSON PARSER
# ==============================
def safe_parse_json(content):
    if not content:
        return None

    # Remove markdown fences
    content = content.strip()
    content = re.sub(r"```json|```", "", content)

    # Try direct parse
    try:
        return json.loads(content)
    except:
        pass

    # Extract JSON block if extra text exists
    match = re.search(r"\{.*\}", content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except:
            pass

    return None


# ==============================
# 🎯 MAIN MCQ GENERATOR
# ==============================
def generate_mcqs(user, topic, num_questions=5):

    # 🔹 Step 1: Generate embedding
    embedding = generate_embedding(topic)

    # 🔹 Step 2: Retrieve relevant chunks
    chunks = search_all_chunks(
        query_embedding=embedding,
        k=10,
        user=user
    )

    if not chunks:
        print("⚠️ No chunks found")
        return []

    # 🔹 Step 3: Deduplicate chunks
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

    # 🔹 Prevent token overflow
    MAX_CONTEXT_CHARS = 12000
    context = context[:MAX_CONTEXT_CHARS]

    # 🔹 Step 5: Prompt (STRICT for Llama)
    prompt = f"""
You are an expert exam setter.

Generate {num_questions} high-quality MCQs.

IMPORTANT RULES:
- Return ONLY valid JSON
- Do NOT include any text before or after JSON
- Do NOT use markdown (no ```)

- Each question must test understanding, not memorization
- Avoid duplicate or very similar questions

Format EXACTLY like this:

{{
  "questions": [
    {{
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "answer": "A",
      "explanation": "string",
      "pdf": "filename.pdf"
    }}
  ]
}}

CONTENT:
{context}
"""

    # 🔹 Step 6: Call Groq
    groq_client = _get_client()
    if not groq_client:
        return []

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
    except Exception as e:
        print("Groq API error:", str(e))
        return []

    # 🔹 Step 7: Extract response
    if not response.choices:
        print("No response choices")
        return []

    content = response.choices[0].message.content

    if not content:
        print("Empty LLM response")
        return []

    print("RAW LLM OUTPUT:\n", content[:1000])

    # 🔹 Step 8: Safe JSON parsing
    data = safe_parse_json(content)

    if not data:
        print("JSON parsing failed")
        print(content)
        return []

    # 🔹 Step 9: Validate structure
    questions = data.get("questions", [])

    if not isinstance(questions, list):
        print("Invalid format: questions is not a list")
        return []

    # 🔹 Step 10: Clean output
    cleaned_questions = []

    for q in questions:
        if (
            isinstance(q, dict)
            and "question" in q
            and "options" in q
            and "answer" in q
        ):
            cleaned_questions.append(q)

    return cleaned_questions
