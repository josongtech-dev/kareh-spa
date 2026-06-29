import api from './axiosInstance';

const multipartHeaders = {
  headers: { 'Content-Type': 'multipart/form-data' as const },
};

export const serviceApi = {
  getAll: () => api.get('/services.php'),
  getCategories: () => api.get('/services.php?resource=categories'),
  createCategory: (data: { name: string; status?: 'Active' | 'Inactive'; display_order?: number | null }) =>
    api.post('/services.php', { ...data, resource: 'categories' }),
  getById: (id: number) => api.get(`/services.php?id=${id}`),
  /** JSON or FormData (use FormData + service_image file for uploads). */
  create: (data: FormData | Record<string, unknown>) =>
    data instanceof FormData
      ? api.post('/services.php', data, multipartHeaders)
      : api.post('/services.php', data),
  /** JSON (PUT) or FormData (POST ?id=) when uploading/replacing an image. */
  update: (id: number, data: FormData | Record<string, unknown>) => {
    if (data instanceof FormData) {
      data.append('id', String(id));
      return api.post('/services.php', data, multipartHeaders);
    }
    return api.put('/services.php', { ...data, id });
  },
  delete: (id: number) => api.delete(`/services.php?id=${id}`),
  /** Product linking for auto-consumption */
  getLinkedProducts: (id: number) => api.get(`/services.php?resource=linked-products&id=${id}`),
  setLinkedProducts: (id: number, products: { product_id: number; quantity: number }[]) =>
    api.post('/services.php', { id, action: 'link-products', products }),
};
