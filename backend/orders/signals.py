from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from .models import Order, DeliveryStatus
from billing.models import Invoice

@receiver(post_save, sender=Order)
def handle_order_status_change(sender, instance, created, **kwargs):
    """
    Handle actions when an order's status changes:
    - When status is set to 'DE' (Delivered), create an invoice automatically
    """
    # Skip if it's a new order being created
    if created:
        return
    
    # Auto-generate invoice when order is marked as delivered
    if instance.status == Order.Status.DELIVERED:
        # Check if invoice already exists for this order to prevent duplicates
        if not Invoice.objects.filter(order=instance).exists():
            # Calculate due date (30 days from now)
            issue_date = timezone.now().date()
            due_date = issue_date + timedelta(days=30)
            
            # Generate invoice number
            last_invoice = Invoice.objects.order_by('-id').first()
            if last_invoice:
                last_number = int(last_invoice.invoice_number[3:])
                invoice_number = f"INV{str(last_number + 1).zfill(6)}"
            else:
                invoice_number = "INV000001"
            
            # Set tax rate (default 20%)
            tax_rate = Decimal('20.00')
            subtotal = instance.total_amount
            tax_amount = subtotal * (tax_rate / Decimal('100.0'))
            total_amount = subtotal + tax_amount
            
            # Create the invoice
            Invoice.objects.create(
                invoice_number=invoice_number,
                order=instance,
                client=instance.client,
                status=Invoice.Status.PENDING,  # Mark as pending to request payment
                issue_date=issue_date,
                due_date=due_date,
                subtotal=subtotal,
                tax_rate=tax_rate,
                tax_amount=tax_amount,
                total_amount=total_amount,
                notes=f"Automatically generated for delivered order {instance.order_number}"
            )
            
            print(f"Auto-generated invoice {invoice_number} for order {instance.order_number}")

@receiver(post_save, sender=DeliveryStatus)
def handle_delivery_status_update(sender, instance, created, **kwargs):
    """
    When a delivery status update is added, update the parent order's status to match
    """
    if created and instance.order.status != instance.status:
        # Update the parent order with the new status
        order = instance.order
        order.status = instance.status
        order.save(update_fields=['status'])
        print(f"Updated order {order.order_number} status to {instance.status} via delivery update") 