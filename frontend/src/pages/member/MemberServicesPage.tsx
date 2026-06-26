import React, { useEffect, useMemo, useState } from 'react';
import { FiSend, FiTag, FiX } from 'react-icons/fi';
import MemberLayout from './MemberLayout';
import { serviceApi } from '../../api/services';
import { appointmentApi } from '../../api/appointments';
import { inhouseRequestApi } from '../../api/inhouseRequests';
import { staffApi } from '../../api/staff';
import ServiceImageThumb from '../../components/ServiceImageThumb';

const MemberServicesPage: React.FC = () => {
  const memberUser = JSON.parse(localStorage.getItem('member_user') || 'null');
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [bookingForm, setBookingForm] = useState({
    category: '',
    service_id: '',
    staff_id: '',
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
    const loadServicesAndStaff = async () => {
      try {
        const [servicesRes, staffRes] = await Promise.all([
          serviceApi.getAll(),
          staffApi.getAttendants()
        ]);
        const serviceData = servicesRes.data?.data || servicesRes.data || [];
        const staffData = staffRes.data?.data || staffRes.data || [];
        setServices(Array.isArray(serviceData) ? serviceData.filter((s: any) => (s.status || 'Active') === 'Active') : []);
        setStaffList(Array.isArray(staffData) ? staffData.filter((s: any) => s.status === 'Active') : []);
      } catch (error) {
        console.error('Failed to load member services', error);
      } finally {
        setLoading(false);
      }
    };
    loadServicesAndStaff();
  }, []);

  const categoryOptions = useMemo(
    () => Array.from(new Set(services.map((s: any) => s.category_name || s.category || 'General Services'))),
    [services]
  );

  const visibleServices = useMemo(() => {
    return services.filter((service: any) => {
      const categoryName = service.category_name || service.category || 'General Services';
      const categoryMatch = !selectedCategory || categoryName === selectedCategory;
      const searchMatch =
        !serviceSearch ||
        String(service.name || '').toLowerCase().includes(serviceSearch.toLowerCase()) ||
        String(service.description || '').toLowerCase().includes(serviceSearch.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [services, selectedCategory, serviceSearch]);

  const groupedVisibleServices = useMemo(() => {
    const groups: Record<string, any[]> = {};
    visibleServices.forEach((service: any) => {
      const categoryName = service.category_name || service.category || 'General Services';
      if (!groups[categoryName]) groups[categoryName] = [];
      groups[categoryName].push(service);
    });
    return groups;
  }, [visibleServices]);

  const bookingServiceOptions = useMemo(() => {
    if (!bookingForm.category) return services;
    return services.filter((service: any) => (service.category_name || service.category || 'General Services') === bookingForm.category);
  }, [services, bookingForm.category]);

  const bookingSelectedService = useMemo(
    () => services.find((s: any) => String(s.id) === String(bookingForm.service_id)),
    [services, bookingForm.service_id]
  );

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberUser?.name || !memberUser?.phone) {
      setNotice('Your profile is incomplete (name/phone required).');
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
        staff_id: bookingForm.staff_id || null,
        appointment_date: bookingForm.appointment_date,
        appointment_time: bookingForm.appointment_time,
        notes: bookingForm.notes
      });
      setNotice('Booking request sent successfully.');
      setIsBookingModalOpen(false);
      setBookingForm({
        category: '',
        service_id: '',
        staff_id: '',
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

  const handleInhouseSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      console.error('Failed to submit in-house request', error);
      setNotice('Failed to submit in-house request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <MemberLayout>
      <h1 className="brand-title text-gradient mb-2">Services</h1>
      <p className="text-secondary mb-4">View price list and make bookings.</p>
      {notice && <div className="alert alert-info border-0 rounded-4 py-2">{notice}</div>}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="glass-panel rounded-4 p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="d-flex align-items-center gap-2 mb-0"><FiTag /> Services Price List</h5>
              <button className="btn btn-purple btn-sm" onClick={() => setIsBookingModalOpen(true)}>Book Appointment</button>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-md-5">
                <select
                  className="form-select bg-dark text-white border-white border-opacity-10"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control bg-dark text-white border-white border-opacity-10"
                  placeholder="Search services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
              </div>
            </div>
            {loading ? (
              <p className="text-secondary mb-0">Loading services...</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {Object.keys(groupedVisibleServices).length === 0 && (
                  <p className="text-secondary mb-0">No services match your filters.</p>
                )}
                {Object.entries(groupedVisibleServices).map(([category, list]) => (
                  <div key={category} className="border border-white border-opacity-10 rounded-4 p-3">
                    <h6 className="text-gradient mb-3">{category}</h6>
                    <div className="table-responsive">
                      <table className="table table-dark table-borderless align-middle mb-0">
                        <tbody>
                          {list.map((service: any) => (
                            <tr key={service.id}>
                              <td className="text-nowrap" style={{ width: 1 }}>
                                <ServiceImageThumb imageUrl={service.image_url} alt={service.name || ''} size={48} />
                              </td>
                              <td>
                                <div className="fw-semibold">{service.name}</div>
                                <div className="small text-secondary">{service.description || 'Premium treatment'}</div>
                              </td>
                              <td className="text-end text-gold fw-bold">KES {Number(service.price || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="glass-panel rounded-4 p-4 h-100">
            <h5 className="d-flex align-items-center gap-2 mb-3"><FiSend /> Request In-House Service</h5>
            <form onSubmit={handleInhouseSubmit} className="row g-2">
              <div className="col-12">
                <select className="form-select bg-dark text-white border-white border-opacity-10" required value={requestForm.service_id} onChange={(e) => setRequestForm({ ...requestForm, service_id: e.target.value })}>
                  <option value="">Select service</option>
                  {visibleServices.map((service: any) => (
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
                <input type="text" className="form-control bg-dark text-white border-white border-opacity-10" placeholder="Location/address" required value={requestForm.location} onChange={(e) => setRequestForm({ ...requestForm, location: e.target.value })} />
              </div>
              <div className="col-12">
                <textarea className="form-control bg-dark text-white border-white border-opacity-10" rows={3} placeholder="Notes" value={requestForm.notes} onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}></textarea>
              </div>
              <div className="col-12">
                <button className="btn btn-outline-light w-100" type="submit" disabled={requestLoading}>
                  {requestLoading ? 'Submitting...' : 'Submit In-House Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {isBookingModalOpen && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" style={{ background: 'rgba(0,0,0,0.75)', zIndex: 2000 }}>
          <div className="glass-panel rounded-4 p-4 w-100" style={{ maxWidth: '560px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Book Appointment</h5>
              <button className="btn btn-link text-white p-0" onClick={() => setIsBookingModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleBookingSubmit} className="row g-2">
              <div className="col-12">
                <select
                  className="form-select bg-dark text-white border-white border-opacity-10"
                  value={bookingForm.category}
                  onChange={(e) => setBookingForm({ ...bookingForm, category: e.target.value, service_id: '' })}
                  required
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <select className="form-select bg-dark text-white border-white border-opacity-10" required value={bookingForm.service_id} onChange={(e) => setBookingForm({ ...bookingForm, service_id: e.target.value })}>
                  <option value="">Select service</option>
                  {bookingServiceOptions.map((service: any) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
              </div>
              {bookingSelectedService && (
                <div className="col-12 d-flex align-items-center gap-3 py-2 px-3 rounded-3 border border-white border-opacity-10">
                  <ServiceImageThumb imageUrl={bookingSelectedService.image_url} alt={bookingSelectedService.name || ''} size={56} />
                  <span className="small text-secondary mb-0">{bookingSelectedService.description || 'Premium treatment'}</span>
                </div>
              )}
              <div className="col-12">
                <label className="small text-secondary mb-1 d-block">Select preferred staff (optional)</label>
                <div className="row g-2">
                  {staffList.map((staff: any) => (
                    <div className="col-12 col-md-6" key={staff.id}>
                      <button
                        type="button"
                        className={`w-100 text-start border rounded-3 p-2 bg-dark text-white ${String(bookingForm.staff_id) === String(staff.id) ? 'border-warning' : 'border-white border-opacity-10'}`}
                        onClick={() => setBookingForm({ ...bookingForm, staff_id: String(staff.id) })}
                      >
                        <div className="fw-semibold small">{staff.name}</div>
                        <div className="x-small text-secondary">{staff.skill || staff.role || 'Specialist'}</div>
                      </button>
                    </div>
                  ))}
                </div>
                {bookingForm.staff_id && (
                  <button
                    type="button"
                    className="btn btn-link text-warning p-0 mt-2 small"
                    onClick={() => setBookingForm({ ...bookingForm, staff_id: '' })}
                  >
                    Clear selected staff
                  </button>
                )}
              </div>
              <div className="col-6">
                <input type="date" className="form-control bg-dark text-white border-white border-opacity-10" required value={bookingForm.appointment_date} onChange={(e) => setBookingForm({ ...bookingForm, appointment_date: e.target.value })} />
              </div>
              <div className="col-6">
                <input type="time" className="form-control bg-dark text-white border-white border-opacity-10" required value={bookingForm.appointment_time} onChange={(e) => setBookingForm({ ...bookingForm, appointment_time: e.target.value })} />
              </div>
              <div className="col-12">
                <textarea className="form-control bg-dark text-white border-white border-opacity-10" rows={3} placeholder="Notes" value={bookingForm.notes} onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}></textarea>
              </div>
              <div className="col-12 d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-outline-light" onClick={() => setIsBookingModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-purple" disabled={bookingLoading}>
                  {bookingLoading ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MemberLayout>
  );
};

export default MemberServicesPage;
