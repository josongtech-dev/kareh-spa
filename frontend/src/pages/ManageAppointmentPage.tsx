import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appointmentManageApi } from '../api/appointmentManage';
import { serviceApi } from '../api/services';
import ServiceImageThumb from '../components/ServiceImageThumb';

const ManageAppointmentPage: React.FC = () => {
  const [params] = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [appointment, setAppointment] = useState<any | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceImageUrl, setServiceImageUrl] = useState<string | undefined>();

  const fetchAppointment = async () => {
    if (!token) {
      setError('Appointment management token is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await appointmentManageApi.getByToken(token);
      const payload = response.data?.data || response.data || {};
      setAppointment(payload);
      setNewDate(payload.appointment_date || '');
      setNewTime(payload.appointment_time ? String(payload.appointment_time).slice(0, 5) : '');
      setNotes(payload.notes || '');
      setCancelReason(payload.cancel_reason || '');
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointment();
  }, [token]);

  useEffect(() => {
    const sid = appointment?.service_id;
    if (!sid) {
      setServiceImageUrl(undefined);
      return;
    }
    let cancelled = false;
    serviceApi
      .getById(Number(sid))
      .then((res) => {
        const d = res.data?.data || res.data;
        if (!cancelled) setServiceImageUrl(d?.image_url);
      })
      .catch(() => {
        if (!cancelled) setServiceImageUrl(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [appointment?.service_id]);

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      setError('Please provide both new date and time.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await appointmentManageApi.manage({
        token,
        action: 'reschedule',
        appointment_date: newDate,
        appointment_time: newTime,
      });
      setSuccess('Appointment rescheduled successfully.');
      await fetchAppointment();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to reschedule appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a cancellation reason.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await appointmentManageApi.manage({
        token,
        action: 'cancel',
        cancel_reason: cancelReason.trim(),
      });
      setSuccess('Appointment cancelled successfully.');
      await fetchAppointment();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    setError('');
    try {
      await appointmentManageApi.manage({
        token,
        action: 'notes',
        notes,
      });
      setSuccess('Notes updated successfully.');
      await fetchAppointment();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update notes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-black min-vh-100 py-5">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="glass-panel rounded-5 p-4 p-md-5">
          <h1 className="Oswald display-6 mb-2">Manage Appointment</h1>
          <p className="opacity-75 mb-4">Use this page to reschedule, cancel, or add notes to your appointment.</p>

          {loading && <p className="mb-0">Loading appointment...</p>}
          {!loading && error && <div className="alert alert-danger">{error}</div>}
          {!loading && success && <div className="alert alert-success">{success}</div>}

          {!loading && appointment && (
            <>
              <div className="mb-4 p-3 rounded-4 border border-opacity-10">
                <div className="small opacity-75">Appointment</div>
                <div className="fw-bold">{appointment.appointment_code} - {appointment.customer_name}</div>
                <div className="small mt-2 d-flex align-items-center gap-2">
                  <ServiceImageThumb imageUrl={serviceImageUrl} alt="" size={44} />
                  <span>Service: {appointment.service_name || 'N/A'}</span>
                </div>
                <div className="small">Current Slot: {appointment.appointment_date} {String(appointment.appointment_time || '').slice(0, 5)}</div>
                <div className="small">Status: {appointment.status}</div>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <div className="p-3 rounded-4 border border-opacity-10 h-100">
                    <h5 className="mb-3">Reschedule</h5>
                    <div className="mb-2">
                      <label className="form-label small">New date</label>
                      <input type="date" className="form-control" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">New time</label>
                      <input type="time" className="form-control" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
                    </div>
                    <button className="btn btn-purple w-100" disabled={saving} onClick={handleReschedule}>
                      {saving ? 'Saving...' : 'Reschedule Appointment'}
                    </button>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 rounded-4 border border-opacity-10 h-100">
                    <h5 className="mb-3">Cancel Appointment</h5>
                    <label className="form-label small">Reason (required)</label>
                    <textarea
                      className="form-control mb-3"
                      rows={4}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please tell us why you are cancelling."
                    />
                    <button className="btn btn-danger w-100" disabled={saving} onClick={handleCancel}>
                      {saving ? 'Saving...' : 'Cancel Appointment'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-4 border border-opacity-10">
                <h5 className="mb-3">Additional Notes</h5>
                <textarea
                  className="form-control mb-3"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for the spa team."
                />
                <button className="btn btn-outline-light" disabled={saving} onClick={handleSaveNotes}>
                  {saving ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAppointmentPage;
