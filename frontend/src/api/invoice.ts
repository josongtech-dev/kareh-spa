import api from './axiosInstance';

export interface InvoiceLine {
  id: number;
  service_name?: string;
  addon_name?: string;
  price: number;
  quantity: number;
  line_total: number;
}

export interface InvoiceData {
  session_id: number;
  session_code: string;
  customer_name: string;
  client_phone: string;
  client_email: string;
  service_lines: InvoiceLine[];
  addon_lines: InvoiceLine[];
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_transaction_code: string;
  billing_status: string;
  paid_at: string;
  created_at: string;
  business: {
    name: string;
    tagline: string;
    address: string;
    phone: string;
    email: string;
    website: string;
  };
}

export const invoiceApi = {
  getBySession: (sessionId: number) =>
    api.get<{ status: string; data: InvoiceData }>(`/invoice.php?session_id=${sessionId}`),
  getByPublicToken: (token: string) =>
    api.get<{ status: string; data: InvoiceData }>(`/invoice.php?token=${encodeURIComponent(token)}`),
};
