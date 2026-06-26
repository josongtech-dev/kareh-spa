import api from './axiosInstance';

export type OfferPayload = {
  name: string;
  description?: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  starts_at?: string | null;
  ends_at?: string | null;
  status: 'Active' | 'Inactive';
  service_ids: number[];
};

export const offersApi = {
  getAll: () => api.get('/offers.php'),
  getById: (id: number) => api.get(`/offers.php?id=${id}`),
  create: (payload: OfferPayload) => api.post('/offers.php', payload),
  update: (id: number, payload: Partial<OfferPayload>) => api.put(`/offers.php?id=${id}`, payload),
  delete: (id: number) => api.delete(`/offers.php?id=${id}`),
};
