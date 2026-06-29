import api from './axiosInstance';

export const appointmentApi = {
  getAll: () => api.get('/appointments.php'),
  getById: (id: number) => api.get(`/appointments.php?id=${id}`),
  getByCustomerEmail: (email: string) => api.get(`/appointments.php?customer_email=${encodeURIComponent(email)}`),
  getByDateRange: (dateFrom: string, dateTo: string, staffId?: number) =>
    api.get(`/appointments.php?date_from=${dateFrom}&date_to=${dateTo}${staffId ? `&staff_id=${staffId}` : ''}`),
  checkAvailability: (date: string, staffId?: number) =>
    api.get(`/appointments.php?check_date=${date}${staffId ? `&staff_id=${staffId}` : ''}`),
  create: (data: any) => api.post('/appointments.php', data),
  update: (id: number, data: any) => api.put('/appointments.php', { ...data, id }),
  updateStatus: (id: number, status: string) => api.put('/appointments.php', { id, status }),
  delete: (id: number) => api.delete(`/appointments.php?id=${id}`),
};
