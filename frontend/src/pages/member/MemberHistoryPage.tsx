import React, { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import MemberLayout from './MemberLayout';
import { appointmentApi } from '../../api/appointments';
import { serviceApi } from '../../api/services';
import ServiceImageThumb from '../../components/ServiceImageThumb';

const MemberHistoryPage: React.FC = () => {
  const memberUser = JSON.parse(localStorage.getItem('member_user') || 'null');
  const [history, setHistory] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const imageForRow = (item: any) => {
    const byId = services.find((s: any) => String(s.id) === String(item.service_id));
    if (byId?.image_url) return byId.image_url as string;
    const name = String(item.service_name || '').trim();
    if (!name) return undefined;
    return services.find((s: any) => String(s.name || '').trim() === name)?.image_url as string | undefined;
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const email = memberUser?.email;
        if (!email) { setLoading(false); return; }
        const [apptRes, svcRes] = await Promise.all([
          appointmentApi.getByCustomerEmail(email),
          serviceApi.getAll()
        ]);
        const data = apptRes.data?.data || apptRes.data || [];
        const svcData = svcRes.data?.data || svcRes.data || [];
        const rows = Array.isArray(data) ? data : [];
        setServices(Array.isArray(svcData) ? svcData : []);
        const memberHistory = rows.filter((a: any) =>
          (a.status === 'completed' || a.session_status === 'Completed')
        );
        setHistory(memberHistory);
      } catch (error) {
        console.error('Failed to load member service history', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [memberUser?.email]);

  return (
    <MemberLayout>
      <h1 className="brand-title text-gradient mb-2">Services Had</h1>
      <p className="text-secondary mb-4">Your completed appointment history.</p>

      <div className="glass-panel rounded-4 p-4">
        <h5 className="d-flex align-items-center gap-2 mb-3"><FiClock /> History</h5>
        {loading && <p className="text-secondary mb-0">Loading history...</p>}
        {!loading && history.length === 0 && <p className="text-secondary mb-0">No completed services yet.</p>}
        {!loading && history.length > 0 && (
          <div className="table-responsive">
            <table className="table table-dark table-borderless small mb-0">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item: any) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <ServiceImageThumb imageUrl={imageForRow(item)} alt="" size={40} />
                        <span>{item.service_name || 'Service'}</span>
                      </div>
                    </td>
                    <td>{item.appointment_date || '-'}</td>
                    <td>{String(item.appointment_time || '').slice(0, 5) || '-'}</td>
                    <td>{item.session_status || item.status || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MemberLayout>
  );
};

export default MemberHistoryPage;
