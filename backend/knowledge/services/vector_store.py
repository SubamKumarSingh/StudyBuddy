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


def search_chunks_scored(pdf_id, query_embedding, k=5):
    chunks = DocumentChunk.objects.filter(pdf_id=pdf_id)

    results = []

    for chunk in chunks:
        score = cosine_similarity(
            query_embedding,
            chunk.embedding
        )
        results.append((score, chunk))

    results.sort(reverse=True, key=lambda x: x[0])

    return results[:k]


def search_chunks(pdf_id, query_embedding, k=5):
    return [chunk for _score, chunk in search_chunks_scored(pdf_id, query_embedding, k=k)]


def search_all_chunks_scored(query_embedding, k=10, user=None, pdf_ids=None):
    """
    Search across all chunks, optionally scoped to a user and/or a set of PDFs.
    """

    chunks = DocumentChunk.objects.select_related("pdf")

    if user:
        chunks = chunks.filter(pdf__user=user)

    if pdf_ids:
        chunks = chunks.filter(pdf_id__in=pdf_ids)

    results = []

    for chunk in chunks:
        score = cosine_similarity(
            query_embedding,
            chunk.embedding
        )
        results.append((score, chunk))

    results.sort(reverse=True, key=lambda x: x[0])

    return results[:k]


def search_all_chunks(query_embedding, k=10, user=None):
    return [chunk for _score, chunk in search_all_chunks_scored(query_embedding, k=k, user=user)]
