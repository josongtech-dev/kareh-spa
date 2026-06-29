import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaCalendarCheck, FaClock, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { serviceApi } from '../api/services';
import { staffApi } from '../api/staff';
import { appointmentApi } from '../api/appointments';
import { backendAssetUrl } from '../api/config';
import FeedbackModal from '../components/admin/FeedbackModal';
import ServiceImageThumb from '../components/ServiceImageThumb';
import SearchableSelect from '../components/admin/SearchableSelect';

const extractList = (res: any): any[] => {
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : [];
};

const BookingPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [staffRes, servicesRes] = await Promise.all([
        staffApi.getAttendants(),
        serviceApi.getAll(),
      ]);
      const nextStaff = extractList(staffRes);
      const nextServices = extractList(servicesRes);
      setStaffList(nextStaff);
      setServices(nextServices);
    } catch (error) {
      console.error('Error fetching booking data:', error);
      setStaffList([]);
      setServices([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  useEffect(() => {
    if (!formData.appointment_date) {
      setAvailableSlots([]);
      return;
    }
    const staffId = selectedSpecialist ? Number(selectedSpecialist) : undefined;
    setSlotsLoading(true);
    appointmentApi.checkAvailability(formData.appointment_date, staffId)
      .then(res => {
        const data = res.data?.data ?? res.data;
        setAvailableSlots(data?.available_slots ?? []);
      })
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [formData.appointment_date, selectedSpecialist]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData(prev => {
      const next = { ...prev, appointment_date: newDate };
      // If switching to today and time is already in the past, clear it
      if (newDate === todayStr && prev.appointment_time) {
        const now = new Date();
        const [h, m] = prev.appointment_time.split(':').map(Number);
        if (h < now.getHours() || (h === now.getHours() && m < now.getMinutes())) {
          next.appointment_time = '';
        }
      }
      return next;
    });
  };

  const minTime = formData.appointment_date === todayStr
    ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) return;
    setLoading(true);
    try {
      const response = await appointmentApi.create({
        ...formData,
        service_id: selectedServiceId,
        service_ids: [selectedServiceId],
        staff_id: selectedSpecialist
      });
      const appointment = response?.data?.data?.appointment;
      setBookingCode(appointment?.appointment_code ?? null);
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Booking failed:', error);
      setLoading(false);
      setIsFeedbackModalOpen(true);
    }
  };

  // Filter staff based on search
  const filteredStaff = (Array.isArray(staffList) ? staffList : []).filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (staff.skill && staff.skill.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch && staff.status === 'Active';
  });

  // Build category options from services
  const categoryOptions = useMemo(() => {
    const cats = new Map<string, string>();
    services.forEach((s: any) => {
      if (s.category_id && s.category_name) cats.set(String(s.category_id), s.category_name);
    });
    return Array.from(cats.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  // Filter services by selected category
  const filteredServices = useMemo(() => {
    let list = services;
    if (selectedCategoryId) {
      list = list.filter((s: any) => String(s.category_id) === selectedCategoryId);
    }
    return list;
  }, [services, selectedCategoryId]);

  // Selected service object
  const selectedService = useMemo(
    () => services.find((s: any) => String(s.id) === String(selectedServiceId)) || null,
    [services, selectedServiceId]
  );

  const handleServiceChange = (val: string) => {
    setSelectedServiceId(val);
    if (val) {
      const svc = services.find((s: any) => String(s.id) === val);
      if (svc?.category_id) setSelectedCategoryId(String(svc.category_id));
    }
  };

  if (success) {
    return (
      <div className="bg-black min-vh-100 d-flex align-items-center justify-content-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-5 rounded-5 text-center"
        >
          <div className="text-success mb-4"><FaCalendarCheck size={80} /></div>
          <h2 className="display-4 Oswald mb-3">RESERVATION SENT!</h2>
          <p className="Outfit opacity-75 fs-5">Thank you, {formData.customer_name}. We have received your booking request.</p>
          {bookingCode && (
            <p className="Outfit fs-4 fw-bold text-gradient mb-3">Booking Code: {bookingCode}</p>
          )}
          <p className="Outfit opacity-50 mb-4">A team member will call you shortly on {formData.customer_phone} to confirm your slot.</p>
          {formData.customer_email && (
            <p className="Outfit opacity-75 small mb-5">
              A confirmation email has been sent to <strong>{formData.customer_email}</strong>.
              You will be notified once your appointment is confirmed.
            </p>
          )}
          {!formData.customer_email && (
            <p className="Outfit opacity-50 small mb-5">You will be notified upon confirmation.</p>
          )}
          <button className="btn btn-purple px-5 py-3 rounded-pill fw-bold" onClick={() => window.location.href = '/'}>
            BACK TO HOME
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-black min-vh-100 py-5 position-relative overflow-hidden">
      <div className="mesh-glow opacity-30"></div>

      {/* Specialist Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed inset-0 w-100 h-100 d-flex align-items-center justify-content-center p-4"
            style={{ zIndex: 9999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel rounded-5 p-4 p-md-5 position-relative"
              style={{ maxWidth: '600px', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="btn btn-link position-absolute top-0 end-0 m-4 text-white p-0" onClick={() => setActiveModal(null)}>
                <FaTimes size={24} />
              </button>

              <div className="row g-4 align-items-center">
                <div className="col-md-5">
                   <img
                     src={activeModal.image_path ? backendAssetUrl(activeModal.image_path) : 'https://via.placeholder.com/400'}
                     alt={activeModal.name}
                     className="w-100 rounded-4 shadow-lg object-fit-cover-top"
                     style={{ height: '250px' }}
                    />
                </div>
                <div className="col-md-7">
                   <div className="d-flex align-items-center gap-3 mb-2">
                      <span className="text-gradient tracking-widest text-uppercase fw-bold small">{activeModal.role}</span>
                   </div>
                   <h2 className="Oswald display-6 fw-bold mb-3">{activeModal.name}</h2>
                   <p className="Outfit fw-semibold text-gold mb-2">EXPERTISE:</p>
                   <p className="Outfit opacity-75 small mb-3">{activeModal.skill || 'Lead Specialist'}</p>
                   <p className="Outfit opacity-50 small m-0">{activeModal.additional_info || 'Highly experienced in luxury spa treatments and grooming.'}</p>

                   <button
                     className="btn btn-purple mt-4 w-100"
                     onClick={() => { setSelectedSpecialist(String(activeModal.id)); setActiveModal(null); }}
                   >
                     SELECT AS MY SPECIALIST
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container py-5 mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <motion.div
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               className="glass-panel rounded-5 p-4 p-md-5 overflow-hidden position-relative"
            >
              <div className="row">
                <div className="col-lg-7">
                  <span className="text-gradient tracking-widest text-uppercase d-block mb-2 fw-bold">Reservation</span>
                  <h2 className="display-4 fw-bold Oswald mb-4">BOOK YOUR <span className="text-playfair italic">Session</span></h2>

                  <form className="mt-5" onSubmit={handleSubmit}>
                    <div className="row g-4">
                      {/* Personal Info */}
                      <div className="col-md-6">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Full Name</label>
                        <input type="text" name="customer_name" required className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-2 Outfit shadow-none" placeholder="Your Name" value={formData.customer_name} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Phone Number</label>
                        <input type="tel" name="customer_phone" required className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-2 Outfit shadow-none" placeholder="07xx xxx xxx" value={formData.customer_phone} onChange={handleInputChange} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Email Address <span className="opacity-50 fw-normal">(optional)</span></label>
                        <input type="email" name="customer_email" className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-2 Outfit shadow-none" placeholder="you@example.com" value={formData.customer_email} onChange={handleInputChange} />
                      </div>

                      {/* Service Selection */}
                      <div className="col-12">
                        <label className="form-label small tracking-widest text-uppercase opacity-50 mb-3">Select Service</label>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <SearchableSelect
                              value={selectedCategoryId}
                              onChange={setSelectedCategoryId}
                              options={[
                                { value: '', label: 'All categories' },
                                ...categoryOptions.map(c => ({ value: String(c.id), label: c.name })),
                              ]}
                              placeholder="Category..."
                              inputClassName="rounded-4 p-2 shadow-none Outfit"
                              dark
                            />
                          </div>
                          <div className="col-md-6">
                            <SearchableSelect
                              value={selectedServiceId}
                              onChange={handleServiceChange}
                              options={[
                                { value: '', label: 'Select a service...' },
                                ...filteredServices.map((s: any) => ({
                                  value: String(s.id),
                                  label: s.name,
                                })),
                              ]}
                              placeholder="Service..."
                              inputClassName="rounded-4 p-2 shadow-none Outfit"
                              dark
                            />
                          </div>
                        </div>

                        {selectedService && (
                          <div className="mt-3 p-3 rounded-4 border border-white border-opacity-10 bg-dark bg-opacity-25">
                            <div className="d-flex align-items-center gap-3">
                              <ServiceImageThumb
                                imageUrl={selectedService.image_url}
                                alt={selectedService.name || 'Service'}
                                size={48}
                              />
                              <div className="flex-grow-1">
                              <div className="fw-semibold small">{selectedService.name}</div>
                              </div>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-light rounded-pill px-3 py-1"
                                onClick={() => { setSelectedServiceId(''); setSelectedCategoryId(''); }}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Specialist Selection */}
                      <div className="col-12 mt-4">
                        <div className="d-flex flex-wrap justify-content-between align-items-end mb-3 gap-3">
                          <label className="form-label small tracking-widest text-uppercase opacity-50 mb-0 d-block">Choose Your Specialist (Optional)</label>
                          <div className="position-relative" style={{ zIndex: 10 }}>
                            <div className="floating-label-group position-relative">
                              <input
                                type="text"
                                className="form-control bg-dark border-white border-opacity-20 text-white rounded-pill px-4 pt-3 pb-1 shadow-none"
                                style={{ width: '250px', fontSize: '14px', background: 'rgba(0,0,0,0.5)', height: '45px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search Name..."
                              />
                            </div>
                          </div>
                        </div>

                        <div className="row g-3">
                          {filteredStaff.length > 0 ? filteredStaff.slice(0, 4).map((spec) => (
                            <div className="col-sm-6 col-md-3" key={spec.id}>
                              <div
                                className={`position-relative rounded-4 p-2 transition-all cursor-pointer border ${selectedSpecialist === String(spec.id) ? 'border-purple bg-purple bg-opacity-10 shadow-purple' : 'border-white border-opacity-10'}`}
                                onClick={() => setSelectedSpecialist(String(spec.id))}
                              >
                                <div
                                  className="rounded-circle overflow-hidden mb-2 mx-auto border border-white border-opacity-25"
                                  style={{ width: 'clamp(64px, 18vw, 84px)', height: 'clamp(64px, 18vw, 84px)' }}
                                >
                                   <img
                                     src={spec.image_path ? backendAssetUrl(spec.image_path) : 'https://via.placeholder.com/400'}
                                     alt={spec.name}
                                     className="w-100 h-100 object-fit-cover-top rounded-circle"
                                    />
                                </div>
                                <h6 className="Oswald m-0 small text-uppercase lh-sm">{spec.name}</h6>
                                <p className="Outfit opacity-50 m-0" style={{ fontSize: '10px' }}>{spec.role}</p>
                                <button
                                  type="button"
                                  className="btn btn-link p-0 text-gradient small fw-bold mt-1 text-decoration-none"
                                  style={{ fontSize: '10px' }}
                                  onClick={(e) => { e.stopPropagation(); setActiveModal(spec); }}
                                >
                                  VIEW BIO
                                </button>
                                {selectedSpecialist === String(spec.id) && (
                                   <div className="position-absolute top-0 end-0 p-2 text-purple"><FaCalendarCheck size={14} /></div>
                                )}
                              </div>
                            </div>
                          )) : (
                            <div className="col-12 py-4 text-center">
                              <p className="opacity-50 Outfit m-0 small">No specialists found matching your search.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="col-md-6 mt-4">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Preferred Date</label>
                        <div className="dt-input-wrap">
                          <FaCalendarAlt className="dt-input-icon" />
                          <input type="date" name="appointment_date" required
                            className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-2 Outfit shadow-none dt-input"
                            style={{ colorScheme: 'dark' }}
                            min={todayStr}
                            value={formData.appointment_date}
                            onChange={handleDateChange} />
                        </div>
                      </div>
                      <div className="col-md-6 mt-4">
                        <label className="form-label small tracking-widest text-uppercase opacity-50">Preferred Time</label>
                        {slotsLoading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-white opacity-50" role="status" />
                          </div>
                        ) : availableSlots.length > 0 ? (
                          <div className="d-flex flex-wrap gap-2" style={{ maxHeight: 160, overflowY: 'auto' }}>
                            {availableSlots.map(slot => (
                              <button
                                key={slot}
                                type="button"
                                className={`btn btn-sm rounded-pill px-3 py-1 ${formData.appointment_time === slot ? '' : ''}`}
                                style={{
                                  fontSize: 13,
                                  borderWidth: 1,
                                  background: formData.appointment_time === slot ? '#6a0dad' : 'rgba(255,255,255,0.05)',
                                  border: formData.appointment_time === slot ? '1px solid #6a0dad' : '1px solid rgba(255,255,255,0.15)',
                                  color: '#fff',
                                }}
                                onClick={() => setFormData(prev => ({ ...prev, appointment_time: slot }))}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : formData.appointment_date ? (
                          <div className="text-white-50 small py-2">No available slots. Try another date.</div>
                        ) : (
                          <div className="dt-input-wrap">
                            <FaClock className="dt-input-icon" />
                            <input type="time" name="appointment_time" required
                              className="form-control bg-transparent border-white border-opacity-10 text-white rounded-4 p-2 Outfit shadow-none dt-input"
                              style={{ colorScheme: 'dark' }}
                              min={minTime}
                              value={formData.appointment_time}
                              onChange={handleInputChange} />
                          </div>
                        )}
                      </div>

                      <div className="col-12 mt-5">
                        <button type="submit" className="btn btn-purple w-100 py-2 Oswald fs-6 tracking-widest" disabled={loading || !selectedServiceId}>
                          {loading ? 'SNEAKING YOU IN...' : 'CONFIRM RESERVATION'}
                        </button>
                        <p className="text-center mt-3 small opacity-50 d-flex align-items-center justify-content-center gap-2 Outfit">
                           <FaInfoCircle size={12} /> We will call you to confirm your slot within 15 minutes.
                        </p>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="col-lg-5 mt-5 mt-lg-0">
                   <div className="p-4 p-md-5 rounded-5 h-100 d-flex flex-column justify-content-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <h4 className="Oswald text-gradient mb-4">VISIT US</h4>
                      <p className="Outfit opacity-75 mb-4 fw-light">
                        Located in the heart of Ngong Town, offering a serene escape from the urban hustle.
                      </p>

                      <div className="mb-4">
                        <p className="m-0 fw-bold Outfit">Milele Mall, 1st Floor</p>
                        <p className="m-0 Outfit fw-light opacity-50">Ngong Town, Kenya</p>
                      </div>

                      <div className="mb-4">
                        <p className="m-0 fw-bold Outfit">Mon - Sat: 8:00 AM - 9:00 PM</p>
                        <p className="m-0 fw-bold Outfit">Sunday: 10:00 AM - 7:00 PM</p>
                      </div>

                      <div>
                        <p className="m-0 fw-bold Outfit">+254 743 695 893</p>
                        <p className="m-0 fw-bold Outfit">karehspa2024@gmail.com</p>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Booking Failed"
        message="Something went wrong. Please try again or call us directly."
        variant="error"
      />
    </div>
  );
};

export default BookingPage;
