import React, { useContext, useEffect, useState } from 'react';
import { FiSave, FiSettings, FiPercent, FiGift, FiUsers, FiPlus, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import { getCurrentAdminRole, isManagerOrOwner } from '../../adminAccess';
import { apiBaseUrl } from '../../api/config';
import { settingsApi } from '../../api/settings';
import { commissionRulesApi, commissionRulesFromResponse, type CommissionRule } from '../../api/commissionRules';
import SuccessModal from '../../components/admin/SuccessModal';
import FeedbackModal from '../../components/admin/FeedbackModal';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

const SettingsPage: React.FC = () => {
  const canManageCommissionRules = isManagerOrOwner(getCurrentAdminRole());
  const { isDarkMode } = useContext(AdminThemeContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings saved successfully.');
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rulesLoadError, setRulesLoadError] = useState<string | null>(null);

  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    id: null as number | null,
    name: '',
    commission_pool_rate: 40,
    tax_rate: 10,
    is_default: false,
  });
  const [ruleToDelete, setRuleToDelete] = useState<number | null>(null);
  const [savingRule, setSavingRule] = useState(false);

  const [form, setForm] = useState({
    offers_enabled: true,
    offers_list_text: '',
    staff_leaves_enabled: true,
    staff_leave_default_days: 21,
    staff_leave_requires_approval: true,
    business_name: 'Kareh Spa',
    default_currency: 'KES',
    dashboard_refresh_seconds: 30,
    discount_deduction_rate: 0,
    other_deductions_rate: 0,
    profit_remaining_rate: 60,
  });

  const loadCommissionRules = async () => {
    setRulesLoadError(null);
    try {
      const res = await commissionRulesApi.getAll();
      setCommissionRules(commissionRulesFromResponse(res));
    } catch (e: any) {
      console.error('Failed to load commission rules', e);
      const backendMsg = e?.response?.data?.message;
      const isNetwork =
        e?.message === 'Network Error' ||
        e?.code === 'ERR_NETWORK' ||
        e?.code === 'ECONNABORTED';
      const msg =
        backendMsg ||
        (isNetwork
          ? `Cannot reach the API at ${apiBaseUrl}. Set VITE_API_BASE_URL in frontend/.env.local to your PHP API (e.g. http://localhost/kareh-spa/php_backend/api). If the URL is correct, add this site’s origin to APP_ALLOWED_ORIGINS on the server (use http://127.0.0.1:5173 if you open Vite via 127.0.0.1, not localhost).`
          : null) ||
        (e?.message ? String(e.message) : 'Could not load commission rules.');
      setRulesLoadError(msg);
      setCommissionRules([]);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.getAll();
      const payload: any = res.data || {};
      const s = payload?.data || payload || {};
      const offers = Array.isArray(s.offers_list) ? s.offers_list : [];
      setForm((prev) => ({
        ...prev,
        offers_enabled: Boolean(s.offers_enabled ?? prev.offers_enabled),
        offers_list_text: offers.join('\n'),
        staff_leaves_enabled: Boolean(s.staff_leaves_enabled ?? prev.staff_leaves_enabled),
        staff_leave_default_days: Number(s.staff_leave_default_days ?? prev.staff_leave_default_days),
        staff_leave_requires_approval: Boolean(s.staff_leave_requires_approval ?? prev.staff_leave_requires_approval),
        business_name: String(s.business_name ?? prev.business_name),
        default_currency: String(s.default_currency ?? prev.default_currency),
        dashboard_refresh_seconds: Number(s.dashboard_refresh_seconds ?? prev.dashboard_refresh_seconds),
        discount_deduction_rate: Number(s.discount_deduction_rate ?? prev.discount_deduction_rate),
        other_deductions_rate: Number(s.other_deductions_rate ?? prev.other_deductions_rate),
        profit_remaining_rate: Number(s.profit_remaining_rate ?? prev.profit_remaining_rate),
      }));
    } catch (error) {
      console.error('Failed to load settings', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    if (canManageCommissionRules) {
      loadCommissionRules();
    }
  }, []);

  const netPct = (r: CommissionRule) =>
    Number(r.net_commission_rate ?? Math.max(0, Number(r.commission_pool_rate) - Number(r.tax_rate))).toFixed(1);
  const spaPct = (r: CommissionRule) =>
    Number(r.spa_retention_rate ?? Math.max(0, 100 - Number(r.commission_pool_rate))).toFixed(1);

  const openAddRule = () => {
    setRuleForm({
      id: null,
      name: '',
      commission_pool_rate: 40,
      tax_rate: 10,
      is_default: commissionRules.length === 0,
    });
    setIsRuleModalOpen(true);
  };

  const openEditRule = (r: CommissionRule) => {
    setRuleForm({
      id: r.id,
      name: r.name,
      commission_pool_rate: Number(r.commission_pool_rate),
      tax_rate: Number(r.tax_rate),
      is_default: Boolean(r.is_default),
    });
    setIsRuleModalOpen(true);
  };

  const saveRule = async () => {
    if (Number(ruleForm.tax_rate) > Number(ruleForm.commission_pool_rate)) {
      setErrorMessage('Tax % cannot exceed commission pool %.');
      setErrorOpen(true);
      return;
    }
    if (!ruleForm.name.trim()) {
      setErrorMessage('Rule name is required.');
      setErrorOpen(true);
      return;
    }
    setSavingRule(true);
    try {
      const payload = {
        name: ruleForm.name.trim(),
        commission_pool_rate: Number(ruleForm.commission_pool_rate),
        tax_rate: Number(ruleForm.tax_rate),
        is_default: ruleForm.is_default,
      };
      if (ruleForm.id) {
        await commissionRulesApi.update(ruleForm.id, payload);
      } else {
        await commissionRulesApi.create(payload);
      }
      setIsRuleModalOpen(false);
      await loadCommissionRules();
      setSuccessMessage(ruleForm.id ? 'Commission rule updated.' : 'Commission rule saved.');
      setSuccessOpen(true);
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || 'Failed to save commission rule.');
      setErrorOpen(true);
    } finally {
      setSavingRule(false);
    }
  };

  const handleSetDefaultRule = async (id: number) => {
    try {
      await commissionRulesApi.setDefault(id);
      await loadCommissionRules();
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || 'Failed to set default rule.');
      setErrorOpen(true);
    }
  };

  const confirmDeleteRule = async () => {
    if (!ruleToDelete) return;
    try {
      await commissionRulesApi.delete(ruleToDelete);
      setRuleToDelete(null);
      await loadCommissionRules();
    } catch (e: any) {
      setErrorMessage(e?.response?.data?.message || 'Cannot delete rule (it may be assigned to a service).');
      setErrorOpen(true);
      setRuleToDelete(null);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setErrorOpen(false);
    const offers = form.offers_list_text
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
    try {
      await settingsApi.update({
        offers_enabled: Boolean(form.offers_enabled),
        offers_list: offers,
        staff_leaves_enabled: Boolean(form.staff_leaves_enabled),
        staff_leave_default_days: Number(form.staff_leave_default_days),
        staff_leave_requires_approval: Boolean(form.staff_leave_requires_approval),
        business_name: form.business_name,
        default_currency: form.default_currency,
        dashboard_refresh_seconds: Number(form.dashboard_refresh_seconds),
        discount_deduction_rate: Number(form.discount_deduction_rate),
        other_deductions_rate: Number(form.other_deductions_rate),
        profit_remaining_rate: Number(form.profit_remaining_rate),
      });
      setSuccessMessage('Settings saved successfully.');
      setSuccessOpen(true);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Failed to save settings.');
      setErrorOpen(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">System Settings</h1>
            <p className="text-secondary mb-0 small">Control offers, leaves and global behavior.</p>
          </div>
          <button className="btn btn-purple rounded-pill px-4 py-2 d-flex align-items-center" onClick={saveSettings} disabled={saving || loading}>
            <FiSave className="me-2" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {loading ? (
          <div className="glass-panel rounded-4 p-4">Loading settings...</div>
        ) : (
          <div className="row g-4">
            {canManageCommissionRules ? (
            <div className="col-lg-6">
              <div className="glass-panel rounded-4 p-4 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h5 className="d-flex align-items-center mb-0"><FiPercent className="me-2" /> Commission rules</h5>
                  <button type="button" className="btn btn-sm btn-purple rounded-pill px-3" onClick={openAddRule}>
                    <FiPlus className="me-1" /> Add rule
                  </button>
                </div>
                <p className="small text-secondary mb-3">
                  Each rule sets the commission <strong>pool</strong> (% of service price) and <strong>tax</strong> (% of price withheld). Staff <strong>net</strong> = pool − tax. The spa keeps the remainder of revenue (100 − pool %).
                </p>
                {rulesLoadError ? (
                  <div className="alert alert-danger small py-2 mb-3" role="alert">
                    {rulesLoadError}
                  </div>
                ) : null}
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <thead>
                      <tr className="small text-secondary">
                        <th>Name</th>
                        <th>Pool %</th>
                        <th>Tax %</th>
                        <th>Net staff %</th>
                        <th>Spa %</th>
                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissionRules.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-secondary small py-3">No rules yet. Add one or run the database migration.</td>
                        </tr>
                      ) : (
                        commissionRules.map((r) => (
                          <tr key={r.id}>
                            <td className="fw-semibold">
                              {r.name}
                              {r.is_default ? (
                                <span className="badge bg-success bg-opacity-25 text-success ms-2 small">Default</span>
                              ) : null}
                            </td>
                            <td>{Number(r.commission_pool_rate).toFixed(1)}</td>
                            <td>{Number(r.tax_rate).toFixed(1)}</td>
                            <td>{netPct(r)}</td>
                            <td>{spaPct(r)}</td>
                            <td className="text-end text-nowrap">
                              {!r.is_default ? (
                                <button
                                  type="button"
                                  className="btn btn-link btn-sm text-warning p-1"
                                  title="Set as default"
                                  onClick={() => handleSetDefaultRule(r.id)}
                                >
                                  <FiStar />
                                </button>
                              ) : null}
                              <button type="button" className="btn btn-link btn-sm p-1" onClick={() => openEditRule(r)} title="Edit">
                                <FiEdit />
                              </button>
                              <button
                                type="button"
                                className="btn btn-link btn-sm text-danger p-1"
                                title="Delete"
                                onClick={() => setRuleToDelete(r.id)}
                              >
                                <FiTrash2 />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="small text-secondary mt-3 mb-0">
                  Assign a rule to each service under Services (optional — otherwise the <strong>default</strong> rule applies).
                </p>
              </div>
            </div>
            ) : null}

            <div className="col-lg-6">
              <div className="glass-panel rounded-4 p-4 h-100">
                <h5 className="d-flex align-items-center mb-3"><FiGift className="me-2" /> Offers & Promotions</h5>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" checked={form.offers_enabled} onChange={(e) => setForm({ ...form, offers_enabled: e.target.checked })} />
                  <label className="form-check-label small">Enable member offers</label>
                </div>
                <label className="form-label small">Offers list (one offer per line)</label>
                <textarea
                  className="form-control glass-input-simple"
                  rows={8}
                  value={form.offers_list_text}
                  onChange={(e) => setForm({ ...form, offers_list_text: e.target.value })}
                />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="glass-panel rounded-4 p-4 h-100">
                <h5 className="d-flex align-items-center mb-3"><FiUsers className="me-2" /> Staff Leave Controls</h5>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" checked={form.staff_leaves_enabled} onChange={(e) => setForm({ ...form, staff_leaves_enabled: e.target.checked })} />
                  <label className="form-check-label small">Enable leave tracking</label>
                </div>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" checked={form.staff_leave_requires_approval} onChange={(e) => setForm({ ...form, staff_leave_requires_approval: e.target.checked })} />
                  <label className="form-check-label small">Require leave approval</label>
                </div>
                <label className="form-label small">Default leave days / year</label>
                <input type="number" className="form-control glass-input-simple" value={form.staff_leave_default_days} onChange={(e) => setForm({ ...form, staff_leave_default_days: Number(e.target.value) })} />
              </div>
            </div>

            <div className="col-lg-6">
              <div className="glass-panel rounded-4 p-4 h-100">
                <h5 className="d-flex align-items-center mb-3"><FiSettings className="me-2" /> General System</h5>
                <label className="form-label small">Business Name</label>
                <input className="form-control glass-input-simple mb-3" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
                <label className="form-label small">Default Currency</label>
                <input className="form-control glass-input-simple mb-3" value={form.default_currency} onChange={(e) => setForm({ ...form, default_currency: e.target.value })} />
                <label className="form-label small">Dashboard Refresh (seconds)</label>
                <input type="number" className="form-control glass-input-simple" value={form.dashboard_refresh_seconds} onChange={(e) => setForm({ ...form, dashboard_refresh_seconds: Number(e.target.value) })} />
                <hr />
                <label className="form-label small">Discount Deduction %</label>
                <input type="number" className="form-control glass-input-simple mb-3" value={form.discount_deduction_rate} onChange={(e) => setForm({ ...form, discount_deduction_rate: Number(e.target.value) })} />
                <label className="form-label small">Other Deductions %</label>
                <input type="number" className="form-control glass-input-simple mb-3" value={form.other_deductions_rate} onChange={(e) => setForm({ ...form, other_deductions_rate: Number(e.target.value) })} />
                <label className="form-label small">Profit Remaining % (of 100)</label>
                <input type="number" className="form-control glass-input-simple" value={form.profit_remaining_rate} onChange={(e) => setForm({ ...form, profit_remaining_rate: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        )}
      </div>

      <AdminModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
        title={ruleForm.id ? 'Edit commission rule' : 'New commission rule'}
        subtitle="Pool and tax are % of service price; net staff % = pool − tax."
        isDarkMode={isDarkMode}
      >
        <div className="mb-3">
          <label className="form-label small">Rule name</label>
          <input
            type="text"
            className="form-control glass-input-simple"
            value={ruleForm.name}
            onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
            placeholder="e.g. Standard therapists"
          />
        </div>
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label small">Commission pool %</label>
            <input
              type="number"
              className="form-control glass-input-simple"
              value={ruleForm.commission_pool_rate}
              onChange={(e) => setRuleForm({ ...ruleForm, commission_pool_rate: Number(e.target.value) })}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small">Tax %</label>
            <input
              type="number"
              className="form-control glass-input-simple"
              value={ruleForm.tax_rate}
              onChange={(e) => setRuleForm({ ...ruleForm, tax_rate: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={ruleForm.is_default}
            onChange={(e) => setRuleForm({ ...ruleForm, is_default: e.target.checked })}
            id="rule-default"
          />
          <label className="form-check-label small" htmlFor="rule-default">
            Default rule (used when a service has no specific rule)
          </label>
        </div>
        <div className="small text-secondary mb-3">
          Net staff %:{' '}
          <strong>
            {Math.max(0, Number(ruleForm.commission_pool_rate) - Number(ruleForm.tax_rate)).toFixed(1)}
          </strong>
          {' · '}
          Spa retention %: <strong>{Math.max(0, 100 - Number(ruleForm.commission_pool_rate)).toFixed(1)}</strong>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary rounded-pill" onClick={() => setIsRuleModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-purple rounded-pill px-4" disabled={savingRule} onClick={saveRule}>
            {savingRule ? 'Saving…' : 'Save rule'}
          </button>
        </div>
      </AdminModal>

      <ConfirmModal
        isOpen={ruleToDelete !== null}
        onClose={() => setRuleToDelete(null)}
        onConfirm={confirmDeleteRule}
        title="Delete commission rule"
        message="Delete this rule? Services using it must be reassigned first."
        confirmText="Delete"
        isDarkMode={isDarkMode}
      />

      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} message={successMessage} isDarkMode={isDarkMode} />
      <FeedbackModal isOpen={errorOpen} onClose={() => setErrorOpen(false)} title="Save Failed" message={errorMessage} variant="error" isDarkMode={isDarkMode} />
    </AdminLayout>
  );
};

export default SettingsPage;
