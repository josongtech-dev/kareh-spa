import React, { useState, useContext, useEffect } from 'react';
import {
  FiUser, FiCamera, FiEdit3, FiPhone, FiMail, FiFileText, FiHash, FiStar, FiSave
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import FeedbackModal from '../../components/admin/FeedbackModal';
import { staffApi } from '../../api/staff';
import { backendAssetUrl } from '../../api/config';
import { getCurrentAdminUser } from '../../adminAccess';

const ProfilePage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackVariant, setFeedbackVariant] = useState<'success' | 'error'>('success');

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    phone: '',
    email: '',
    idNumber: '',
    skill: '',
    additionalInfo: '',
  });

  const currentUser = getCurrentAdminUser();
  const staffId = currentUser?.id;

  const fetchProfile = async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      const res = await staffApi.getById(staffId);
      const data = res.data?.data || res.data;
      setProfile(data);
      setFormData({
        name: data.name || '',
        username: data.username || '',
        phone: data.phone || '',
        email: data.email || '',
        idNumber: data.id_number || '',
        skill: data.skill || '',
        additionalInfo: data.additional_info || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [staffId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return;
    setSaving(true);
    try {
      const form = new FormData();
      form.append('name', formData.name);
      form.append('username', formData.username);
      form.append('phone', formData.phone);
      form.append('email', formData.email);
      form.append('idNumber', formData.idNumber);
      form.append('skill', formData.skill);
      form.append('additionalInfo', formData.additionalInfo);

      const fileInput = document.getElementById('profileImageUpload') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        form.append('passport_image', fileInput.files[0]);
      }

      await staffApi.update(staffId, form);
      setEditPreview(null);
      setFeedbackTitle('Profile Updated');
      setFeedbackMessage('Your profile has been updated successfully.');
      setFeedbackVariant('success');
      setIsFeedbackModalOpen(true);
      fetchProfile();
    } catch (err: any) {
      setFeedbackTitle('Update Failed');
      setFeedbackMessage(err?.response?.data?.message || 'Failed to update profile.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const imageUrl = editPreview || (profile?.image_path ? backendAssetUrl(profile.image_path) : '');

  if (loading) {
    return (
      <AdminLayout>
        <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <div className="spinner-border text-purple" role="status" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container-fluid" style={{ maxWidth: '900px' }}>
        <div className="d-flex align-items-center gap-3 mb-5">
          <div className="bg-purple bg-opacity-10 p-3 rounded-3">
            <FiUser className="text-purple fs-3" />
          </div>
          <div>
            <h1 className="brand-title text-gradient h2 mb-1">My Profile</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">{profile?.role || 'Staff'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* Image Section */}
            <div className="col-lg-4">
              <div className="glass-panel p-4 rounded-4 h-100 d-flex flex-column align-items-center justify-content-center">
                <label className="form-label small text-secondary mb-3 text-uppercase tracking-widest">Profile Photo</label>
                <div
                  className="position-relative mb-4 cursor-pointer"
                  style={{ width: '180px', height: '180px' }}
                  onClick={() => document.getElementById('profileImageUpload')?.click()}
                >
                  <div className="w-100 h-100 rounded-circle border border-secondary border-opacity-25 overflow-hidden profile-upload-placeholder d-flex align-items-center justify-content-center border-dashed">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Profile" className="w-100 h-100 object-fit-cover-top" />
                    ) : (
                      <FiCamera className="fs-1 text-secondary opacity-25" />
                    )}
                  </div>
                  <div className="position-absolute bottom-0 end-0 bg-purple p-2 rounded-circle shadow-lg border edit-badge">
                    <FiEdit3 size={16} className="text-white" />
                  </div>
                </div>
                <input type="file" id="profileImageUpload" hidden accept="image/*" onChange={handleImageChange} />
                <div className="text-center small text-secondary px-2">
                  <p className="mb-1">Click to upload a new photo</p>
                  <p className="mb-0 opacity-75">JPG, PNG or WebP</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="col-lg-8">
              <div className="glass-panel p-4 rounded-4">
                <h5 className="mb-4 text-purple fw-semibold d-flex align-items-center gap-2">
                  <FiEdit3 /> Personal Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">Full Name</label>
                    <div className="input-group">
                      <span className="input-group-text glass-input-simple border-end-0"><FiUser size={14} /></span>
                      <input type="text" name="name" className="form-control glass-input-simple" value={formData.name} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">Username</label>
                    <div className="input-group">
                      <span className="input-group-text glass-input-simple border-end-0"><FiHash size={14} /></span>
                      <input type="text" name="username" className="form-control glass-input-simple" value={formData.username} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">Email</label>
                    <div className="input-group">
                      <span className="input-group-text glass-input-simple border-end-0"><FiMail size={14} /></span>
                      <input type="email" name="email" className="form-control glass-input-simple" value={formData.email} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">Phone</label>
                    <div className="input-group">
                      <span className="input-group-text glass-input-simple border-end-0"><FiPhone size={14} /></span>
                      <input type="text" name="phone" className="form-control glass-input-simple" value={formData.phone} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">ID Number</label>
                    <div className="input-group">
                      <span className="input-group-text glass-input-simple border-end-0"><FiFileText size={14} /></span>
                      <input type="text" name="idNumber" className="form-control glass-input-simple" value={formData.idNumber} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">Skill / Title</label>
                    <div className="input-group">
                      <span className="input-group-text glass-input-simple border-end-0"><FiStar size={14} /></span>
                      <input type="text" name="skill" className="form-control glass-input-simple" value={formData.skill} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">Role</label>
                    <input type="text" className="form-control glass-input-simple" value={profile?.role || ''} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small text-secondary">Status</label>
                    <input type="text" className="form-control glass-input-simple" value={profile?.status || ''} disabled />
                  </div>
                  <div className="col-12">
                    <label className="form-label small text-secondary">Additional Info</label>
                    <textarea name="additionalInfo" rows={3} className="form-control glass-input-simple" value={formData.additionalInfo} onChange={handleChange} />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-4 pt-3 border-top border-secondary border-opacity-10">
                  <button type="submit" className="btn btn-purple rounded-pill px-5 py-2 fw-bold d-flex align-items-center gap-2" disabled={saving}>
                    {saving ? (
                      <><span className="spinner-border spinner-border-sm" /> Saving...</>
                    ) : (
                      <><FiSave /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title={feedbackTitle}
        message={feedbackMessage}
        variant={feedbackVariant}
      />

      <style>{`
        .profile-upload-placeholder {
          background: ${isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'};
          transition: all 0.3s ease;
        }
        .profile-upload-placeholder:hover {
          background: ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'};
        }
        .border-dashed {
          border: 2px dashed ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'} !important;
        }
        .edit-badge {
          transition: transform 0.3s ease;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}</style>
    </AdminLayout>
  );
};

export default ProfilePage;
