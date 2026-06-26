import api from './axiosInstance';

export const addonApi = {
  getAll: () => api.get('/addons.php'),
  getActive: () => api.get('/addons.php?active=1'),
  getById: (id: number) => api.get(`/addons.php?id=${id}`),
  create: (data: any) => api.post('/addons.php', data),
  update: (id: number, data: any) => api.put(`/addons.php?id=${id}`, data),
  delete: (id: number) => api.delete(`/addons.php?id=${id}`),
};
