import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Client Interface
import Home from '../pages/client/Home';
import AboutUs from '../pages/client/AboutUs';
import Products from '../pages/client/Products';
import ProductDetails from '../pages/client/ProductDetails';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderTracking from '../pages/client/OrderTracking';
import Profile from '../pages/client/Profile';
import Support from '../pages/client/Support';

// Product Presentation
import ProductPresentation from '../pages/presentation/ProductPresentation';

// Layouts
import ClientLayout from '../components/layout/ClientLayout';
import DashboardLayout from '../components/layout/DashboardLayout';
import AuthLayout from '../components/layout/AuthLayout';
import AuthGuard from '../components/guards/AuthGuard';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Commercial Interface
import CommercialDashboard from '../pages/commercial/Dashboard';
import OrderManagement from '../pages/commercial/OrderManagement';
import CustomerManagement from '../pages/commercial/CustomerManagement';
import QuoteManagement from '../pages/commercial/QuoteManagement';

// Delivery Interface
import DeliveryDashboard from '../pages/delivery/Dashboard';
import DeliveryManagement from '../pages/delivery/DeliveryManagement';
import RoutePlanning from '../pages/delivery/RoutePlanning';
import DeliveryMetrics from '../pages/delivery/Metrics';

// Warehouse Interface
import WarehouseDashboard from '../pages/warehouse/Dashboard';
import StockManagement from '../pages/warehouse/StockManagement';
import InventoryReports from '../pages/warehouse/InventoryReports';
import SupplyChain from '../pages/warehouse/SupplyChain';
import ProductManagement from '../pages/warehouse/ProductManagement';

// Billing Interface
import BillingDashboard from '../pages/billing/Dashboard';
import InvoiceManagement from '../pages/billing/InvoiceManagement';
import PaymentProcessing from '../pages/billing/PaymentProcessing';
import FinancialReports from '../pages/billing/FinancialReports';
import NewInvoice from '../pages/billing/NewInvoice';

// Admin Interface
import AdminDashboard from '../pages/admin/WoodThemedDashboard';
import EnhancedDashboard from '../pages/admin/EnhancedDashboard';
import UserManagement from '../pages/admin/UserManagement';
import SystemConfig from '../pages/admin/SystemConfig';
import GlobalMonitoring from '../pages/admin/GlobalMonitoring';
import ReportingHub from '../pages/admin/ReportingHub';
import AuditLogs from '../pages/admin/AuditLogs';

// Product Detail Page
import ProductDetail from '../pages/ProductDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      
      {/* Product Presentation - Public Route */}
      <Route path="/presentation" element={<ProductPresentation />} />

      {/* Cart Route - Handled by component itself which includes ClientLayout */}
      <Route path="/cart" element={<CartPage />} />

      {/* Client Interface Routes */}
      <Route element={
        <AuthGuard allowedRoles={['CL']}>
          <ClientLayout />
        </AuthGuard>
      }>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-tracking" element={<OrderTracking />} />
        <Route path="/profile/*" element={<Profile />} />
        <Route path="/support" element={<Support />} />
      </Route>

      {/* Commercial Routes */}
      <Route element={
        <AuthGuard allowedRoles={['CO']}>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/commercial" element={<CommercialDashboard />} />
        <Route path="/commercial/orders" element={<OrderManagement />} />
        <Route path="/commercial/customers" element={<CustomerManagement />} />
        <Route path="/commercial/quotes" element={<QuoteManagement />} />
      </Route>

      {/* Delivery Routes */}
      <Route element={
        <AuthGuard allowedRoles={['DA']}>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/delivery" element={<DeliveryDashboard />} />
        <Route path="/delivery/management" element={<DeliveryManagement />} />
        <Route path="/delivery/routes" element={<RoutePlanning />} />
        <Route path="/delivery/metrics" element={<DeliveryMetrics />} />
      </Route>

      {/* Warehouse Routes */}
      <Route element={
        <AuthGuard allowedRoles={['WM']}>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/warehouse" element={<WarehouseDashboard />} />
        <Route path="/warehouse/stock" element={<StockManagement />} />
        <Route path="/warehouse/products" element={<ProductManagement />} />
        <Route path="/warehouse/reports" element={<InventoryReports />} />
        <Route path="/warehouse/supply-chain" element={<SupplyChain />} />
      </Route>

      {/* Billing Routes */}
      <Route element={
        <AuthGuard allowedRoles={['BM']}>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/billing" element={<BillingDashboard />} />
        <Route path="/billing/invoices" element={<InvoiceManagement />} />
        <Route path="/billing/payments" element={<PaymentProcessing />} />
        <Route path="/billing/reports" element={<FinancialReports />} />
        <Route path="/billing/new-invoice" element={<NewInvoice />} />
      </Route>

      {/* Admin Routes */}
      <Route element={
        <AuthGuard allowedRoles={['AD']}>
          <DashboardLayout />
        </AuthGuard>
      }>
        <Route path="/admin" element={<EnhancedDashboard />} />
        <Route path="/admin/dashboard-old" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/config" element={<SystemConfig />} />
        <Route path="/admin/monitoring" element={<GlobalMonitoring />} />
        <Route path="/admin/reports" element={<ReportingHub />} />
        <Route path="/admin/audit" element={<AuditLogs />} />
      </Route>

      {/* Public landing page */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      
      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 