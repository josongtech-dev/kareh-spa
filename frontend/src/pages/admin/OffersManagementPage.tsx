import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit, FiGift, FiPlus, FiTrash2 } from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import AdminModal from '../../components/admin/AdminModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import SuccessModal from '../../components/admin/SuccessModal';
import FeedbackModal from '../../components/admin/FeedbackModal';
import { offersApi } from '../../api/offers';
import { serviceApi } from '../../api/services';

const toLocalDateTimeInput = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const OffersManagementPage: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percent' as 'percent' | 'amount',
    discount_value: '',
    starts_at: '',
    ends_at: '',
    status: 'Active' as 'Active' | 'Inactive',
    service_ids: [] as number[],
  });

  const serviceNameById = useMemo(() => {
    const map: Record<number, string> = {};
    services.forEach((s: any) => { map[Number(s.id)] = String(s.name || 'Service'); });
    return map;
  }, [services]);

  const fetchData = async () => {
    try {
      const [offersRes, servicesRes] = await Promise.all([offersApi.getAll(), serviceApi.getAll()]);
      const offerRows = offersRes.data?.data || offersRes.data || [];
      const serviceRows = servicesRes.data?.data || servicesRes.data || [];
      setOffers(Array.isArray(offerRows) ? offerRows : []);
      setServices(Array.isArray(serviceRows) ? serviceRows : []);
    } catch (error) {
      console.error('Failed to load offers page', error);
      setIsErrorOpen(true);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingOffer(null);
    setFormData({
      name: '',
      description: '',
      discount_type: 'percent',
      discount_value: '',
      starts_at: '',
      ends_at: '',
      status: 'Active',
      service_ids: [],
    });
    setIsModalOpen(true);
  };

  const openEdit = (offer: any) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name || '',
      description: offer.description || '',
      discount_type: offer.discount_type === 'amount' ? 'amount' : 'percent',
      discount_value: String(offer.discount_value ?? ''),
      starts_at: toLocalDateTimeInput(offer.starts_at),
      ends_at: toLocalDateTimeInput(offer.ends_at),
      status: offer.status === 'Inactive' ? 'Inactive' : 'Active',
      service_ids: Array.isArray(offer.service_ids) ? offer.service_ids.map((id: any) => Number(id)).filter((id: number) => id > 0) : [],
    });
    setIsModalOpen(true);
  };

  const toggleService = (serviceId: number) => {
    setFormData((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.service_ids.length === 0) {
      setIsErrorOpen(true);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value || 0),
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString().slice(0, 19).replace('T', ' ') : null,
        ends_at: formData.ends_at ? new Date(formData.ends_at).toISOString().slice(0, 19).replace('T', ' ') : null,
        status: formData.status,
        service_ids: formData.service_ids,
      };
      if (editingOffer) {
        await offersApi.update(editingOffer.id, payload);
        setSuccessMessage('Offer updated successfully.');
      } else {
        await offersApi.create(payload as any);
        setSuccessMessage('Offer created successfully.');
      }
      setIsSuccessOpen(true);
      setIsModalOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Failed to save offer', error);
      setIsErrorOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!offerToDelete) return;
    try {
      await offersApi.delete(offerToDelete);
      setSuccessMessage('Offer deleted successfully.');
      setIsSuccessOpen(true);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete offer', error);
      setIsErrorOpen(true);
    } finally {
      setOfferToDelete(null);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="brand-title text-gradient h2 mb-1">Service Offers</h1>
            <p className="text-secondary small mb-0">Create offers for one or multiple services. Billing uses offer prices; commissions remain on base prices.</p>
          </div>
          <button className="btn btn-purple rounded-pill px-4 py-2 fw-bold" onClick={openCreate}>
            <FiPlus className="me-2" /> ADD OFFER
          </button>
        </div>

        <AdminTable
          isDarkMode={false}
          data={offers}
          columns={[
            { header: 'Offer' },
            { header: 'Discount' },
            { header: 'Period' },
            { header: 'Services' },
            { header: 'Status' },
            { header: 'Action', align: 'end' },
          ]}
          renderRow={(offer: any) => (
            <tr key={offer.id} className="align-middle">
              <td className="py-3">
                <div className="fw-bold">{offer.name}</div>
                <div className="small text-secondary">{offer.description || 'No description'}</div>
              </td>
              <td className="py-3">
                {offer.discount_type === 'amount' ? `KES ${Number(offer.discount_value || 0).toLocaleString()}` : `${Number(offer.discount_value || 0)}%`}
              </td>
              <td className="py-3 small">
                <div>From: {offer.starts_at ? new Date(offer.starts_at).toLocaleString() : 'Now'}</div>
                <div>To: {offer.ends_at ? new Date(offer.ends_at).toLocaleString() : 'No end date'}</div>
              </td>
              <td className="py-3 small">
                {(offer.service_ids || [])
                  .map((sid: number) => serviceNameById[Number(sid)] || `Service #${sid}`)
                  .slice(0, 4)
                  .join(', ') || 'No services'}
                {(offer.service_ids || []).length > 4 ? ' ...' : ''}
              </td>
              <td className="py-3">
                <span className={`badge rounded-pill ${offer.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>{offer.status}</span>
              </td>
              <td className="py-3 text-end">
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(offer)}><FiEdit /></button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => { setOfferToDelete(offer.id); setIsDeleteConfirmOpen(true); }}><FiTrash2 /></button>
              </td>
            </tr>
          )}
        />
      </div>

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOffer ? 'Edit Offer' : 'Create Offer'}
        subtitle="Offers only reduce client payable; commissions still use main price."
        isDarkMode={false}
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-8">
              <label className="form-label small fw-bold">Offer Name</label>
              <input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Status</label>
              <select className="form-select" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold">Description</label>
              <textarea className="form-control" rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Discount Type</label>
              <select className="form-select" value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value as 'percent' | 'amount' })}>
                <option value="percent">Percent (%)</option>
                <option value="amount">Amount (KES)</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Discount Value</label>
              <input type="number" step="0.01" min="0" className="form-control" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })} required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold">Offer Period</label>
              <div className="small text-secondary pt-2">Set start/end below</div>
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Starts At</label>
              <input type="datetime-local" className="form-control" value={formData.starts_at} onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })} />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold">Ends At</label>
              <input type="datetime-local" className="form-control" value={formData.ends_at} onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })} />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold d-flex align-items-center"><FiGift className="me-2" />Services for this Offer</label>
              <div className="border rounded-3 p-2" style={{ maxHeight: 220, overflowY: 'auto' }}>
                {services.map((s: any) => (
                  <div className="form-check" key={s.id}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`offer-service-${s.id}`}
                      checked={formData.service_ids.includes(Number(s.id))}
                      onChange={() => toggleService(Number(s.id))}
                    />
                    <label className="form-check-label" htmlFor={`offer-service-${s.id}`}>
                      {s.name} (KES {Number(String(s.price || 0).replace(/,/g, '')).toLocaleString()})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-purple rounded-pill px-4 fw-bold" disabled={loading}>
              {loading ? 'Saving...' : editingOffer ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      </AdminModal>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => { setIsDeleteConfirmOpen(false); setOfferToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Offer"
        message="Are you sure you want to delete this offer?"
        confirmText="Delete"
        isDarkMode={false}
      />

      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} message={successMessage} isDarkMode={false} />
      <FeedbackModal isOpen={isErrorOpen} onClose={() => setIsErrorOpen(false)} title="Offer Action Failed" message="Failed to complete offer action. Please try again." variant="error" isDarkMode={false} />
    </AdminLayout>
  );
};

export default OffersManagementPage;
