import React, { useState, useEffect, useContext } from 'react';
import { FiEdit, FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import SuccessModal from '../../components/admin/SuccessModal';
import { rewardApi } from '../../api/rewards';

const RewardsManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);

  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingReward, setEditingReward] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_required: '',
    stock: '',
    image_path: '',
    status: 'Active',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchRewards = async () => {
    setFetchLoading(true);
    try {
      const res = await rewardApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];
      setRewards(Array.isArray(data) ? data : []);
    } catch {
      setRewards([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchRedemptions = async () => {
    setHistoryLoading(true);
    try {
      const res = await rewardApi.getAllHistory();
      const data = res?.data?.data ?? res?.data ?? [];
      setRedemptions(Array.isArray(data) ? data : []);
    } catch {
      setRedemptions([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') fetchRedemptions();
  }, [activeTab]);

  const resetForm = () => {
    setFormData({ name: '', description: '', points_required: '', stock: '', image_path: '', status: 'Active' });
    setEditingReward(null);
  };

  const openCreate = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEdit = (reward: any) => {
    setFormData({
      name: reward.name || '',
      description: reward.description || '',
      points_required: String(reward.points_required || ''),
      stock: String(reward.stock ?? ''),
      image_path: reward.image_path || '',
      status: reward.status || 'Active',
    });
    setEditingReward(reward);
    setShowFormModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        points_required: formData.points_required || '0',
        stock: formData.stock || '0',
        image_path: formData.image_path.trim(),
        status: formData.status,
      };
      if (editingReward) {
        await rewardApi.update(editingReward.id, payload);
        setSuccessMsg('Reward updated successfully');
      } else {
        await rewardApi.create(payload);
        setSuccessMsg('Reward created successfully');
      }
      setShowFormModal(false);
      resetForm();
      setShowSuccess(true);
      await fetchRewards();
    } catch {
      setSuccessMsg('Operation failed');
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (reward: any) => {
    setDeleteTarget(reward);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await rewardApi.delete(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setSuccessMsg('Reward deleted successfully');
      setShowSuccess(true);
      await fetchRewards();
    } catch {
      setShowDeleteConfirm(false);
      setSuccessMsg('Failed to delete reward');
      setShowSuccess(true);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label small fw-bold text-uppercase text-secondary">Name</label>
          <input type="text" name="name" className="form-control glass-input-premium" required value={formData.name} onChange={handleChange} placeholder="e.g. Free Hair Wash" />
        </div>
        <div className="col-12">
          <label className="form-label small fw-bold text-uppercase text-secondary">Description</label>
          <textarea name="description" className="form-control glass-input-premium" rows={3} value={formData.description} onChange={handleChange} placeholder="Describe what this reward offers..." />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Points Required</label>
          <input type="number" name="points_required" className="form-control glass-input-premium" min="0" step="1" value={formData.points_required} onChange={handleChange} placeholder="e.g. 500" />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Stock (0 = unlimited)</label>
          <input type="number" name="stock" className="form-control glass-input-premium" min="0" step="1" value={formData.stock} onChange={handleChange} placeholder="0 for unlimited" />
          <small className="text-secondary opacity-50">Set to 0 if this reward has no quantity limit</small>
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Image Path (optional)</label>
          <input type="text" name="image_path" className="form-control glass-input-premium" value={formData.image_path} onChange={handleChange} placeholder="/images/rewards/wash.png" />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Status</label>
          <select name="status" className="form-select glass-input-premium" value={formData.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="mt-4 d-flex justify-content-end gap-2">
        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowFormModal(false)}>Cancel</button>
        <button type="submit" className="btn btn-purple rounded-pill px-4" disabled={loading}>
          {loading ? 'Saving...' : (editingReward ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );

  const columns = [
    { header: 'Name' },
    { header: 'Points' },
    { header: 'Stock' },
    { header: 'Status' },
    { header: '', align: 'end' as const },
  ];

  const historyColumns = [
    { header: 'Member' },
    { header: 'Reward' },
    { header: 'Points' },
    { header: 'Status' },
    { header: 'Date' },
  ];

  return (
    <AdminLayout>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="Oswald fw-bold mb-1">Rewards</h4>
          <p className="text-secondary small mb-0 Outfit">Manage loyalty rewards catalogue and track redemptions</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'rewards' ? 'btn-purple' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('rewards')}
          >
            Rewards
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'history' ? 'btn-purple' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('history')}
          >
            Redemption History
          </button>
        </div>
      </div>

      {activeTab === 'rewards' && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-purple rounded-pill px-4 d-flex align-items-center gap-2" onClick={openCreate}>
              <FiPlus size={16} /> New Reward
            </button>
          </div>

          <div className={`rounded-4 p-4 ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
            <AdminTable
              columns={columns}
              data={rewards}
              loading={fetchLoading}
              isDarkMode={isDarkMode}
              renderRow={(item: any) => (
                <tr key={item.id}>
                  <td className="py-3 border-0 fw-semibold">{item.name}</td>
                  <td className="py-3 border-0">{Number(item.points_required || 0).toLocaleString()}</td>
                  <td className="py-3 border-0">
                    {item.stock > 0
                      ? <span className={item.stock <= 3 ? 'text-danger fw-bold' : ''}>{item.stock} left</span>
                      : <span className="text-secondary">Unlimited</span>}
                  </td>
                  <td className="py-3 border-0">
                    <span className={`badge ${item.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 border-0 text-end">
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => openEdit(item)} title="Edit">
                      <FiEdit size={14} />
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => requestDelete(item)} title="Delete">
                      <FiTrash2 size={14} />
                    </button>
                  </td>
                </tr>
              )}
            />
          </div>
        </>
      )}

      {activeTab === 'history' && (
        <div className={`rounded-4 p-4 ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="m-0 fw-bold">Redemption Log</h5>
            <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1" onClick={fetchRedemptions}>
              <FiRefreshCw size={12} /> Refresh
            </button>
          </div>
          <AdminTable
            columns={historyColumns}
            data={redemptions}
            loading={historyLoading}
            isDarkMode={isDarkMode}
            renderRow={(item: any) => (
              <tr key={item.id}>
                <td className="py-3 border-0">{item.member_name || item.member_email || `Member #${item.member_id}`}</td>
                <td className="py-3 border-0">{item.reward_name || `Reward #${item.reward_id}`}</td>
                <td className="py-3 border-0">{Number(item.points_spent || 0).toLocaleString()}</td>
                <td className="py-3 border-0">
                  <span className={`badge ${item.status === 'Approved' ? 'bg-success' : item.status === 'Rejected' ? 'bg-danger' : item.status === 'Cancelled' ? 'bg-secondary' : 'bg-warning text-dark'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3 border-0 text-secondary small">{item.created_at ? new Date(item.created_at).toLocaleString() : '—'}</td>
              </tr>
            )}
          />
        </div>
      )}

      <AdminModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingReward ? 'Edit Reward' : 'New Reward'} isDarkMode={isDarkMode}>
        {renderForm()}
      </AdminModal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Reward"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Success" message={successMsg} />
    </AdminLayout>
  );
};

export default RewardsManagementPage;
