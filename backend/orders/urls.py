from django.urls import path

from .views import CheckoutView, OrderListView, OrderPayView

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('<int:order_id>/pay/', OrderPayView.as_view(), name='order-pay'),
    path('', OrderListView.as_view(), name='order-list'),
]
