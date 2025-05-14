from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PE', _('Pending')
        CONFIRMED = 'CO', _('Confirmed')
        IN_PRODUCTION = 'PR', _('In Production')
        READY_FOR_DELIVERY = 'RD', _('Ready for Delivery')
        IN_TRANSIT = 'IT', _('In Transit')
        DELIVERED = 'DE', _('Delivered')
        CANCELLED = 'CA', _('Cancelled')

    order_number = models.CharField(max_length=20, unique=True)
    client = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='orders')
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.PENDING
    )
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_address = models.TextField()
    delivery_notes = models.TextField(blank=True)
    delivery_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_number} - {self.client.username}"

    class Meta:
        verbose_name = 'Order'
        verbose_name_plural = 'Orders'
        ordering = ['-created_at']

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in Order {self.order.order_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Order Item'
        verbose_name_plural = 'Order Items'

class DeliveryStatus(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='delivery_updates')
    status = models.CharField(max_length=2, choices=Order.Status.choices)
    location = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    updated_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Delivery update for Order {self.order.order_number}"

    class Meta:
        verbose_name = 'Delivery Status'
        verbose_name_plural = 'Delivery Statuses'
        ordering = ['-created_at']
