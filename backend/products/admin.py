from django.contrib import admin
from .models import Product, Category, ProductImage, ProductReview

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at', 'updated_at']
    search_fields = ['name', 'description']
    list_filter = ['created_at']

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductReviewInline(admin.TabularInline):
    model = ProductReview
    extra = 0
    readonly_fields = ['user', 'rating', 'comment', 'created_at']

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'panel_type', 'category', 'price', 'stock_quantity', 'is_active']
    list_filter = ['panel_type', 'category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductImageInline, ProductReviewInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'panel_type', 'category', 'description')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'stock_quantity', 'min_stock_threshold')
        }),
        ('Technical Details', {
            'fields': ('technical_specs',)
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Status', {
            'fields': ('is_active', 'created_at', 'updated_at')
        }),
    )

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name']

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['product__name', 'user__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']
