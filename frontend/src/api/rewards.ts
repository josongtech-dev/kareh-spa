import api from './axiosInstance';

export const rewardApi = {
  getAll: () => api.get('/rewards.php'),
  getById: (id: number) => api.get(`/rewards.php?id=${id}`),
  create: (data: any) => api.post('/rewards.php', data),
  update: (id: number, data: any) => api.post('/rewards.php', { ...data, id }),
  delete: (id: number) => api.delete(`/rewards.php?id=${id}`),
  redeem: (memberId: number, rewardId: number) =>
    api.post('/rewards.php', { action: 'redeem', member_id: memberId, reward_id: rewardId }),
  getMemberHistory: (memberId: number) =>
    api.get(`/rewards.php?action=member_history&member_id=${memberId}`),
  getAllHistory: () => api.get('/rewards.php?action=all_history'),
};
