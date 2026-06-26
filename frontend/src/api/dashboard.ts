import api from './axiosInstance';

export type DashboardOverview = {
  active_staff_count: number;
  active_member_count: number;
  open_appointments_count: number;
  completed_sessions_count: number;
  monthly_revenue_completed: number;
  active_services_count: number;
  low_stock_count: number;
  stock_level_pct: number;
};

export const dashboardApi = {
  getOverview: (month?: string) => {
    const params = month ? { month } : {};
    return api.get<DashboardOverview>('/dashboard.php', { params });
  },
};
