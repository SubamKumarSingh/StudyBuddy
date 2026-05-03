from django.core.management.base import BaseCommand
from analytics.services.dataset_builder import build_dataset


class Command(BaseCommand):

    help = "Build ML dataset from study sessions"

    def handle(self, *args, **kwargs):

        file = build_dataset()

        if file:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Dataset generated: {file}"
                )
            )
        else:
            self.stdout.write(
                self.style.WARNING(
                    "No sessions found"
                )
            )