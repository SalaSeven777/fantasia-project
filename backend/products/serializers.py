from rest_framework import serializers
from .models import Product, Category, ProductImage, ProductReview

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at', 'updated_at']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_primary', 'created_at']

class ProductReviewSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ProductReview
        fields = ['id', 'user', 'user_username', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['user']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)
    panel_type_display = serializers.CharField(source='get_panel_type_display', read_only=True)
    inStock = serializers.SerializerMethodField()
    
    def get_inStock(self, obj):
        return obj.stock_quantity > 0

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'panel_type', 'panel_type_display', 'category', 'category_name',
            'description', 'technical_specs', 'price', 'stock_quantity',
            'min_stock_threshold', 'image', 'is_active', 'created_at',
            'updated_at', 'additional_images', 'reviews', 'inStock'
        ] 