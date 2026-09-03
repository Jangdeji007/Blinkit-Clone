from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import User


class AuthAPITestCase(APITestCase):
    def test_signup_creates_customer(self):
        response = self.client.post(
            reverse('auth-signup'),
            {
                'username': 'newcustomer',
                'email': 'new@example.com',
                'password': 'securepass123',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], User.Role.CUSTOMER)

    def test_signup_rejects_role_field(self):
        response = self.client.post(
            reverse('auth-signup'),
            {
                'username': 'badrole',
                'email': 'bad@example.com',
                'password': 'securepass123',
                'role': 'admin',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_role_for_admin(self):
        User.objects.create_superuser(
            username='adminuser',
            email='admin@example.com',
            password='adminpass123',
        )
        response = self.client.post(
            reverse('auth-login'),
            {'username': 'adminuser', 'password': 'adminpass123'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], User.Role.ADMIN)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_token_refresh(self):
        User.objects.create_user(
            username='refreshuser',
            email='refresh@example.com',
            password='securepass123',
        )
        login = self.client.post(
            reverse('auth-login'),
            {'username': 'refreshuser', 'password': 'securepass123'},
            format='json',
        )
        response = self.client.post(
            reverse('auth-refresh'),
            {'refresh': login.data['refresh']},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
