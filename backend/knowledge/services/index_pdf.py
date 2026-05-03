import tempfile
from io import BytesIO

from googleapiclient.http import MediaIoBaseDownload

from resources.services.google_drive import get_drive_service

from .pdf_parser import extract_text_from_pdf
from .chunker import chunk_text
from .embedding_service import generate_embedding

from knowledge.models import DocumentChunk


def index_pdf(pdf):

    service = get_drive_service(pdf.user)

    if service is None:
        return

    request = service.files().get_media(fileId=pdf.drive_file_id)

    fh = BytesIO()
    downloader = MediaIoBaseDownload(fh, request)

    done = False
    while not done:
        _, done = downloader.next_chunk()

    fh.seek(0)

    # Save temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:

        tmp.write(fh.read())
        temp_path = tmp.name

    # Extract text
    pages = extract_text_from_pdf(temp_path)

    for page in pages:

        chunks = chunk_text(page["text"])

        for i, chunk in enumerate(chunks):

            embedding = generate_embedding(chunk)

            DocumentChunk.objects.create(
                pdf=pdf,
                chunk_index=i,
                page_number=page["page"],
                text=chunk,
                embedding=embedding
            )

    