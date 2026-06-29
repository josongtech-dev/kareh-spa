import api from './axiosInstance';

export interface ActivityLog {
  id: number;
  actor_type: string;
  actor_id: number | null;
  actor_name: string | null;
  category: string;
  action: string;
  description: string;
  entity_type: string | null;
  entity_id: number | null;
  ip_address: string | null;
  created_at: string;
}

export interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export const activityLogsApi = {
  getAll: async (params?: {
    page?: number;
    per_page?: number;
    category?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    actor_id?: number;
  }) => {
    const res = await api.get('/activity_logs.php', { params });
    return { data: (res.data?.data || res.data) as ActivityLogsResponse };
  },
};
