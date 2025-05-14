from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        PURCHASE = 'PU', _('Purchase')
        SALE = 'SA', _('Sale')
        RETURN = 'RE', _('Return')
        ADJUSTMENT = 'AD', _('Adjustment')
        DAMAGED = 'DA', _('Damaged')

    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='stock_movements')
    movement_type = models.CharField(
        max_length=2,
        choices=MovementType.choices
    )
    quantity = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Use negative numbers for outgoing stock"
    )
    reference_number = models.CharField(max_length=50, blank=True,
        help_text="Order number, invoice number, etc."
    )
    notes = models.TextField(blank=True)
    performed_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_movement_type_display()} - {self.product.name} ({self.quantity})"

    def save(self, *args, **kwargs):
        # Update product stock quantity
        self.product.stock_quantity += self.quantity
        self.product.save()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Stock Movement'
        verbose_name_plural = 'Stock Movements'
        ordering = ['-created_at']

class Supplier(models.Model):
    name = models.CharField(max_length=200)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Supplier'
        verbose_name_plural = 'Suppliers'
        ordering = ['name']

class PurchaseOrder(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DR', _('Draft')
        SUBMITTED = 'SU', _('Submitted')
        APPROVED = 'AP', _('Approved')
        RECEIVED = 'RE', _('Received')
        CANCELLED = 'CA', _('Cancelled')

    supplier = models.ForeignKey(Supplier, on_delete=models.PROTECT, related_name='purchase_orders')
    order_number = models.CharField(max_length=20, unique=True)
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.DRAFT
    )
    expected_delivery_date = models.DateField()
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"PO {self.order_number} - {self.supplier.name}"

    class Meta:
        verbose_name = 'Purchase Order'
        verbose_name_plural = 'Purchase Orders'
        ordering = ['-created_at']

class PurchaseOrderItem(models.Model):
    purchase_order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in PO {self.purchase_order.order_number}"

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Purchase Order Item'
        verbose_name_plural = 'Purchase Order Items'
