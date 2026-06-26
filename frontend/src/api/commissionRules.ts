import type { AxiosResponse } from 'axios';
import api from './axiosInstance';

export type CommissionRule = {
  id: number;
  name: string;
  commission_pool_rate: number;
  tax_rate: number;
  sort_order?: number;
  is_default?: number | boolean;
  net_commission_rate?: number;
  spa_retention_rate?: number;
};

/** Backend wraps JSON as { status, data }; list endpoints put the array in `data`. */
export function commissionRulesFromResponse(res: AxiosResponse<unknown>): CommissionRule[] {
  const body = res?.data as { data?: unknown; status?: string } | undefined;
  const raw = body?.data ?? body;
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(normalizeCommissionRule);
}

function normalizeCommissionRule(row: unknown): CommissionRule {
  const r = row as Record<string, unknown>;
  const pool = Number(r.commission_pool_rate ?? 0);
  const tax = Number(r.tax_rate ?? 0);
  const net =
    r.net_commission_rate != null
      ? Number(r.net_commission_rate)
      : Math.max(0, pool - tax);
  const spa =
    r.spa_retention_rate != null ? Number(r.spa_retention_rate) : Math.max(0, 100 - pool);
  return {
    id: Number(r.id ?? 0),
    name: String(r.name ?? ''),
    commission_pool_rate: pool,
    tax_rate: tax,
    sort_order: Number(r.sort_order ?? 0),
    is_default: Boolean(Number(r.is_default ?? 0)),
    net_commission_rate: net,
    spa_retention_rate: spa,
  };
}

export const commissionRulesApi = {
  getAll: () => api.get<{ status: string; data: CommissionRule[] }>('/commission_rules.php'),
  create: (data: Partial<CommissionRule> & { name: string; commission_pool_rate: number; tax_rate: number }) =>
    api.post('/commission_rules.php', data),
  update: (id: number, data: Partial<CommissionRule>) => api.put(`/commission_rules.php?id=${id}`, data),
  delete: (id: number) => api.delete(`/commission_rules.php?id=${id}`),
  setDefault: (id: number) => api.post(`/commission_rules.php?id=${id}&action=set_default`),
};
