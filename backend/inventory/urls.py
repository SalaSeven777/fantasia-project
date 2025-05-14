from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'inventory'

router = DefaultRouter()
router.register('stock-movements', views.StockMovementViewSet)
router.register('suppliers', views.SupplierViewSet)
router.register('purchase-orders', views.PurchaseOrderViewSet)
router.register('purchase-order-items', views.PurchaseOrderItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 