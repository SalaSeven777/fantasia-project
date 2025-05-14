from django.shortcuts import render
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order, OrderItem, DeliveryStatus
from .serializers import OrderSerializer, OrderItemSerializer, DeliveryStatusSerializer
from products.models import Product
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

# Create your views here.

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'client', 'delivery_date']
    search_fields = ['order_number', 'shipping_address']
    ordering_fields = ['created_at', 'delivery_date', 'total_amount']

    def get_queryset(self):
        user = self.request.user
        # Allow staff and commercial users to see all orders
        if user.is_staff or hasattr(user, 'role') and user.role == 'CO':
            queryset = Order.objects.all()
        # Delivery agents can see orders that are confirmed, ready for delivery or in transit
        elif hasattr(user, 'role') and user.role == 'DA':
            queryset = Order.objects.filter(status__in=['CO', 'RD', 'IT'])
        # Regular clients only see their own orders
        else:
            queryset = Order.objects.filter(client=user)
            
        # If queryset is empty, inject some test data
        if not queryset.exists():
            status_filter = self.request.query_params.get('status')
            return self.get_test_orders(status_filter)
        
        return queryset

    def get_test_orders(self, status_filter=None):
        """
        Return sample orders for testing when the database is empty
        """
        from django.utils import timezone
        from datetime import timedelta
        from django.contrib.auth import get_user_model
        
        # Get actual Order objects instead of dictionaries
        User = get_user_model()
        
        # For serialization
        class TestOrder:
            def __init__(self, **kwargs):
                for key, value in kwargs.items():
                    setattr(self, key, value)
        
        # Sample order data
        now = timezone.now()
        sample_orders = []
        
        orders_data = [
            {
                'id': 1001,
                'order_number': 'ORD-1001',
                'client_id': self.request.user.id,
                'status': 'CO',  # Confirmed
                'total_amount': 150.75,
                'shipping_address': '123 Main St, City, State 12345',
                'delivery_notes': 'Handle with care',
                'delivery_date': now.date() + timedelta(days=10),
                'created_at': now - timedelta(days=1),
                'updated_at': now - timedelta(hours=2),
            },
            {
                'id': 1002,
                'order_number': 'ORD-1002',
                'client_id': self.request.user.id,
                'status': 'RD',  # Ready for Delivery
                'total_amount': 120.50,
                'shipping_address': '456 Oak Ave, City, State 12345',
                'delivery_notes': 'Leave at door',
                'delivery_date': now.date() + timedelta(days=7),
                'created_at': now - timedelta(days=2),
                'updated_at': now - timedelta(hours=6),
            },
            {
                'id': 1003,
                'order_number': 'ORD-1003',
                'client_id': self.request.user.id,
                'status': 'IT',  # In Transit
                'total_amount': 85.75,
                'shipping_address': '789 Pine St, City, State 12345',
                'delivery_notes': 'Ring bell',
                'delivery_date': now.date() + timedelta(days=3),
                'created_at': now - timedelta(days=3),
                'updated_at': now - timedelta(days=1),
            },
            {
                'id': 1004,
                'order_number': 'ORD-1004',
                'client_id': self.request.user.id,
                'status': 'DE',  # Delivered
                'total_amount': 220.30,
                'shipping_address': '101 Elm St, City, State 12345',
                'delivery_notes': 'Signature required',
                'delivery_date': now.date() - timedelta(days=1),
                'created_at': now - timedelta(days=5),
                'updated_at': now - timedelta(days=2),
            }
        ]
        
        # Create test objects
        for order_data in orders_data:
            # Filter by status if specified
            if status_filter and order_data['status'] != status_filter:
                continue
                
            order = TestOrder(**order_data)
            # Add extra properties needed for serialization
            order.items = []  # Empty list of items
            order.client = self.request.user  # Assign the user
            
            # Add a status_display property
            status_map = {
                'PE': 'Pending',
                'CO': 'Confirmed',
                'PR': 'In Production',
                'RD': 'Ready for Delivery',
                'IT': 'In Transit',
                'DE': 'Delivered',
                'CA': 'Cancelled'
            }
            order.status_display = status_map.get(order.status, order.status)
            
            sample_orders.append(order)
            
        return sample_orders
        
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    def create(self, request, *args, **kwargs):
        # Debug: Log the request data
        print(f"[DEBUG] Order create request data: {request.data}")
        print(f"[DEBUG] Authenticated user: {request.user.username} (ID: {request.user.id})")
        
        # Extract items data from the request
        items_data = request.data.get('items', [])
        
        # Validate there are items in the order
        if not items_data:
            return Response(
                {'error': 'Order must contain at least one item'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create serializer with rest of the data
        serializer = self.get_serializer(data=request.data)
        
        # Instead of using raise_exception=True, handle validation errors manually
        if not serializer.is_valid():
            print(f"[DEBUG] Order serializer validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Save the order
            order = serializer.save(client=request.user)
            print(f"[DEBUG] Order created with ID: {order.id}, Order #: {order.order_number}")
            
            # Calculate the total amount
            total_amount = Decimal('0.00')
            
            # Process each order item
            for item_data in items_data:
                product_id = item_data.get('product_id')
                quantity = item_data.get('quantity', 1)
                
                if not product_id:
                    order.delete()
                    return Response(
                        {'error': 'Product ID is required for each order item'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                try:
                    # Get the product
                    product = Product.objects.get(pk=product_id)
                    print(f"[DEBUG] Processing product: {product.id} - {product.name}, price: {product.price}")
                    
                    # Check if product is in stock with sufficient quantity
                    if not hasattr(product, 'stock_quantity') or product.stock_quantity < quantity:
                        order.delete()
                        return Response(
                            {'error': f'Product {product.name} does not have sufficient stock. Available: {getattr(product, "stock_quantity", 0)}, Requested: {quantity}'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Decrease the stock quantity
                    product.stock_quantity -= quantity
                    product.save()
                    print(f"[DEBUG] Updated product stock: {product.name}, new stock: {product.stock_quantity}")
                    
                    # Calculate prices
                    unit_price = product.price
                    item_total = unit_price * Decimal(quantity)
                    
                    # Add to the order total
                    total_amount += item_total
                    
                    # Create the order item
                    order_item = OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        unit_price=unit_price,
                        total_price=item_total
                    )
                    print(f"[DEBUG] Created order item: {order_item.id}, product: {product.name}, quantity: {quantity}, total: {item_total}")
                    
                except Product.DoesNotExist:
                    # If product doesn't exist, delete the order and return error
                    order.delete()
                    return Response(
                        {'error': f'Product with ID {product_id} does not exist'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                except Exception as e:
                    # If any other error occurs, delete the order and return error
                    order.delete()
                    print(f"[DEBUG] Error creating order item: {str(e)}")
                    return Response(
                        {'error': f'Error creating order item: {str(e)}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Update the order total
            order.total_amount = total_amount
            order.save()
            print(f"[DEBUG] Updated order total amount: {total_amount}")
            
            # Return the serialized order data
            serializer = self.get_serializer(order)
            print(f"[DEBUG] Order created successfully, returning data")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"[DEBUG] Unexpected error in order creation: {str(e)}")
            return Response(
                {'error': f'Unexpected error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def mark_delivered(self, request, pk=None):
        """
        Special endpoint to mark an order as delivered and trigger invoice creation
        """
        order = self.get_object()
        
        # Only allow changing to delivered status if it's not already delivered
        if order.status == Order.Status.DELIVERED:
            return Response(
                {"detail": "Order is already marked as delivered."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the order status
        order.status = Order.Status.DELIVERED
        order.save()
        
        # Get the newly created invoice (should be created by signal)
        try:
            invoice = order.invoice
            serializer = self.get_serializer(order)
            return Response({
                "order": serializer.data,
                "message": f"Order marked as delivered. Invoice {invoice.invoice_number} was automatically generated."
            })
        except Exception as e:
            return Response({
                "order": self.get_serializer(order).data,
                "message": "Order marked as delivered but invoice generation may have failed.",
                "error": str(e)
            })

    @action(detail=True, methods=['post'])
    def add_delivery_status(self, request, pk=None):
        order = self.get_object()
        serializer = DeliveryStatusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(order=order, updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['order', 'product']

    def get_queryset(self):
        user = self.request.user
        # Allow staff and commercial users to see all order items
        if user.is_staff or hasattr(user, 'role') and user.role == 'CO':
            return OrderItem.objects.all()
        # Regular clients only see their own order items
        return OrderItem.objects.filter(order__client=user)

class DeliveryStatusViewSet(viewsets.ModelViewSet):
    queryset = DeliveryStatus.objects.all()
    serializer_class = DeliveryStatusSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['order', 'status']
    ordering_fields = ['created_at']

    def get_queryset(self):
        user = self.request.user
        # Allow staff and commercial users to see all delivery statuses
        if user.is_staff or hasattr(user, 'role') and user.role == 'CO':
            return DeliveryStatus.objects.all()
        # Delivery agents can see all delivery statuses for confirmed, in transit or ready for delivery orders
        elif hasattr(user, 'role') and user.role == 'DA':
            return DeliveryStatus.objects.filter(order__status__in=['CO', 'RD', 'IT'])
        # Regular clients only see their own delivery statuses
        return DeliveryStatus.objects.filter(order__client=user)

    def perform_create(self, serializer):
        serializer.save(updated_by=self.request.user)

# Add routes endpoints 
@api_view(['GET', 'POST'])
def get_delivery_routes(request):
    """
    GET: Get all delivery routes
    POST: Create a new delivery route
    """
    if request.method == 'GET':
        # Return sample routes for testing
        sample_routes = [
            {
                "id": 1,
                "name": "Route 1",
                "start_location": "Warehouse",
                "end_location": "Downtown",
                "stops": [
                    {"order_id": 101, "location": "123 Main St", "estimated_time": "09:30"}
                ],
                "total_distance": 15.5,
                "total_time": 45,
                "assigned_agent": 1,
                "status": "planned",
                "date": "2025-05-07"
            },
            {
                "id": 2,
                "name": "Route 2",
                "start_location": "Warehouse",
                "end_location": "Suburbs",
                "stops": [
                    {"order_id": 102, "location": "456 Oak Ave", "estimated_time": "10:15"}
                ],
                "total_distance": 22.3,
                "total_time": 55,
                "assigned_agent": 2,
                "status": "in_progress",
                "date": "2025-05-07"
            }
        ]
        return Response(sample_routes, status=status.HTTP_200_OK)
    
    elif request.method == 'POST':
        # For now, just return success with the posted data
        # In a real implementation, you would validate and save the data
        route_data = request.data
        route_data['id'] = 3  # Assign a dummy ID
        return Response(route_data, status=status.HTTP_201_CREATED)

@api_view(['GET', 'PATCH'])
def get_delivery_route_detail(request, pk):
    """
    GET: Get details for a specific delivery route
    PATCH: Update the status of a delivery route
    """
    sample_route = {
        "id": pk,
        "name": f"Route {pk}",
        "start_location": "Warehouse",
        "end_location": "Downtown",
        "stops": [
            {"order_id": 101, "location": "123 Main St", "estimated_time": "09:30"}
        ],
        "total_distance": 15.5,
        "total_time": 45,
        "assigned_agent": 1,
        "status": "planned",
        "date": "2025-05-07"
    }
    
    if request.method == 'GET':
        return Response(sample_route, status=status.HTTP_200_OK)
    
    elif request.method == 'PATCH':
        # Update the route with the new data
        data = request.data
        # For this demo, we'll just echo back the updated route
        updated_route = sample_route.copy()
        
        # Update status if provided
        if 'status' in data:
            updated_route['status'] = data['status']
            
        # Update other fields as needed
        for key in ['name', 'assigned_agent', 'start_location', 'end_location']:
            if key in data:
                updated_route[key] = data[key]
                
        return Response(updated_route, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_delivery_metrics(request):
    """
    Get delivery performance metrics
    """
    # Get the timeframe parameter
    timeframe = request.query_params.get('timeframe', 'week')
    
    # Sample metrics data
    metrics = {
        "daily_deliveries": [
            {"date": "2025-05-01", "count": 12, "completed": 10},
            {"date": "2025-05-02", "count": 15, "completed": 13},
            {"date": "2025-05-03", "count": 8, "completed": 8},
            {"date": "2025-05-04", "count": 10, "completed": 9},
            {"date": "2025-05-05", "count": 14, "completed": 12},
            {"date": "2025-05-06", "count": 16, "completed": 14},
            {"date": "2025-05-07", "count": 13, "completed": 11}
        ],
        "performance_by_agent": [
            {"agent_id": 1, "agent_name": "John Doe", "delivered": 25, "on_time": 22, "late": 3},
            {"agent_id": 2, "agent_name": "Jane Smith", "delivered": 30, "on_time": 28, "late": 2},
            {"agent_id": 3, "agent_name": "Bob Johnson", "delivered": 15, "on_time": 13, "late": 2}
        ],
        "delivery_areas": [
            {"area": "Downtown", "count": 35, "percentage": 40},
            {"area": "Suburbs", "count": 30, "percentage": 34},
            {"area": "Industrial", "count": 15, "percentage": 17},
            {"area": "Other", "count": 8, "percentage": 9}
        ]
    }
    
    return Response(metrics, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_delivery_summary(request):
    """
    Get delivery summary statistics
    """
    # Sample summary data
    summary = {
        "total_deliveries": 88,
        "completed": 75,
        "in_progress": 8,
        "pending": 3,
        "failed": 2,
        "on_time_percentage": 92,
        "average_delivery_time": 45.5
    }
    
    return Response(summary, status=status.HTTP_200_OK)
