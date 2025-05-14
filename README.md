# LATTÉ BOIS E-Commerce Management System

A full-stack e-commerce management system for LATTÉ BOIS, a laminated wood panel manufacturer.

## Project Structure

```
django-react-project/
├── backend/                 # Django backend
│   ├── config/             # Django project settings
│   ├── apps/               # Django apps
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/               # React source code
│   ├── public/            # Static files
│   └── package.json       # Node.js dependencies
└── README.md              # Project documentation
```

## Technology Stack

- Frontend: React.js with Tailwind CSS
- Backend: Django (Python)
- Database: PostgreSQL
- Authentication: Django REST Framework + JWT

## Features

- Role-based access control (8 different user roles)
- django application admin (the application main administrator)
- client shop
- Product management system
- Order processing and tracking
- Inventory management
- Delivery management
- Billing and invoicing
- Admin dashboard

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 14+
- PostgreSQL
- pip
- npm

### Installation

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Development

- Backend API documentation: `http://localhost:8000/api/docs/`
- Frontend development server: `http://localhost:3000`

## License

This project is proprietary software of LATTÉ BOIS. 