from django.contrib import admin
from .models import Invoice, Payment, CreditNote

class PaymentInline(admin.TabularInline):
    model = Payment
    extra = 0
    readonly_fields = ['created_at']

class CreditNoteInline(admin.TabularInline):
    model = CreditNote
    extra = 0
    readonly_fields = ['created_at']

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'client', 'order', 'status', 'total_amount', 'due_date']
    list_filter = ['status', 'issue_date', 'due_date', 'created_at']
    search_fields = ['invoice_number', 'client__username', 'order__order_number']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [PaymentInline, CreditNoteInline]
    fieldsets = (
        (None, {
            'fields': ('invoice_number', 'client', 'order', 'status')
        }),
        ('Dates', {
            'fields': ('issue_date', 'due_date')
        }),
        ('Financial Details', {
            'fields': ('subtotal', 'tax_rate', 'tax_amount', 'total_amount')
        }),
        ('Additional Information', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['invoice', 'amount', 'payment_method', 'payment_date', 'created_by']
    list_filter = ['payment_method', 'payment_date', 'created_at']
    search_fields = ['invoice__invoice_number', 'transaction_id', 'notes']
    readonly_fields = ['created_at']

@admin.register(CreditNote)
class CreditNoteAdmin(admin.ModelAdmin):
    list_display = ['credit_note_number', 'invoice', 'amount', 'issue_date', 'created_by']
    list_filter = ['issue_date', 'created_at']
    search_fields = ['credit_note_number', 'invoice__invoice_number', 'reason']
    readonly_fields = ['created_at']
