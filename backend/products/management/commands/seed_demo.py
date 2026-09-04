from decimal import Decimal

from django.core.management.base import BaseCommand

from products.models import Category, Product
from users.models import User

CATEGORIES = [
    'Dairy',
    'Snacks',
    'Beverages',
    'Fruits',
    'Vegetables',
    'Bakery',
    'Personal Care',
    'Household',
]

PRODUCTS = [
    {
        'name': 'Amul Taaza Milk 1L',
        'description': 'Homogenised toned milk, rich in calcium and protein.',
        'price': Decimal('62.00'),
        'stock': 50,
        'category': 'Dairy',
    },
    {
        'name': 'Britannia Good Day Cookies',
        'description': 'Butter cookies with a crisp, melt-in-mouth texture.',
        'price': Decimal('35.00'),
        'stock': 80,
        'category': 'Snacks',
    },
    {
        'name': 'Coca-Cola 750ml',
        'description': 'Chilled soft drink bottle.',
        'price': Decimal('40.00'),
        'stock': 100,
        'category': 'Beverages',
    },
    {
        'name': 'Banana (1 dozen)',
        'description': 'Fresh ripe bananas, perfect for smoothies and snacking.',
        'price': Decimal('48.00'),
        'stock': 30,
        'category': 'Fruits',
    },
    {
        'name': 'Onion 1kg',
        'description': 'Fresh red onions for everyday cooking.',
        'price': Decimal('32.00'),
        'stock': 60,
        'category': 'Vegetables',
    },
    {
        'name': 'Modern Bread 400g',
        'description': 'Soft white sandwich bread, freshly baked.',
        'price': Decimal('45.00'),
        'stock': 40,
        'category': 'Bakery',
    },
    {
        'name': 'Amul Butter 100g',
        'description': 'Utterly butterly delicious table butter.',
        'price': Decimal('58.00'),
        'stock': 45,
        'category': 'Dairy',
    },
    {
        'name': 'Lay\'s Classic Salted 52g',
        'description': 'Crispy potato chips with classic salted flavour.',
        'price': Decimal('20.00'),
        'stock': 120,
        'category': 'Snacks',
    },
    {
        'name': 'Real Fruit Power Orange 1L',
        'description': 'Ready-to-serve fruit beverage with no added preservatives.',
        'price': Decimal('110.00'),
        'stock': 25,
        'category': 'Beverages',
    },
    {
        'name': 'Surf Excel Easy Wash 1kg',
        'description': 'Detergent powder for tough stain removal.',
        'price': Decimal('125.00'),
        'stock': 35,
        'category': 'Household',
    },
]


DEMO_ADMIN = {
    'username': 'admin',
    'password': 'Admin@123',
    'email': 'admin@demo.com',
}

DEMO_CUSTOMER = {
    'username': 'Customer',
    'password': 'Customer@123',
    'email': 'customer@demo.com',
}


class Command(BaseCommand):
    help = 'Seed demo categories, products, and login accounts for local development and demos.'

    def _seed_demo_users(self):
        admin, admin_created = User.objects.get_or_create(
            username=DEMO_ADMIN['username'],
            defaults={
                'email': DEMO_ADMIN['email'],
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        if not admin_created:
            admin.role = User.Role.ADMIN
            admin.is_staff = True
            admin.is_superuser = True
            admin.email = DEMO_ADMIN['email']
        admin.set_password(DEMO_ADMIN['password'])
        admin.save()

        customer, customer_created = User.objects.get_or_create(
            username=DEMO_CUSTOMER['username'],
            defaults={
                'email': DEMO_CUSTOMER['email'],
                'role': User.Role.CUSTOMER,
            },
        )
        if not customer_created:
            customer.role = User.Role.CUSTOMER
            customer.email = DEMO_CUSTOMER['email']
        customer.set_password(DEMO_CUSTOMER['password'])
        customer.save()

        return admin_created, customer_created

    def handle(self, *args, **options):
        categories_created = 0
        category_map = {}

        for name in CATEGORIES:
            category, created = Category.objects.get_or_create(name=name)
            category_map[name] = category
            if created:
                categories_created += 1

        products_created = 0
        for item in PRODUCTS:
            category = category_map[item['category']]
            _, created = Product.objects.get_or_create(
                name=item['name'],
                defaults={
                    'description': item['description'],
                    'price': item['price'],
                    'stock': item['stock'],
                    'category': category,
                },
            )
            if created:
                products_created += 1

        admin_created, customer_created = self._seed_demo_users()

        if (
            categories_created == 0
            and products_created == 0
            and not admin_created
            and not customer_created
        ):
            self.stdout.write(self.style.WARNING('Demo data already exists, skipped.'))
        else:
            self.stdout.write(
                self.style.SUCCESS(
                    f'Created {categories_created} categories, {products_created} products, '
                    f'{int(admin_created)} admin, {int(customer_created)} customer.',
                ),
            )
            self.stdout.write(
                self.style.SUCCESS(
                    'Demo login — admin / Admin@123  |  Customer / Customer@123',
                ),
            )
