import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BrandedLoader from './components/BrandedLoader';
import NotFoundPage from './pages/NotFoundPage';
import { canAccessExpenses, canCreateAdmin, canManageOffers, canSeeAnalytics, canSeeCommissions, getCurrentAdminRole, isAttendant } from './adminAccess';
import './App.css';

const getParsedStorage = (key: string): any | null => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const HomePage = lazy(() => import('./pages/HomePage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const SessionFeedbackPage = lazy(() => import('./pages/SessionFeedbackPage'));
const ManageAppointmentPage = lazy(() => import('./pages/ManageAppointmentPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StaffManagementPage = lazy(() => import('./pages/admin/StaffManagementPage'));
const ServicesManagementPage = lazy(() => import('./pages/admin/ServicesManagementPage'));
const ProductsManagementPage = lazy(() => import('./pages/admin/ProductsManagementPage'));
const AppointmentsManagementPage = lazy(() => import('./pages/admin/AppointmentsManagementPage'));
const MembersManagementPage = lazy(() => import('./pages/admin/MembersManagementPage'));
const SessionsManagementPage = lazy(() => import('./pages/admin/SessionsManagementPage'));
const CommissionsManagementPage = lazy(() => import('./pages/admin/CommissionsManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const FeedbackManagementPage = lazy(() => import('./pages/admin/FeedbackManagementPage'));
const AddonsManagementPage = lazy(() => import('./pages/admin/AddonsManagementPage'));
const OffersManagementPage = lazy(() => import('./pages/admin/OffersManagementPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const ExpensesManagementPage = lazy(() => import('./pages/admin/ExpensesManagementPage'));
const AddAdminPage = lazy(() => import('./pages/admin/AddAdminPage'));
const InhouseRequestsManagementPage = lazy(() => import('./pages/admin/InhouseRequestsManagementPage'));
const UserLoginPage = lazy(() => import('./pages/UserLoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminResetPasswordPage = lazy(() => import('./pages/admin/AdminResetPasswordPage'));
const ActivityLogsPage = lazy(() => import('./pages/admin/ActivityLogsPage'));
const RewardsManagementPage = lazy(() => import('./pages/admin/RewardsManagementPage'));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage'));
const PaymentCallbackPage = lazy(() => import('./pages/PaymentCallbackPage'));
const MemberOffersPage = lazy(() => import('./pages/member/MemberOffersPage'));
const MemberServicesPage = lazy(() => import('./pages/member/MemberServicesPage'));
const MemberPointsPage = lazy(() => import('./pages/member/MemberPointsPage'));
const MemberHistoryPage = lazy(() => import('./pages/member/MemberHistoryPage'));

const MemberProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const member = getParsedStorage('member_user');
  return member ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adminToken = localStorage.getItem('admin_token');
  const adminUser = getParsedStorage('admin_user');
  return adminToken && adminUser ? <>{children}</> : <Navigate to="/admin/login" replace />;
};

const AddAdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const adminToken = localStorage.getItem('admin_token');
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }
  return canCreateAdmin(getCurrentAdminRole()) ? <>{children}</> : <Navigate to="/admin/dashboard" replace />;
};

const RoleProtectedRoute: React.FC<{ children: React.ReactNode; check: () => boolean }> = ({ children, check }) => {
  const adminToken = localStorage.getItem('admin_token');
  const adminUser = getParsedStorage('admin_user');
  if (!adminToken || !adminUser) {
    return <Navigate to="/admin/login" replace />;
  }
  return check() ? <>{children}</> : <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<BrandedLoader message="Loading Kareh's experience..." />}>
        <Routes>
          {/* Admin Portal Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/add-admin" element={<AddAdminProtectedRoute><AddAdminPage /></AddAdminProtectedRoute>} />
          <Route path="/admin/staff" element={<AdminProtectedRoute><StaffManagementPage /></AdminProtectedRoute>} />
          <Route path="/admin/services" element={<AdminProtectedRoute><ServicesManagementPage /></AdminProtectedRoute>} />
          <Route path="/admin/addons" element={<AdminProtectedRoute><AddonsManagementPage /></AdminProtectedRoute>} />
          <Route path="/admin/products" element={<AdminProtectedRoute><ProductsManagementPage /></AdminProtectedRoute>} />
          <Route path="/admin/bookings" element={<AdminProtectedRoute><AppointmentsManagementPage /></AdminProtectedRoute>} />
          <Route
            path="/admin/members"
            element={<RoleProtectedRoute check={() => !isAttendant(getCurrentAdminRole())}><MembersManagementPage /></RoleProtectedRoute>}
          />
          <Route path="/admin/sessions" element={<AdminProtectedRoute><SessionsManagementPage /></AdminProtectedRoute>} />
          <Route
            path="/admin/commissions"
            element={<RoleProtectedRoute check={() => canSeeCommissions(getCurrentAdminRole())}><CommissionsManagementPage /></RoleProtectedRoute>}
          />
          <Route
            path="/admin/analytics"
            element={<RoleProtectedRoute check={() => canSeeAnalytics(getCurrentAdminRole())}><AnalyticsPage /></RoleProtectedRoute>}
          />
          <Route path="/admin/feedback" element={<AdminProtectedRoute><FeedbackManagementPage /></AdminProtectedRoute>} />
          <Route
            path="/admin/expenses"
            element={
              <RoleProtectedRoute check={() => canAccessExpenses(getCurrentAdminRole())}>
                <ExpensesManagementPage />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin/offers"
            element={<RoleProtectedRoute check={() => canManageOffers(getCurrentAdminRole())}><OffersManagementPage /></RoleProtectedRoute>}
          />
          <Route path="/admin/inhouse-requests" element={<AdminProtectedRoute><InhouseRequestsManagementPage /></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><SettingsPage /></AdminProtectedRoute>} />
          <Route path="/admin/activity-logs" element={<AdminProtectedRoute><ActivityLogsPage /></AdminProtectedRoute>} />
          <Route path="/admin/rewards" element={<AdminProtectedRoute><RewardsManagementPage /></AdminProtectedRoute>} />
          <Route path="/admin/profile" element={<AdminProtectedRoute><ProfilePage /></AdminProtectedRoute>} />

          {/* Payment Callback */}
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/member/dashboard" element={<Navigate to="/member/offers" replace />} />
          <Route path="/member/offers" element={<MemberProtectedRoute><MemberOffersPage /></MemberProtectedRoute>} />
          <Route path="/member/services" element={<MemberProtectedRoute><MemberServicesPage /></MemberProtectedRoute>} />
          <Route path="/member/points" element={<MemberProtectedRoute><MemberPointsPage /></MemberProtectedRoute>} />
          <Route path="/member/history" element={<MemberProtectedRoute><MemberHistoryPage /></MemberProtectedRoute>} />

          {/* Client Facing Routes - With Navbar & Footer */}
          <Route path="*" element={
            <div className="d-flex flex-column min-vh-100">
              <Navbar />
              <main className="flex-grow-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/session-feedback" element={<SessionFeedbackPage />} />
                  <Route path="/manage-appointment" element={<ManageAppointmentPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App;
