from rest_framework import serializers
from .models import Invoice, Payment, CreditNote
from orders.serializers import OrderSerializer

class PaymentSerializer(serializers.ModelSerializer):
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'invoice', 'amount', 'payment_method',
            'payment_method_display', 'payment_date', 'transaction_id',
            'notes', 'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['created_by']

class CreditNoteSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = CreditNote
        fields = [
            'id', 'credit_note_number', 'invoice', 'amount',
            'reason', 'issue_date', 'created_by',
            'created_by_username', 'created_at'
        ]
        read_only_fields = ['created_by', 'credit_note_number']

    def create(self, validated_data):
        # Generate a unique credit note number
        last_cn = CreditNote.objects.order_by('-id').first()
        if last_cn:
            last_number = int(last_cn.credit_note_number[2:])
            new_number = f"CN{str(last_number + 1).zfill(6)}"
        else:
            new_number = "CN000001"
        
        validated_data['credit_note_number'] = new_number
        return super().create(validated_data)

class InvoiceSerializer(serializers.ModelSerializer):
    order_details = OrderSerializer(source='order', read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    credit_notes = CreditNoteSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    client_username = serializers.CharField(source='client.username', read_only=True)
    total_paid = serializers.SerializerMethodField()
    
    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'order', 'order_details',
            'client', 'client_username', 'status', 'status_display',
            'issue_date', 'due_date', 'subtotal', 'tax_rate',
            'tax_amount', 'total_amount', 'total_paid', 'notes',
            'created_at', 'updated_at', 'payments', 'credit_notes'
        ]
        read_only_fields = ['invoice_number', 'tax_amount', 'total_amount']

    def get_total_paid(self, obj):
        return sum(payment.amount for payment in obj.payments.all())

    def create(self, validated_data):
        # Generate a unique invoice number
        last_invoice = Invoice.objects.order_by('-id').first()
        if last_invoice:
            last_number = int(last_invoice.invoice_number[3:])
            new_number = f"INV{str(last_number + 1).zfill(6)}"
        else:
            new_number = "INV000001"
        
        validated_data['invoice_number'] = new_number
        return super().create(validated_data) 