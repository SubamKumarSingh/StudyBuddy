from knowledge.models import DocumentChunk


def cosine_similarity(a, b):
    if not a or not b:
        return 0

    paired = list(zip(a, b))
    dot = sum(x * y for x, y in paired)
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for _, y in paired) ** 0.5

    if norm_a == 0 or norm_b == 0:
        return 0

    return dot / (norm_a * norm_b)


def search_chunks(pdf_id, query_embedding, k=5):

    chunks = DocumentChunk.objects.filter(pdf_id=pdf_id)

    results = []

    for chunk in chunks:

        score = cosine_similarity(
            query_embedding,
            chunk.embedding
        )

        results.append((score, chunk))

    results.sort(reverse=True, key=lambda x: x[0])

    return [c[1] for c in results[:k]]

def search_all_chunks(query_embedding, k=10, user=None):
    """
    Search across ALL chunks (optionally user-specific)
    """

    # 🔹 Filter base queryset
    chunks = DocumentChunk.objects.select_related("pdf")

    if user:
        chunks = chunks.filter(pdf__user=user)

    results = []

    for chunk in chunks:
        score = cosine_similarity(
            query_embedding,
            chunk.embedding
        )

        results.append((score, chunk))

    # 🔹 Sort by similarity
    results.sort(reverse=True, key=lambda x: x[0])

    # 🔹 Return top-k chunks
    return [c[1] for c in results[:k]]
