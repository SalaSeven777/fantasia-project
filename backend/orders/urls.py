from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'orders'

router = DefaultRouter()
router.register('orders', views.OrderViewSet)
router.register('items', views.OrderItemViewSet)
router.register('delivery-status', views.DeliveryStatusViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('routes/', views.get_delivery_routes, name='delivery-routes'),
    path('routes/<int:pk>/', views.get_delivery_route_detail, name='delivery-route-detail'),
    path('delivery-metrics/', views.get_delivery_metrics, name='delivery-metrics'),
    path('delivery-summary/', views.get_delivery_summary, name='delivery-summary'),
] 