from rest_framework import serializers
from .models import Order, OrderItem, DeliveryStatus
from products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'product', 'product_details',
            'quantity', 'unit_price', 'total_price', 'created_at'
        ]
        read_only_fields = ['total_price']

class DeliveryStatusSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    updated_by_username = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = DeliveryStatus
        fields = [
            'id', 'order', 'status', 'status_display', 'location',
            'notes', 'updated_by', 'updated_by_username', 'created_at'
        ]
        read_only_fields = ['updated_by']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    delivery_updates = DeliveryStatusSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    client_username = serializers.CharField(source='client.username', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'client', 'client_username', 'status',
            'status_display', 'total_amount', 'shipping_address',
            'delivery_notes', 'delivery_date', 'created_at',
            'updated_at', 'items', 'delivery_updates'
        ]
        read_only_fields = ['order_number', 'total_amount', 'client']
        extra_kwargs = {
            'shipping_address': {'required': True},
        }

    def validate(self, data):
        # Ensure shipping address is provided
        if not data.get('shipping_address'):
            raise serializers.ValidationError({"shipping_address": "Shipping address is required"})
        return data

    def create(self, validated_data):
        # Generate a unique order number
        # You might want to implement a more sophisticated order number generation
        last_order = Order.objects.order_by('-id').first()
        if last_order:
            last_number = int(last_order.order_number[3:])
            new_number = f"ORD{str(last_number + 1).zfill(6)}"
        else:
            new_number = "ORD000001"
        
        validated_data['order_number'] = new_number
        
        # Set a default total_amount of 0, it will be updated when order items are added
        validated_data['total_amount'] = 0
        
        # Print debug info
        print(f"[DEBUG] Creating order with validated data: {validated_data}")
        
        return super().create(validated_data) 