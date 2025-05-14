from rest_framework import serializers
from .models import Quote, QuoteItem
from django.utils import timezone

class QuoteItemSerializer(serializers.ModelSerializer):
    """Serializer for retrieving QuoteItem instances"""
    class Meta:
        model = QuoteItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'discount', 'total']
        read_only_fields = ['total']

class QuoteSerializer(serializers.ModelSerializer):
    """Serializer for retrieving Quote instances with related items"""
    items = QuoteItemSerializer(many=True, read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True)
    customer_company = serializers.CharField(source='customer.company_name', read_only=True, allow_null=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Quote
        fields = [
            'id', 'quote_number', 'customer', 'customer_name', 'customer_email', 
            'customer_company', 'date_created', 'valid_until', 'status', 'status_display',
            'subtotal', 'discount', 'tax', 'total', 'notes', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['quote_number', 'total']

class QuoteItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating QuoteItem instances"""
    class Meta:
        model = QuoteItem
        fields = ['product', 'quantity', 'unit_price', 'discount']
    
    def create(self, validated_data):
        # Calculate total based on quantity, unit_price, and discount
        quantity = validated_data.get('quantity')
        unit_price = validated_data.get('unit_price')
        discount = validated_data.get('discount', 0)
        
        total = (quantity * unit_price) - discount
        
        return QuoteItem.objects.create(
            **validated_data,
            total=total,
            product_name=validated_data['product'].name
        )

class QuoteCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating Quote instances with nested items"""
    items = QuoteItemCreateSerializer(many=True)
    
    class Meta:
        model = Quote
        fields = [
            'customer', 'valid_until', 'status', 'subtotal', 
            'discount', 'tax', 'notes', 'items'
        ]
    
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Create the quote with a unique number and calculate the total
        subtotal = validated_data.get('subtotal', 0)
        discount = validated_data.get('discount', 0)
        tax = validated_data.get('tax', 0)
        total = subtotal - discount + tax
        
        quote = Quote.objects.create(
            **validated_data,
            total=total
        )
        
        # Create quote items
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            unit_price = item_data['unit_price']
            discount = item_data.get('discount', 0)
            
            item_total = (quantity * unit_price) - discount
            
            QuoteItem.objects.create(
                quote=quote,
                product=product,
                product_name=product.name,
                quantity=quantity,
                unit_price=unit_price,
                discount=discount,
                total=item_total
            )
        
        return quote
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update the quote fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Recalculate the total
        instance.total = instance.subtotal - instance.discount + instance.tax
        instance.save()
        
        # Update or create items if provided
        if items_data is not None:
            # First, remove existing items
            instance.items.all().delete()
            
            # Create new items
            for item_data in items_data:
                product = item_data['product']
                quantity = item_data['quantity']
                unit_price = item_data['unit_price']
                discount = item_data.get('discount', 0)
                
                item_total = (quantity * unit_price) - discount
                
                QuoteItem.objects.create(
                    quote=instance,
                    product=product,
                    product_name=product.name,
                    quantity=quantity,
                    unit_price=unit_price,
                    discount=discount,
                    total=item_total
                )
        
        return instance 