import api from './axiosInstance';

export const appointmentApi = {
  getAll: () => api.get('/appointments.php'),
  getById: (id: number) => api.get(`/appointments.php?id=${id}`),
  getByCustomerEmail: (email: string) => api.get(`/appointments.php?customer_email=${encodeURIComponent(email)}`),
  create: (data: any) => api.post('/appointments.php', data),
  update: (id: number, data: any) => api.put(`/appointments.php?id=${id}`, data),
  updateStatus: (id: number, status: string) => api.put(`/appointments.php?id=${id}`, { status }),
  delete: (id: number) => api.delete(`/appointments.php?id=${id}`),
};
