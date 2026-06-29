import React, { useState, useContext, useEffect } from 'react';
import { 
  FiPlus, FiCalendar, FiSearch, FiMoreHorizontal, 
  FiEdit, FiTrash2, FiClock, 
  FiActivity, FiChevronDown, FiXCircle
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import SuccessModal from '../../components/admin/SuccessModal';
import FeedbackModal from '../../components/admin/FeedbackModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import AdminTable from '../../components/admin/AdminTable';
import { appointmentApi } from '../../api/appointments';
import { sessionsApi } from '../../api/sessions';
import { staffApi } from '../../api/staff';
import { serviceApi } from '../../api/services';
import { getCurrentAdminRole, isManagerOrOwner } from '../../adminAccess';
import ServiceImageThumb from '../../components/ServiceImageThumb';

const AppointmentsManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const currentRole = getCurrentAdminRole();
  const canPickFullStatusOptions = isManagerOrOwner(currentRole);
  const fullAppointmentActions = isManagerOrOwner(currentRole);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackVariant, setFeedbackVariant] = useState<'success' | 'error' | 'info'>('info');
  type AppointmentConfirmDialog =
    | { mode: 'delete'; id: number }
    | { mode: 'cancel'; apt: any };
  const [confirmDialog, setConfirmDialog] = useState<AppointmentConfirmDialog | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [appointmentForSession, setAppointmentForSession] = useState<any | null>(null);
  const [selectedStaffForSession, setSelectedStaffForSession] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<any | null>(null);
  const [isAppointmentDetailsModalOpen, setIsAppointmentDetailsModalOpen] = useState(false);
  const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('attention');
  const [rescheduleData, setRescheduleData] = useState({
    appointment_date: '',
    appointment_time: '',
    staff_id: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [nowTs, setNowTs] = useState(Date.now());
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');
  const [serviceSelectionTouched, setServiceSelectionTouched] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    staff_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [aptRes, staffRes, servicesRes, categoriesRes] = await Promise.all([
        appointmentApi.getAll(),
        staffApi.getAttendants(),
        serviceApi.getAll(),
        serviceApi.getCategories()
      ]);

      const statusClasses: Record<string, string> = {
        'confirmed': 'text-success',
        'pending': 'text-warning',
        'cancelled': 'text-danger',
        'completed': 'text-info',
        'in_session_progress': 'text-primary',
        'session_completed': 'text-success'
      };

      const aptData = (aptRes.data?.data || aptRes.data || []).map((a: any) => ({
        ...a,
        statusLabel:
          a.session_status === 'In Progress' || a.session_status === 'Finalizing'
            ? 'In Session Progress'
            : a.session_status === 'Completed'
              ? 'Session Completed'
              : a.status.charAt(0).toUpperCase() + a.status.slice(1),
        statusClass:
          a.session_status === 'In Progress' || a.session_status === 'Finalizing'
            ? statusClasses['in_session_progress']
            : a.session_status === 'Completed'
              ? statusClasses['session_completed']
              : statusClasses[a.status] || 'text-secondary'
      }));

      const sorted = [...aptData].sort((a: any, b: any) => {
        const priority = (x: any) => {
          const isPending = x.status === 'pending' && !x.session_id;
          const isConfirmed = x.status === 'confirmed' && !x.session_id;
          if (isPending) return 1;
          if (isConfirmed) return 2;
          return 3;
        };
        return priority(a) - priority(b);
      });

      const servicesPayload = servicesRes.data?.data || servicesRes.data || [];
      const normalizedServices = (Array.isArray(servicesPayload) ? servicesPayload : []).map((service: any) => {
        const normalizedCategory = String(service?.category_name || service?.category || '').trim();
        return {
          ...service,
          category: normalizedCategory,
          category_name: normalizedCategory
        };
      });
      const categoriesPayload = categoriesRes.data?.data || categoriesRes.data || [];
      const normalizedCategories = (Array.isArray(categoriesPayload) ? categoriesPayload : [])
        .map((category: any) => String(category?.name || category?.category || category || '').trim())
        .filter(Boolean);

      setAppointments(sorted);
      setStaffList(staffRes.data?.data || staffRes.data || []);
      setServices(normalizedServices);
      setServiceCategories(Array.from(new Set(normalizedCategories)));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getAppointmentStartMs = (apt: any) => {
    if (!apt?.appointment_date || !apt?.appointment_time) return null;
    const dt = new Date(`${apt.appointment_date}T${String(apt.appointment_time).slice(0, 8)}`);
    const ts = dt.getTime();
    return Number.isNaN(ts) ? null : ts;
  };

  const canOpenSession = (apt: any) => {
    const startMs = getAppointmentStartMs(apt);
    if (!startMs) return false;
    return nowTs >= (startMs - 30 * 60 * 1000);
  };

  const isInSessionProgress = (apt: any) =>
    apt?.session_status === 'In Progress' || apt?.session_status === 'Finalizing';
  const isSessionCompleted = (apt: any) => apt?.session_status === 'Completed';
  const isSessionLocked = (apt: any) => isInSessionProgress(apt) || isSessionCompleted(apt);

  const canCancelAppointment = (apt: any) =>
    fullAppointmentActions &&
    !isSessionLocked(apt) &&
    apt.status !== 'cancelled' &&
    apt.status !== 'completed';

  const getSessionAvailabilityDiff = (apt: any) => {
    const startMs = getAppointmentStartMs(apt);
    if (!startMs) return null;
    const availableAtMs = startMs - 30 * 60 * 1000;
    return availableAtMs - nowTs;
  };

  const formatCountdown = (msDiff: number) => {
    const totalSec = Math.floor(msDiff / 1000);
    const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceIds.length) {
      setServiceSelectionTouched(true);
      return;
    }
    setLoading(true);
    try {
      const response = await appointmentApi.create({
        ...formData,
        service_id: selectedServiceIds[0],
        service_ids: selectedServiceIds,
      });
      if (response?.data?.status !== 'success') {
        throw new Error(response?.data?.message || 'Failed to create appointment');
      }
      setLoading(false);
      setIsModalOpen(false);
      
      // Show success modal
      setSuccessMessage("Appointment has been successfully scheduled and recorded.");
      setIsSuccessModalOpen(true);
      
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        staff_id: '',
        appointment_date: '',
        appointment_time: '',
        notes: ''
      });
      setSelectedServiceIds([]);
      setServiceDropdownOpen(false);
      setServiceSearchTerm('');
      setServiceSelectionTouched(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating booking:', error);
      setLoading(false);
      setFeedbackTitle('Booking Failed');
      setFeedbackMessage('Unable to create appointment right now. Please review details and try again.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const closeManualBookingModal = () => {
    setIsModalOpen(false);
    setSelectedServiceIds([]);
    setServiceDropdownOpen(false);
    setServiceSearchTerm('');
    setServiceSelectionTouched(false);
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await appointmentApi.updateStatus(id, status);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const proceedOpenSession = async (apt: any, assignedStaffId: string | number) => {
    try {
      const serviceItems = Array.isArray(apt.service_items) && apt.service_items.length > 0
        ? apt.service_items
        : (apt.service_id
          ? [{
            service_id: apt.service_id,
            price: services.find(s => String(s.id) === String(apt.service_id))?.price ?? 0,
          }]
          : []);

      const primaryService = serviceItems[0];
      const matchedService = primaryService
        ? services.find(s => String(s.id) === String(primaryService.service_id))
        : null;
      const totalAmount = serviceItems.reduce((sum: number, item: any) => {
        const svc = services.find(s => String(s.id) === String(item.service_id));
        const price = parseFloat(String(item.price ?? svc?.price ?? 0).replace(/,/g, ''));
        return sum + (Number.isFinite(price) ? price : 0);
      }, 0);

      const additionalServices = serviceItems.slice(1).map((item: any) => {
        const svc = services.find(s => String(s.id) === String(item.service_id));
        return {
          service_id: item.service_id,
          price: parseFloat(String(item.price ?? svc?.price ?? 0).replace(/,/g, '')),
          assigned_staff_id: Number(assignedStaffId),
        };
      });

      const response = await sessionsApi.create({
        appointment_id: apt.id,
        customer_name: apt.customer_name,
        client_phone: apt.customer_phone || '',
        client_email: apt.customer_email || '',
        service_id: primaryService?.service_id ?? apt.service_id,
        staff_id: assignedStaffId,
        total_amount: totalAmount || (matchedService ? parseFloat(String(matchedService.price).replace(/,/g, '')) : 0),
        additional_services: additionalServices,
        notes: apt.notes || ''
      });

      if (response?.data?.status !== 'success') {
        throw new Error(response?.data?.message || 'Unable to open session from appointment');
      }

      const createdSession = response?.data?.data?.session;
      if (!createdSession?.id) {
        throw new Error('Session was not returned after creation. Please refresh and try again.');
      }

      setSuccessMessage(`Session opened for ${apt.customer_name} from appointment ${apt.appointment_code}.`);
      setIsSuccessModalOpen(true);
      await fetchData();
    } catch (error: any) {
      console.error('Error opening session:', error);
      setFeedbackTitle('Open Session Failed');
      setFeedbackMessage(error?.response?.data?.message || error?.message || 'Failed to open session from appointment.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const handleOpenSession = async (apt: any) => {
    if (!apt.staff_id) {
      setAppointmentForSession(apt);
      setSelectedStaffForSession('');
      setIsAssignStaffModalOpen(true);
      return;
    }
    await proceedOpenSession(apt, apt.staff_id);
  };

  const handleAssignStaffAndOpen = async () => {
    if (!appointmentForSession || !selectedStaffForSession) return;
    try {
      await appointmentApi.update(appointmentForSession.id, { staff_id: selectedStaffForSession });
      setIsAssignStaffModalOpen(false);
      await proceedOpenSession(
        { ...appointmentForSession, staff_id: selectedStaffForSession },
        selectedStaffForSession
      );
      setAppointmentForSession(null);
      setSelectedStaffForSession('');
    } catch (error) {
      setFeedbackTitle('Staff Assignment Failed');
      setFeedbackMessage('Unable to assign staff for this appointment.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const openRescheduleModal = (apt: any) => {
    setAppointmentToEdit(apt);
    setRescheduleData({
      appointment_date: apt.appointment_date || '',
      appointment_time: String(apt.appointment_time || '').slice(0, 5),
      staff_id: apt.staff_id ? String(apt.staff_id) : ''
    });
    setIsRescheduleModalOpen(true);
  };

  const handleSaveReschedule = async () => {
    if (!appointmentToEdit) return;
    try {
      await appointmentApi.update(appointmentToEdit.id, {
        appointment_date: rescheduleData.appointment_date,
        appointment_time: rescheduleData.appointment_time,
        staff_id: rescheduleData.staff_id || null
      });
      setIsRescheduleModalOpen(false);
      setAppointmentToEdit(null);
      setSuccessMessage('Appointment schedule/attendant updated successfully.');
      setIsSuccessModalOpen(true);
      await fetchData();
    } catch (error) {
      setFeedbackTitle('Update Failed');
      setFeedbackMessage('Unable to update appointment schedule/attendant.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
    }
  };

  const openAppointmentDetails = (apt: any) => {
    setSelectedAppointmentDetails(apt);
    setIsAppointmentDetailsModalOpen(true);
  };

  const requestDeleteAppointment = (id: number) => {
    setConfirmDialog({ mode: 'delete', id });
  };

  const requestCancelAppointment = (apt: any) => {
    setCancelReasonInput('');
    setConfirmDialog({ mode: 'cancel', apt });
  };

  const handleConfirmDialog = async () => {
    if (!confirmDialog) return;
    if (confirmDialog.mode === 'delete') {
      try {
        await appointmentApi.delete(confirmDialog.id);
        await fetchData();
      } catch (error) {
        setFeedbackTitle('Delete Failed');
        setFeedbackMessage('Unable to delete appointment. Please try again.');
        setFeedbackVariant('error');
        setIsFeedbackModalOpen(true);
      } finally {
        setConfirmDialog(null);
        setCancelReasonInput('');
      }
      return;
    }

    const apt = confirmDialog.apt;
    const reason = cancelReasonInput.trim();
    try {
      const payload: Record<string, unknown> = { status: 'cancelled' };
      if (reason) {
        payload.cancel_reason = reason;
        const existingNotes = String(apt.notes || '').trim();
        payload.notes = existingNotes
          ? `${existingNotes}\n\nStaff cancellation: ${reason}`
          : `Staff cancellation: ${reason}`;
      }
      await appointmentApi.update(apt.id, payload);
      setConfirmDialog(null);
      setCancelReasonInput('');
      setSuccessMessage('Appointment has been cancelled.');
      setIsSuccessModalOpen(true);
      await fetchData();
    } catch (error) {
      setFeedbackTitle('Cancel Failed');
      setFeedbackMessage('Unable to cancel appointment. Please try again.');
      setFeedbackVariant('error');
      setIsFeedbackModalOpen(true);
      setConfirmDialog(null);
      setCancelReasonInput('');
    }
  };

  const filteredAppointments = appointments
    .filter((apt) => {
      const searchMatch =
        apt.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.staff_name && apt.staff_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        apt.appointment_code.toLowerCase().includes(searchQuery.toLowerCase());
      if (!searchMatch) return false;

      if (statusFilter === 'attention') {
        return (apt.status === 'pending' && !apt.session_id) || (apt.status === 'confirmed' && !apt.session_id);
      }
      if (statusFilter === 'pending') return apt.status === 'pending' && !apt.session_id;
      if (statusFilter === 'confirmed') return apt.status === 'confirmed' && !apt.session_id;
      if (statusFilter === 'in_session_progress') return isInSessionProgress(apt);
      if (statusFilter === 'session_completed') return isSessionCompleted(apt);
      if (statusFilter === 'cancelled') return apt.status === 'cancelled';
      if (statusFilter === 'completed') return apt.status === 'completed' && !apt.session_id;
      return true;
    })
    .sort((a: any, b: any) => {
      if (statusFilter === 'attention') {
        const priority = (x: any) => ((x.status === 'pending' && !x.session_id) ? 1 : (x.status === 'confirmed' && !x.session_id ? 2 : 3));
        return priority(a) - priority(b);
      }
      return 0;
    });

  const serviceCategoryOrder = Array.from(
    new Set(
      [
        ...serviceCategories,
        ...services.map((service: any) => String(service?.category_name || service?.category || '').trim())
      ].filter(Boolean)
    )
  );
  const groupedServices = serviceCategoryOrder.map((category) => ({
    category,
    items: services.filter((service: any) => {
      const serviceCategory = String(service?.category_name || service?.category || '').trim();
      return serviceCategory === category;
    })
  })).filter((group) => group.items.length > 0);
  const uncategorizedServices = services.filter((service: any) => {
    const serviceCategory = String(service?.category_name || service?.category || '').trim();
    return !serviceCategory;
  });

  const normalizedServiceSearch = serviceSearchTerm.trim().toLowerCase();
  const filterServiceBySearch = (service: any) => {
    if (!normalizedServiceSearch) return true;
    const name = String(service?.name || '').toLowerCase();
    const description = String(service?.description || '').toLowerCase();
    const price = String(service?.price || '').toLowerCase();
    return name.includes(normalizedServiceSearch) || description.includes(normalizedServiceSearch) || price.includes(normalizedServiceSearch);
  };
  const filteredGroupedServices = groupedServices
    .map((group) => ({ ...group, items: group.items.filter(filterServiceBySearch) }))
    .filter((group) => group.items.length > 0);
  const filteredUncategorizedServices = uncategorizedServices.filter(filterServiceBySearch);
  const hasVisibleServices = filteredGroupedServices.length > 0 || filteredUncategorizedServices.length > 0;
  const selectedServiceObjects = selectedServiceIds
    .map((id) => services.find((s: any) => String(s.id) === String(id)))
    .filter(Boolean);
  const selectedServicesTotal = selectedServiceObjects.reduce((sum: number, service: any) => {
    const value = Number(String(service?.price ?? 0).replace(/,/g, '')) || 0;
    return sum + value;
  }, 0);

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Booking Management</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Track and schedule client appointments</p>
          </div>
          <button 
            onClick={() => {
              setIsModalOpen(true);
              setSelectedServiceIds([]);
              setServiceDropdownOpen(false);
              setServiceSearchTerm('');
              setServiceSelectionTouched(false);
            }}
            className="btn btn-purple rounded-pill px-4 py-3 fw-bold d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale"
          >
            <FiPlus className="me-2" /> MANUAL BOOKING
          </button>
        </div>

        {/* Stats Summary Panel */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-purple bg-opacity-10 text-purple rounded-circle"><FiCalendar /></div>
                <div>
                  <div className="x-small text-uppercase tracking-wider text-secondary fw-bold">Total Bookings</div>
                  <div className="h4 mb-0 fw-bold">{appointments.length}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 bg-warning bg-opacity-10 text-warning rounded-circle"><FiClock /></div>
                <div>
                  <div className="x-small text-uppercase tracking-wider text-secondary fw-bold">Pending Actions</div>
                  <div className="h4 mb-0 fw-bold">{appointments.filter(a => a.status === 'pending').length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="glass-panel p-3 rounded-4 mb-4 border-1 shadow-sm">
          <div className="row g-3">
            <div className="col-md-5">
              <label className="form-label x-small fw-bold text-uppercase tracking-wider text-secondary mb-1">
                Search Appointments (Customer, Staff, or Code)
              </label>
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="text" 
                  className="form-control glass-input-simple ps-5" 
                  placeholder="Search by customer, staff or code..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <label className="form-label x-small fw-bold text-uppercase tracking-wider text-secondary mb-1">
                Filter by Status
              </label>
              <div className="position-relative">
                <select
                  className="form-select glass-input-simple pe-5"
                  aria-label="Filter appointments by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="attention">Needs Attention (Default)</option>
                  <option value="pending">Pending Approval</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_session_progress">In Session Progress</option>
                  <option value="session_completed">Session Completed</option>
                  <option value="completed">Completed (No Session)</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="all">All</option>
                </select>
                <FiChevronDown
                  className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary opacity-75"
                  style={{ pointerEvents: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <AdminTable 
          isDarkMode={isDarkMode}
          data={filteredAppointments}
          columns={[
            { header: 'ID / Code' },
            { header: 'Client' },
            { header: 'Service' },
            { header: 'Practitioner' },
            { header: 'Date, Time & Countdown' },
            { header: 'Status', align: 'center' },
            { header: 'Action', align: 'end' as const }
          ]}
          renderRow={(apt) => (
            <tr key={apt.id} className="align-middle border-bottom border-opacity-10">
              <td className="px-4 py-4 border-0">
                <div className="fw-bold x-small text-secondary">{apt.appointment_code}</div>
              </td>
              <td className="py-4 border-0">
                <div className="fw-bold small">{apt.customer_name}</div>
                <div className="x-small text-muted">{apt.customer_phone}</div>
              </td>
              <td className="py-4 border-0 text-secondary small">
                <div className="d-flex align-items-center gap-2">
                  <ServiceImageThumb
                    imageUrl={services.find((s: any) => String(s.id) === String(apt.service_id))?.image_url}
                    alt=""
                    size={40}
                  />
                  <span>{apt.service_name || 'N/A'}</span>
                </div>
              </td>
              <td className="py-4 border-0">
                <div className="small fw-medium">{apt.staff_name || 'Any Available'}</div>
              </td>
              <td className="py-4 border-0">
                <div className="small fw-medium">{apt.appointment_date}</div>
                <div className="x-small text-secondary">{apt.appointment_time}</div>
                {(() => {
                  if (isInSessionProgress(apt)) return null;
                  if (isSessionCompleted(apt)) {
                    return (
                      <div className="x-small text-success fw-bold mt-1">
                        Completed at {apt.session_end_time ? new Date(apt.session_end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </div>
                    );
                  }
                  const startTs = getAppointmentStartMs(apt);
                  if (!startTs) return null;
                  const diff = startTs - nowTs;
                  if (diff > 0) {
                    return <div className="x-small text-primary fw-bold mt-1">Starts in {formatCountdown(diff)}</div>;
                  }
                  return <div className="x-small text-secondary mt-1">Started {formatCountdown(Math.abs(diff))} ago</div>;
                })()}
              </td>
              <td className="py-4 border-0 text-center">
                {isSessionLocked(apt) ? (
                  <span className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 border-0 ${apt.statusClass.replace('text-', 'bg-')}`}>
                    <span className={`${apt.statusClass} d-flex align-items-center`}>&bull; {apt.statusLabel}</span>
                  </span>
                ) : (
                  <div className="dropdown">
                    <button 
                      className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 cursor-pointer border-0 transition-all hover-scale-sm dropdown-toggle hide-caret ${apt.statusClass.replace('text-', 'bg-')}`}
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      type="button"
                    >
                      <span className={`${apt.statusClass} d-flex align-items-center`}>
                        &bull; {apt.statusLabel}
                        <FiChevronDown className="ms-1 opacity-50" size={12} />
                      </span>
                    </button>
                    <ul className={`dropdown-menu shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                      {(canPickFullStatusOptions ? ['pending', 'confirmed', 'cancelled', 'completed'] : ['pending', 'confirmed']).map(status => (
                        <li key={status}>
                          <button className="dropdown-item py-2" onClick={() => handleStatusChange(apt.id, status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </td>
              <td className="px-4 py-4 border-0 text-end">
                {isSessionLocked(apt) ? (
                  <button
                    className="btn btn-sm btn-purple-outline rounded-pill px-3 py-2 fw-bold x-small"
                    onClick={() => openAppointmentDetails(apt)}
                  >
                    VIEW DETAILS
                  </button>
                ) : (
                  <div className="dropdown">
                    <button className={`btn btn-sm p-2 rounded-circle border-0 ${isDarkMode ? 'text-white hover-bg-white-10' : 'text-dark hover-bg-black-10'}`} type="button" data-bs-toggle="dropdown">
                      <FiMoreHorizontal />
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                      {apt.status === 'confirmed' && !apt.session_id && (
                        <li>
                          <button
                            className="dropdown-item py-2 d-flex align-items-center"
                            disabled={!canOpenSession(apt)}
                            onClick={() => handleOpenSession(apt)}
                          >
                            <FiActivity className="me-2 text-success" /> Open Session
                          </button>
                        </li>
                      )}
                      {apt.status === 'confirmed' && !apt.session_id && !canOpenSession(apt) && (
                        <li>
                          <span className="dropdown-item-text x-small text-warning">
                            Available in {formatCountdown(Math.max(0, getSessionAvailabilityDiff(apt) || 0))}
                          </span>
                        </li>
                      )}
                      {fullAppointmentActions && (
                        <>
                          <li>
                            <button className="dropdown-item py-2 d-flex align-items-center" onClick={() => openRescheduleModal(apt)}>
                              <FiEdit className="me-2 text-primary" /> Reschedule / Reassign
                            </button>
                          </li>
                          {canCancelAppointment(apt) && (
                            <li>
                              <button
                                type="button"
                                className="dropdown-item py-2 d-flex align-items-center text-warning"
                                onClick={() => requestCancelAppointment(apt)}
                              >
                                <FiXCircle className="me-2" /> Cancel appointment
                              </button>
                            </li>
                          )}
                          <li><button className="dropdown-item py-2 d-flex align-items-center text-danger" onClick={() => requestDeleteAppointment(apt.id)}><FiTrash2 className="me-2" /> Delete</button></li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </td>
            </tr>
          )}
        />
      </div>

      {/* Manual Booking Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={closeManualBookingModal}
        title="New Internal Booking"
        subtitle="Schedule walk-in or phone inquiries"
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleSubmit} className={`admin-booking-form ${isDarkMode ? 'theme-dark' : 'theme-light'}`}>
          <div className="row g-4 mb-5">
             <div className="col-lg-4 border-end border-opacity-10 pe-lg-4">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 01</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Client Identity</h4>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Client Name</label>
                <input type="text" name="customer_name" required className="form-control glass-input-premium" value={formData.customer_name} onChange={handleChange} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Phone Number</label>
                <input type="tel" name="customer_phone" required className="form-control glass-input-premium" value={formData.customer_phone} onChange={handleChange} />
              </div>
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Email (Optional)</label>
                <input type="email" name="customer_email" className="form-control glass-input-premium" value={formData.customer_email} onChange={handleChange} />
              </div>
            </div>

            <div className="col-lg-8 ps-lg-4">
               <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 02</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Schedule & Services</h4>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Date</label>
                  <input type="date" name="appointment_date" required className="form-control glass-input-premium" value={formData.appointment_date} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Time</label>
                  <input type="time" name="appointment_time" required className="form-control glass-input-premium" value={formData.appointment_time} onChange={handleChange} />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Service</label>
                  <div className="booking-service-dropdown">
                    <button
                      type="button"
                      className={`booking-service-trigger ${serviceDropdownOpen ? 'is-open' : ''}`}
                      onClick={() => setServiceDropdownOpen((prev) => !prev)}
                    >
                      <div className="booking-service-trigger-copy">
                        <span className="booking-service-trigger-label">
                          {selectedServiceIds.length
                            ? `${selectedServiceIds.length} service${selectedServiceIds.length > 1 ? 's' : ''} selected`
                            : 'Select Service'}
                        </span>
                        <span className="booking-service-trigger-meta">
                          {selectedServiceIds.length
                            ? `KES ${selectedServicesTotal.toLocaleString()} total`
                            : 'Choose from available services'}
                        </span>
                      </div>
                      <FiChevronDown className={`booking-service-trigger-icon ${serviceDropdownOpen ? 'is-open' : ''}`} />
                    </button>

                    {serviceDropdownOpen && (
                      <div className="booking-service-picker rounded-4 border border-white border-opacity-10 overflow-hidden mt-2">
                        <div className="booking-service-picker-toolbar">
                          <span className="small opacity-75">Choose one or more services</span>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-light rounded-pill px-3 py-1"
                            onClick={() => setServiceDropdownOpen(false)}
                          >
                            Close
                          </button>
                        </div>
                        <div className="booking-service-search-wrap">
                          <input
                            type="text"
                            className="form-control booking-service-search-input shadow-none"
                            placeholder="Search service, description or price..."
                            value={serviceSearchTerm}
                            onChange={(e) => setServiceSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="booking-service-picker-header d-none d-md-grid">
                          <span>Preview</span>
                          <span>Service</span>
                          <span className="text-end">Price</span>
                        </div>
                        <div className="booking-service-picker-body">
                          {filteredGroupedServices.map((group) => (
                            <div key={group.category} className="booking-service-group">
                              <div className="booking-service-group-title">{group.category}</div>
                              {group.items.map((s: any) => {
                                const selectedCount = selectedServiceIds.filter((id) => String(id) === String(s.id)).length;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    className={`booking-service-row ${selectedCount > 0 ? 'is-active' : ''}`}
                                    onClick={() => {
                                      setSelectedServiceIds((prev) => [...prev, String(s.id)]);
                                      setServiceSelectionTouched(false);
                                    }}
                                  >
                                    <ServiceImageThumb
                                      imageUrl={s.image_url}
                                      alt={s.name || 'Service'}
                                      size={48}
                                      className="booking-service-thumb"
                                    />
                                    <div className="booking-service-meta">
                                      <span className="booking-service-name">{s.name}</span>
                                      {s.description ? <span className="booking-service-desc">{s.description}</span> : null}
                                    </div>
                                    <span className="booking-service-price">
                                      KES {s.price}
                                      {selectedCount > 0 ? ` · x${selectedCount}` : ''}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          ))}
                          {filteredUncategorizedServices.length > 0 && (
                            <div className="booking-service-group">
                              <div className="booking-service-group-title">Other Services</div>
                              {filteredUncategorizedServices.map((s: any) => {
                                const selectedCount = selectedServiceIds.filter((id) => String(id) === String(s.id)).length;
                                return (
                                  <button
                                    key={s.id}
                                    type="button"
                                    className={`booking-service-row ${selectedCount > 0 ? 'is-active' : ''}`}
                                    onClick={() => {
                                      setSelectedServiceIds((prev) => [...prev, String(s.id)]);
                                      setServiceSelectionTouched(false);
                                    }}
                                  >
                                    <ServiceImageThumb
                                      imageUrl={s.image_url}
                                      alt={s.name || 'Service'}
                                      size={48}
                                      className="booking-service-thumb"
                                    />
                                    <div className="booking-service-meta">
                                      <span className="booking-service-name">{s.name}</span>
                                      {s.description ? <span className="booking-service-desc">{s.description}</span> : null}
                                    </div>
                                    <span className="booking-service-price">
                                      KES {s.price}
                                      {selectedCount > 0 ? ` · x${selectedCount}` : ''}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                          {!hasVisibleServices && (
                            <div className="booking-service-empty">No services match your search.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {serviceSelectionTouched && !selectedServiceIds.length && (
                    <p className="small text-warning mt-2 mb-0">Please select at least one service.</p>
                  )}
                </div>
                <div className="col-12">
                  {selectedServiceObjects.length > 0 && (
                    <div className="selected-services-panel mt-1 mb-1 p-3 rounded-4 border">
                      <div className="d-flex justify-content-between align-items-center mb-2 gap-2">
                        <div className="small fw-semibold">Selected Services</div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light rounded-pill px-3 py-1"
                          onClick={() => setSelectedServiceIds([])}
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {selectedServiceObjects.map((service: any, idx: number) => (
                          <div key={`${service.id}-${idx}`} className="d-flex align-items-center justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <ServiceImageThumb imageUrl={service.image_url} alt={service.name || 'Service'} size={36} />
                              <span className="small">{service.name}</span>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="small selected-services-price">KES {service.price}</span>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light rounded-pill px-2 py-0"
                                onClick={() => setSelectedServiceIds((prev) => prev.filter((_, itemIdx) => itemIdx !== idx))}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="small fw-semibold selected-services-price mt-2">
                        Total: KES {selectedServicesTotal.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Staff (Optional)</label>
                  <select name="staff_id" className="form-select glass-input-premium" value={formData.staff_id} onChange={handleChange}>
                    <option value="">Any Available</option>
                    {staffList.filter(s => s.status === 'Active').map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Notes</label>
                  <textarea name="notes" className="form-control glass-input-premium" rows={3} value={formData.notes} onChange={handleChange}></textarea>
                </div>
              </div>
            </div>
          </div>
          <div className="border-top border-opacity-10 pt-4 d-flex justify-content-end align-items-center">
            <button type="button" className="btn px-4 py-2 rounded-pill fw-bold text-secondary hover-bg-light me-3 transition-all" onClick={closeManualBookingModal}>CANCEL</button>
            <button type="submit" className="btn btn-purple px-5 py-2 rounded-pill fw-bold shadow-lg transition-all hover-scale" disabled={loading}>
              {loading ? 'BOOKING...' : 'CONFIRM BOOKING'}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={isAssignStaffModalOpen}
        onClose={() => { setIsAssignStaffModalOpen(false); setAppointmentForSession(null); setSelectedStaffForSession(''); }}
        title="Assign Staff Before Session"
        subtitle={appointmentForSession ? `Appointment ${appointmentForSession.appointment_code}` : 'Assign staff'}
        isDarkMode={isDarkMode}
        maxWidth="560px"
      >
        <div className="py-2">
          <p className="small text-secondary mb-3">
            This appointment has no assigned staff. Select a staff member before opening the session.
          </p>
          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Staff Member</label>
          <select
            className="form-select glass-input-premium mb-4"
            value={selectedStaffForSession}
            onChange={(e) => setSelectedStaffForSession(e.target.value)}
          >
            <option value="">Select Staff</option>
            {staffList.filter((s: any) => s.status === 'Active').map((s: any) => (
              <option key={s.id} value={s.id}>{s.name} ({s.skill || 'Generalist'})</option>
            ))}
          </select>
          <div className="d-flex justify-content-end gap-2">
            <button className="btn px-4 py-2 rounded-pill fw-bold text-secondary" onClick={() => { setIsAssignStaffModalOpen(false); setAppointmentForSession(null); setSelectedStaffForSession(''); }}>
              Cancel
            </button>
            <button className="btn btn-purple px-4 py-2 rounded-pill fw-bold" disabled={!selectedStaffForSession} onClick={handleAssignStaffAndOpen}>
              Assign & Open Session
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isRescheduleModalOpen}
        onClose={() => { setIsRescheduleModalOpen(false); setAppointmentToEdit(null); }}
        title="Reschedule Appointment"
        subtitle={appointmentToEdit ? appointmentToEdit.appointment_code : 'Update appointment'}
        isDarkMode={isDarkMode}
        maxWidth="620px"
      >
        <div className="py-2">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">New Date</label>
              <input
                type="date"
                className="form-control glass-input-premium"
                value={rescheduleData.appointment_date}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, appointment_date: e.target.value }))}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">New Time</label>
              <input
                type="time"
                className="form-control glass-input-premium"
                value={rescheduleData.appointment_time}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, appointment_time: e.target.value }))}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Reassign Attendant</label>
              <select
                className="form-select glass-input-premium"
                value={rescheduleData.staff_id}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, staff_id: e.target.value }))}
              >
                <option value="">Any Available</option>
                {staffList.filter((s: any) => s.status === 'Active').map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.skill || 'Generalist'})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button className="btn px-4 py-2 rounded-pill fw-bold text-secondary" onClick={() => { setIsRescheduleModalOpen(false); setAppointmentToEdit(null); }}>
              Cancel
            </button>
            <button
              className="btn btn-purple px-4 py-2 rounded-pill fw-bold"
              onClick={handleSaveReschedule}
              disabled={!rescheduleData.appointment_date || !rescheduleData.appointment_time}
            >
              Save Changes
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isAppointmentDetailsModalOpen}
        onClose={() => { setIsAppointmentDetailsModalOpen(false); setSelectedAppointmentDetails(null); }}
        title="Appointment Details"
        subtitle={selectedAppointmentDetails ? selectedAppointmentDetails.appointment_code : 'Details'}
        isDarkMode={isDarkMode}
        maxWidth="700px"
      >
        {selectedAppointmentDetails ? (
          <div className="row g-3">
            <div className="col-md-6"><strong>Client:</strong> {selectedAppointmentDetails.customer_name}</div>
            <div className="col-md-6"><strong>Phone:</strong> {selectedAppointmentDetails.customer_phone || 'N/A'}</div>
            <div className="col-md-6 d-flex align-items-center gap-2 flex-wrap">
              <strong>Service:</strong>
              <ServiceImageThumb
                imageUrl={services.find((s: any) => String(s.id) === String(selectedAppointmentDetails.service_id))?.image_url}
                alt=""
                size={36}
              />
              <span>{selectedAppointmentDetails.service_name || 'N/A'}</span>
            </div>
            <div className="col-md-6"><strong>Attendant:</strong> {selectedAppointmentDetails.staff_name || 'Unassigned'}</div>
            <div className="col-md-6"><strong>Date:</strong> {selectedAppointmentDetails.appointment_date}</div>
            <div className="col-md-6"><strong>Time:</strong> {selectedAppointmentDetails.appointment_time}</div>
            <div className="col-md-6"><strong>Status:</strong> {selectedAppointmentDetails.statusLabel || selectedAppointmentDetails.status}</div>
            <div className="col-md-6"><strong>Session Status:</strong> {selectedAppointmentDetails.session_status || 'Not started'}</div>
            <div className="col-12"><strong>Notes:</strong> {selectedAppointmentDetails.notes || 'No notes provided.'}</div>
          </div>
        ) : (
          <p className="small text-secondary mb-0">No details available.</p>
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
        title={feedbackTitle}
        message={feedbackMessage}
        variant={feedbackVariant}
        isDarkMode={isDarkMode}
      />

      <ConfirmModal
        isOpen={confirmDialog !== null}
        onClose={() => { setConfirmDialog(null); setCancelReasonInput(''); }}
        onConfirm={handleConfirmDialog}
        title={confirmDialog?.mode === 'cancel' ? 'Cancel appointment' : 'Delete Appointment'}
        message={
          confirmDialog?.mode === 'cancel'
            ? 'The booking will stay in the system with status cancelled. Use delete only if the record should be removed entirely.'
            : 'Are you sure you want to delete this appointment?'
        }
        confirmText={confirmDialog?.mode === 'cancel' ? 'Cancel appointment' : 'Delete'}
        confirmButtonClassName={confirmDialog?.mode === 'cancel' ? 'btn-warning text-dark' : 'btn-danger'}
        isDarkMode={isDarkMode}
      >
        {confirmDialog?.mode === 'cancel' && (
          <div className="mb-4">
            <label className={`form-label small fw-bold ${isDarkMode ? 'text-secondary' : 'text-muted'}`}>
              Reason (optional)
            </label>
            <textarea
              className={`form-control glass-input-simple ${isDarkMode ? 'bg-dark text-white border-secondary' : ''}`}
              rows={3}
              value={cancelReasonInput}
              onChange={(e) => setCancelReasonInput(e.target.value)}
              placeholder="e.g. Client requested cancellation"
            />
          </div>
        )}
      </ConfirmModal>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input-simple {
          background: rgba(106, 13, 173, 0.03) !important;
          border: 1px solid rgba(106, 13, 173, 0.1) !important;
          padding: 0.75rem 1rem !important;
          border-radius: 12px !important;
        }
        .btn-purple { background: var(--purple); color: white; border: none; }
        .glass-input-premium {
          background: rgba(255, 255, 255, 0.04) !important;
          border: 1px solid rgba(106, 13, 173, 0.15) !important;
          padding: 0.9rem 1rem !important;
          border-radius: 14px !important;
        }
        .admin-booking-form.theme-light .form-label.text-secondary {
          color: #495057 !important;
        }
        .admin-booking-form.theme-light .glass-input-premium {
          color: #1f2937 !important;
          background: rgba(255, 255, 255, 0.95) !important;
          border-color: rgba(106, 13, 173, 0.25) !important;
        }
        .admin-booking-form.theme-light .glass-input-premium::placeholder {
          color: rgba(31, 41, 55, 0.68) !important;
        }
        .admin-booking-form.theme-light .booking-service-trigger,
        .admin-booking-form.theme-light .booking-service-picker {
          background: #ffffff !important;
          color: #1f2937 !important;
          border-color: rgba(106, 13, 173, 0.24) !important;
        }
        .admin-booking-form.theme-light .booking-service-trigger-meta,
        .admin-booking-form.theme-light .booking-service-desc,
        .admin-booking-form.theme-light .booking-service-empty {
          color: #4b5563 !important;
          opacity: 1 !important;
        }
        .admin-booking-form.theme-light .booking-service-picker-toolbar,
        .admin-booking-form.theme-light .booking-service-search-wrap,
        .admin-booking-form.theme-light .booking-service-picker-header {
          background: #f8fafc !important;
          border-color: rgba(106, 13, 173, 0.14) !important;
          color: #4b5563 !important;
        }
        .admin-booking-form.theme-light .booking-service-group-title {
          background: #f3e8ff !important;
          border-color: rgba(106, 13, 173, 0.14) !important;
          color: #6a0dad !important;
        }
        .admin-booking-form.theme-light .booking-service-row {
          color: #1f2937 !important;
          border-bottom-color: rgba(106, 13, 173, 0.12) !important;
        }
        .admin-booking-form.theme-light .booking-service-row:hover {
          background: rgba(106, 13, 173, 0.06) !important;
        }
        .admin-booking-form.theme-light .booking-service-row.is-active {
          background: linear-gradient(135deg, rgba(106, 13, 173, 0.18), rgba(217, 0, 130, 0.1)) !important;
        }
        .admin-booking-form.theme-light .booking-service-search-input {
          color: #1f2937 !important;
          background: #ffffff !important;
          border-color: rgba(106, 13, 173, 0.25) !important;
        }
        .admin-booking-form.theme-light .booking-service-search-input::placeholder {
          color: #6b7280 !important;
        }
        .selected-services-panel {
          border-color: rgba(255, 255, 255, 0.12) !important;
          background: rgba(255, 255, 255, 0.04) !important;
        }
        .selected-services-price {
          color: var(--gold) !important;
        }
        .admin-booking-form.theme-light .selected-services-panel {
          border-color: rgba(106, 13, 173, 0.2) !important;
          background: #ffffff !important;
          color: #1f2937 !important;
        }
        .admin-booking-form.theme-light .selected-services-price {
          color: #7c3aed !important;
        }
        .x-small { font-size: 0.65rem; }
        .hide-caret::after { display: none !important; }
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

export default AppointmentsManagementPage;
