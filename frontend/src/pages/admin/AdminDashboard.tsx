import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { staffApi } from '../../api/staff';
import { appointmentApi } from '../../api/appointments';
import { serviceApi } from '../../api/services';
import { commissionApi } from '../../api/commissions';
import { dashboardApi } from '../../api/dashboard';
import { getCurrentAdminRole, getCurrentAdminUser, isAttendant } from '../../adminAccess';
import { 
  FiUsers, 
  FiCalendar, FiDollarSign, FiBox, FiUserCheck, 
  FiTag, FiLayers, FiActivity, FiMoreHorizontal,
  FiCheckCircle, FiX, FiChevronDown, FiBell
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminTable from '../../components/admin/AdminTable';
import ServiceImageThumb from '../../components/ServiceImageThumb';

const AdminDashboard = () => {
  const { isDarkMode } = React.useContext(AdminThemeContext);
  const currentRole = getCurrentAdminRole();
  const currentUser = getCurrentAdminUser();
  const attendantView = isAttendant(currentRole);
  const currentStaffId = Number(currentUser?.id || currentUser?.staff_id || 0);
  const navigate = useNavigate();
  const formatKes = (value: number) => `KES ${Math.round(value).toLocaleString()}`;
  
  const [staffCount, setStaffCount] = React.useState<number | string>('...');
  const [memberCount, setMemberCount] = React.useState<number>(0);
  const [activeBookingsCount, setActiveBookingsCount] = React.useState<number>(0);
  const [completedSessionsCount, setCompletedSessionsCount] = React.useState<number>(0);
  const [monthlyRevenueFromCompleted, setMonthlyRevenueFromCompleted] = React.useState<number>(0);
  const [servicesCount, setServicesCount] = React.useState<number>(0);
  const [lowStockCount, setLowStockCount] = React.useState<number>(0);
  const [stockLevelPct, setStockLevelPct] = React.useState<number>(0);
  const [selectedMonth, setSelectedMonth] = React.useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const currentMonth = (() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  })();

  const getAvailableMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months;
  };

  const formatMonthLabel = (ym: string) => {
    const [year, month] = ym.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const overviewResponse = await dashboardApi.getOverview(selectedMonth);
        const payload: any = overviewResponse.data || {};
        const metrics = payload?.data || payload || {};

        setStaffCount(Number(metrics.active_staff_count || 0));
        setActiveBookingsCount(Number(metrics.open_appointments_count || 0));
        setMemberCount(Number(metrics.active_member_count || 0));
        setServicesCount(Number(metrics.active_services_count || 0));
        setCompletedSessionsCount(Number(metrics.completed_sessions_count || 0));
        setMonthlyRevenueFromCompleted(Number(metrics.monthly_revenue_completed || 0));
        setLowStockCount(Number(metrics.low_stock_count || 0));
        setStockLevelPct(Number(metrics.stock_level_pct || 0));
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
        setStaffCount(0);
        setActiveBookingsCount(0);
        setMemberCount(0);
        setCompletedSessionsCount(0);
        setMonthlyRevenueFromCompleted(0);
        setServicesCount(0);
        setLowStockCount(0);
        setStockLevelPct(0);
      }
    };
    loadDashboardData();
    const refreshTimer = setInterval(loadDashboardData, 30000);
    return () => clearInterval(refreshTimer);
  }, [selectedMonth]);

  const [appointments, setAppointments] = React.useState<any[]>([]);
  const [servicesCatalog, setServicesCatalog] = React.useState<any[]>([]);
  const [upcomingAlerts, setUpcomingAlerts] = React.useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = React.useState<any[]>([]);
  const [nowTs, setNowTs] = React.useState(Date.now());
  const [myPendingCommission, setMyPendingCommission] = React.useState<number>(0);
  const [myPaidCommission, setMyPaidCommission] = React.useState<number>(0);
  const [myServicesRendered, setMyServicesRendered] = React.useState<number>(0);
  const [myLeaveCount, setMyLeaveCount] = React.useState<number>(0);

  React.useEffect(() => {
    const timer = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const loadAttendantMetrics = async () => {
      if (!attendantView || !currentStaffId) return;
      try {
        const [commAggRes, commDetailsRes, staffRes] = await Promise.all([
          commissionApi.getAggregated(selectedMonth),
          commissionApi.getStaffDetails(currentStaffId, selectedMonth),
          staffApi.getById(currentStaffId),
        ]);

        const aggRows = commAggRes.data?.data || commAggRes.data || [];
        const myRows = (Array.isArray(aggRows) ? aggRows : []).filter((row: any) => Number(row.staff_id) === currentStaffId);
        setMyPendingCommission(myRows.reduce((s, r: any) => s + Number(r.pending_earnings || 0), 0));
        setMyPaidCommission(myRows.reduce((s, r: any) => s + Number(r.paid_earnings || 0), 0));

        const detailRows = commDetailsRes.data?.data || commDetailsRes.data || [];
        setMyServicesRendered(Array.isArray(detailRows) ? detailRows.length : 0);

        const myStaff = staffRes.data?.data || staffRes.data || null;
        setMyLeaveCount(String(myStaff?.status || '').toLowerCase() === 'on leave' ? 1 : 0);
      } catch (error) {
        console.error('Failed to load attendant dashboard metrics', error);
        setMyPendingCommission(0);
        setMyPaidCommission(0);
        setMyServicesRendered(0);
        setMyLeaveCount(0);
      }
    };
    loadAttendantMetrics();
  }, [attendantView, currentStaffId, selectedMonth]);

  React.useEffect(() => {
    const loadAppointments = async () => {
      try {
        const [response, svcRes] = await Promise.all([appointmentApi.getAll(), serviceApi.getAll()]);
        const data = response.data?.data || response.data || [];
        const svcRows = svcRes.data?.data || svcRes.data || [];
        setServicesCatalog(Array.isArray(svcRows) ? svcRows : []);
        const rows = Array.isArray(data) ? data : [];

        const normalized = rows.map((a: any) => {
          const displayStatus =
            a.session_status === 'In Progress'
              ? 'In Session Progress'
              : a.session_status === 'Completed'
                ? 'Session Completed'
                : (a.status || '').charAt(0).toUpperCase() + (a.status || '').slice(1);
          const statusClass =
            displayStatus === 'In Session Progress'
              ? 'text-primary'
              : displayStatus === 'Session Completed'
                ? 'text-success'
                : a.status === 'confirmed'
                  ? 'text-success'
                  : a.status === 'pending'
                    ? 'text-warning'
                    : a.status === 'cancelled'
                      ? 'text-danger'
                      : 'text-secondary';
          return {
            id: a.id,
            name: a.customer_name,
            service: a.service_name || 'N/A',
            service_id: a.service_id,
            staff: a.staff_name || 'Unassigned',
            time: `${a.appointment_date} ${String(a.appointment_time || '').slice(0, 5)}`,
            status: displayStatus,
            statusClass,
            appointment_date: a.appointment_date,
            appointment_time: a.appointment_time,
            raw_status: a.status,
            session_status: a.session_status
          };
        });
        setAppointments(normalized);
        setPendingApprovals(
          rows.filter((a: any) => a.status === 'pending' && !a.session_id)
        );
      } catch (err) {
        console.error('Failed to load appointments', err);
      }
    };
    loadAppointments();
    const refreshTimer = setInterval(loadAppointments, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  React.useEffect(() => {
    const alerts = appointments.filter((a) => {
      if (a.raw_status !== 'confirmed') return false;
      if (a.session_status === 'In Progress' || a.session_status === 'Completed') return false;
      const dt = new Date(`${a.appointment_date}T${String(a.appointment_time || '').slice(0, 8)}`);
      const diff = dt.getTime() - nowTs;
      return diff > 0 && diff <= 60 * 60 * 1000;
    }).map((a) => {
      const dt = new Date(`${a.appointment_date}T${String(a.appointment_time || '').slice(0, 8)}`);
      const diffSec = Math.floor((dt.getTime() - nowTs) / 1000);
      const mm = String(Math.floor(diffSec / 60)).padStart(2, '0');
      const ss = String(Math.max(0, diffSec % 60)).padStart(2, '0');
      return { ...a, countdown: `${mm}:${ss}` };
    });
    setUpcomingAlerts(alerts);
  }, [appointments, nowTs]);
  
  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {attendantView ? (
          <>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
              <h1 className="brand-title text-gradient m-0">My Dashboard</h1>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm border-0 rounded-3"
                  style={{
                    width: 'auto', minWidth: '160px',
                    background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    color: isDarkMode ? '#fff' : '#333',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
                    colorScheme: isDarkMode ? 'dark' : 'light'
                  }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {getAvailableMonths().map((ym) => (
                    <option key={ym} value={ym} style={{ background: isDarkMode ? '#222' : '#fff', color: isDarkMode ? '#fff' : '#333' }}>{formatMonthLabel(ym)}</option>
                  ))}
                </select>
                <button
                  className={`btn btn-sm rounded-pill px-3 ${selectedMonth === currentMonth ? 'btn-purple' : ''}`}
                  style={{
                    padding: '0.375rem 0.75rem',
                    ...(selectedMonth !== currentMonth ? {
                      background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
                      color: isDarkMode ? '#fff' : '#333'
                    } : {})
                  }}
                  onClick={() => setSelectedMonth(currentMonth)}
                >
                  This Month
                </button>
                <button
                  className="btn btn-sm rounded-pill px-3"
                  style={{
                    background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                    border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
                    color: isDarkMode ? '#fff' : '#333'
                  }}
                  onClick={() => {
                    const d = new Date(selectedMonth + '-01');
                    d.setMonth(d.getMonth() - 1);
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, '0');
                    setSelectedMonth(`${y}-${m}`);
                  }}
                >
                  Previous Month
                </button>
                <Link to="/admin/commissions" className="btn btn-purple rounded-pill px-4 py-2 d-flex align-items-center" style={{ fontSize: '13px' }}>
                  <FiDollarSign className="me-2" /> MY COMMISSIONS
                </Link>
              </div>
            </div>
            <p className="text-secondary mb-4">Track your current performance and status.</p>

            <div className="row g-4 mt-2">
              <div className="col-md-6 col-lg-3">
                <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-warning bg-opacity-25 text-warning me-3">
                      <FiDollarSign />
                    </div>
                    <h3 className="h6 mb-0 text-uppercase tracking-wider">My Commission</h3>
                  </div>
                  <div className="display-6 fw-bold text-gold">{formatKes(myPendingCommission)}</div>
                  <p className="small text-secondary mb-0 mt-3">Pending for {formatMonthLabel(selectedMonth)}</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-success bg-opacity-25 text-success me-3">
                      <FiCheckCircle />
                    </div>
                    <h3 className="h6 mb-0 text-uppercase tracking-wider">Commissions Paid</h3>
                  </div>
                  <div className="display-6 fw-bold text-gold">{formatKes(myPaidCommission)}</div>
                  <p className="small text-secondary mb-0 mt-3">Settled for {formatMonthLabel(selectedMonth)}</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-primary bg-opacity-25 text-primary me-3">
                      <FiLayers />
                    </div>
                    <h3 className="h6 mb-0 text-uppercase tracking-wider">Services Rendered</h3>
                  </div>
                  <div className="display-6 fw-bold text-gold">{myServicesRendered}</div>
                  <p className="small text-secondary mb-0 mt-3">Completed commission entries</p>
                </div>
              </div>

              <div className="col-md-6 col-lg-3">
                <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
                  <div className="d-flex align-items-center mb-3">
                    <div className="p-3 rounded-circle bg-info bg-opacity-25 text-info me-3">
                      <FiCalendar />
                    </div>
                    <h3 className="h6 mb-0 text-uppercase tracking-wider">Leaves</h3>
                  </div>
                  <div className="display-6 fw-bold text-gold">{myLeaveCount}</div>
                  <p className="small text-secondary mb-0 mt-3">{myLeaveCount > 0 ? 'Currently on leave' : 'No active leave'}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-5 gap-3">
          <h1 className="brand-title text-gradient m-0">Dashboard Overview</h1>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <select
              className="form-select form-select-sm border-0 rounded-3"
              style={{
                width: 'auto', minWidth: '160px',
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: isDarkMode ? '#fff' : '#333',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.15)',
                colorScheme: isDarkMode ? 'dark' : 'light'
              }}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {getAvailableMonths().map((ym) => (
                <option key={ym} value={ym} style={{ background: isDarkMode ? '#222' : '#fff', color: isDarkMode ? '#fff' : '#333' }}>{formatMonthLabel(ym)}</option>
              ))}
            </select>
            <button
              className={`btn btn-sm rounded-pill px-3 ${selectedMonth === currentMonth ? 'btn-purple' : ''}`}
              style={{
                padding: '0.375rem 0.75rem',
                ...(selectedMonth !== currentMonth ? {
                  background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
                  color: isDarkMode ? '#fff' : '#333'
                } : {})
              }}
              onClick={() => setSelectedMonth(currentMonth)}
            >
              This Month
            </button>
            <button
              className="btn btn-sm rounded-pill px-3"
              style={{
                background: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.15)',
                color: isDarkMode ? '#fff' : '#333'
              }}
              onClick={() => {
                const d = new Date(selectedMonth + '-01');
                d.setMonth(d.getMonth() - 1);
                setSelectedMonth(d.toISOString().slice(0, 7));
              }}
            >
              Previous Month
            </button>
          </div>
        </div>
        
        <p className="text-secondary mb-4">Welcome back to the Kareh Spa Management Portal. Here&apos;s your daily summary.</p>

        {upcomingAlerts.length > 0 && (
          <div className="alert alert-warning d-flex align-items-start gap-3 rounded-4 border-0 shadow-sm mb-4">
            <div className="mt-1"><FiBell /></div>
            <div>
              <div className="fw-bold mb-1">Upcoming Appointment Alerts (within 1 hour)</div>
              <div className="small">
                {upcomingAlerts.map((a) => `${a.name} (${a.service}) starts in ${a.countdown}`).join(' | ')}
              </div>
            </div>
          </div>
        )}

        {pendingApprovals.length > 0 && (
          <div className="alert alert-danger d-flex align-items-start gap-3 rounded-4 border-0 shadow-sm mb-4">
            <div className="mt-1"><FiBell /></div>
            <div>
              <div className="fw-bold mb-1">Appointments Requiring Confirmation</div>
              <div className="small">
                {pendingApprovals.length} appointment{pendingApprovals.length > 1 ? 's' : ''} awaiting approval.
                <Link to="/admin/bookings" className="ms-2 fw-bold text-decoration-none">Review now</Link>
              </div>
            </div>
          </div>
        )}
        
        <div className="row g-4 mt-2">
          {/* Revenue */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-success bg-opacity-25 text-success me-3">
                  <FiDollarSign />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Revenue</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{formatKes(monthlyRevenueFromCompleted)}</div>
              <p className="small text-secondary mb-0 mt-3">Completed sessions only ({formatMonthLabel(selectedMonth)})</p>
            </div>
          </div>

          {/* Appointments */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-purple bg-opacity-25 text-purple me-3">
                  <FiCalendar />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Appointments</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{activeBookingsCount}</div>
              <p className="small text-secondary mb-0 mt-3">Open appointments (pending + confirmed)</p>
            </div>
          </div>

          {/* Staff */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-info bg-opacity-25 text-info me-3">
                  <FiUsers />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Staff</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{typeof staffCount === 'number' && staffCount < 10 ? `0${staffCount}` : staffCount}</div>
              <p className="small text-secondary mb-0 mt-3">Active members</p>
            </div>
          </div>

          {/* Members/Customers */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-warning bg-opacity-25 text-warning me-3">
                  <FiUserCheck />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Members</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{memberCount}</div>
              <p className="small text-secondary mb-0 mt-3">Active loyalty accounts</p>
            </div>
          </div>

          {/* Stock/Inventory */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-danger bg-opacity-25 text-danger me-3">
                  <FiBox />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Stock</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{stockLevelPct}%</div>
              <p className="small text-secondary mb-0 mt-3">Products currently in stock</p>
            </div>
          </div>

          {/* Promotions */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-magenta bg-opacity-25 text-magenta me-3">
                  <FiTag />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Low Stock</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{String(lowStockCount).padStart(2, '0')}</div>
              <p className="small text-secondary mb-0 mt-3">Items needing replenishment</p>
            </div>
          </div>

          {/* Services */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-primary bg-opacity-25 text-primary me-3">
                  <FiLayers />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Services</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{servicesCount}</div>
              <p className="small text-secondary mb-0 mt-3">Active catalog offerings</p>
            </div>
          </div>

          {/* Activity/Engagement */}
          <div className="col-md-6 col-lg-3">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center mb-3">
                <div className="p-3 rounded-circle bg-secondary bg-opacity-25 text-secondary me-3">
                  <FiActivity />
                </div>
                <h3 className="h6 mb-0 text-uppercase tracking-wider">Sessions</h3>
              </div>
              <div className="display-6 fw-bold text-gold">{completedSessionsCount}</div>
              <p className="small text-secondary mb-0 mt-3">Completed service sessions</p>
            </div>
          </div>
        </div>

        {/* Recent Appointments Section */}
        <div className="mt-5 mb-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 m-0 fw-bold">Recent Appointments</h2>
            <Link to="/admin/bookings" className="text-purple text-decoration-none small fw-bold">VIEW ALL &rarr;</Link>
          </div>
          
          <AdminTable 
            isDarkMode={isDarkMode}
            columns={[
              { header: 'Customer' },
              { header: 'Service' },
              { header: 'Staff' },
              { header: 'Time' },
              { header: 'Status' },
              { header: 'Action', align: 'end' }
            ]}
            data={appointments}
            renderRow={(apt) => (
              <tr key={apt.id} className="align-middle">
                <td className="px-4 py-3 border-0 fw-medium">{apt.name}</td>
                <td className="py-3 border-0 text-secondary small">
                  <div className="d-flex align-items-center gap-2">
                    <ServiceImageThumb
                      imageUrl={(servicesCatalog as any[]).find((s: any) => String(s.id) === String(apt.service_id))?.image_url}
                      alt=""
                      size={36}
                    />
                    <span>{apt.service}</span>
                  </div>
                </td>
                <td className="py-3 border-0 text-secondary small">{apt.staff}</td>
                <td className="py-3 border-0 text-secondary small">{apt.time}</td>
                <td className="py-3 border-0 small">
                  <div className="dropdown">
                    <button 
                      className={`badge rounded-pill bg-opacity-10 bg-current cursor-pointer border-0 transition-all hover-scale-sm dropdown-toggle hide-caret ${apt.statusClass.replace('text-', 'bg-')}`}
                      data-bs-toggle="dropdown" 
                      aria-expanded="false"
                      type="button"
                    >
                      <span className={`${apt.statusClass} d-flex align-items-center`}>
                        &bull; {apt.status}
                        <FiChevronDown className="ms-1 opacity-50" size={10} />
                      </span>
                    </button>
                    <ul className={`dropdown-menu shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                      <li><span className="dropdown-item-text small text-secondary">Status managed in Appointments</span></li>
                    </ul>
                  </div>
                </td>
                <td className="px-4 py-3 border-0 text-end">
                  <div className="dropdown">
                    <button 
                      className={`btn btn-sm p-1 border-0 ${isDarkMode ? 'text-white' : 'text-dark'}`}
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FiMoreHorizontal size={16} />
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                      <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => navigate(`/admin/bookings?id=${apt.id}`)}><FiActivity className="me-2 text-secondary" /> Reschedule</button></li>
                      <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => navigate(`/admin/sessions?appointment_id=${apt.id}`)}><FiCheckCircle className="me-2 text-success" /> Open Session</button></li>
                      <li><hr className="dropdown-divider opacity-10" /></li>
                      <li><button className="dropdown-item d-flex align-items-center py-2 text-danger" type="button"><FiX className="me-2" /> Cancel Booking</button></li>
                    </ul>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
          </>
        )}
      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-current { background-color: currentColor !important; }
        .cursor-pointer { cursor: pointer !important; }
        .hover-scale-sm:hover { transform: scale(1.05); }
        .hover-scale-sm:active { transform: scale(0.95); }
        .hover-text-purple:hover { color: var(--purple) !important; }
        .hide-caret::after { display: none !important; }
        .table-hover tbody tr:hover {
          background-color: rgba(106, 13, 173, 0.02) !important;
        }
        body.admin-dark .table-hover tbody tr:hover {
          background-color: rgba(255, 255, 255, 0.02) !important;
        }
      `}} />
    </AdminLayout>
  );
};

export default AdminDashboard;
