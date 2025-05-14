from django.contrib import admin
from .models import StockMovement, Supplier, PurchaseOrder, PurchaseOrderItem

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ['product', 'movement_type', 'quantity', 'reference_number', 'performed_by', 'created_at']
    list_filter = ['movement_type', 'created_at']
    search_fields = ['product__name', 'reference_number', 'notes']
    readonly_fields = ['created_at']

@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ['name', 'contact_person', 'email', 'phone', 'is_active']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'contact_person', 'email', 'phone']
    readonly_fields = ['created_at', 'updated_at']

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1
    readonly_fields = ['total_price']

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'supplier', 'status', 'expected_delivery_date', 'created_by', 'created_at']
    list_filter = ['status', 'expected_delivery_date', 'created_at']
    search_fields = ['order_number', 'supplier__name', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PurchaseOrderItemInline]
    fieldsets = (
        (None, {
            'fields': ('order_number', 'supplier', 'status')
        }),
        ('Delivery Information', {
            'fields': ('expected_delivery_date', 'notes')
        }),
        ('Creation Details', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )

@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = ['purchase_order', 'product', 'quantity', 'unit_price', 'total_price']
    search_fields = ['purchase_order__order_number', 'product__name']
    readonly_fields = ['total_price']
