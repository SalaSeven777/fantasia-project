from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

class Invoice(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DR', _('Draft')
        PENDING = 'PE', _('Pending')
        PAID = 'PA', _('Paid')
        PARTIALLY_PAID = 'PP', _('Partially Paid')
        OVERDUE = 'OV', _('Overdue')
        CANCELLED = 'CA', _('Cancelled')

    invoice_number = models.CharField(max_length=20, unique=True)
    order = models.OneToOneField('orders.Order', on_delete=models.PROTECT, related_name='invoice')
    client = models.ForeignKey('users.User', on_delete=models.PROTECT, related_name='invoices')
    status = models.CharField(
        max_length=2,
        choices=Status.choices,
        default=Status.DRAFT
    )
    issue_date = models.DateField()
    due_date = models.DateField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=4, decimal_places=2, default=20.00)  # 20% VAT
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.client.username}"

    def save(self, *args, **kwargs):
        if not self.tax_amount:
            self.tax_amount = self.subtotal * (self.tax_rate / 100)
        if not self.total_amount:
            self.total_amount = self.subtotal + self.tax_amount
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'
        ordering = ['-created_at']

class Payment(models.Model):
    class PaymentMethod(models.TextChoices):
        BANK_TRANSFER = 'BT', _('Bank Transfer')
        CREDIT_CARD = 'CC', _('Credit Card')
        CHECK = 'CH', _('Check')
        CASH = 'CA', _('Cash')

    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    payment_method = models.CharField(
        max_length=2,
        choices=PaymentMethod.choices
    )
    payment_date = models.DateField()
    transaction_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment of {self.amount} for Invoice {self.invoice.invoice_number}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update invoice status based on payments
        total_paid = sum(payment.amount for payment in self.invoice.payments.all())
        if total_paid >= self.invoice.total_amount:
            self.invoice.status = Invoice.Status.PAID
        elif total_paid > 0:
            self.invoice.status = Invoice.Status.PARTIALLY_PAID
        self.invoice.save()

    class Meta:
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-payment_date']

class CreditNote(models.Model):
    credit_note_number = models.CharField(max_length=20, unique=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.PROTECT, related_name='credit_notes')
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    reason = models.TextField()
    issue_date = models.DateField()
    created_by = models.ForeignKey('users.User', on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Credit Note {self.credit_note_number} for Invoice {self.invoice.invoice_number}"

    class Meta:
        verbose_name = 'Credit Note'
        verbose_name_plural = 'Credit Notes'
        ordering = ['-issue_date']
