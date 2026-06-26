import api from './axiosInstance';

export const sessionsApi = {
  getAll: () => api.get(`/sessions.php?_=${Date.now()}`),
  getById: (id: number) => api.get(`/sessions.php?id=${id}&_=${Date.now()}`),
  getFeedbackSummary: (startDate?: string, endDate?: string, limit = 5) =>
    api.get(`/sessions.php?action=feedback_summary&start_date=${encodeURIComponent(startDate || '')}&end_date=${encodeURIComponent(endDate || '')}&limit=${limit}`),
  getFeedbackNotifications: (limit = 50) =>
    api.get(`/sessions.php?action=feedback_notifications&limit=${limit}`),
  markFeedbackViewed: (feedbackId: number) =>
    api.post('/sessions.php?action=mark_feedback_viewed', { feedback_id: feedbackId }),
  markAllFeedbackViewed: () =>
    api.post('/sessions.php?action=mark_all_feedback_viewed'),
  create: (data: any) => api.post('/sessions.php', data),
  addService: (sessionId: number, serviceId: number, price: number, assignedStaffId?: number) =>
    api.post('/sessions.php?action=add_service', {
      session_id: sessionId,
      service_id: serviceId,
      price,
      assigned_staff_id: assignedStaffId || 0,
    }),
  removeService: (serviceLineId: number) =>
    api.post('/sessions.php?action=remove_service', { service_line_id: serviceLineId }),
  addAddon: (sessionId: number, addonId: number, quantity: number) =>
    api.post('/sessions.php?action=add_addon', {
      session_id: sessionId,
      addon_id: addonId,
      quantity,
    }),
  removeAddon: (addonLineId: number) =>
    api.post('/sessions.php?action=remove_addon', { addon_line_id: addonLineId }),
  initiatePayment: (sessionId: number, paymentMethod: 'MPESA' | 'CARD') =>
    api.post('/sessions.php?action=initiate_payment', {
      session_id: sessionId,
      payment_method: paymentMethod,
    }),
  paySession: (sessionId: number, transactionCode: string) =>
    api.post('/sessions.php?action=pay_session', {
      session_id: sessionId,
      transaction_code: transactionCode,
    }),
  getPaymentStatus: (sessionId: number) =>
    api.get(`/sessions.php?action=payment_status&id=${sessionId}&_=${Date.now()}`),
  checkPesapalStatus: (orderTrackingId: string, merchantReference?: string) =>
    api.get(`/pesapal.php?action=check_status&order_tracking_id=${encodeURIComponent(orderTrackingId)}${merchantReference ? `&merchant_reference=${encodeURIComponent(merchantReference)}` : ''}&_=${Date.now()}`),
  update: (id: number, data: any) => api.put(`/sessions.php?id=${id}`, data),
  delete: (id: number) => api.delete(`/sessions.php?id=${id}`),
};
