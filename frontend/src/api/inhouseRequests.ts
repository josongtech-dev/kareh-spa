import api from './axiosInstance';

export const inhouseRequestApi = {
  getByMember: (memberId: number) => api.get(`/inhouse_requests.php?member_id=${memberId}`),
  getAll: () => api.get('/inhouse_requests.php?all=1'),
  create: (data: any) => api.post('/inhouse_requests.php', data),
  updateStatus: (id: number, status: string) => api.put('/inhouse_requests.php', { id, status }),
};
