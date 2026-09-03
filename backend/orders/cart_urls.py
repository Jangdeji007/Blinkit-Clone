from django.urls import path

from .views import CartAddView, CartRemoveView, CartView

urlpatterns = [
    path('', CartView.as_view(), name='cart-detail'),
    path('add/', CartAddView.as_view(), name='cart-add'),
    path('remove/<int:item_id>/', CartRemoveView.as_view(), name='cart-remove'),
]
