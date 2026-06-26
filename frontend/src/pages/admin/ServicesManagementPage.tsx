import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { serviceApi } from '../../api/services';
import { commissionRulesApi, commissionRulesFromResponse, type CommissionRule } from '../../api/commissionRules';
import { 
  FiPlus, FiLayers, FiSearch, FiMoreHorizontal, 
  FiEdit, FiTrash2, FiClock, FiTag, 
  FiDollarSign, FiChevronDown, FiCheckCircle, FiX, FiEye, FiPercent, FiImage
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import SuccessModal from '../../components/admin/SuccessModal';
import FeedbackModal from '../../components/admin/FeedbackModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import AdminTable from '../../components/admin/AdminTable';
import { canManageServices, getCurrentAdminRole, isAttendant } from '../../adminAccess';
import { backendAssetUrl } from '../../api/config';
import ServiceImageThumb from '../../components/ServiceImageThumb';

const SERVICE_CATALOG_UPDATED_EVENT = 'service-catalog-updated';

const ServicesManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const currentRole = getCurrentAdminRole();
  const canManage = canManageServices(currentRole);
  const attendantReadOnly = isAttendant(currentRole);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: '',
    price: '',
    description: '',
    status: 'Active',
    commission_rule_id: '' as string | number
  });
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [serviceImagePreviewUrl, setServiceImagePreviewUrl] = useState<string | null>(null);
  const [removeServiceImage, setRemoveServiceImage] = useState(false);
  const serviceImageInputRef = useRef<HTMLInputElement>(null);

  // DB Services Data
  const [services, setServices] = useState<any[]>([]);
  const [categoryCatalog, setCategoryCatalog] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryFormName, setCategoryFormName] = useState('');
  const [commissionRulesList, setCommissionRulesList] = useState<CommissionRule[]>([]);
  const [commissionRulesLoading, setCommissionRulesLoading] = useState(false);

  const fetchCommissionRules = async () => {
    setCommissionRulesLoading(true);
    try {
      const res = await commissionRulesApi.getAll();
      setCommissionRulesList(commissionRulesFromResponse(res));
    } catch (error) {
      console.error('Error fetching commission rules:', error);
      setCommissionRulesList([]);
    } finally {
      setCommissionRulesLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await serviceApi.getAll();
      const statusClasses: Record<string, string> = {
        'Active': 'text-success',
        'Inactive': 'text-secondary'
      };
      
      const data = response.data?.data || response.data || [];
      const dataArray = Array.isArray(data) ? data : [];
      
      const formattedServices = dataArray.map((service: any) => {
        const normalizedCategory = String(
          service.category_name || service.category || ''
        ).trim();
        return {
          ...service,
          // Normalize category label so UI works with both legacy and category_id schemas.
          category: normalizedCategory,
          category_name: normalizedCategory,
          statusClass: statusClasses[service.status] || 'text-secondary'
        };
      });
      setServices(formattedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await serviceApi.getCategories();
      const payload = response.data?.data || response.data || [];
      const categoryList = (Array.isArray(payload) ? payload : [])
        .map((category: any) =>
          String(category?.name || category?.category || category || '').trim()
        )
        .filter(Boolean);
      setCategoryCatalog(Array.from(new Set(categoryList)));
    } catch (error) {
      console.error('Error fetching service categories:', error);
      setCategoryCatalog([]);
    }
  };

  const notifyServiceCatalogUpdated = () => {
    window.dispatchEvent(new CustomEvent(SERVICE_CATALOG_UPDATED_EVENT));
  };

  useEffect(() => {
    fetchServices();
    fetchServiceCategories();
    if (canManage) {
      fetchCommissionRules();
    }
  }, []);

  useEffect(() => {
    if (!serviceImageFile) {
      setServiceImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(serviceImageFile);
    setServiceImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [serviceImageFile]);

  const resetServiceImageFields = () => {
    setServiceImageFile(null);
    setRemoveServiceImage(false);
    setServiceImagePreviewUrl(null);
    if (serviceImageInputRef.current) {
      serviceImageInputRef.current.value = '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    setCategorySaving(true);
    try {
      await serviceApi.createCategory({ name, status: 'Active' });
      await fetchServiceCategories();
      setFormData((prev) => ({ ...prev, category: name }));
      setNewCategoryName('');
      setSuccessMessage('Category saved successfully.');
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error creating category:', error);
      setIsFeedbackModalOpen(true);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleCreateCategoryFromLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = categoryFormName.trim();
    if (!name) return;
    setCategorySaving(true);
    try {
      await serviceApi.createCategory({ name, status: 'Active' });
      await fetchServiceCategories();
      setCategoryFormName('');
      setIsCategoryModalOpen(false);
      setFormData((prev) => ({ ...prev, category: name }));
      setSuccessMessage('Category created and saved to database.');
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error('Error creating category from link:', error);
      setIsFeedbackModalOpen(true);
    } finally {
      setCategorySaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const priceStr = String(formData.price).replace(/,/g, '');
      const commissionRulePayload =
        formData.commission_rule_id === '' || formData.commission_rule_id === null
          ? null
          : Number(formData.commission_rule_id);

      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('description', formData.description ?? '');
      fd.append('price', priceStr);
      fd.append('duration', formData.duration);
      fd.append('category', formData.category);
      fd.append('status', formData.status);
      fd.append(
        'commission_rule_id',
        commissionRulePayload === null ? '' : String(commissionRulePayload)
      );
      if (serviceImageFile) {
        fd.append('service_image', serviceImageFile);
      }
      if (editingService && removeServiceImage) {
        fd.append('remove_image', '1');
      }

      if (editingService) {
        await serviceApi.update(editingService.id, fd);
      } else {
        await serviceApi.create(fd);
      }
      notifyServiceCatalogUpdated();
      setLoading(false);
      setIsModalOpen(false);
      
      // Show success modal
      setSuccessMessage(editingService ? 'Service has been updated successfully.' : "The new service has been successfully published to the catalog.");
      setIsSuccessModalOpen(true);
      setEditingService(null);
      resetServiceImageFields();
      
      setFormData({
        name: '',
        category: '',
        duration: '',
        price: '',
        description: '',
        status: 'Active',
        commission_rule_id: ''
      });
      fetchServices();
    } catch (error) {
      console.error('Error creating service:', error);
      setLoading(false);
      setIsFeedbackModalOpen(true);
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'Active' ? <FiCheckCircle className="me-1" /> : <FiX className="me-1" />;
  };

  const toggleStatus = async (id: number, newStatus: string) => {
    try {
      await serviceApi.update(id, { status: newStatus });
      notifyServiceCatalogUpdated();
      await fetchServices();
    } catch (error) {
      console.error('Error updating service status:', error);
      setIsFeedbackModalOpen(true);
    }
  };

  const openCreateModal = () => {
    setEditingService(null);
    setNewCategoryName('');
    resetServiceImageFields();
    setFormData({
      name: '',
      category: '',
      duration: '',
      price: '',
      description: '',
      status: 'Active',
      commission_rule_id: ''
    });
    void fetchServiceCategories();
    void fetchCommissionRules();
    setIsModalOpen(true);
  };

  const openEditModal = (service: any) => {
    setEditingService(service);
    setNewCategoryName('');
    resetServiceImageFields();
    setFormData({
      name: service.name || '',
      category: service.category || service.category_name || '',
      duration: service.duration || '',
      price: String(service.price || ''),
      description: service.description || '',
      status: service.status || 'Active',
      commission_rule_id: service.commission_rule_id ? String(service.commission_rule_id) : ''
    });
    void fetchServiceCategories();
    void fetchCommissionRules();
    setIsModalOpen(true);
  };

  const openViewModal = (service: any) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const requestDelete = (id: number) => {
    setServiceToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await serviceApi.delete(serviceToDelete);
      notifyServiceCatalogUpdated();
      setSuccessMessage('Service has been deleted successfully.');
      setIsSuccessModalOpen(true);
      await fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      setIsFeedbackModalOpen(true);
    } finally {
      setIsConfirmModalOpen(false);
      setServiceToDelete(null);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      (service.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const serviceCategory = String(service.category || service.category_name || '');
    const matchesCategory = !categoryFilter || serviceCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryOptions = Array.from(
    new Set(
      [...categoryCatalog, ...services.map((s) => String(s.category || s.category_name || '').trim())]
        .filter(Boolean)
    )
  );
  const categoryFormOptions = Array.from(
    new Set(
      [
        ...categoryCatalog,
        ...services
        .map((s) => String(s.category || s.category_name || '').trim())
          .filter(Boolean),
        formData.category,
        editingService?.category,
        editingService?.category_name
      ].filter(Boolean)
    )
  );

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Service Catalog</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Maintain and update your spa offerings</p>
          </div>
          {canManage && (
            <div className="d-flex gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="btn btn-outline-secondary rounded-pill px-4 py-3 fw-bold d-flex align-items-center justify-content-center"
              >
                <FiLayers className="me-2" /> CREATE CATEGORY
              </button>
              <button 
                onClick={openCreateModal}
                className="btn btn-purple rounded-pill px-4 py-3 fw-bold d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale"
              >
                <FiPlus className="me-2" /> ADD NEW SERVICE
              </button>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="glass-panel p-3 rounded-4 mb-4 border-1 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="text" 
                  className="form-control glass-input-simple ps-5" 
                  placeholder="Search services..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 col-lg-2">
              <select className="form-select glass-input-simple" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <AdminTable 
          isDarkMode={isDarkMode}
          data={filteredServices}
          columns={[
            { header: 'Image', align: 'center' },
            { header: 'Service Name' },
            { header: 'Category' },
            ...(canManage ? [{ header: 'Commission rule' }] : []),
            { header: 'Duration' },
            { header: 'Price (KES)' },
            { header: 'Status', align: 'center' },
            ...(!attendantReadOnly ? [{ header: 'Action', align: 'end' as const }] : [])
          ]}
          renderRow={(service) => (
            <tr key={service.id} className="align-middle border-bottom border-opacity-10">
              <td className="py-4 border-0 text-center" style={{ width: 72 }}>
                <div className="d-inline-flex justify-content-center">
                  <ServiceImageThumb imageUrl={service.image_url} alt="" size={44} />
                </div>
              </td>
              <td className="px-4 py-4 border-0">
                <div className="fw-bold">{service.name}</div>
              </td>
              <td className="py-4 border-0 text-secondary small">{service.category}</td>
              {canManage ? (
                <td className="py-4 border-0 small">
                  <span className="d-inline-flex align-items-center text-secondary">
                    <FiPercent className="me-1 opacity-50 flex-shrink-0" size={14} />
                    <span className="text-dark">
                    {service.commission_rule_name
                      ? `${service.commission_rule_name} (${Number(service.commission_rule_staff_pct).toFixed(1)}% to staff)`
                      : 'Default'}
                  </span>
                  </span>
                </td>
              ) : null}
              <td className="py-4 border-0">
                <div className="d-flex align-items-center small text-secondary">
                  <FiClock className="me-1 opacity-50" size={14} />
                  {service.duration}
                </div>
              </td>
              <td className="py-4 border-0 fw-bold">{service.price}</td>
              <td className="py-4 border-0 text-center">
                {canManage ? (
                <div className="dropdown">
                  <button 
                    className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 cursor-pointer border-0 transition-all hover-scale-sm dropdown-toggle hide-caret ${service.statusClass.replace('text-', 'bg-')}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    type="button"
                  >
                    <span className={`${service.statusClass} d-flex align-items-center`}>
                      {getStatusIcon(service.status)}
                      {service.status}
                      <FiChevronDown className="ms-1 opacity-50" size={12} />
                    </span>
                  </button>
                  <ul className={`dropdown-menu shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                    <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Set Status</h6></li>
                    {['Active', 'Inactive'].map(status => (
                      <li key={status}>
                        <button 
                          className="dropdown-item d-flex align-items-center py-2" 
                          onClick={() => toggleStatus(service.id, status)}
                        >
                          <span className={`me-2 ${status === 'Active' ? 'text-success' : 'text-secondary'}`}>
                            {getStatusIcon(status)}
                          </span>
                          {status}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                ) : (
                  <span className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 border-0 ${service.statusClass.replace('text-', 'bg-')}`}>
                    <span className={`${service.statusClass} d-flex align-items-center`}>
                      {getStatusIcon(service.status)}
                      {service.status}
                    </span>
                  </span>
                )}
              </td>
              {!attendantReadOnly && (
              <td className="px-4 py-4 border-0 text-end">
                  <div className="dropdown">
                    <button 
                      className={`btn btn-sm p-2 rounded-circle border-0 ${isDarkMode ? 'text-white hover-bg-white-10' : 'text-dark hover-bg-black-10'}`}
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                      <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Manage Service</h6></li>
                      <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openViewModal(service)}><FiEye className="me-2" /> View Service</button></li>
                      {canManage && (
                        <>
                          <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openEditModal(service)}><FiEdit className="me-2" /> Edit Service</button></li>
                          <li><hr className="dropdown-divider opacity-10" /></li>
                          <li><button className="dropdown-item d-flex align-items-center py-2 text-danger" type="button" onClick={() => requestDelete(service.id)}><FiTrash2 className="me-2" /> Delete Service</button></li>
                        </>
                      )}
                    </ul>
                  </div>
              </td>
              )}
            </tr>
          )}
        />
      </div>

      {/* Add Service Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingService(null); resetServiceImageFields(); }}
        title={editingService ? 'Edit Service' : 'Create New Service'}
        subtitle={editingService ? 'Update existing service details' : "Expand your spa's treatment menu"}
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-4 mb-5">
            {/* Left Column: Service Identity */}
            <div className="col-lg-4 border-end border-opacity-10 pe-lg-4">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 01</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Service Identity</h4>
              </div>
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Service Name</label>
                <div className="position-relative">
                  <FiTag className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                  <input type="text" name="name" className="form-control glass-input-premium ps-5" placeholder="e.g. Aromatherapy Massage" required value={formData.name} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Category</label>
                <div className="position-relative">
                  <FiLayers className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                  <select name="category" className="form-select glass-input-premium ps-5" required value={formData.category} onChange={handleChange}>
                    <option value="">Select Category</option>
                    {categoryFormOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                {canManage && (
                  <div className="mt-3">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control glass-input-premium"
                        placeholder="Create category (e.g. Bridal Packages)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            void handleCreateCategory();
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-purple fw-bold"
                        disabled={categorySaving || !newCategoryName.trim()}
                        onClick={() => void handleCreateCategory()}
                      >
                        {categorySaving ? 'Saving...' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Initial Status</label>
                <div className="position-relative">
                  <FiCheckCircle className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                  <select name="status" className="form-select glass-input-premium ps-5" required value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {canManage && (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
                    Commission rule <span className="fw-normal text-lowercase">(rule name & staff %)</span>
                  </label>
                  <div className="position-relative">
                    <FiPercent className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <select
                      name="commission_rule_id"
                      className="form-select glass-input-premium ps-5"
                      value={formData.commission_rule_id}
                      onChange={handleChange}
                      disabled={commissionRulesLoading}
                    >
                      <option value="">
                        {commissionRulesLoading ? 'Loading rules…' : 'Site default (no rule on this service)'}
                      </option>
                      {commissionRulesList.map((r) => {
                        const staffPct = Number(
                          r.net_commission_rate ?? Number(r.commission_pool_rate) - Number(r.tax_rate)
                        );
                        return (
                          <option key={r.id} value={r.id}>
                            {r.name} — {staffPct.toFixed(1)}% to staff
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <p className="small text-secondary mt-2 mb-0">
                    Rules are loaded from your commission presets.{' '}
                    <Link to="/admin/settings" className="text-purple text-decoration-none">
                      Add or edit commission rules
                    </Link>
                    .
                  </p>
                  {!commissionRulesLoading && commissionRulesList.length === 0 ? (
                    <p className="small text-warning mb-0 mt-2">No commission rules found — the site default will apply until you add rules in Settings.</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Right Column: Specifications */}
            <div className="col-lg-8 ps-lg-4">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 02</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Specifications</h4>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Duration</label>
                  <div className="position-relative">
                    <FiClock className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <input type="text" name="duration" className="form-control glass-input-premium ps-5" placeholder="e.g. 60 min" required value={formData.duration} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Base Price (KES)</label>
                  <div className="position-relative">
                    <FiDollarSign className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <input type="text" name="price" className="form-control glass-input-premium ps-5" placeholder="e.g. 2500" required value={formData.price} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Service Description</label>
                <div className="position-relative">
                  <FiEdit className="position-absolute top-0 start-0 m-3 text-secondary opacity-50" />
                  <textarea name="description" className="form-control glass-input-premium ps-5 pt-3" placeholder="Briefly describe the treatment..." rows={4} value={formData.description} onChange={handleChange}></textarea>
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
                  Service image <span className="fw-normal text-lowercase">(optional)</span>
                </label>
                <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch">
                  <div
                    className={`service-image-preview-slot rounded-4 border border-secondary border-opacity-25 bg-light bg-opacity-50 d-flex align-items-center justify-content-center flex-shrink-0 overflow-hidden ${
                      isDarkMode ? 'bg-dark bg-opacity-25 border-white border-opacity-10' : ''
                    }`}
                    style={{ width: 140, height: 140 }}
                    aria-hidden
                  >
                    {serviceImagePreviewUrl || (editingService?.image_url && !removeServiceImage) ? (
                      <img
                        src={serviceImagePreviewUrl || backendAssetUrl(editingService?.image_url)}
                        alt=""
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <div className="text-center px-2 py-3">
                        <FiImage className="text-secondary opacity-40 mb-1" size={28} />
                        <div className="x-small text-secondary opacity-75 lh-sm">Preview</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1 d-flex flex-column min-w-0">
                    <div className="position-relative flex-grow-1">
                      <FiImage className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50 z-1" />
                      <input
                        ref={serviceImageInputRef}
                        type="file"
                        name="service_image"
                        className="form-control glass-input-premium ps-5"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          setServiceImageFile(file ?? null);
                          setRemoveServiceImage(false);
                        }}
                      />
                    </div>
                    {editingService?.image_url ? (
                      <div className="form-check mt-2 mb-0">
                        <input
                          id="remove-service-image"
                          type="checkbox"
                          className="form-check-input"
                          checked={removeServiceImage}
                          onChange={(e) => {
                            setRemoveServiceImage(e.target.checked);
                            if (e.target.checked) {
                              setServiceImageFile(null);
                              if (serviceImageInputRef.current) serviceImageInputRef.current.value = '';
                            }
                          }}
                        />
                        <label className="form-check-label small text-secondary" htmlFor="remove-service-image">
                          Remove current image
                        </label>
                      </div>
                    ) : null}
                    <p className="small text-secondary mt-2 mb-0">
                      JPG, PNG, or WebP · max 5 MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-top border-opacity-10 pt-4 d-flex justify-content-end align-items-center">
            <button 
              type="button" 
              className="btn px-4 py-2 rounded-pill fw-bold text-secondary hover-bg-light me-3 transition-all"
              onClick={() => setIsModalOpen(false)}
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="btn btn-purple px-5 py-2 rounded-pill fw-bold shadow-lg transition-all hover-scale d-flex align-items-center" 
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" /> PROCESSING...</>
              ) : editingService ? 'UPDATE SERVICE' : 'PUBLISH SERVICE'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isCategoryModalOpen}
        onClose={() => { setIsCategoryModalOpen(false); setCategoryFormName(''); }}
        title="Create Service Category"
        subtitle="Add a category and save it to database"
        isDarkMode={isDarkMode}
        maxWidth="560px"
      >
        <form onSubmit={handleCreateCategoryFromLink}>
          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
            Category name
          </label>
          <input
            type="text"
            className="form-control glass-input-premium"
            placeholder="e.g. Bridal Packages"
            value={categoryFormName}
            onChange={(e) => setCategoryFormName(e.target.value)}
            required
          />
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-4"
              onClick={() => { setIsCategoryModalOpen(false); setCategoryFormName(''); }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-purple rounded-pill px-4 fw-bold"
              disabled={categorySaving || !categoryFormName.trim()}
            >
              {categorySaving ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedService(null); }}
        title="Service Details"
        subtitle={selectedService?.name || 'Service'}
        isDarkMode={isDarkMode}
        maxWidth="680px"
      >
        {selectedService ? (
          <div className="row g-3 small">
            {selectedService.image_url ? (
              <div className="col-12 mb-2">
                <img
                  src={backendAssetUrl(selectedService.image_url)}
                  alt={selectedService.name || 'Service'}
                  className="rounded-4 border border-opacity-10 w-100 object-fit-cover"
                  style={{ maxHeight: 220 }}
                />
              </div>
            ) : null}
            <div className="col-md-6"><strong>Name:</strong> {selectedService.name}</div>
            <div className="col-md-6"><strong>Category:</strong> {selectedService.category || 'N/A'}</div>
            <div className="col-md-6"><strong>Duration:</strong> {selectedService.duration || 'N/A'}</div>
            <div className="col-md-6"><strong>Price:</strong> KES {parseFloat(String(selectedService.price || 0)).toLocaleString()}</div>
            <div className="col-md-6"><strong>Status:</strong> {selectedService.status || 'N/A'}</div>
            {canManage ? (
              <div className="col-md-12">
                <strong>Commission rule:</strong>{' '}
                {selectedService.commission_rule_name
                  ? `${selectedService.commission_rule_name} (${Number(selectedService.commission_rule_staff_pct ?? 0).toFixed(1)}% to staff)`
                  : 'Default (site rule)'}
              </div>
            ) : null}
            <div className="col-md-12"><strong>Description:</strong> {selectedService.description || 'No description provided.'}</div>
          </div>
        ) : (
          <p className="small text-secondary mb-0">No service selected.</p>
        )}
      </AdminModal>

      {/* Success Feedback Modal */}
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        isDarkMode={isDarkMode}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Service Action Failed"
        message="Failed to complete service action. Please try again."
        variant="error"
        isDarkMode={isDarkMode}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setServiceToDelete(null); }}
        onConfirm={handleDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service?"
        confirmText="Delete"
        isDarkMode={isDarkMode}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input-simple {
          background: rgba(106, 13, 173, 0.03) !important;
          border: 1px solid rgba(106, 13, 173, 0.1) !important;
          padding: 0.75rem 1rem !important;
          border-radius: 12px !important;
          transition: all 0.3s ease;
        }
        .glass-input-premium {
          background: transparent !important;
          border: 1px solid rgba(106, 13, 173, 0.15) !important;
          padding: 0.9rem 1rem !important;
          border-radius: 14px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        body.admin-light .glass-input-premium {
          background: #ffffff !important;
          border-color: rgba(0, 0, 0, 0.08) !important;
        }
        .badge-premium {
          display: inline-block;
          padding: 0.35em 1.2em;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 100px;
          background: #6a0dad;
          color: #ffffff;
        }
        body.admin-dark .badge-premium {
          background: rgba(157, 0, 255, 0.2);
          color: #d90082;
          border: 1px solid rgba(157, 0, 255, 0.3);
        }
        .hide-caret::after { display: none !important; }
        .hover-scale:hover { transform: scale(1.02); }
        .hover-scale-sm:hover { transform: scale(1.05); }
      `}} />
    </AdminLayout>
  );
};

export default ServicesManagementPage;
