from io import BytesIO
from django.utils import timezone
from django.http import StreamingHttpResponse

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from googleapiclient.http import MediaIoBaseDownload
from googleapiclient.errors import HttpError

from .models import PDFResource, ResourceInteraction
from .services.google_drive import get_drive_service

from knowledge.services.index_pdf import index_pdf
from tracking.services.review_scheduler import record_study_session


def _validate_drive_access(pdf):
    service = get_drive_service(pdf.user)

    if service is None:
        return None, Response(
            {"error": "GOOGLE_DRIVE_NOT_CONNECTED"},
            status=401
        )

    try:
        service.files().get(
            fileId=pdf.drive_file_id,
            fields="id"
        ).execute()
    except HttpError as e:
        if getattr(e.resp, "status", None) in (401, 403):
            return None, Response(
                {"error": "GOOGLE_DRIVE_SESSION_EXPIRED"},
                status=401
            )

        return None, Response(
            {"error": "FAILED_TO_FETCH_FILE"},
            status=500
        )

    return service, None

class PDFStreamView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pdf_id):
        try:
            pdf = PDFResource.objects.get(id=pdf_id, user=request.user)
        except PDFResource.DoesNotExist:
            return Response({"error": "PDF not found"}, status=404)

        service, error_response = _validate_drive_access(pdf)
        if error_response:
            return error_response

        try:
            request_drive = service.files().get_media(
                fileId=pdf.drive_file_id
            )

            fh = BytesIO()
            downloader = MediaIoBaseDownload(fh, request_drive)

            done = False
            while not done:
                _, done = downloader.next_chunk()

            fh.seek(0)

            response = StreamingHttpResponse(
                fh,
                content_type="application/pdf"
            )

            response["Content-Disposition"] = (
                f'inline; filename="{pdf.name}"'
            )

            return response
        except HttpError as e:
            if getattr(e.resp, "status", None) in (401, 403):
                return Response(
                    {"error": "GOOGLE_DRIVE_SESSION_EXPIRED"},
                    status=401
                )
            return Response(
                {"error": "FAILED_TO_FETCH_FILE"},
                status=500
            )

from rest_framework.permissions import IsAuthenticated

# class PDFStreamView(APIView):
#     permission_classes = []

#     def get(self, request, pdf_id):
#         try:
#             pdf = PDFResource.objects.get(
#                 id=pdf_id,
#                 user=request.user
#             )
#         except PDFResource.DoesNotExist:
#             return Response({"error": "PDF not found"}, status=404)

#         service = get_drive_service(request.user)

#         if service is None:
#             return Response(
#                 {"error": "GOOGLE_DRIVE_NOT_CONNECTED"},
#                 status=401
#             )

#         try:
#             request_drive = service.files().get_media(
#                 fileId=pdf.drive_file_id
#             )

#             fh = BytesIO()
#             downloader = MediaIoBaseDownload(fh, request_drive)

#             done = False
#             while not done:
#                 _, done = downloader.next_chunk()

#             fh.seek(0)

#             response = StreamingHttpResponse(
#                 fh,
#                 content_type="application/pdf"
#             )

#             response["Content-Disposition"] = (
#                 f'inline; filename="{pdf.name}"'
#             )

#             return response

#         except HttpError as e:
#             if e.resp.status == 401:
#                 return Response(
#                     {"error": "GOOGLE_DRIVE_SESSION_EXPIRED"},
#                     status=401
#                 )

#             return Response(
#                 {"error": "FAILED_TO_FETCH_FILE"},
#                 status=500
#             )

class PDFCheckAccessView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pdf_id):
        try:
            pdf = PDFResource.objects.get(id=pdf_id, user=request.user)
        except PDFResource.DoesNotExist:
            return Response({"error": "PDF not found"}, status=404)

        _, error_response = _validate_drive_access(pdf)
        if error_response:
            return error_response

        return Response({"status": "ok"})


class DrivePDFListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        service = get_drive_service(request.user)

        if service is None:
            return Response(
                {"error": "Google Drive not connected"},
                status=403
            )

        try:
            result = service.files().list(
                q="mimeType='application/pdf'",
                fields="files(id, name, mimeType)"
            ).execute()
        except HttpError as e:
            if e.resp.status == 401:
                return Response(
                    {"error": "Google Drive session expired. Please reconnect."},
                    status=403
                )
            raise

        return Response(result.get("files", []))

class RegisterPDFView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = request.data

        pdf,created = PDFResource.objects.get_or_create(
            user=request.user,
            drive_file_id=data["id"],
            defaults={
                "name": data["name"],
                "mime_type": data["mimeType"],
            }
        )
        # if created:
        index_pdf(pdf=pdf)

        return Response({"status": "registered"})

class RegisteredPDFListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pdfs = PDFResource.objects.filter(
            user=request.user
        ).order_by("-created_at")

        return Response([
            {
                "id": pdf.id,
                "name": pdf.display_title(),
                "view_count": pdf.view_count,
                "last_viewed_at": pdf.last_viewed_at,
                "total_view_time": pdf.total_view_time,
                "tags": pdf.tags,
                "created_at": pdf.created_at,
            }
            for pdf in pdfs
        ])

class PDFViewOpened(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pdf_id):
        pdf = PDFResource.objects.get(id=pdf_id, user=request.user)

        pdf.view_count += 1
        pdf.last_viewed_at = timezone.now()
        pdf.save(update_fields=["view_count", "last_viewed_at"])

        ResourceInteraction.objects.create(
            user=request.user,
            pdf=pdf,
            event_type="view_opened"
        )

        return Response({"status": "view_opened"})

class PDFViewClosed(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pdf_id):
        duration = int(request.data.get("duration", 0))

        pdf = PDFResource.objects.get(id=pdf_id, user=request.user)
        pdf.total_view_time += duration
        pdf.save(update_fields=["total_view_time"])

        ResourceInteraction.objects.create(
            user=request.user,
            pdf=pdf,
            event_type="view_closed",
            duration=duration
        )

        record_study_session(request.user, pdf, duration)

        return Response({"status": "view_closed"})

class UpdatePDFMetadata(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pdf_id):
        pdf = PDFResource.objects.get(id=pdf_id, user=request.user)

        pdf.title_override = request.data.get(
            "title_override", pdf.title_override
        )
        pdf.notes = request.data.get("notes", pdf.notes)
        pdf.tags = request.data.get("tags", pdf.tags)
        pdf.save()

        ResourceInteraction.objects.create(
            user=request.user,
            pdf=pdf,
            event_type="metadata_updated"
        )

        return Response({"status": "updated"})



# views.py

from rest_framework import generics, permissions
from .models import Note
from .serializers import NoteSerializer


class NoteListCreateView(generics.ListCreateAPIView):

    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NoteDeleteView(generics.DestroyAPIView):

    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(user=self.request.user)
