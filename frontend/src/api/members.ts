import api from './axiosInstance';

export const memberApi = {
  getAll: () => api.get('/members.php'),
  getById: (id: number) => api.get(`/members.php?id=${id}`),
  create: (data: any) => api.post('/members.php', data),
  update: (id: number, data: any) => api.put('/members.php', { ...data, id }),
  updateStatus: (id: number, status: string) => api.put('/members.php', { id, status }),
  adjustPoints: (id: number, pointsChange: number) => api.post('/members.php', { id, action: 'adjust_points', points_change: pointsChange }),
  delete: (id: number) => api.delete(`/members.php?id=${id}`),
};
