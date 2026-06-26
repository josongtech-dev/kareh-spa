import api from './axiosInstance';

const buildRangeQuery = (month?: string, startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (month) params.set('month', month);
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  const qs = params.toString();
  return qs ? `&${qs}` : '';
};

export const commissionApi = {
  getAll: () => api.get('/commissions.php'),
  getSummary: (month?: string, startDate?: string, endDate?: string) =>
    api.get(`/commissions.php?action=summary${buildRangeQuery(month, startDate, endDate)}`),
  getAggregated: (month?: string, startDate?: string, endDate?: string) =>
    api.get(`/commissions.php?action=aggregated${buildRangeQuery(month, startDate, endDate)}`),
  sync: () => api.get('/commissions.php?action=sync'),
  getStaffCommissions: (staffId: number, month?: string, startDate?: string, endDate?: string) =>
    api.get(`/commissions.php?id=${staffId}${buildRangeQuery(month, startDate, endDate)}`),
  getStaffDetails: (
    staffId: number,
    month?: string,
    startDate?: string,
    endDate?: string,
    paymentStatus?: 'Pending' | 'Paid',
    settlementBatchId?: number | null,
    payoutFingerprint?: { transactionId: string | null; settledAt: string | null } | null
  ) => {
    const ps =
      paymentStatus === 'Pending' || paymentStatus === 'Paid'
        ? `&payment_status=${encodeURIComponent(paymentStatus)}`
        : '';
    const sb =
      settlementBatchId != null && settlementBatchId > 0
        ? `&settlement_batch_id=${settlementBatchId}`
        : '';
    const pf =
      paymentStatus === 'Paid' &&
      (settlementBatchId == null || settlementBatchId <= 0) &&
      payoutFingerprint?.settledAt
        ? `&payout_transaction_id=${encodeURIComponent(payoutFingerprint.transactionId ?? '')}&payout_settled_at=${encodeURIComponent(payoutFingerprint.settledAt)}`
        : '';
    return api.get(`/commissions.php?id=${staffId}&action=details${buildRangeQuery(month, startDate, endDate)}${ps}${sb}${pf}`);
  },
  create: (data: any) => api.post('/commissions.php', data),
  updateStatus: (id: number, status: string) => api.post(`/commissions.php?id=${id}&action=update_status`, { status }),
  settleStaff: (staffId: number, payload: any) => api.post(`/commissions.php?id=${staffId}&action=settle_staff`, payload),
};
