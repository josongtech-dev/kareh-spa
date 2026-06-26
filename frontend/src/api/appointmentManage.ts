import api from './axiosInstance';

export const appointmentManageApi = {
  getByToken: (token: string) =>
    api.post('/appointment-manage.php', { token, action: 'view' }),
  manage: (payload: {
    token: string;
    action: 'reschedule' | 'cancel' | 'notes';
    appointment_date?: string;
    appointment_time?: string;
    cancel_reason?: string;
    notes?: string;
  }) => api.post('/appointment-manage.php', payload),
};
