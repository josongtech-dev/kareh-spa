import React, { useEffect, useMemo, useState } from 'react';
import { FiGift, FiCopy, FiSend, FiClock, FiTag } from 'react-icons/fi';
import { serviceApi } from '../../api/services';
import { appointmentApi } from '../../api/appointments';
import { inhouseRequestApi } from '../../api/inhouseRequests';
import MemberLayout from './MemberLayout';
import ServiceImageThumb from '../../components/ServiceImageThumb';

const MemberDashboardPage: React.FC = () => {
  const memberUser = JSON.parse(localStorage.getItem('member_user') || 'null');
  const [services, setServices] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [bookingForm, setBookingForm] = useState({
    service_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [requestForm, setRequestForm] = useState({
    service_id: '',
    preferred_date: '',
    preferred_time: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        const email = memberUser?.email;
        const [servicesRes, appointmentsRes, requestsRes] = await Promise.all([
          serviceApi.getAll(),
          email ? appointmentApi.getByCustomerEmail(email) : Promise.resolve({ data: { data: [] } }),
          memberUser?.id ? inhouseRequestApi.getByMember(memberUser.id) : Promise.resolve({ data: { data: [] } })
        ]);
        const servicesData = servicesRes.data?.data || servicesRes.data || [];
        const appointmentsData = appointmentsRes.data?.data || appointmentsRes.data || [];
        const requestsData = requestsRes.data?.data || requestsRes.data || [];
        setServices(Array.isArray(servicesData) ? servicesData.filter((s: any) => (s.status || 'Active') === 'Active') : []);

        const memberHistory = (Array.isArray(appointmentsData) ? appointmentsData : []).filter((a: any) =>
          a.status === 'completed' || a.session_status === 'Completed'
        );
        setHistory(memberHistory);
        setRequests(Array.isArray(requestsData) ? requestsData : []);
      } catch (error) {
        console.error('Failed to load member dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [memberUser?.id, memberUser?.email]);

  const referralCode = useMemo(() => `KAREH-${String(memberUser?.id || 0).padStart(4, '0')}`, [memberUser?.id]);

  const historyServiceImage = (item: any) => {
    const byId = services.find((s: any) => String(s.id) === String(item.service_id));
    if (byId?.image_url) return byId.image_url as string;
    const name = String(item.service_name || '').trim();
    if (!name) return undefined;
    return services.find((s: any) => String(s.name || '').trim() === name)?.image_url as string | undefined;
  };

  const bookingSelectedService = useMemo(
    () => services.find((s: any) => String(s.id) === String(bookingForm.service_id)),
    [services, bookingForm.service_id]
  );

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setNotice('Referral code copied.');
    } catch {
      setNotice('Unable to copy code right now.');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberUser?.id) return;
    setRequestLoading(true);
    setNotice('');
    try {
      await inhouseRequestApi.create({
        member_id: memberUser.id,
        ...requestForm
      });
      setNotice('In-house service request submitted.');
      setRequestForm({
        service_id: '',
        preferred_date: '',
        preferred_time: '',
        location: '',
        notes: ''
      });
      const refreshed = await inhouseRequestApi.getByMember(memberUser.id);
      setRequests(refreshed.data?.data || refreshed.data || []);
    } catch (error) {
      console.error('Failed to submit in-house request', error);
      setNotice('Failed to submit request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberUser?.name || !memberUser?.phone) {
      setNotice('Your account profile is incomplete (name/phone required).');
      return;
    }
    setBookingLoading(true);
    setNotice('');
    try {
      await appointmentApi.create({
        customer_name: memberUser.name,
        customer_phone: memberUser.phone,
        customer_email: memberUser.email || '',
        service_id: bookingForm.service_id,
        appointment_date: bookingForm.appointment_date,
        appointment_time: bookingForm.appointment_time,
        notes: bookingForm.notes
      });
      setNotice('Booking request sent successfully.');
      setBookingForm({
        service_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });
    } catch (error) {
      console.error('Failed to submit booking', error);
      setNotice('Failed to submit booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <MemberLayout>
      <div className="container-fluid">
        <h1 className="brand-title text-gradient mb-2">Member Dashboard</h1>
        <p className="text-secondary mb-4">Welcome back, {memberUser?.name || 'Member'}.</p>

        {notice && <div className="alert alert-info border-0 rounded-4 py-2">{notice}</div>}
        {loading && <p className="text-secondary">Loading your dashboard...</p>}

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="glass-panel rounded-4 p-4 h-100">
              <h5 className="d-flex align-items-center gap-2 mb-3"><FiTag /> Services Price List</h5>
              <div className="table-responsive">
                <table className="table table-dark table-borderless align-middle mb-0">
                  <tbody>
                    {services.map((service: any) => (
                      <tr key={service.id}>
                        <td className="text-nowrap" style={{ width: 1 }}>
                          <ServiceImageThumb imageUrl={service.image_url} alt={service.name || ''} size={40} />
                        </td>
                        <td>{service.name}</td>
                        <td className="text-end text-gold fw-bold">KES {Number(service.price || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-panel rounded-4 p-4 h-100">
              <h5 className="d-flex align-items-center gap-2 mb-3"><FiClock /> Services You've Had</h5>
              {history.length === 0 ? (
                <p className="text-secondary mb-0">No completed service history yet.</p>
              ) : (
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {history.slice(0, 8).map((item: any) => (
                    <li key={item.id} className="p-2 rounded-3 border border-white border-opacity-10 d-flex justify-content-between align-items-center gap-2">
                      <span className="d-flex align-items-center gap-2 min-w-0">
                        <ServiceImageThumb imageUrl={historyServiceImage(item)} alt="" size={36} />
                        <span className="text-truncate">{item.service_name || 'Service'}</span>
                      </span>
                      <small className="text-secondary flex-shrink-0">{item.appointment_date}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-panel rounded-4 p-4 h-100">
              <h5 className="d-flex align-items-center gap-2 mb-3"><FiTag /> Book a Service</h5>
              <form onSubmit={handleBookingSubmit} className="row g-2">
                <div className="col-12">
                  <select
                    className="form-select bg-dark text-white border-white border-opacity-10"
                    required
                    value={bookingForm.service_id}
                    onChange={(e) => setBookingForm({ ...bookingForm, service_id: e.target.value })}
                  >
                    <option value="">Select service</option>
                    {services.map((service: any) => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                {bookingSelectedService && (
                  <div className="col-12 d-flex align-items-center gap-3 py-2 px-3 rounded-3 border border-white border-opacity-10">
                    <ServiceImageThumb imageUrl={bookingSelectedService.image_url} alt={bookingSelectedService.name || ''} size={52} />
                    <span className="small text-secondary mb-0">{bookingSelectedService.description || 'Premium treatment'}</span>
                  </div>
                )}
                <div className="col-6">
                  <input
                    type="date"
                    className="form-control bg-dark text-white border-white border-opacity-10"
                    required
                    value={bookingForm.appointment_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value })}
                  />
                </div>
                <div className="col-6">
                  <input
                    type="time"
                    className="form-control bg-dark text-white border-white border-opacity-10"
                    required
                    value={bookingForm.appointment_time}
                    onChange={(e) => setBookingForm({ ...bookingForm, appointment_time: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <textarea
                    className="form-control bg-dark text-white border-white border-opacity-10"
                    rows={3}
                    placeholder="Optional notes"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <button className="btn btn-purple w-100" type="submit" disabled={bookingLoading}>
                    {bookingLoading ? 'Submitting...' : 'Book Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-panel rounded-4 p-4 h-100">
              <h5 className="d-flex align-items-center gap-2 mb-3"><FiGift /> Promos & Invite</h5>
              <div className="mb-3 p-3 rounded-3 border border-warning border-opacity-25">
                <p className="mb-1 fw-bold">Invite & Earn Points</p>
                <p className="small text-secondary mb-2">Share your code and get bonus loyalty points when a friend joins.</p>
                <div className="d-flex gap-2">
                  <code className="px-3 py-2 rounded-3 bg-dark text-gold">{referralCode}</code>
                  <button className="btn btn-outline-light btn-sm" onClick={copyReferralCode}><FiCopy /></button>
                </div>
              </div>
              <ul className="small text-secondary mb-0">
                <li>10% off manicure every Tuesday.</li>
                <li>Free beard touch-up after 4 completed visits.</li>
                <li>Members get priority weekend slots.</li>
              </ul>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-panel rounded-4 p-4 h-100">
              <h5 className="d-flex align-items-center gap-2 mb-3"><FiSend /> Request In-House Service</h5>
              <form onSubmit={handleRequestSubmit} className="row g-2">
                <div className="col-12">
                  <select className="form-select bg-dark text-white border-white border-opacity-10" required value={requestForm.service_id} onChange={(e) => setRequestForm({ ...requestForm, service_id: e.target.value })}>
                    <option value="">Select service</option>
                    {services.map((service: any) => (
                      <option key={service.id} value={service.id}>{service.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <input type="date" className="form-control bg-dark text-white border-white border-opacity-10" value={requestForm.preferred_date} onChange={(e) => setRequestForm({ ...requestForm, preferred_date: e.target.value })} />
                </div>
                <div className="col-6">
                  <input type="time" className="form-control bg-dark text-white border-white border-opacity-10" value={requestForm.preferred_time} onChange={(e) => setRequestForm({ ...requestForm, preferred_time: e.target.value })} />
                </div>
                <div className="col-12">
                  <input type="text" className="form-control bg-dark text-white border-white border-opacity-10" placeholder="Your location/address" required value={requestForm.location} onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })} />
                </div>
                <div className="col-12">
                  <textarea className="form-control bg-dark text-white border-white border-opacity-10" rows={3} placeholder="Any notes or instructions" value={requestForm.notes} onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}></textarea>
                </div>
                <div className="col-12">
                  <button className="btn btn-purple w-100" type="submit" disabled={requestLoading}>
                    {requestLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-4 p-4 mt-4">
          <h6 className="mb-3">Your In-House Requests</h6>
          {requests.length === 0 ? (
            <p className="text-secondary mb-0 small">No in-house requests yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-dark table-borderless small mb-0">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Preferred</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request: any) => (
                    <tr key={request.id}>
                      <td>{request.service_name}</td>
                      <td>{request.preferred_date || '-'} {request.preferred_time || ''}</td>
                      <td>{request.location}</td>
                      <td className="text-capitalize">{request.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
};

export default MemberDashboardPage;
