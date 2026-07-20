import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BoothsPage from './pages/BoothsPage';
import CustomersPage from './pages/CustomersPage';
import ManagersPage from './pages/ManagersPage';
import BookingsPage from './pages/BookingsPage';
import ContractsPage from './pages/ContractsPage';
import PaymentsPage from './pages/PaymentsPage';
import MaintenancePage from './pages/MaintenancePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ChatCustomersPage from './pages/ChatCustomersPage';
import ChatAdminPage from './pages/ChatAdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import './App.css';

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector((state) => !!state.auth.user);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        
        {/* Protected routes wrapped in Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout><DashboardPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booths"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_OPERATOR']}>
              <Layout><BoothsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_OPERATOR']}>
              <Layout><CustomersPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/managers"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <Layout><ManagersPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat-customers"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF', 'ROLE_OPERATOR']}>
              <Layout><ChatCustomersPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat-admin"
          element={
            <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
              <Layout><ChatAdminPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CUSTOMER']}>
              <Layout><BookingsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contracts"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_CUSTOMER']}>
              <Layout><ContractsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_CUSTOMER']}>
              <Layout><PaymentsPage /></Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_CUSTOMER']}>
              <Layout><MaintenancePage /></Layout>
            </ProtectedRoute>
          }
        />
        
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
