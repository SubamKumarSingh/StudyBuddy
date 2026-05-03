
    
# # resources/urls.py
# from django.urls import path
# from .views import DrivePDFListView, PDFStreamView, RegisterPDFView, RegisteredPDFListView

# urlpatterns = [
#     path("drive/pdfs/", DrivePDFListView.as_view()),
#     path("pdfs/register/", RegisterPDFView.as_view()),
#     path("pdfs/", RegisteredPDFListView.as_view()),
#     path("pdfs/<int:pdf_id>/stream/", PDFStreamView.as_view())
# ]

from django.urls import path
from .views import (
    NoteDeleteView,
    NoteListCreateView,
    PDFCheckAccessView,
    PDFStreamView,
    DrivePDFListView,
    RegisterPDFView,
    RegisteredPDFListView,
    PDFViewOpened,
    PDFViewClosed,
    UpdatePDFMetadata,
)

urlpatterns = [
    path("drive/pdfs/", DrivePDFListView.as_view()),
    path("pdfs/register/", RegisterPDFView.as_view()),
    path("pdfs/", RegisteredPDFListView.as_view()),
    # path("pdfs/<int:pdf_id>/stream/", PDFStreamView.as_view()),
    path("pdfs/<int:pdf_id>/stream/", PDFStreamView.as_view()),
    path("pdfs/<int:pdf_id>/check/",PDFCheckAccessView.as_view()),
    # Notes views
    path("notes/", NoteListCreateView.as_view()),
    path("notes/<int:pk>/", NoteDeleteView.as_view()),

    # 🧠 AI data collection
    path("pdfs/<int:pdf_id>/open/", PDFViewOpened.as_view()),
    path("pdfs/<int:pdf_id>/close/", PDFViewClosed.as_view()),
    path("pdfs/<int:pdf_id>/meta/", UpdatePDFMetadata.as_view()),
]