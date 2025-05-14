from django.contrib import admin
from .models import Order, OrderItem, DeliveryStatus

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['total_price']

class DeliveryStatusInline(admin.TabularInline):
    model = DeliveryStatus
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'client', 'status', 'total_amount', 'delivery_date', 'created_at']
    list_filter = ['status', 'delivery_date', 'created_at']
    search_fields = ['order_number', 'client__username', 'shipping_address']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [OrderItemInline, DeliveryStatusInline]
    fieldsets = (
        (None, {
            'fields': ('order_number', 'client', 'status')
        }),
        ('Delivery Information', {
            'fields': ('shipping_address', 'delivery_notes', 'delivery_date')
        }),
        ('Financial Details', {
            'fields': ('total_amount',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'quantity', 'unit_price', 'total_price']
    list_filter = ['created_at']
    search_fields = ['order__order_number', 'product__name']
    readonly_fields = ['total_price', 'created_at']

@admin.register(DeliveryStatus)
class DeliveryStatusAdmin(admin.ModelAdmin):
    list_display = ['order', 'status', 'location', 'updated_by', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['order__order_number', 'location', 'notes']
    readonly_fields = ['created_at']
