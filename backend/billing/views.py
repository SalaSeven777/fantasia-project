from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Invoice, Payment, CreditNote
from .serializers import InvoiceSerializer, PaymentSerializer, CreditNoteSerializer

# Create your views here.

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'client', 'order']
    search_fields = ['invoice_number', 'notes']
    ordering_fields = ['issue_date', 'due_date', 'created_at', 'total_amount']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Invoice.objects.all()
        return Invoice.objects.filter(client=user)

    @action(detail=True, methods=['post'])
    def add_payment(self, request, pk=None):
        invoice = self.get_object()
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(invoice=invoice, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_credit_note(self, request, pk=None):
        invoice = self.get_object()
        serializer = CreditNoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(invoice=invoice, created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['invoice', 'payment_method', 'payment_date']
    ordering_fields = ['payment_date', 'amount', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(invoice__client=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CreditNoteViewSet(viewsets.ModelViewSet):
    queryset = CreditNote.objects.all()
    serializer_class = CreditNoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['invoice', 'issue_date']
    search_fields = ['credit_note_number', 'reason']
    ordering_fields = ['issue_date', 'amount', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CreditNote.objects.all()
        return CreditNote.objects.filter(invoice__client=user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
