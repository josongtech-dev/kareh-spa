import api from './axiosInstance';

export const staffApi = {
  getAll: () => api.get('/staff.php'),
  getAttendants: () => api.get('/staff.php?role=attendant&status=Active'),
  getById: (id: number) => api.get(`/staff.php?id=${id}`),
  
  /**
   * Create a new staff member
   * @param formData FormData containing name, email, phone, specialization, bio, and passport_image
   */
  create: (formData: FormData) => api.post('/staff.php', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  /**
   * Update staff member 
   * Note: Using POST with an ID because PHP handles multipart/form-data better via POST
   */
  update: (id: number, formData: FormData) => api.post(`/staff.php?id=${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),

  delete: (id: number) => api.delete(`/staff.php?id=${id}`),
};
