from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from products.models import Product
from users.permissions import IsCustomer

from .models import Cart, CartItem, Order, OrderItem
from .serializers import CartAddSerializer, CartSerializer, OrderSerializer


def get_or_create_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartAddView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request):
        serializer = CartAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product = get_object_or_404(Product, pk=serializer.validated_data['product_id'])
        quantity = serializer.validated_data['quantity']

        if quantity > product.stock:
            return Response(
                {'detail': f'Only {product.stock} units available for {product.name}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart = get_or_create_cart(request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity},
        )

        if not created:
            new_quantity = cart_item.quantity + quantity
            if new_quantity > product.stock:
                return Response(
                    {'detail': f'Only {product.stock} units available for {product.name}.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = new_quantity
            cart_item.save(update_fields=['quantity'])

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartRemoveView(APIView):
    permission_classes = [IsCustomer]

    def delete(self, request, item_id):
        cart = get_or_create_cart(request.user)
        cart_item = get_object_or_404(CartItem, pk=item_id, cart=cart)
        cart_item.delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CheckoutView(APIView):
    permission_classes = [IsCustomer]

    @transaction.atomic
    def post(self, request):
        cart = get_or_create_cart(request.user)
        cart_items = list(
            cart.items.select_related('product').select_for_update().all(),
        )

        if not cart_items:
            return Response(
                {'detail': 'Cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        total_amount = 0
        for item in cart_items:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            if item.quantity > product.stock:
                return Response(
                    {'detail': f'Insufficient stock for {product.name}.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            total_amount += product.price * item.quantity

        order = Order.objects.create(
            user=request.user,
            total_amount=total_amount,
            status=Order.Status.PENDING,
        )

        for item in cart_items:
            product = Product.objects.select_for_update().get(pk=item.product_id)
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item.quantity,
                price_at_purchase=product.price,
            )
            product.stock -= item.quantity
            product.save(update_fields=['stock'])

        cart.items.all().delete()

        order = Order.objects.prefetch_related('items__product').get(pk=order.pk)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderPayView(APIView):
    permission_classes = [IsCustomer]

    def post(self, request, order_id):
        order = get_object_or_404(Order, pk=order_id, user=request.user)

        if order.status == Order.Status.PAID:
            return Response(
                {'detail': 'Order is already paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = Order.Status.PAID
        order.save(update_fields=['status'])

        order = Order.objects.prefetch_related('items__product').get(pk=order.pk)
        return Response(OrderSerializer(order).data)


class OrderListView(APIView):
    permission_classes = [IsCustomer]

    def get(self, request):
        orders = (
            Order.objects.filter(user=request.user)
            .prefetch_related('items__product')
            .order_by('-created_at')
        )
        return Response(OrderSerializer(orders, many=True).data)
