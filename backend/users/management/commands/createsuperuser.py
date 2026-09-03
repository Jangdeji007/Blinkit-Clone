from django.contrib.auth.management.commands.createsuperuser import (
    Command as AuthCreateSuperuserCommand,
)

from users.models import User


class Command(AuthCreateSuperuserCommand):
    help = 'Create a superuser with role=admin for the Blinkit clone admin panel.'

    def save_superuser(self, user, *args, **kwargs):
        user.role = User.Role.ADMIN
        user.is_staff = True
        return super().save_superuser(user, *args, **kwargs)
