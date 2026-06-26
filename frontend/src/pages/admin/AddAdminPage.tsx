import React, { useState } from 'react';
import { FiUser, FiShield, FiStar, FiCamera, FiPhone, FiMail, FiFileText, FiEdit3, FiHash } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import FeedbackModal from '../../components/admin/FeedbackModal';

const AddAdminPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skill: '',
    phone: '',
    email: '',
    idNumber: '',
    additionalInfo: '',
    notes: ''
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsFeedbackModalOpen(true);
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="container-fluid" style={{ maxWidth: '1000px' }}>
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Staff Onboarding</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Enroll new team members into the system</p>
          </div>
          <FiShield className="text-gold fs-1 opacity-25" />
        </div>

        <form onSubmit={handleSubmit} className="row g-4">
          {/* Image Upload Section */}
          <div className="col-lg-4 text-center">
            <div className="glass-panel p-4 rounded-4 h-100 d-flex flex-column align-items-center justify-content-center">
              <label className="form-label small text-secondary mb-3 text-uppercase tracking-widest">Passport Image</label>
              <div 
                className="position-relative mb-4 cursor-pointer" 
                style={{ width: '180px', height: '180px' }}
                onClick={() => document.getElementById('imageUpload')?.click()}
              >
                <div className="w-100 h-100 rounded-circle border border-secondary border-opacity-25 overflow-hidden profile-upload-placeholder d-flex align-items-center justify-content-center border-dashed">
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-100 h-100 object-fit-cover-top" />
                  ) : (
                    <FiCamera className="fs-1 text-secondary opacity-25" />
                  )}
                </div>
                <div className="position-absolute bottom-0 end-0 bg-purple p-2 rounded-circle shadow-lg border edit-badge">
                  <FiEdit3 size={16} className="text-white" />
                </div>
              </div>
              <input 
                type="file" 
                id="imageUpload" 
                hidden 
                accept="image/*" 
                onChange={handleImageChange}
              />
              <p className="small text-secondary px-3">Upload a professional passport-sized photo for the staff ID card.</p>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="col-lg-8">
            <div className="glass-panel p-4 p-md-5 rounded-4 h-100">
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">Full Name</label>
                  <div className="position-relative">
                    <FiUser className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input type="text" name="name" className="form-control glass-input ps-5" placeholder="Enter name" required value={formData.name} onChange={handleChange} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">Role</label>
                  <div className="position-relative">
                    <FiShield className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <select name="role" className="form-select glass-input ps-5" required value={formData.role} onChange={handleChange}>
                      <option value="">Select Role</option>
                      <option value="owner">System Owner</option>
                      <option value="manager">Manager</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="attendant">Staff Attendant</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">Primary Skill</label>
                  <div className="position-relative">
                    <FiStar className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input type="text" name="skill" className="form-control glass-input ps-5" placeholder="e.g. Barbering, Massage" required value={formData.skill} onChange={handleChange} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">ID / Passport Number</label>
                  <div className="position-relative">
                    <FiHash className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input type="text" name="idNumber" className="form-control glass-input ps-5" placeholder="National ID or Passport" required value={formData.idNumber} onChange={handleChange} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">Phone Number</label>
                  <div className="position-relative">
                    <FiPhone className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input type="tel" name="phone" className="form-control glass-input ps-5" placeholder="07XX XXX XXX" required value={formData.phone} onChange={handleChange} />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">Email Address</label>
                  <div className="position-relative">
                    <FiMail className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                    <input type="email" name="email" className="form-control glass-input ps-5" placeholder="email@karehspa.com" required value={formData.email} onChange={handleChange} />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">Additional Information</label>
                  <div className="position-relative">
                    <FiFileText className="position-absolute top-0 start-0 m-3 text-secondary" />
                    <textarea name="additionalInfo" className="form-control glass-input ps-5 pt-3" placeholder="Certifications, previous experience..." rows={3} value={formData.additionalInfo} onChange={handleChange}></textarea>
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label small text-secondary mb-2 ms-1 text-uppercase tracking-wider">Private Notes (Optional)</label>
                  <div className="position-relative">
                    <FiEdit3 className="position-absolute top-0 start-0 m-3 text-secondary" />
                    <textarea name="notes" className="form-control glass-input ps-5 pt-3" placeholder="Internal HR notes..." rows={2} value={formData.notes} onChange={handleChange}></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="d-flex justify-content-end gap-3 mt-3">
              <button type="button" className="btn btn-outline-secondary px-5 py-3 rounded-3" onClick={() => navigate('/admin/dashboard')}>CANCEL</button>
              <button type="submit" className="btn btn-purple px-5 py-3 rounded-3 fw-bold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : 'SAVE STAFF MEMBER'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input {
          padding: 1rem 1rem 1rem 3rem !important;
          transition: all 0.3s ease;
        }
        .border-dashed {
          border-style: dashed !important;
        }
        .edit-badge {
          border-color: #000 !important;
        }
        body.admin-light .edit-badge {
          border-color: #fff !important;
        }
        .profile-upload-placeholder {
          background: #1a1a1a;
        }
        body.admin-light .profile-upload-placeholder {
          background: #f8f9fa;
        }
        .cursor-pointer {
          cursor: pointer;
        }
      `}} />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          navigate('/admin/dashboard');
        }}
        title="Success"
        message="Admin/Staff added successfully!"
        variant="success"
      />
    </AdminLayout>
  );
};

export default AddAdminPage;
