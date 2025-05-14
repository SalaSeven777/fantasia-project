from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'billing'

router = DefaultRouter()
router.register('invoices', views.InvoiceViewSet)
router.register('payments', views.PaymentViewSet)
router.register('credit-notes', views.CreditNoteViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 