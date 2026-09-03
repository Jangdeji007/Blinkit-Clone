from django.urls import path

from .views import LoginView, RefreshTokenView, SignupView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='auth-signup'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('refresh/', RefreshTokenView.as_view(), name='auth-refresh'),
]
