from django.contrib import admin
from .models import Quote, QuoteItem

class QuoteItemInline(admin.TabularInline):
    model = QuoteItem
    extra = 1

@admin.register(Quote)
class QuoteAdmin(admin.ModelAdmin):
    list_display = ('quote_number', 'customer_name', 'date_created', 'status', 'total')
    list_filter = ('status', 'date_created')
    search_fields = ('quote_number', 'customer_name')
    inlines = [QuoteItemInline]

@admin.register(QuoteItem)
class QuoteItemAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'quantity', 'unit_price', 'discount', 'total')
    list_filter = ('quote',)
    search_fields = ('product_name',)
