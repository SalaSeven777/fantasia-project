from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
import uuid

class Quote(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DR', _('Draft')
        SENT = 'SE', _('Sent')
        ACCEPTED = 'AC', _('Accepted')
        REJECTED = 'RE', _('Rejected')
        EXPIRED = 'EX', _('Expired')
        CONVERTED = 'CO', _('Converted to Order')
    
    quote_number = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='quotes')
    customer_name = models.CharField(max_length=255)  # Denormalized for historical records
    date_created = models.DateField(auto_now_add=True)
    valid_until = models.DateField()
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.DRAFT
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Quote {self.quote_number} - {self.customer_name}"
    
    def save(self, *args, **kwargs):
        # Calculate totals
        if not self.total:
            self.total = self.subtotal - self.discount + self.tax
        
        # Generate quote number if it doesn't exist
        if not self.quote_number:
            last_quote = Quote.objects.order_by('-id').first()
            quote_id = 1
            if last_quote:
                quote_id = last_quote.id + 1
            self.quote_number = f"Q-{quote_id:05d}"
            
        # Store customer name if it's not set
        if not self.customer_name and self.customer:
            name_parts = []
            if self.customer.first_name:
                name_parts.append(self.customer.first_name)
            if self.customer.last_name:
                name_parts.append(self.customer.last_name)
            
            if name_parts:
                self.customer_name = " ".join(name_parts)
            else:
                self.customer_name = self.customer.email
                
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Quote'
        verbose_name_plural = 'Quotes'
        ordering = ['-date_created']


class QuoteItem(models.Model):
    quote = models.ForeignKey(Quote, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT)
    product_name = models.CharField(max_length=255)  # Denormalized for historical records
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in Quote {self.quote.quote_number}"

    def save(self, *args, **kwargs):
        # Calculate total with discount
        self.total = (self.quantity * self.unit_price) - self.discount
        
        # Store product name if it's not set
        if not self.product_name and self.product:
            self.product_name = self.product.name
            
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Quote Item'
        verbose_name_plural = 'Quote Items'
        ordering = ['id']
