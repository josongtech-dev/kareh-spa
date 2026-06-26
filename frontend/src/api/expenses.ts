import api from './axiosInstance';

export const expensesApi = {
  getAll: () => api.get('/expenses.php'),
  getById: (id: number) => api.get(`/expenses.php?id=${id}`),
  create: (data: Record<string, unknown>) => api.post('/expenses.php', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/expenses.php?id=${id}`, data),
  delete: (id: number) => api.delete(`/expenses.php?id=${id}`),
  confirm: (id: number) => api.post(`/expenses.php?id=${id}&action=confirm`),
};
