import React, { useContext, useEffect, useState } from 'react';
import { FiCheck, FiEdit, FiEye, FiMoreHorizontal, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import SuccessModal from '../../components/admin/SuccessModal';
import { expensesApi } from '../../api/expenses';
import { getCurrentAdminRole, canFullyManageExpenses } from '../../adminAccess';

const emptyForm = () => ({
  name: '',
  expense_date: new Date().toISOString().slice(0, 10),
  purpose: '',
  transaction_code: '',
  amount: '',
});

const ExpensesManagementPage: React.FC = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const role = getCurrentAdminRole();
  const fullAccess = canFullyManageExpenses(role);

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [viewExpense, setViewExpense] = useState<any | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmExpenseOpen, setConfirmExpenseOpen] = useState(false);
  const [pendingConfirmId, setPendingConfirmId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await expensesApi.getAll();
      const list = res.data?.data ?? res.data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setFormData(emptyForm());
    setFormModalOpen(true);
  };

  const openEdit = (exp: any) => {
    setEditing(exp);
    setFormData({
      name: exp.name || '',
      expense_date: String(exp.expense_date || '').slice(0, 10),
      purpose: exp.purpose || '',
      transaction_code: exp.transaction_code || '',
      amount: String(exp.amount ?? ''),
    });
    setFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(String(formData.amount).replace(/,/g, ''));
    if (!formData.name.trim() || !formData.expense_date || !formData.purpose.trim()) {
      setSuccessMessage('Please fill name, date, and purpose.');
      setSuccessOpen(true);
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setSuccessMessage('Enter a valid amount.');
      setSuccessOpen(true);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        expense_date: formData.expense_date,
        purpose: formData.purpose.trim(),
        transaction_code: formData.transaction_code.trim(),
        amount,
      };
      if (editing) {
        await expensesApi.update(editing.id, payload);
        setSuccessMessage('Expense updated.');
      } else {
        await expensesApi.create(payload);
        setSuccessMessage('Expense added (pending confirmation).');
      }
      setSuccessOpen(true);
      setFormModalOpen(false);
      await fetchData();
    } catch (err: any) {
      setSuccessMessage(err?.response?.data?.message || 'Could not save expense.');
      setSuccessOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await expensesApi.delete(deleteId);
      setSuccessMessage('Expense deleted.');
      setSuccessOpen(true);
      await fetchData();
    } catch (err: any) {
      setSuccessMessage(err?.response?.data?.message || 'Delete failed.');
      setSuccessOpen(true);
    } finally {
      setDeleteId(null);
      setConfirmDeleteOpen(false);
    }
  };

  const runConfirm = async () => {
    if (!pendingConfirmId) return;
    try {
      await expensesApi.confirm(pendingConfirmId);
      setSuccessMessage('Expense confirmed.');
      setSuccessOpen(true);
      await fetchData();
    } catch (err: any) {
      setSuccessMessage(err?.response?.data?.message || 'Confirm failed.');
      setSuccessOpen(true);
    } finally {
      setPendingConfirmId(null);
      setConfirmExpenseOpen(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <h1 className="brand-title text-gradient h2 mb-1">Expenses</h1>
            <p className="text-secondary small mb-0">
              Record operational expenses. New entries stay <strong>pending</strong> until a manager or owner confirms them.
            </p>
          </div>
          <button type="button" className="btn btn-purple rounded-pill px-4 py-2 fw-bold" onClick={openCreate}>
            <FiPlus className="me-2" /> ADD EXPENSE
          </button>
        </div>

        <AdminTable
          isDarkMode={isDarkMode}
          data={rows}
          columns={[
            { header: 'Name' },
            { header: 'Date' },
            { header: 'Purpose' },
            { header: 'TX Code' },
            { header: 'Amount', align: 'end' },
            { header: 'Status', align: 'center' },
            { header: 'Action', align: 'end' },
          ]}
          renderRow={(exp: any) => (
            <tr key={exp.id} className="align-middle border-bottom border-opacity-10">
              <td className="py-3">
                <div className="fw-bold small">{exp.name}</div>
                {exp.created_by_name && (
                  <div className="small text-muted">By {exp.created_by_name}</div>
                )}
              </td>
              <td className="py-3 small">{exp.expense_date ? String(exp.expense_date).slice(0, 10) : '—'}</td>
              <td className="py-3 small" style={{ maxWidth: 240 }}>
                <span className="text-truncate d-inline-block" style={{ maxWidth: 220 }} title={exp.purpose}>
                  {exp.purpose || '—'}
                </span>
              </td>
              <td className="py-3 small font-monospace">{exp.transaction_code || '—'}</td>
              <td className="py-3 text-end fw-bold">
                KES {parseFloat(String(exp.amount || 0).replace(/,/g, '')).toLocaleString()}
              </td>
              <td className="py-3 text-center">
                <span
                  className={`badge rounded-pill ${
                    exp.status === 'confirmed' ? 'bg-success' : 'bg-warning text-dark'
                  }`}
                >
                  {exp.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </span>
              </td>
              <td className="py-3 text-end text-nowrap">
                <div className="dropdown">
                  <button
                    type="button"
                    className={`btn btn-sm p-2 rounded-circle border-0 ${isDarkMode ? 'text-white hover-bg-white-10' : 'text-dark hover-bg-black-10'}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="Expense actions"
                  >
                    <FiMoreHorizontal size={18} />
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}
                  >
                    <li>
                      <h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Actions</h6>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item d-flex align-items-center py-2"
                        onClick={() => setViewExpense(exp)}
                      >
                        <FiEye className="me-2" /> View
                      </button>
                    </li>
                    {fullAccess && exp.status === 'pending' && (
                      <li>
                        <button
                          type="button"
                          className="dropdown-item d-flex align-items-center py-2 text-success"
                          onClick={() => {
                            setPendingConfirmId(exp.id);
                            setConfirmExpenseOpen(true);
                          }}
                        >
                          <FiCheck className="me-2" /> Confirm
                        </button>
                      </li>
                    )}
                    {fullAccess && exp.status !== 'confirmed' && (
                      <>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item d-flex align-items-center py-2"
                            onClick={() => openEdit(exp)}
                          >
                            <FiEdit className="me-2" /> Edit
                          </button>
                        </li>
                        <li>
                          <hr className="dropdown-divider opacity-10" />
                        </li>
                        <li>
                          <button
                            type="button"
                            className="dropdown-item d-flex align-items-center py-2 text-danger"
                            onClick={() => {
                              setDeleteId(exp.id);
                              setConfirmDeleteOpen(true);
                            }}
                          >
                            <FiTrash2 className="me-2" /> Delete
                          </button>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      <AdminModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editing ? 'Edit expense' : 'Add expense'}
        subtitle="Pending until confirmed by a manager or owner"
        isDarkMode={isDarkMode}
        maxWidth="640px"
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-uppercase text-secondary">Name</label>
              <input
                className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-uppercase text-secondary">Date</label>
              <input
                type="date"
                className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-uppercase text-secondary">Purpose</label>
              <textarea
                className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                rows={3}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-uppercase text-secondary">Transaction code</label>
              <input
                className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={formData.transaction_code}
                onChange={(e) => setFormData({ ...formData, transaction_code: e.target.value })}
                placeholder="Reference / M-Pesa code"
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-uppercase text-secondary">Amount (KES)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-control ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setFormModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-purple rounded-pill px-4 fw-bold" disabled={loading}>
              {loading ? 'Saving…' : editing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={!!viewExpense}
        onClose={() => setViewExpense(null)}
        title="Expense details"
        subtitle={viewExpense?.name || ''}
        isDarkMode={isDarkMode}
        maxWidth="560px"
      >
        {viewExpense ? (
          <div className="small">
            <div className="mb-2">
              <strong>Date:</strong> {String(viewExpense.expense_date || '').slice(0, 10)}
            </div>
            <div className="mb-2">
              <strong>Amount:</strong> KES{' '}
              {parseFloat(String(viewExpense.amount || 0).replace(/,/g, '')).toLocaleString()}
            </div>
            <div className="mb-2">
              <strong>Transaction code:</strong> {viewExpense.transaction_code || '—'}
            </div>
            <div className="mb-2">
              <strong>Status:</strong>{' '}
              <span className="text-capitalize">{viewExpense.status}</span>
            </div>
            <div className="mb-2">
              <strong>Purpose:</strong>
              <p className="mb-0 mt-1">{viewExpense.purpose}</p>
            </div>
            {viewExpense.created_by_name && (
              <div className="mb-2 text-muted">Recorded by: {viewExpense.created_by_name}</div>
            )}
            {viewExpense.status === 'confirmed' && viewExpense.confirmed_at && (
              <div className="mb-1">
                Confirmed {new Date(viewExpense.confirmed_at).toLocaleString()}
                {viewExpense.confirmed_by_name ? ` · ${viewExpense.confirmed_by_name}` : ''}
              </div>
            )}
            <button type="button" className="btn btn-purple rounded-pill mt-3" onClick={() => setViewExpense(null)}>
              Close
            </button>
          </div>
        ) : null}
      </AdminModal>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleDelete}
        title="Delete expense"
        message="Delete this expense permanently?"
        confirmText="Delete"
        isDarkMode={isDarkMode}
      />

      <ConfirmModal
        isOpen={confirmExpenseOpen}
        onClose={() => {
          setConfirmExpenseOpen(false);
          setPendingConfirmId(null);
        }}
        onConfirm={runConfirm}
        title="Confirm expense"
        message="Mark this expense as confirmed? This indicates finance approval."
        confirmText="Confirm"
        isDarkMode={isDarkMode}
      />

      <SuccessModal isOpen={successOpen} onClose={() => setSuccessOpen(false)} message={successMessage} isDarkMode={isDarkMode} />
    </AdminLayout>
  );
};

export default ExpensesManagementPage;
