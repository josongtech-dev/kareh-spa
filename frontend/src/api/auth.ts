import api from './axiosInstance';

const clearCustomerSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('member_user');
  sessionStorage.removeItem('admin_reset_token');
};

const clearAdminSession = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('token');
  localStorage.removeItem('member_user');
  sessionStorage.removeItem('admin_reset_token');
};

export const authApi = {
  login: (credentials: any) => api.post('/auth/login.php', credentials),
  adminLogin: (credentials: any) => api.post('/auth/staff-login.php', credentials),
  adminResetPassword: (payload: any) => api.post('/auth/staff-reset-password.php', payload),
  register: (data: any) => api.post('/auth/register.php', data),
  getProfile: () => api.get('/auth/profile.php'),
  logout: async () => {
    try {
      await api.post('/auth/logout.php');
    } catch {
      // Server-side revocation is best-effort; always clear local state
    }
    clearCustomerSession();
    window.location.href = '/login';
  },
  memberLogout: async () => {
    try {
      await api.post('/auth/logout.php');
    } catch {
      // best-effort
    }
    clearCustomerSession();
    window.location.href = '/login';
  },
  adminLogout: async () => {
    try {
      await api.post('/auth/logout.php');
    } catch {
      // best-effort
    }
    clearAdminSession();
    window.location.href = '/admin/login';
  }
};
