import api from './axiosInstance';

export const productApi = {
  getAll: () => api.get('/products.php'),
  getById: (id: number) => api.get(`/products.php?id=${id}`),
  getMovements: (id: number, limit: number = 30) => api.get(`/products.php?id=${id}&action=movements&limit=${limit}`),
  getVelocitySummary: (days: number = 30) => api.get(`/products.php?action=velocity&days=${days}`),
  getCostSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    const qs = params.toString();
    return api.get(`/products.php?action=cost_summary${qs ? `&${qs}` : ''}`);
  },
  create: (data: any) => api.post('/products.php', data),
  update: (id: number, data: any) => api.put(`/products.php?id=${id}`, data),
  updateStatus: (id: number, status: string) => api.put(`/products.php?id=${id}`, { status }),
  restock: (id: number, payload: { quantity: number; amount: number; notes?: string }) =>
    api.post(`/products.php?id=${id}&action=restock`, payload),
  consume: (id: number, payload: { quantity: number; notes?: string }) =>
    api.post(`/products.php?id=${id}&action=consume`, payload),
  delete: (id: number) => api.delete(`/products.php?id=${id}`),
};
