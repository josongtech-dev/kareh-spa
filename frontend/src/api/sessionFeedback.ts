import api from './axiosInstance';

export interface SessionFeedbackContext {
  session_code: string;
  customer_name: string;
  total_amount: number;
  created_at?: string | null;
  paid_at?: string | null;
}

export const sessionFeedbackApi = {
  getContext: (token: string) =>
    api.post('/session-feedback.php', { token, action: 'view' }),
  submit: (payload: { token: string; service_rating: number; billing_rating: number; feedback_text: string }) =>
    api.post('/session-feedback.php', payload),
};
