import os

from django.conf import settings
from django.http import JsonResponse


def health_check(_request):
    return JsonResponse({
        'status': 'ok',
        'cloudinary_configured': bool(os.environ.get('CLOUDINARY_URL', '').strip()),
        'media_storage': settings.STORAGES['default']['BACKEND'],
    })
