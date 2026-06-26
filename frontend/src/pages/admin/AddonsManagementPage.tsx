import React, { useState, useEffect, useContext } from 'react';
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import SuccessModal from '../../components/admin/SuccessModal';
import { addonApi } from '../../api/addons';

const AddonsManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);

  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingAddon, setEditingAddon] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    material_price: '',
    labour_price: '',
    bulk_after: '',
    bulk_labour_price: '',
    status: 'Active',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAddons = async () => {
    setFetchLoading(true);
    try {
      const res = await addonApi.getAll();
      const data = res?.data?.data ?? res?.data ?? [];
      setAddons(Array.isArray(data) ? data : []);
    } catch {
      setAddons([]);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchAddons();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', material_price: '', labour_price: '', bulk_after: '', bulk_labour_price: '', status: 'Active' });
    setEditingAddon(null);
  };

  const openCreate = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEdit = (addon: any) => {
    setFormData({
      name: addon.name || '',
      material_price: String(addon.material_price || ''),
      labour_price: String(addon.labour_price || ''),
      bulk_after: addon.bulk_after !== null && addon.bulk_after !== undefined ? String(addon.bulk_after) : '',
      bulk_labour_price: addon.bulk_labour_price !== null && addon.bulk_labour_price !== undefined ? String(addon.bulk_labour_price) : '',
      status: addon.status || 'Active',
    });
    setEditingAddon(addon);
    setShowFormModal(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        material_price: formData.material_price || '0',
        labour_price: formData.labour_price || '0',
        bulk_after: formData.bulk_after || '',
        bulk_labour_price: formData.bulk_labour_price || '',
        status: formData.status,
      };
      if (editingAddon) {
        await addonApi.update(editingAddon.id, payload);
        setSuccessMsg('Addon updated successfully');
      } else {
        await addonApi.create(payload);
        setSuccessMsg('Addon created successfully');
      }
      setShowFormModal(false);
      resetForm();
      setShowSuccess(true);
      await fetchAddons();
    } catch {
      setSuccessMsg('Operation failed');
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (addon: any) => {
    setDeleteTarget(addon);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await addonApi.delete(deleteTarget.id);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      setSuccessMsg('Addon deleted successfully');
      setShowSuccess(true);
      await fetchAddons();
    } catch {
      setShowDeleteConfirm(false);
      setSuccessMsg('Failed to delete addon');
      setShowSuccess(true);
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label small fw-bold text-uppercase text-secondary">Name</label>
          <input type="text" name="name" className="form-control glass-input-premium" required value={formData.name} onChange={handleChange} placeholder="e.g. Extra Dye" />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Material Price (KES)</label>
          <input type="number" name="material_price" className="form-control glass-input-premium" min="0" step="0.01" value={formData.material_price} onChange={handleChange} placeholder="0.00" />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Labour Price (KES)</label>
          <input type="number" name="labour_price" className="form-control glass-input-premium" min="0" step="0.01" value={formData.labour_price} onChange={handleChange} placeholder="0.00" />
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Bulk After (units)</label>
          <input type="number" name="bulk_after" className="form-control glass-input-premium" min="1" step="1" value={formData.bulk_after} onChange={handleChange} placeholder="Leave empty for no bulk tier" />
          <small className="text-secondary opacity-50">Labour price drops after this many units</small>
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-bold text-uppercase text-secondary">Bulk Labour Price (KES)</label>
          <input type="number" name="bulk_labour_price" className="form-control glass-input-premium" min="0" step="0.01" value={formData.bulk_labour_price} onChange={handleChange} placeholder="Reduced labour per unit" />
          <small className="text-secondary opacity-50">Labour price per unit after bulk threshold</small>
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
          {loading ? 'Saving...' : (editingAddon ? 'Update' : 'Create')}
        </button>
      </div>
    </form>
  );

  const columns = [
    { header: 'Name' },
    { header: 'Material' },
    { header: 'Labour' },
    { header: 'Bulk Tier' },
    { header: 'Status' },
    { header: '', align: 'end' as const },
  ];

  return (
    <AdminLayout>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="Oswald fw-bold mb-1">Add-ons</h4>
          <p className="text-secondary small mb-0 Outfit">Manage billable extras (extra dye, extra braids, etc.)</p>
        </div>
        <button className="btn btn-purple rounded-pill px-4 d-flex align-items-center gap-2" onClick={openCreate}>
          <FiPlus size={16} /> New Add-on
        </button>
      </div>

      <div className={`rounded-4 p-4 ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
        <AdminTable
          columns={columns}
          data={addons}
          loading={fetchLoading}
          isDarkMode={isDarkMode}
          renderRow={(item: any) => (
            <tr key={item.id}>
              <td className="py-3 border-0 fw-semibold">{item.name}</td>
              <td className="py-3 border-0">KES {Number(item.material_price || 0).toLocaleString()}</td>
              <td className="py-3 border-0">KES {Number(item.labour_price || 0).toLocaleString()}</td>
              <td className="py-3 border-0">
                {item.bulk_after
                  ? `After ${item.bulk_after} → KES ${Number(item.bulk_labour_price || 0).toLocaleString()}`
                  : '—'}
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

      <AdminModal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingAddon ? 'Edit Add-on' : 'New Add-on'} isDarkMode={isDarkMode}>
        {renderForm()}
      </AdminModal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Add-on"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />

      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Success" message={successMsg} />
    </AdminLayout>
  );
};

export default AddonsManagementPage;
