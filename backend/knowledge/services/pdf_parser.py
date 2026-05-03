def extract_text_from_pdf(file_path):
    try:
        import fitz
    except Exception:
        return []

    doc = fitz.open(file_path)

    pages = []

    for page_num, page in enumerate(doc):

        text = page.get_text()

        pages.append({
            "page": page_num + 1,
            "text": text
        })

    return pages
