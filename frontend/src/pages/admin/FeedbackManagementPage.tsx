import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FiBell, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import { sessionsApi } from '../../api/sessions';
import AdminTable from '../../components/admin/AdminTable';

const FeedbackManagementPage: React.FC = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const [loading, setLoading] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const response = await sessionsApi.getFeedbackNotifications(500);
      const payload = response.data?.data || response.data || {};
      const items = Array.isArray(payload.items) ? payload.items : [];
      setFeedbackItems(items);
      setUnreadCount(Number(payload.unread_count || 0));
    } catch (error) {
      console.error('Failed to load feedback list', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const filteredFeedback = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return feedbackItems;
    return feedbackItems.filter((item: any) =>
      String(item.session_code || '').toLowerCase().includes(query) ||
      String(item.customer_name || '').toLowerCase().includes(query) ||
      String(item.feedback_text || '').toLowerCase().includes(query)
    );
  }, [feedbackItems, searchQuery]);

  const markAsViewed = async (item: any) => {
    if (!item?.id || item?.viewed_at) return;
    try {
      await sessionsApi.markFeedbackViewed(Number(item.id));
      setFeedbackItems((prev) =>
        prev.map((entry) => (entry.id === item.id ? { ...entry, viewed_at: new Date().toISOString() } : entry))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark feedback as viewed', error);
    }
  };

  const markAllAsViewed = async () => {
    try {
      await sessionsApi.markAllFeedbackViewed();
      setFeedbackItems((prev) => prev.map((entry) => ({ ...entry, viewed_at: entry.viewed_at || new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all feedback as viewed', error);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Client Feedback</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">
              Dedicated feedback center for tracking quality and billing experience
            </p>
          </div>
          <button className="btn btn-purple rounded-pill px-4 py-2 fw-bold d-flex align-items-center gap-2" onClick={markAllAsViewed}>
            <FiCheckCircle /> Mark all as viewed
          </button>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center">
              <div className="p-3 rounded-circle bg-danger bg-opacity-10 text-danger me-3">
                <FiBell size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>Unread Feedback</div>
                <div className="h4 mb-0 fw-bold">{unreadCount}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary me-3">
                <FiMessageSquare size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>Total Feedback Records</div>
                <div className="h4 mb-0 fw-bold">{feedbackItems.length}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-3 rounded-4 mb-4 border-1 shadow-sm">
          <input
            type="text"
            className="form-control glass-input-simple"
            placeholder="Search by session code, client name, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <AdminTable
          isDarkMode={isDarkMode}
          data={filteredFeedback}
          columns={[
            { header: 'Session' },
            { header: 'Client' },
            { header: 'Ratings' },
            { header: 'Feedback' },
            { header: 'Submitted' },
            { header: 'Status', align: 'center' },
            { header: 'Action', align: 'end' },
          ]}
          renderRow={(item: any) => (
            <tr key={item.id} className="align-middle border-bottom border-opacity-10">
              <td className="px-4 py-3 border-0 fw-bold">{item.session_code || `#${item.session_id}`}</td>
              <td className="py-3 border-0">{item.customer_name || 'Client'}</td>
              <td className="py-3 border-0 small">
                Service: <strong>{Number(item.service_rating || 0).toFixed(1)}</strong>
                <br />
                Billing: <strong>{Number(item.billing_rating || 0).toFixed(1)}</strong>
              </td>
              <td className="py-3 border-0 small">{item.feedback_text || <span className="text-secondary">No written comment</span>}</td>
              <td className="py-3 border-0 small">{item.submitted_at ? new Date(item.submitted_at).toLocaleString() : 'N/A'}</td>
              <td className="py-3 border-0 text-center">
                {item.viewed_at ? (
                  <span className="badge bg-success bg-opacity-10 text-success">Viewed</span>
                ) : (
                  <span className="badge bg-danger bg-opacity-10 text-danger">Unread</span>
                )}
              </td>
              <td className="px-4 py-3 border-0 text-end">
                {!item.viewed_at ? (
                  <button className="btn btn-sm btn-purple-outline rounded-pill px-3" onClick={() => markAsViewed(item)}>
                    Mark Viewed
                  </button>
                ) : (
                  <span className="text-secondary small">-</span>
                )}
              </td>
            </tr>
          )}
        />

        {loading && <p className="small text-secondary mt-3 mb-0">Loading feedback...</p>}
      </div>
    </AdminLayout>
  );
};

export default FeedbackManagementPage;
