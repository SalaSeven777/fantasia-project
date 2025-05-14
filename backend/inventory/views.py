from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import StockMovement, Supplier, PurchaseOrder, PurchaseOrderItem
from .serializers import (
    StockMovementSerializer, SupplierSerializer,
    PurchaseOrderSerializer, PurchaseOrderItemSerializer
)

# Create your views here.

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['product', 'movement_type']
    ordering_fields = ['created_at']

    def perform_create(self, serializer):
        serializer.save(performed_by=self.request.user)

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'contact_person', 'email']
    ordering_fields = ['name', 'created_at']

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all()
    serializer_class = PurchaseOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['supplier', 'status']
    search_fields = ['order_number', 'notes']
    ordering_fields = ['created_at', 'expected_delivery_date']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        purchase_order = self.get_object()
        serializer = PurchaseOrderItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(purchase_order=purchase_order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        purchase_order = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(PurchaseOrder.Status.choices):
            return Response(
                {'status': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        purchase_order.status = new_status
        purchase_order.save()
        serializer = self.get_serializer(purchase_order)
        return Response(serializer.data)

class PurchaseOrderItemViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['purchase_order', 'product']
