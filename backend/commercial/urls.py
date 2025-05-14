from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteViewSet, QuoteItemViewSet, commercial_dashboard_stats

router = DefaultRouter()
router.register(r'quotes', QuoteViewSet)
router.register(r'quote-items', QuoteItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/stats/', commercial_dashboard_stats, name='commercial-dashboard-stats'),
] 