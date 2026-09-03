from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from products.models import Category, Product
from users.models import User


class ProductAPITestCase(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name='Dairy')
        self.product = Product.objects.create(
            name='Milk',
            description='Fresh milk',
            price=Decimal('50.00'),
            stock=10,
            category=self.category,
        )
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@test.com',
            password='adminpass123',
        )

    def _auth_header(self, user):
        token = RefreshToken.for_user(user).access_token
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_public_can_list_products(self):
        response = self.client.get(reverse('product-list-create'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_can_create_product(self):
        response = self.client.post(
            reverse('product-list-create'),
            {
                'name': 'Bread',
                'description': 'Whole wheat',
                'price': '40.00',
                'stock': 5,
                'category': self.category.id,
            },
            format='json',
            **self._auth_header(self.admin),
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_search_filter(self):
        response = self.client.get(reverse('product-list-create'), {'search': 'milk'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class OrderFlowTestCase(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            username='customer',
            email='customer@test.com',
            password='securepass123',
        )
        self.product = Product.objects.create(
            name='Eggs',
            price=Decimal('60.00'),
            stock=5,
        )

    def _auth_header(self, user):
        token = RefreshToken.for_user(user).access_token
        return {'HTTP_AUTHORIZATION': f'Bearer {token}'}

    def test_cart_checkout_and_pay_flow(self):
        auth = self._auth_header(self.customer)

        add_response = self.client.post(
            reverse('cart-add'),
            {'product_id': self.product.id, 'quantity': 2},
            format='json',
            **auth,
        )
        self.assertEqual(add_response.status_code, status.HTTP_200_OK)

        checkout_response = self.client.post(reverse('order-checkout'), **auth)
        self.assertEqual(checkout_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(checkout_response.data['status'], 'pending')
        order_id = checkout_response.data['id']

        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

        pay_response = self.client.post(reverse('order-pay', args=[order_id]), **auth)
        self.assertEqual(pay_response.status_code, status.HTTP_200_OK)
        self.assertEqual(pay_response.data['status'], 'paid')

        orders_response = self.client.get(reverse('order-list'), **auth)
        self.assertEqual(orders_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(orders_response.data), 1)
