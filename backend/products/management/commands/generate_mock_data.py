from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from products.models import Product, Category, ProductReview
from orders.models import Order, OrderItem, DeliveryStatus
from inventory.models import StockMovement
from faker import Faker
import random
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Generates mock data for testing the application'

    def __init__(self):
        super().__init__()
        self.fake = Faker()

    def generate_phone_number(self):
        """Generate a phone number that fits within 15 characters."""
        return f"+{random.randint(1, 999)}{random.randint(100000000, 999999999)}"

    def create_users(self, count=10):
        users = []
        # Create admin user
        admin_user = User.objects.create_superuser(
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            role='AD',
            phone_number=self.generate_phone_number()
        )
        users.append(admin_user)

        # Create users with different roles
        roles = ['CL', 'CO', 'DA', 'WM', 'BM']
        for role in roles:
            for _ in range(2):  # Create 2 users per role
                user = User.objects.create_user(
                    email=self.fake.email(),
                    password='password123',
                    first_name=self.fake.first_name(),
                    last_name=self.fake.last_name(),
                    role=role,
                    phone_number=self.generate_phone_number(),
                    company_name=self.fake.company() if role in ['CO', 'WM', 'BM'] else '',
                    address=self.fake.address()
                )
                users.append(user)

        return users

    def create_categories(self):
        main_categories = [
            "Doors",
            "Panels",
            "Furniture",
            "Kitchen",
            "Bathroom",
            "Office",
            "Storage",
            "Custom",
        ]

        sub_categories = {
            "Doors": ["Interior Doors", "Exterior Doors", "Sliding Doors", "Folding Doors", "Fire Doors"],
            "Panels": ["Wall Panels", "Ceiling Panels", "Decorative Panels", "Acoustic Panels"],
            "Furniture": ["Tables", "Chairs", "Cabinets", "Shelves", "Desks"],
            "Kitchen": ["Cabinets", "Countertops", "Islands", "Pantry Units"],
        }

        created_categories = {}

        # Create main categories
        for category_name in main_categories:
            category = Category.objects.create(
                name=category_name,
                description=self.fake.paragraph()
            )
            created_categories[category_name] = {
                'main': category,
                'sub': []
            }

            # Create subcategories if they exist
            if category_name in sub_categories:
                for sub_name in sub_categories[category_name]:
                    sub_category = Category.objects.create(
                        name=sub_name,
                        description=self.fake.paragraph()
                    )
                    created_categories[category_name]['sub'].append(sub_category)

        return created_categories

    def create_products(self, categories, count=50):
        products = []
        panel_types = ['LP', 'MF', 'MH']
        
        for _ in range(count):
            # Select random category
            category_data = random.choice(list(categories.values()))
            category = random.choice(category_data['sub']) if category_data['sub'] else category_data['main']

            # Generate random technical specifications
            technical_specs = {
                'dimensions': {
                    'length': random.randint(50, 300),
                    'width': random.randint(30, 150),
                    'thickness': random.randint(10, 50)
                },
                'weight': f"{random.uniform(1, 100):.2f}",
                'material': random.choice(['Oak', 'Pine', 'Maple', 'Walnut', 'Cherry']),
                'finish': random.choice(['Natural', 'Matte', 'Glossy', 'Semi-Glossy']),
                'color': self.fake.color_name()
            }

            product = Product.objects.create(
                name=f"{category.name} - {self.fake.word().title()}",
                description=self.fake.paragraph(nb_sentences=5),
                panel_type=random.choice(panel_types),
                category=category,
                technical_specs=technical_specs,
                price=Decimal(random.uniform(99.99, 9999.99)).quantize(Decimal('0.01')),
                stock_quantity=random.randint(0, 100),
                min_stock_threshold=random.randint(5, 20),
                image=f"https://picsum.photos/seed/{random.randint(1, 1000)}/400/400",
                is_active=True
            )
            products.append(product)

        return products

    def create_reviews(self, products, users):
        reviews = []
        # Only clients can write reviews
        client_users = [user for user in users if user.role == 'CL']
        
        # Keep track of which products each user has reviewed
        user_reviews = {}  # user_id -> set of product_ids
        
        for product in products:
            # Generate 0-5 reviews per product
            num_reviews = random.randint(0, min(5, len(client_users)))  # Don't try to create more reviews than available users
            # Get users who haven't reviewed this product yet
            available_users = [
                user for user in client_users 
                if user.id not in user_reviews or product.id not in user_reviews[user.id]
            ]
            if not available_users:
                continue
                
            selected_users = random.sample(available_users, min(num_reviews, len(available_users)))
            for user in selected_users:
                review = ProductReview.objects.create(
                    product=product,
                    user=user,
                    rating=random.randint(1, 5),
                    comment=self.fake.paragraph()
                )
                reviews.append(review)
                
                # Update tracking
                if user.id not in user_reviews:
                    user_reviews[user.id] = set()
                user_reviews[user.id].add(product.id)
                
        return reviews

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Generating mock data...')

        # Clear existing data
        self.stdout.write('Clearing existing data...')
        
        # Delete related models first
        self.stdout.write('Deleting orders and delivery statuses...')
        DeliveryStatus.objects.all().delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        
        self.stdout.write('Deleting inventory movements...')
        StockMovement.objects.all().delete()
        
        self.stdout.write('Deleting products and reviews...')
        ProductReview.objects.all().delete()
        Product.objects.all().delete()
        Category.objects.all().delete()
        
        self.stdout.write('Deleting users...')
        User.objects.all().delete()

        # Create new data
        self.stdout.write('Creating users...')
        users = self.create_users()

        self.stdout.write('Creating categories...')
        categories = self.create_categories()

        self.stdout.write('Creating products...')
        products = self.create_products(categories)

        self.stdout.write('Creating reviews...')
        reviews = self.create_reviews(products, users)

        # Print summary
        self.stdout.write(self.style.SUCCESS(f'''
        Successfully generated mock data:
        - Users: {len(users)} (including different roles)
        - Categories: {Category.objects.count()}
        - Products: {len(products)}
        - Reviews: {len(reviews)}
        
        Admin user created:
        - Email: admin@example.com
        - Password: admin123
        
        Regular test users created with roles:
        - Clients (CL)
        - Commercial (CO)
        - Delivery Agents (DA)
        - Warehouse Managers (WM)
        - Billing Managers (BM)
        All regular users have password: password123
        ''')) 