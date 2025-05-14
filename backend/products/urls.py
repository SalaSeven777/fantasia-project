from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'products'

router = DefaultRouter()
router.register('categories', views.CategoryViewSet)
router.register('products', views.ProductViewSet)
router.register('images', views.ProductImageViewSet)
router.register('reviews', views.ProductReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 