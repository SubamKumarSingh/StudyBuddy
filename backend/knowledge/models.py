from django.db import models

# Create your models here.
from resources.models import PDFResource
from studybuddy import settings

class DocumentChunk(models.Model):

    pdf = models.ForeignKey(
        PDFResource,
        on_delete=models.CASCADE,
        related_name="chunks"
    )

    chunk_index = models.IntegerField()

    page_number = models.IntegerField(null=True, blank=True)

    text = models.TextField()

    embedding = models.JSONField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.pdf.name} - chunk {self.chunk_index}"
    
class MCQAttempt(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    pdf = models.ForeignKey(
        PDFResource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    topic = models.CharField(
        max_length=255,
        default="general"
    )

    question = models.TextField()

    selected = models.CharField(max_length=255)

    correct = models.CharField(max_length=255)

    is_correct = models.BooleanField()

    explanation = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.topic} - {self.is_correct}"

