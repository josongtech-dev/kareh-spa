import api from './axiosInstance';

const multipartHeaders = {
  headers: { 'Content-Type': 'multipart/form-data' as const },
};

export const serviceApi = {
  getAll: () => api.get('/services.php'),
  getCategories: () => api.get('/services.php?resource=categories'),
  createCategory: (data: { name: string; status?: 'Active' | 'Inactive'; display_order?: number | null }) =>
    api.post('/services.php?resource=categories', data),
  getById: (id: number) => api.get(`/services.php?id=${id}`),
  /** JSON or FormData (use FormData + service_image file for uploads). */
  create: (data: FormData | Record<string, unknown>) =>
    data instanceof FormData
      ? api.post('/services.php', data, multipartHeaders)
      : api.post('/services.php', data),
  /** JSON (PUT) or FormData (POST ?id=) when uploading/replacing an image. */
  update: (id: number, data: FormData | Record<string, unknown>) =>
    data instanceof FormData
      ? api.post(`/services.php?id=${id}`, data, multipartHeaders)
      : api.put(`/services.php?id=${id}`, data),
  delete: (id: number) => api.delete(`/services.php?id=${id}`),
};
