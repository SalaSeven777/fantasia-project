from rest_framework import serializers
from .models import StockMovement, Supplier, PurchaseOrder, PurchaseOrderItem
from products.serializers import ProductSerializer

class StockMovementSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    movement_type_display = serializers.CharField(source='get_movement_type_display', read_only=True)
    performed_by_username = serializers.CharField(source='performed_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_details', 'movement_type',
            'movement_type_display', 'quantity', 'reference_number',
            'notes', 'performed_by', 'performed_by_username', 'created_at'
        ]
        read_only_fields = ['performed_by']

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = [
            'id', 'name', 'contact_person', 'email', 'phone',
            'address', 'is_active', 'created_at', 'updated_at'
        ]

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = PurchaseOrderItem
        fields = [
            'id', 'purchase_order', 'product', 'product_details',
            'quantity', 'unit_price', 'total_price'
        ]
        read_only_fields = ['total_price']

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    supplier_details = SupplierSerializer(source='supplier', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = PurchaseOrder
        fields = [
            'id', 'supplier', 'supplier_details', 'order_number',
            'status', 'status_display', 'expected_delivery_date',
            'notes', 'created_by', 'created_by_username',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['created_by', 'order_number']

    def create(self, validated_data):
        # Generate a unique purchase order number
        last_po = PurchaseOrder.objects.order_by('-id').first()
        if last_po:
            last_number = int(last_po.order_number[2:])
            new_number = f"PO{str(last_number + 1).zfill(6)}"
        else:
            new_number = "PO000001"
        
        validated_data['order_number'] = new_number
        return super().create(validated_data) 