import React, { useState, useContext, useEffect } from 'react';
import { 
  FiUserPlus, FiUsers, FiSearch, FiMoreHorizontal, 
  FiTrash2, FiStar, FiMail, FiPhone, FiEdit,
  FiChevronDown, FiAward, FiTrendingUp
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import SuccessModal from '../../components/admin/SuccessModal';
import FeedbackModal from '../../components/admin/FeedbackModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import AdminTable from '../../components/admin/AdminTable';
import { memberApi } from '../../api/members';

const MembersManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [pointsChange, setPointsChange] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    loyalty_points: 0,
    loyalty_tier: 'Bronze',
    status: 'Active'
  });

  const initEditForm = (member: any) => ({
    name: member.name || '',
    email: member.email || '',
    phone: member.phone || '',
    loyalty_points: member.loyalty_points ?? 0,
    loyalty_tier: member.loyalty_tier || 'Bronze',
    status: member.status || 'Active',
  });
  const [editFormData, setEditFormData] = useState(initEditForm({}));
  const [editMemberId, setEditMemberId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const res = await memberApi.getAll();
      const statusClasses: Record<string, string> = {
        'Active': 'text-success',
        'Inactive': 'text-secondary',
        'Suspended': 'text-danger'
      };
      
      const data = (res.data?.data || res.data || []).map((m: any) => ({
        ...m,
        statusClass: statusClasses[m.status] || 'text-secondary'
      }));
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await memberApi.create(formData);
      setLoading(false);
      setIsModalOpen(false);
      
      // Show success modal
      setSuccessMessage("Member has been successfully enrolled into the loyalty program.");
      setIsSuccessModalOpen(true);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        loyalty_points: 0,
        loyalty_tier: 'Bronze',
        status: 'Active'
      });
      fetchData();
    } catch (error) {
      console.error('Error registering member:', error);
      setLoading(false);
      setFeedbackTitle('Registration Failed');
      setFeedbackMessage('Failed to register member.');
      setIsFeedbackModalOpen(true);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await memberApi.updateStatus(id, status);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAdjustPoints = async () => {
    if (!selectedMember) return;
    try {
      await memberApi.adjustPoints(selectedMember.id, pointsChange);
      setIsPointsModalOpen(false);
      
      // Show success modal
      setSuccessMessage(`${pointsChange > 0 ? 'Added' : 'Deducted'} ${Math.abs(pointsChange)} points successfully.`);
      setIsSuccessModalOpen(true);
      
      setPointsChange(0);
      fetchData();
    } catch (error) {
      console.error('Error adjusting points:', error);
    }
  };

  const requestDeleteMember = (id: number) => {
    setMemberToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const openEditModal = (member: any) => {
    setEditMemberId(member.id);
    setEditFormData(initEditForm(member));
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editMemberId === null) return;
    setEditLoading(true);
    try {
      await memberApi.update(editMemberId, {
        name: editFormData.name,
        email: editFormData.email,
        phone: editFormData.phone,
        loyalty_points: Number(editFormData.loyalty_points),
        loyalty_tier: editFormData.loyalty_tier,
        status: editFormData.status,
      });
      setEditLoading(false);
      setIsEditModalOpen(false);
      setEditMemberId(null);
      setSuccessMessage("Member profile updated successfully.");
      setIsSuccessModalOpen(true);
      fetchData();
    } catch (error) {
      console.error('Error updating member:', error);
      setEditLoading(false);
      setFeedbackTitle('Update Failed');
      setFeedbackMessage('Failed to update member profile.');
      setIsFeedbackModalOpen(true);
    }
  };

  const handleDeleteMember = async () => {
    if (!memberToDelete) return;
    try {
      await memberApi.delete(memberToDelete);
      await fetchData();
    } catch (error) {
      setFeedbackTitle('Delete Failed');
      setFeedbackMessage('Unable to revoke membership right now.');
      setIsFeedbackModalOpen(true);
    } finally {
      setIsConfirmModalOpen(false);
      setMemberToDelete(null);
    }
  };

  const getTierBadge = (tier: string) => {
    switch(tier) {
      case 'Gold': return <span className="badge rounded-pill bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-1"><FiAward className="me-1" size={10} /> GOLD</span>;
      case 'Silver': return <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-3 py-1"><FiStar className="me-1" size={10} /> SILVER</span>;
      case 'Bronze': return <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-1"><FiStar className="me-1" size={10} /> BRONZE</span>;
      default: return null;
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.phone && m.phone.includes(searchQuery))
  );

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Member Directory</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Manage your loyalty club and customer database</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn btn-purple rounded-pill px-4 py-3 fw-bold d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale"
          >
            <FiUserPlus className="me-2" /> REGISTER NEW MEMBER
          </button>
        </div>

        {/* Loyalty Overview Cards */}
        <div className="row g-4 mb-5">
           <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center">
              <div className="p-3 rounded-circle bg-purple bg-opacity-10 text-purple me-3">
                <FiUsers size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>Total Members</div>
                <div className="h4 mb-0 fw-bold">{members.length}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center">
              <div className="p-3 rounded-circle bg-gold bg-opacity-10 text-gold me-3" style={{ color: '#d4af37' }}>
                <FiAward size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>Gold Tier</div>
                <div className="h4 mb-0 fw-bold">{members.filter(m => m.loyalty_tier === 'Gold').length}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success me-3">
                <FiTrendingUp size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>Active Accounts</div>
                <div className="h4 mb-0 fw-bold">{members.filter(m => m.status === 'Active').length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="glass-panel p-3 rounded-4 mb-4 border-1 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="text" 
                  className="form-control glass-input-simple ps-5" 
                  placeholder="Search members by name, email or phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <AdminTable 
          isDarkMode={isDarkMode}
          data={filteredMembers}
          columns={[
            { header: 'Member Profile' },
            { header: 'Loyalty Tier' },
            { header: 'Contact Info' },
            { header: 'Points' },
            { header: 'Status', align: 'center' },
            { header: 'Action', align: 'end' }
          ]}
          renderRow={(member) => (
            <tr key={member.id} className="align-middle border-bottom border-opacity-10">
              <td className="px-4 py-4 border-0">
                <div className="d-flex align-items-center">
                   <div className="bg-purple bg-opacity-10 rounded-circle text-purple me-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '40px', height: '40px' }}>
                    {member.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="fw-bold">{member.name}</div>
                    <div className="text-secondary x-small tracking-wider">Joined {new Date(member.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 border-0">
                {getTierBadge(member.loyalty_tier)}
              </td>
              <td className="py-4 border-0">
                <div className="d-flex align-items-center small text-secondary mb-1">
                  <FiMail className="me-2 opacity-50" size={12} />
                  {member.email}
                </div>
                <div className="d-flex align-items-center small text-secondary">
                  <FiPhone className="me-2 opacity-50" size={12} />
                  {member.phone || 'N/A'}
                </div>
              </td>
              <td className="py-4 border-0">
                <div className="fw-bold text-gold">{member.loyalty_points}</div>
                <div className="x-small text-secondary opacity-75 text-uppercase">PTS</div>
              </td>
              <td className="py-4 border-0 text-center">
                <div className="dropdown">
                  <button 
                    className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 cursor-pointer border-0 transition-all hover-scale-sm dropdown-toggle hide-caret ${member.statusClass.replace('text-', 'bg-')}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    type="button"
                  >
                    <span className={`${member.statusClass} d-flex align-items-center`}>
                      &bull; {member.status}
                      <FiChevronDown className="ms-1 opacity-50" size={12} />
                    </span>
                  </button>
                  <ul className={`dropdown-menu shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                    <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Account Status</h6></li>
                    {['Active', 'Inactive', 'Suspended'].map(status => (
                      <li key={status}>
                        <button 
                          className="dropdown-item d-flex align-items-center py-2" 
                          onClick={() => handleStatusChange(member.id, status)}
                        >
                          {status}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </td>
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
                    <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openEditModal(member)}><FiEdit className="me-2" /> Edit Profile</button></li>
                    <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => { setSelectedMember(member); setIsPointsModalOpen(true); }}><FiAward className="me-2" /> Adjust Points</button></li>
                    <li><button className="dropdown-item d-flex align-items-center py-2 text-danger" type="button" onClick={() => requestDeleteMember(member.id)}><FiTrash2 className="me-2" /> Revoke</button></li>
                  </ul>
                </div>
              </td>
            </tr>
          )}
        />
      </div>

      {/* Adjust Points Modal */}
      <AdminModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        title="Adjust Loyalty Points"
        subtitle={`Manually adjust points for ${selectedMember?.name}`}
        isDarkMode={isDarkMode}
      >
        <div className="p-3">
          <div className="h2 text-center text-gold mb-4 fw-bold">{selectedMember?.loyalty_points} <span className="small opacity-50">CURRENT</span></div>
          <div className="mb-4">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Adjustment (use negative for deduction)</label>
            <input 
              type="number" 
              className="form-control glass-input-premium text-center h4" 
              value={pointsChange} 
              onChange={(e) => setPointsChange(parseInt(e.target.value))} 
            />
          </div>
          <div className="d-flex gap-3">
            <button className="btn btn-outline-secondary rounded-pill flex-grow-1" onClick={() => setIsPointsModalOpen(false)}>CANCEL</button>
            <button className="btn btn-purple rounded-pill flex-grow-1" onClick={handleAdjustPoints}>APPLY CHANGE</button>
          </div>
        </div>
      </AdminModal>

      {/* Edit Member Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditMemberId(null); }}
        title="Edit Member Profile"
        subtitle={`Update details for ${editFormData.name || ''}`}
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleEditSubmit}>
          <div className="p-1">
            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Full Name</label>
              <input type="text" name="name" required className="form-control glass-input-premium" value={editFormData.name} onChange={handleEditChange} />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Email Address</label>
              <input type="email" name="email" required className="form-control glass-input-premium" value={editFormData.email} onChange={handleEditChange} />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Phone Number</label>
              <input type="tel" name="phone" className="form-control glass-input-premium" value={editFormData.phone} onChange={handleEditChange} />
            </div>
            <div className="row g-3 mb-4">
              <div className="col-6">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Loyalty Tier</label>
                <select name="loyalty_tier" className="form-select glass-input-premium" value={editFormData.loyalty_tier} onChange={handleEditChange}>
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Status</label>
                <select name="status" className="form-select glass-input-premium" value={editFormData.status} onChange={handleEditChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>
          <div className="border-top border-opacity-10 pt-4 d-flex justify-content-end align-items-center gap-3">
            <button type="button" className="btn px-4 py-2 rounded-pill fw-bold text-secondary" onClick={() => { setIsEditModalOpen(false); setEditMemberId(null); }}>CANCEL</button>
            <button type="submit" className="btn btn-purple px-5 py-2 rounded-pill fw-bold shadow-lg" disabled={editLoading}>
              {editLoading ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Add Member Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Loyalty Registration"
        subtitle="Enrolling a new member to the Kareh Club"
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-4 mb-5">
            <div className="col-lg-4 border-end border-opacity-10 pe-lg-4">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 01</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Member Identity</h4>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Full Name</label>
                <input type="text" name="name" required className="form-control glass-input-premium" value={formData.name} onChange={handleChange} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Email Address</label>
                <input type="email" name="email" required className="form-control glass-input-premium" value={formData.email} onChange={handleChange} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Phone Number</label>
                <input type="tel" name="phone" required className="form-control glass-input-premium" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="col-lg-8 ps-lg-4">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 02</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Loyalty & Initial State</h4>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Member Password</label>
                  <input type="text" name="password" required className="form-control glass-input-premium" value={formData.password} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Assign Tier</label>
                  <select name="loyalty_tier" className="form-select glass-input-premium" value={formData.loyalty_tier} onChange={handleChange}>
                    <option value="Bronze">Bronze</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Initial Points</label>
                  <input type="number" name="loyalty_points" className="form-control glass-input-premium" value={formData.loyalty_points} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-top border-opacity-10 pt-4 d-flex justify-content-end align-items-center">
            <button type="button" className="btn px-4 py-2 rounded-pill fw-bold text-secondary hover-bg-light me-3 transition-all" onClick={() => setIsModalOpen(false)}>CANCEL</button>
            <button type="submit" className="btn btn-purple px-5 py-2 rounded-pill fw-bold shadow-lg transition-all hover-scale" disabled={loading}>
              {loading ? 'ENROLLING...' : 'ENROLL MEMBER'}
            </button>
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
        variant="error"
        isDarkMode={isDarkMode}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setMemberToDelete(null); }}
        onConfirm={handleDeleteMember}
        title="Revoke Membership"
        message="Are you sure you want to revoke this membership?"
        confirmText="Revoke"
        isDarkMode={isDarkMode}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input-simple {
          background: rgba(106, 13, 173, 0.03) !important;
          border: 1px solid rgba(106, 13, 173, 0.1) !important;
          padding: 0.75rem 1rem !important;
          border-radius: 12px !important;
        }
        .btn-purple { background: var(--purple); color: white; border: none; }
        .glass-input-premium {
          background: transparent !important;
          border: 1px solid rgba(106, 13, 173, 0.15) !important;
          padding: 0.9rem 1rem !important;
          border-radius: 14px !important;
        }
        .x-small { font-size: 0.65rem; }
        .hide-caret::after { display: none !important; }
        .text-gold { color: #d4af37 !important; }
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
      `}} />
    </AdminLayout>
  );
};

export default MembersManagementPage;
