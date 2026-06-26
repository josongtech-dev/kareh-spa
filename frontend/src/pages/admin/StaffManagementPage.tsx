import React, { useState, useContext, useEffect } from 'react';
import { 
  FiUserPlus, FiUsers, FiUser, FiSearch, FiMoreHorizontal, 
  FiEdit, FiTrash2, FiShield, FiStar, FiCamera, 
  FiPhone, FiMail, FiFileText, FiHash, FiX, FiCheckCircle, FiClock, FiAlertCircle,
  FiChevronDown, FiCopy, FiMessageCircle, FiShare2, FiMessageSquare
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import SuccessModal from '../../components/admin/SuccessModal';
import FeedbackModal from '../../components/admin/FeedbackModal';
import AdminTable from '../../components/admin/AdminTable';
import { staffApi } from '../../api/staff';
import { backendAssetUrl } from '../../api/config';
import { getCurrentAdminRole, isAttendant, isManager, isReceptionist } from '../../adminAccess';

const StaffManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackVariant, setFeedbackVariant] = useState<'success' | 'error' | 'info'>('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: '',
    skill: '',
    phone: '',
    email: '',
    idNumber: '',
    additionalInfo: '',
    notes: '',
    status: 'Active',
    activationPassword: ''
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    role: '',
    skill: '',
    phone: '',
    email: '',
    idNumber: '',
    additionalInfo: '',
    status: 'Active'
  });

  // DB Staff Data
  const [staffList, setStaffList] = useState<any[]>([]);
  const currentRole = getCurrentAdminRole();
  const readOnlyStaffRole = isReceptionist(currentRole) || isAttendant(currentRole);
  const attendantNoActions = isAttendant(currentRole);

  const fetchStaff = async () => {
    try {
      const response = await staffApi.getAll();
      const statusClasses: Record<string, string> = {
        'Active': 'text-success',
        'On Leave': 'text-info',
        'Suspended': 'text-danger',
        'Inactive': 'text-secondary'
      };
      
      // Backend returns a JSON array or { status: "success", data: [...] }
      const data = response.data?.data || response.data || [];
      const dataArray = Array.isArray(data) ? data : [];
      
      const formattedStaff = dataArray.map((staff: any) => ({
        ...staff,
        statusClass: statusClasses[staff.status] || 'text-secondary'
      }));
      setStaffList(formattedStaff);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const resolveImagePath = (imagePath?: string) => {
    if (!imagePath) return '';
    return backendAssetUrl(imagePath);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('username', formData.username);
      form.append('role', formData.role);
      form.append('skill', formData.skill);
      form.append('phone', formData.phone);
      form.append('email', formData.email);
      form.append('idNumber', formData.idNumber);
      form.append('status', formData.status);
      form.append('additionalInfo', formData.additionalInfo);
      form.append('activationPassword', formData.activationPassword);
      
      const fileInput = document.getElementById('modalImageUpload') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        form.append('passport_image', fileInput.files[0]);
      }

      await staffApi.create(form);
      
      setLoading(false);
      setIsModalOpen(false);
      
      // Show success modal
      setSuccessMessage("New staff member has been registered to the team.");
      setIsSuccessModalOpen(true);
      
      setFormData({
        name: '',
        username: '',
        role: '',
        skill: '',
        phone: '',
        email: '',
        idNumber: '',
        additionalInfo: '',
        notes: '',
        status: 'Active',
        activationPassword: ''
      });
      fetchStaff();
    } catch (error: any) {
      console.error('Enrollment error:', error);
      setLoading(false);
      setFeedbackTitle('Enrollment Failed');
      setFeedbackMessage(
        error?.response?.data?.message || 'Failed to enroll staff. Please try again.'
      );
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const openViewModal = (staff: any) => {
    setSelectedStaff(staff);
    setIsViewModalOpen(true);
  };

  const openEditModal = (staff: any) => {
    setSelectedStaff(staff);
    setEditPreview(staff.image_path ? resolveImagePath(staff.image_path) : null);
    setEditFormData({
      name: staff.name || '',
      username: staff.username || '',
      role: staff.role || '',
      skill: staff.skill || '',
      phone: staff.phone || '',
      email: staff.email || '',
      idNumber: staff.id_number || '',
      additionalInfo: staff.additional_info || '',
      status: staff.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (staff: any) => {
    setSelectedStaff(staff);
    setIsDeleteModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff?.id) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append('name', editFormData.name);
      form.append('username', editFormData.username);
      form.append('role', editFormData.role);
      form.append('skill', editFormData.skill);
      form.append('phone', editFormData.phone);
      form.append('email', editFormData.email);
      form.append('idNumber', editFormData.idNumber);
      form.append('status', editFormData.status);
      form.append('additionalInfo', editFormData.additionalInfo);

      const fileInput = document.getElementById('editImageUpload') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        form.append('passport_image', fileInput.files[0]);
      }

      await staffApi.update(selectedStaff.id, form);
      setLoading(false);
      setIsEditModalOpen(false);
      setFeedbackTitle('Staff Updated');
      setFeedbackMessage('Staff details have been updated successfully.');
      setFeedbackVariant('success');
      setIsFeedbackModalOpen(true);
      fetchStaff();
    } catch (error: any) {
      console.error('Update staff failed:', error);
      setLoading(false);
      setFeedbackTitle('Update Failed');
      setFeedbackMessage(error?.response?.data?.message || 'Failed to update staff details.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const handleDeleteStaff = async () => {
    if (!selectedStaff?.id) return;
    setLoading(true);
    try {
      await staffApi.delete(selectedStaff.id);
      setLoading(false);
      setIsDeleteModalOpen(false);
      setFeedbackTitle('Staff Deleted');
      setFeedbackMessage('Staff member has been removed successfully.');
      setFeedbackVariant('success');
      setIsFeedbackModalOpen(true);
      fetchStaff();
    } catch (error: any) {
      console.error('Delete staff failed:', error);
      setLoading(false);
      setFeedbackTitle('Delete Failed');
      setFeedbackMessage(error?.response?.data?.message || 'Failed to delete staff member.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const handleStatusUpdate = async (staff: any, status: string) => {
    try {
      const form = new FormData();
      form.append('status', status);
      await staffApi.update(staff.id, form);
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === staff.id
            ? {
                ...s,
                status,
                statusClass:
                  status === 'Active'
                    ? 'text-success'
                    : status === 'On Leave'
                      ? 'text-info'
                      : status === 'Suspended'
                        ? 'text-danger'
                        : 'text-secondary'
              }
            : s
        )
      );
      setFeedbackTitle('Status Updated');
      setFeedbackMessage(`${staff.name}'s status changed to ${status}.`);
      setFeedbackVariant('success');
      setIsFeedbackModalOpen(true);
    } catch (error: any) {
      console.error('Status update failed:', error);
      setFeedbackTitle('Status Update Failed');
      setFeedbackMessage(error?.response?.data?.message || 'Failed to update status.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active': return <FiCheckCircle className="me-1" />;
      case 'Inactive': return <FiAlertCircle className="me-1" />;
      case 'Suspended': return <FiX className="me-1" />;
      case 'On Leave': return <FiClock className="me-1" />;
      default: return null;
    }
  };

  const visibleStaffList = staffList.filter((staff) => {
    const role = String(staff?.role || '').trim().toLowerCase();
    if (isReceptionist(currentRole)) {
      return role === 'attendant';
    }
    if (isAttendant(currentRole)) {
      return role !== 'owner' && role !== 'system owner';
    }
    if (isManager(currentRole)) {
      return role !== 'owner' && role !== 'system owner';
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Staff Management</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Manage your team and their active status</p>
          </div>
          {!readOnlyStaffRole && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn btn-purple rounded-pill px-4 py-3 fw-bold d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale"
            >
              <FiUserPlus className="me-2" /> ADD NEW STAFF
            </button>
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
                  placeholder="Search staff by name or role..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 col-lg-2">
              <select className="form-select glass-input-simple">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="on-leave">On Leave</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="col-md-3 col-lg-2">
              <select className="form-select glass-input-simple">
                <option value="">All Roles</option>
                <option value="manager">Manager</option>
                <option value="attendant">Staff Attendant</option>
                <option value="receptionist">Receptionist</option>
              </select>
            </div>
          </div>
        </div>

        {/* Staff Table - Refactored */}
        <AdminTable 
          isDarkMode={isDarkMode}
          data={visibleStaffList}
          columns={[
            { header: 'Staff Member' },
            { header: 'Passport Image' },
            { header: 'Role & Skill' },
            { header: 'Contact' },
            { header: 'Status', align: 'center' },
            ...(!attendantNoActions ? [{ header: 'Action', align: 'end' as const }] : [])
          ]}
          renderRow={(staff) => (
            <tr key={staff.id} className="align-middle border-bottom border-opacity-10">
              <td className="px-4 py-4 border-0">
                <div className="fw-bold">{staff.name}</div>
              </td>
              <td className="py-4 border-0">
                {staff.image_path ? (
                  <img
                    src={backendAssetUrl(staff.image_path)}
                    alt={`${staff.name} passport`}
                    className="rounded-3 object-fit-cover-top border border-white border-opacity-10 shadow-sm"
                    style={{ width: '56px', height: '56px' }}
                  />
                ) : (
                  <span className="small text-secondary">No image</span>
                )}
              </td>
              <td className="py-4 border-0">
                <div className="small font-weight-bold">{staff.role}</div>
                <div className="text-secondary x-small">{staff.skill}</div>
              </td>
              <td className="py-4 border-0 text-secondary small">{staff.phone}</td>
              <td className="py-4 border-0 text-center">
                {readOnlyStaffRole ? (
                  <span className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 border-0 ${staff.statusClass.replace('text-', 'bg-')}`}>
                    <span className={`${staff.statusClass} d-flex align-items-center`}>
                      {getStatusIcon(staff.status)}
                      {staff.status}
                    </span>
                  </span>
                ) : (
                  <div className="dropdown">
                    <button 
                      className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 cursor-pointer border-0 transition-all hover-scale-sm dropdown-toggle hide-caret ${staff.statusClass.replace('text-', 'bg-')}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      type="button"
                    >
                      <span className={`${staff.statusClass} d-flex align-items-center`}>
                        {getStatusIcon(staff.status)}
                        {staff.status}
                        <FiChevronDown className="ms-1 opacity-50" size={12} />
                      </span>
                    </button>
                    <ul className={`dropdown-menu shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                      <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Change Status</h6></li>
                      {['Active', 'On Leave', 'Suspended', 'Inactive'].map(status => (
                        <li key={status}>
                          <button 
                            className="dropdown-item d-flex align-items-center py-2" 
                            onClick={() => handleStatusUpdate(staff, status)}
                          >
                            <span className={`me-2 ${status === 'Active' ? 'text-success' : status === 'On Leave' ? 'text-info' : status === 'Suspended' ? 'text-danger' : 'text-secondary'}`}>
                              {getStatusIcon(status)}
                            </span>
                            {status}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </td>
              {!attendantNoActions && (
              <td className="px-4 py-4 border-0 text-end text-nowrap">
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
                    <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Actions</h6></li>
                    {!isAttendant(currentRole) && <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openViewModal(staff)}><FiUsers className="me-2" /> View Details</button></li>}
                    {!readOnlyStaffRole && (
                      <>
                        <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openEditModal(staff)}><FiEdit className="me-2" /> Edit Details</button></li>
                        <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => handleStatusUpdate(staff, 'On Leave')}><FiClock className="me-2" /> Manage Leave</button></li>
                        <li><hr className="dropdown-divider opacity-10" /></li>
                        <li><button className="dropdown-item d-flex align-items-center py-2 text-danger" type="button" onClick={() => openDeleteModal(staff)}><FiTrash2 className="me-2" /> Delete Member</button></li>
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

      {/* Add Staff Modal - Refactored */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Enroll New Staff"
        subtitle="Digital Onboarding & System Setup"
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleSubmit} className="row g-5">
          {/* Left Column: Profile & Identification */}
          <div className="col-lg-4 border-end border-opacity-10">
            <div className="section-title mb-4">
              <span className="badge-premium mb-2">PART 01</span>
              <h4 className="h6 fw-bold text-uppercase tracking-wider">Identity & Media</h4>
            </div>

            <div className="text-center mb-5">
              <div 
                className="position-relative mx-auto mb-4 cursor-pointer profile-uploader" 
                style={{ width: '180px', height: '180px' }}
                onClick={() => document.getElementById('modalImageUpload')?.click()}
              >
                <div className="w-100 h-100 rounded-circle border-2 border-dashed border-secondary border-opacity-25 overflow-hidden d-flex align-items-center justify-content-center bg-light-soft transition-all">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-100 h-100 object-fit-cover-top scale-hover" />
                  ) : (
                    <div className="text-center p-3">
                      <FiCamera className="fs-1 text-secondary opacity-50 mb-2" />
                      <div className="x-small text-muted fw-bold">UPLOAD PHOTO</div>
                    </div>
                  )}
                </div>
                <div className="position-absolute bottom-0 end-0 bg-purple p-3 rounded-circle shadow-lg border-3 border-white edit-badge-floating">
                  <FiEdit size={18} className="text-white" />
                </div>
              </div>
              <input type="file" id="modalImageUpload" hidden accept="image/*" onChange={handleImageChange} />
              <p className="small text-muted px-2">Professional passport sized photo. Max 5MB (JPG/PNG).</p>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">National ID / Passport</label>
              <div className="position-relative">
                <FiHash className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                <input type="text" name="idNumber" className="form-control glass-input-premium ps-5" placeholder="Number" required value={formData.idNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Username</label>
              <div className="position-relative">
                <FiUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                <input type="text" name="username" className="form-control glass-input-premium ps-5" placeholder="Enter Username" required value={formData.username} onChange={handleChange} />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Initial Status</label>
              <div className="position-relative">
                <FiCheckCircle className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                <select name="status" className="form-select glass-input-premium ps-5" required value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right Column: Professional Details */}
          <div className="col-lg-8">
            {/* Basic Info Section */}
            <div className="mb-5">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 02</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Professional Profile</h4>
              </div>
              
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Legal Full Name</label>
                  <div className="position-relative">
                    <FiUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <input type="text" name="name" className="form-control glass-input-premium ps-5" placeholder="Enter Full Name" required value={formData.name} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Phone Number</label>
                  <div className="position-relative">
                    <FiPhone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <input type="tel" name="phone" className="form-control glass-input-premium ps-5" placeholder="07XXXXXXXX" required value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-md-7">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Email Address</label>
                  <div className="position-relative">
                    <FiMail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <input type="email" name="email" className="form-control glass-input-premium ps-5" placeholder="Enter Email" required value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Assigned Designation</label>
                  <div className="position-relative">
                    <FiShield className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <select name="role" className="form-select glass-input-premium ps-5" required value={formData.role} onChange={handleChange}>
                      <option value="">Select Role</option>
                      <option value="owner">System Owner</option>
                      <option value="manager">Manager</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="attendant">Staff Attendant</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Expertise / Skill</label>
                  <div className="position-relative">
                    <FiStar className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <input type="text" name="skill" className="form-control glass-input-premium ps-5" placeholder="e.g. Lead Beautician" required value={formData.skill} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 03</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Administrative Summary</h4>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Professional Summary</label>
                <div className="position-relative">
                  <FiFileText className="position-absolute top-0 start-0 m-3 text-secondary opacity-50" />
                  <textarea name="additionalInfo" className="form-control glass-input-premium ps-5 pt-3" placeholder="Briefly describe background, certifications, and spa experience..." rows={3} required value={formData.additionalInfo} onChange={handleChange}></textarea>
                </div>
              </div>
              
              {/* System Access Section */}
              <div className="mt-5">
                <div className="section-title mb-4">
                  <span className="badge-premium mb-2">PART 04</span>
                  <h4 className="h6 fw-bold text-uppercase tracking-wider">System Access</h4>
                </div>
                
                <div className="row g-4 align-items-end">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Activation Password</label>
                    <div className="position-relative">
                      <FiShield className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                      <input 
                        type="text" 
                        name="activationPassword" 
                        className="form-control glass-input-premium ps-5" 
                        placeholder="Generate or Enter Password" 
                        required 
                        value={formData.activationPassword} 
                        onChange={handleChange} 
                      />
                      <button 
                        type="button"
                        className="btn btn-link position-absolute top-50 end-0 translate-middle-y me-2 text-purple fw-bold x-small text-decoration-none"
                        onClick={() => {
                          const pass = Math.random().toString(36).slice(-8).toUpperCase();
                          setFormData({...formData, activationPassword: pass});
                        }}
                      >
                        GENERATE
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex gap-2">
                      <button 
                        type="button" 
                        className="btn btn-outline-purple rounded-pill p-3 flex-grow-1 d-flex align-items-center justify-content-center"
                        onClick={() => {
                          navigator.clipboard.writeText(formData.activationPassword);
                          setFeedbackTitle('Copied');
                          setFeedbackMessage('Password copied to clipboard.');
                          setFeedbackVariant('info');
                          setIsFeedbackModalOpen(true);
                        }}
                        title="Copy Password"
                      >
                        <FiCopy className="me-2" /> COPY
                      </button>
                      
                      <div className="dropdown flex-shrink-0">
                        <button 
                          className="btn btn-purple rounded-pill p-3 dropdown-toggle hide-caret" 
                          type="button" 
                          data-bs-toggle="dropdown"
                        >
                          <FiShare2 />
                        </button>
                        <ul className={`dropdown-menu dropdown-menu-end shadow-lg ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                          <li><h6 className="dropdown-header">Share Activation Link</h6></li>
                          <li>
                            <button 
                              type="button" 
                              className="dropdown-item d-flex align-items-center py-2 text-success"
                              onClick={() => {
                                const msg = encodeURIComponent(`Welcome to Kareh Spa! Your activation password is: ${formData.activationPassword}`);
                                window.open(`https://wa.me/?text=${msg}`, '_blank');
                              }}
                            >
                              <FiMessageCircle className="me-2" /> WhatsApp
                            </button>
                          </li>
                          <li>
                            <button 
                              type="button" 
                              className="dropdown-item d-flex align-items-center py-2 text-primary"
                              onClick={() => {
                                const subject = encodeURIComponent('Kareh Spa System Access');
                                const body = encodeURIComponent(`Your activation password is: ${formData.activationPassword}`);
                                window.location.href = `mailto:${formData.email}?subject=${subject}&body=${body}`;
                              }}
                            >
                              <FiMail className="me-2" /> Email
                            </button>
                          </li>
                          <li>
                            <button 
                              type="button" 
                              className="dropdown-item d-flex align-items-center py-2 text-info"
                              onClick={() => {
                                const body = encodeURIComponent(`Kareh Spa Password: ${formData.activationPassword}`);
                                window.location.href = `sms:${formData.phone}?body=${body}`;
                              }}
                            >
                              <FiMessageSquare className="me-2" /> SMS
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-end gap-3 mt-5">
                <button 
                  type="button" 
                  className="btn px-5 py-3 rounded-pill fw-bold border-opacity-25 border-secondary text-secondary hover-bg-light"
                  onClick={() => setIsModalOpen(false)}
                >
                  CANCEL
                </button>
                <button 
                  type="submit" 
                  className="btn btn-purple px-5 py-3 rounded-pill fw-bold shadow-lg transition-all hover-scale" 
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner-border spinner-border-sm me-2" /> PROCESSING...</>
                  ) : 'FINALIZE ENROLLMENT'}
                </button>
              </div>
            </div>
          </div>
        </form>
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
        title={feedbackTitle}
        message={feedbackMessage}
        variant={feedbackVariant}
        isDarkMode={isDarkMode}
      />

      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Staff Details"
        subtitle="Profile summary"
        isDarkMode={isDarkMode}
        maxWidth="680px"
      >
        {selectedStaff && (
          <div className="row g-4">
            <div className="col-md-4 text-center">
              {selectedStaff.image_path ? (
                <img
                  src={resolveImagePath(selectedStaff.image_path)}
                  alt={selectedStaff.name}
                  className="rounded-4 w-100 border border-white border-opacity-10 object-fit-cover-top"
                  style={{ maxHeight: '220px' }}
                />
              ) : (
                <div className="p-4 rounded-4 bg-light-soft">No passport image</div>
              )}
            </div>
            <div className="col-md-8">
              <h4 className="fw-bold mb-3">{selectedStaff.name}</h4>
              <div className="small mb-2"><strong>Username:</strong> {selectedStaff.username || 'N/A'}</div>
              <div className="small mb-2"><strong>Role:</strong> {selectedStaff.role || 'N/A'}</div>
              <div className="small mb-2"><strong>Skill:</strong> {selectedStaff.skill || 'N/A'}</div>
              <div className="small mb-2"><strong>Phone:</strong> {selectedStaff.phone || 'N/A'}</div>
              <div className="small mb-2"><strong>Email:</strong> {selectedStaff.email || 'N/A'}</div>
              <div className="small mb-2"><strong>ID Number:</strong> {selectedStaff.id_number || 'N/A'}</div>
              <div className="small mb-2"><strong>Status:</strong> {selectedStaff.status || 'N/A'}</div>
              <div className="small mt-3"><strong>Notes:</strong> {selectedStaff.additional_info || 'N/A'}</div>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Staff"
        subtitle="Update profile and account details"
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleUpdateStaff} className="row g-4">
          <div className="col-lg-4 text-center">
            <div className="position-relative mx-auto mb-3 cursor-pointer" style={{ width: '170px', height: '170px' }} onClick={() => document.getElementById('editImageUpload')?.click()}>
              <div className="w-100 h-100 rounded-circle overflow-hidden border border-2 border-white border-opacity-10">
                {editPreview ? (
                  <img src={editPreview} alt="Preview" className="w-100 h-100 object-fit-cover-top" />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-light-soft">
                    <FiCamera className="fs-1 text-secondary" />
                  </div>
                )}
              </div>
            </div>
            <input type="file" id="editImageUpload" hidden accept="image/*" onChange={handleEditImageChange} />
            <p className="small text-secondary">Tap image to upload a new passport photo.</p>
          </div>

          <div className="col-lg-8">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small">Full Name</label>
                <input type="text" name="name" className="form-control glass-input-simple" value={editFormData.name} onChange={handleEditChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small">Username</label>
                <input type="text" name="username" className="form-control glass-input-simple" value={editFormData.username} onChange={handleEditChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small">Role</label>
                <select name="role" className="form-select glass-input-simple" value={editFormData.role} onChange={handleEditChange} required>
                  <option value="owner">System Owner</option>
                  <option value="manager">Manager</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="attendant">Staff Attendant</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small">Status</label>
                <select name="status" className="form-select glass-input-simple" value={editFormData.status} onChange={handleEditChange} required>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label small">Phone</label>
                <input type="text" name="phone" className="form-control glass-input-simple" value={editFormData.phone} onChange={handleEditChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small">Email</label>
                <input type="email" name="email" className="form-control glass-input-simple" value={editFormData.email} onChange={handleEditChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small">ID Number</label>
                <input type="text" name="idNumber" className="form-control glass-input-simple" value={editFormData.idNumber} onChange={handleEditChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small">Skill</label>
                <input type="text" name="skill" className="form-control glass-input-simple" value={editFormData.skill} onChange={handleEditChange} required />
              </div>
              <div className="col-12">
                <label className="form-label small">Additional Info</label>
                <textarea name="additionalInfo" rows={3} className="form-control glass-input-simple" value={editFormData.additionalInfo} onChange={handleEditChange}></textarea>
              </div>
            </div>
          </div>

          <div className="col-12 d-flex justify-content-end gap-3 mt-3">
            <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-purple px-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Staff"
        subtitle="This action cannot be undone"
        isDarkMode={isDarkMode}
        maxWidth="520px"
      >
        <p className="mb-4">
          Are you sure you want to delete <strong>{selectedStaff?.name || 'this staff member'}</strong>?
        </p>
        <div className="d-flex justify-content-end gap-3">
          <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger px-4" onClick={handleDeleteStaff} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Delete'}
          </button>
        </div>
      </AdminModal>

      <style dangerouslySetInnerHTML={{ __html: `
        .z-index-2000 { z-index: 2000; }
        .blur-sm { backdrop-filter: blur(8px); }
        .glass-input-simple {
          background-color: rgba(106, 13, 173, 0.03) !important;
          border: 1px solid rgba(106, 13, 173, 0.1) !important;
          padding: 0.75rem 1rem !important;
          border-radius: 12px !important;
          transition: all 0.3s ease;
        }
        .glass-input-premium {
          background-color: transparent !important;
          border: 1px solid rgba(106, 13, 173, 0.15) !important;
          padding: 0.9rem 1rem !important;
          border-radius: 14px !important;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        .glass-input-premium:focus {
          border-color: var(--purple) !important;
          box-shadow: 0 0 25px rgba(106, 13, 173, 0.1) !important;
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
        body.admin-light .glass-input-premium {
          background-color: #ffffff !important;
          border-color: rgba(0, 0, 0, 0.08) !important;
        }
        .ps-5 { padding-left: 3rem !important; }
        .hover-scale:hover { transform: scale(1.02); }
        .scale-hover:hover { transform: scale(1.05); }
        .x-small { font-size: 0.7rem; }
        .bg-purple-10 { background: rgba(106, 13, 173, 0.1); }
        .hover-bg-purple-10:hover { background: rgba(106, 13, 173, 0.1); }
        .bg-light-soft { background: rgba(0, 0, 0, 0.02); }
        body.admin-dark .bg-light-soft { background: rgba(255, 255, 255, 0.05); }
        .edit-badge-floating { border-color: white !important; }
        body.admin-light .edit-badge-floating { border-color: #f8f9fc !important; }
        .profile-uploader:hover .bg-light-soft {
          border-color: var(--purple) !important;
          background: rgba(106, 13, 173, 0.03) !important;
        }
        .cursor-pointer { cursor: pointer !important; }
        .hide-caret::after { display: none !important; }
        .hover-scale-sm:hover { transform: scale(1.05); }
        .hover-scale-sm:active { transform: scale(0.95); }
        .text-purple-darker { color: #4a097d !important; }
        .text-purple-muted { color: #6a0dad; opacity: 0.8; }
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
      `}} />
    </AdminLayout>
  );
};

export default StaffManagementPage;
