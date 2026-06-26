import { useState, useContext, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiChevronDown, FiCheckCircle, FiX, FiClock } from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import FeedbackModal from '../../components/admin/FeedbackModal';
import { inhouseRequestApi } from '../../api/inhouseRequests';
import { getCurrentAdminRole, isAttendant } from '../../adminAccess';

const statusBadge: Record<string, string> = {
  pending: 'bg-warning bg-opacity-10 text-warning',
  approved: 'bg-success bg-opacity-10 text-success',
  completed: 'bg-info bg-opacity-10 text-info',
  cancelled: 'bg-danger bg-opacity-10 text-danger',
};

const InhouseRequestsManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const currentRole = getCurrentAdminRole();
  const canMutate = !isAttendant(currentRole);

  const [requests, setRequests] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await inhouseRequestApi.getAll();
      const data = res.data?.data || res.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching in-house requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await inhouseRequestApi.updateStatus(id, status);
      setFeedbackTitle('Request Updated');
      setFeedbackMessage(`Request has been ${status}.`);
      setFeedbackOpen(true);
      fetchRequests();
    } catch (error: any) {
      setFeedbackTitle('Update Failed');
      setFeedbackMessage(error?.response?.data?.message || 'Failed to update request.');
      setFeedbackOpen(true);
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 m-0 fw-bold">In-House Service Requests</h2>
      </div>

      <AdminTable
        isDarkMode={isDarkMode}
        columns={[
          { header: 'Member' },
          { header: 'Service' },
          { header: 'Location' },
          { header: 'Preferred' },
          { header: 'Status' },
          { header: 'Action', align: 'end' },
        ]}
        data={requests}
        renderRow={(req) => (
          <tr key={req.id} className="align-middle">
            <td className="px-4 py-3 border-0">
              <div className="fw-medium">{req.member_name}</div>
              <div className="d-flex gap-2 small text-secondary mt-1">
                {req.member_email && <span><FiMail size={12} /> {req.member_email}</span>}
                {req.member_phone && <span><FiPhone size={12} /> {req.member_phone}</span>}
              </div>
            </td>
            <td className="py-3 border-0 text-secondary small">{req.service_name}</td>
            <td className="py-3 border-0 text-secondary small">
              <FiMapPin size={12} className="me-1" />{req.location}
              {req.notes && <div className="text-muted small mt-1">{req.notes}</div>}
            </td>
            <td className="py-3 border-0 text-secondary small">
              {req.preferred_date && <div><FiClock size={12} className="me-1" />{req.preferred_date}</div>}
              {req.preferred_time && <div className="text-muted">{String(req.preferred_time).slice(0, 5)}</div>}
            </td>
            <td className="py-3 border-0 small">
              <span className={`badge rounded-pill ${statusBadge[req.status] || 'bg-secondary bg-opacity-10 text-secondary'}`}>
                {req.status}
              </span>
            </td>
            <td className="py-3 border-0 text-end">
              {canMutate && req.status === 'pending' && (
                <div className="dropdown">
                  <button className="btn btn-sm btn-outline-secondary rounded-pill dropdown-toggle hide-caret" data-bs-toggle="dropdown">
                    <FiChevronDown size={14} />
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                    <li><button className="dropdown-item d-flex align-items-center py-2 text-success" type="button" onClick={() => handleStatusChange(req.id, 'approved')}><FiCheckCircle className="me-2" /> Approve</button></li>
                    <li><button className="dropdown-item d-flex align-items-center py-2 text-danger" type="button" onClick={() => handleStatusChange(req.id, 'cancelled')}><FiX className="me-2" /> Reject</button></li>
                  </ul>
                </div>
              )}
              {canMutate && req.status === 'approved' && (
                <button className="btn btn-sm btn-outline-info rounded-pill" onClick={() => handleStatusChange(req.id, 'completed')}>
                  <FiCheckCircle size={14} className="me-1" /> Mark Completed
                </button>
              )}
            </td>
          </tr>
        )}
      />

      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        title={feedbackTitle}
        message={feedbackMessage}
        isDarkMode={isDarkMode}
      />
    </AdminLayout>
  );
};

export default InhouseRequestsManagementPage;
