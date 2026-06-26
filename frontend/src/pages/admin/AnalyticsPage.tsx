import { useEffect, useMemo, useState } from 'react';
import {
  FiTrendingUp, FiDollarSign, FiUsers,
  FiDownload, FiFilter, FiActivity,
  FiPieChart, FiBarChart2, FiClock, FiPackage, FiMessageSquare
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { motion } from 'framer-motion';
import { sessionsApi } from '../../api/sessions';
import { memberApi } from '../../api/members';
import { productApi } from '../../api/products';
import { staffApi } from '../../api/staff';
import { commissionApi } from '../../api/commissions';
import { settingsApi } from '../../api/settings';
import { buildReportingRange, getMissingMonthsMessage, isDateWithinRange } from '../../adminReporting';
import type { ReportingPeriod } from '../../adminReporting';

const AnalyticsPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<any>({});
  const [commissionAgg, setCommissionAgg] = useState<any[]>([]);
  const [velocityRows, setVelocityRows] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [costSummary, setCostSummary] = useState<any>({});
  const [feedbackSummary, setFeedbackSummary] = useState<any>({
    feedback_count: 0,
    avg_service_rating: 0,
    avg_billing_rating: 0,
    recent_comments: [],
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ReportingPeriod>('monthly');
  const [anchorDate, setAnchorDate] = useState(new Date().toISOString().slice(0, 10));
  const [manualRevenue, setManualRevenue] = useState(0);
  const [manualEnabled, setManualEnabled] = useState(false);

  const parseAmount = (value: any) => {
    const parsed = Number(String(value ?? 0).replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const reportRange = buildReportingRange(period, new Date(anchorDate));
  const rangeDays = Math.max(
    1,
    Math.floor((reportRange.end.getTime() - reportRange.start.getTime()) / (24 * 60 * 60 * 1000)) + 1
  );

  const fetchAnalyticsData = async () => {
    try {
      const [sessionsRes, membersRes, productsRes, staffRes, commSyncRes, commSummaryRes, commAggRes, velocityRes, settingsRes, costSummaryRes, feedbackSummaryRes] = await Promise.all([
        sessionsApi.getAll(),
        memberApi.getAll(),
        productApi.getAll(),
        staffApi.getAll(),
        commissionApi.sync(),
        commissionApi.getSummary(undefined, reportRange.startDate, reportRange.endDate),
        commissionApi.getAggregated(undefined, reportRange.startDate, reportRange.endDate),
        productApi.getVelocitySummary(Math.max(7, rangeDays)),
        settingsApi.getAll(),
        productApi.getCostSummary(reportRange.startDate, reportRange.endDate),
        sessionsApi.getFeedbackSummary(reportRange.startDate, reportRange.endDate, 5),
      ]);
      void commSyncRes;
      setSessions(sessionsRes.data?.data || sessionsRes.data || []);
      setMembers(membersRes.data?.data || membersRes.data || []);
      setProducts(productsRes.data?.data || productsRes.data || []);
      setStaff(staffRes.data?.data || staffRes.data || []);
      setCommissionSummary(commSummaryRes.data?.data || commSummaryRes.data || {});
      setCommissionAgg(commAggRes.data?.data || commAggRes.data || []);
      setVelocityRows(velocityRes.data?.data || velocityRes.data || []);
      setSettings(settingsRes.data?.data || settingsRes.data || {});
      setCostSummary(costSummaryRes.data?.data || costSummaryRes.data || {});
      setFeedbackSummary(feedbackSummaryRes.data?.data || feedbackSummaryRes.data || {});
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 30000);
    return () => clearInterval(interval);
  }, [period, anchorDate]);

  const sessionsInRange = useMemo(
    () =>
      sessions.filter((s: any) =>
        isDateWithinRange(s.paid_at || s.updated_at || s.created_at, reportRange)
      ),
    [sessions, period, anchorDate]
  );

  const paidSessions = useMemo(
    () =>
      sessionsInRange.filter(
        (s: any) =>
          s.billing_status === 'paid'
      ),
    [sessionsInRange]
  );
  const missingMonthsMessage = period === 'yearly'
    ? getMissingMonthsMessage(
        [...sessions]
          .map((s: any) => s.paid_at || s.created_at)
          .filter(Boolean)
          .sort()[0] || null,
        reportRange.start.getFullYear()
      )
    : null;

  const grossRevenue = useMemo(
    () => paidSessions.reduce((acc: number, s: any) => acc + parseAmount(s.total_amount), 0) + (manualEnabled ? manualRevenue : 0),
    [paidSessions, manualEnabled, manualRevenue]
  );

  const avgTicket = useMemo(
    () => (paidSessions.length > 0 ? grossRevenue / paidSessions.length : 0),
    [paidSessions.length, grossRevenue]
  );

  const activeMembers = useMemo(
    () => members.filter((m: any) => (m.status || 'Active') !== 'Inactive').length,
    [members]
  );

  const stockValue = useMemo(
    () => products.reduce((acc: number, p: any) => acc + parseAmount(p.remaining_value), 0),
    [products]
  );
  const totalSessions = sessionsInRange.length;
  const averageSessionsPerDay = totalSessions / rangeDays;
  const peakSessionDays = useMemo(() => {
    const days: Record<string, number> = {};
    sessionsInRange.forEach((s: any) => {
      const dtRaw = s.end_time || s.updated_at || s.created_at || s.start_time;
      if (!dtRaw) return;
      const day = new Date(dtRaw).toLocaleDateString(undefined, { weekday: 'long' });
      days[day] = (days[day] || 0) + 1;
    });
    const ordered = Object.entries(days).sort((a, b) => b[1] - a[1]);
    return ordered.slice(0, 3);
  }, [sessionsInRange]);

  const pendingCommissions = parseAmount(commissionSummary.total_pending || 0);
  const paidCommissions = parseAmount(commissionSummary.total_paid || 0);
  const totalCommissions = pendingCommissions + paidCommissions;
  const totalTax = parseAmount(commissionSummary.total_tax || 0);
  const totalServiceProfit = parseAmount(commissionSummary.total_service_profit || 0);
  const productDeductedValue = parseAmount(costSummary.total_consumption_cost || 0);
  const discountRate = parseAmount(settings.discount_deduction_rate || 0);
  const otherDeductionRate = parseAmount(settings.other_deductions_rate || 0);
  const discountDeductionValue = grossRevenue * (discountRate / 100);
  const otherDeductionValue = grossRevenue * (otherDeductionRate / 100);
  const operationalCost = productDeductedValue + totalCommissions + totalTax + discountDeductionValue + otherDeductionValue;
  const netMade = grossRevenue - operationalCost;
  const profitRemainingRate = parseAmount(settings.profit_remaining_rate || 0);
  const settingsProfitValue = grossRevenue * (profitRemainingRate / 100);
  const averageProfitPerSession = paidSessions.length > 0 ? totalServiceProfit / paidSessions.length : 0;
  const activeStaffCount = staff.filter((s: any) => String(s.status || '').toLowerCase() === 'active').length;
  const highPerformingStaff = useMemo(() => {
    const merged = new Map<number, any>();
    for (const row of commissionAgg) {
      const id = Number(row.staff_id);
      if (!Number.isFinite(id)) continue;
      const te = parseAmount(row.total_earnings);
      const prev = merged.get(id);
      if (!prev) {
        merged.set(id, {
          ...row,
          total_earnings: te,
          bookings: Number(row.bookings || 0),
          pending_earnings: parseAmount(row.pending_earnings),
          paid_earnings: parseAmount(row.paid_earnings),
        });
      } else {
        prev.total_earnings = parseAmount(prev.total_earnings) + te;
        prev.bookings = Number(prev.bookings || 0) + Number(row.bookings || 0);
        prev.pending_earnings = parseAmount(prev.pending_earnings) + parseAmount(row.pending_earnings);
        prev.paid_earnings = parseAmount(prev.paid_earnings) + parseAmount(row.paid_earnings);
      }
    }
    return [...merged.values()]
      .sort((a: any, b: any) => parseAmount(b.total_earnings) - parseAmount(a.total_earnings))
      .slice(0, 5);
  }, [commissionAgg]);
  const fastMovingProducts = [...velocityRows]
    .sort((a: any, b: any) => parseAmount(b.avg_daily_usage) - parseAmount(a.avg_daily_usage))
    .slice(0, 5);
  const feedbackCount = Number(feedbackSummary.feedback_count || 0);
  const avgServiceRating = Number(feedbackSummary.avg_service_rating || 0);
  const avgBillingRating = Number(feedbackSummary.avg_billing_rating || 0);
  const recentFeedbackComments = Array.isArray(feedbackSummary.recent_comments) ? feedbackSummary.recent_comments : [];

  const weeklyRevenueBars = useMemo(() => {
    const now = new Date(reportRange.end);
    const days: { label: string; dateKey: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
      days.push({ label, dateKey, value: 0 });
    }
    const map = new Map(days.map((d) => [d.dateKey, d]));
    paidSessions.forEach((s: any) => {
      const sourceDate = s.paid_at || s.updated_at || s.created_at;
      if (!sourceDate) return;
      const key = new Date(sourceDate).toISOString().slice(0, 10);
      const bucket = map.get(key);
      if (bucket) bucket.value += parseAmount(s.total_amount);
    });
    const max = Math.max(...days.map((d) => d.value), 1);
    return days.map((d) => ({
      ...d,
      height: Math.max(6, Math.round((d.value / max) * 100)),
    }));
  }, [paidSessions, reportRange.endDate]);

  const topTreatments = useMemo(() => {
    const serviceMap: Record<string, { name: string; sales: number; revenue: number }> = {};
    paidSessions.forEach((s: any) => {
      const lines = s.service_lines || [];
      lines.forEach((line: any) => {
        const name = line.service_name || 'Service';
        const revenue = parseAmount(line.price || 0);
        if (!serviceMap[name]) serviceMap[name] = { name, sales: 0, revenue: 0 };
        serviceMap[name].sales += 1;
        serviceMap[name].revenue += revenue;
      });
    });
    return Object.values(serviceMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [paidSessions]);

  const stats = [
    { title: 'Gross Revenue', value: grossRevenue, icon: <FiDollarSign />, color: 'purple' },
    { title: 'Pending Commissions', value: pendingCommissions, icon: <FiDollarSign />, color: 'warning' },
    { title: 'Paid Commissions', value: paidCommissions, icon: <FiDollarSign />, color: 'success' },
    { title: 'Product Deducted Value', value: productDeductedValue, icon: <FiPackage />, color: 'danger' },
    { title: 'Total Sessions', value: totalSessions, icon: <FiActivity />, color: 'primary', isNumber: true },
    { title: 'Avg Sessions/Day', value: averageSessionsPerDay, icon: <FiClock />, color: 'info', isNumber: true },
    { title: 'Stock Value', value: stockValue, icon: <FiPackage />, color: 'secondary' },
    { title: 'Operational Cost', value: operationalCost, icon: <FiTrendingUp />, color: 'danger' },
    { title: 'Net Made (Revenue - Cost)', value: netMade, icon: <FiDollarSign />, color: 'success' },
    { title: `Profit @ ${profitRemainingRate}%`, value: settingsProfitValue, icon: <FiTrendingUp />, color: 'purple' },
    { title: 'Avg Profit/Session', value: averageProfitPerSession, icon: <FiTrendingUp />, color: 'success' },
    { title: 'Active Staff', value: activeStaffCount, icon: <FiUsers />, color: 'primary', isNumber: true },
    { title: 'Active Members', value: activeMembers, icon: <FiUsers />, color: 'primary', isNumber: true },
    { title: 'Avg. Ticket', value: avgTicket, icon: <FiActivity />, color: 'warning' },
  ];

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Business Intelligence</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Data-driven insights & performance tracking</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-purple-outline rounded-pill px-4 py-2 fw-bold x-small d-flex align-items-center">
              <FiDownload className="me-2" /> EXPORT ALL DATA
            </button>
            <button className="btn btn-purple rounded-pill px-4 py-2 fw-bold x-small d-flex align-items-center shadow-sm">
              <FiFilter className="me-2" /> CUSTOM PERIOD
            </button>
          </div>
        </div>

        {/* Global Performance Cards */}
        <div className="row g-4 mb-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="col-md-6 col-xl-3">
              <div className="glass-panel p-4 rounded-4 border-1 shadow-sm position-relative overflow-hidden h-100">
                <div className={`p-2 bg-${stat.color} bg-opacity-10 text-${stat.color} rounded-3 d-inline-block mb-3`}>
                  {stat.icon}
                </div>
                <div className="text-secondary x-small text-uppercase tracking-wider fw-bold mb-1">{stat.title}</div>
                <div className="h3 mb-2 fw-bold">
                  {stat.isNumber
                    ? `${Number(stat.value).toLocaleString()}`
                    : `KES ${Number(stat.value).toLocaleString()}`}
                </div>
                <div className="small fw-bold text-secondary">
                  {loading ? 'Syncing live data...' : 'Live data refreshes every 30s'}
                </div>
                {/* Decorative Mesh */}
                <div className={`position-absolute end-0 bottom-0 p-3 opacity-10 text-${stat.color}`} style={{ transform: 'scale(3) rotate(-15deg)' }}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="row g-4 mb-5">
          <div className="col-lg-4">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <h5 className="fw-bold mb-3"><FiMessageSquare className="me-2 text-info" /> Client Feedback</h5>
              <div className="small text-secondary mb-2">Responses in period</div>
              <div className="h4 fw-bold mb-3">{feedbackCount}</div>
              <div className="small text-secondary mb-1">Average service rating</div>
              <div className="fw-bold mb-3">{avgServiceRating.toFixed(2)} / 5</div>
              <div className="small text-secondary mb-1">Average billing rating</div>
              <div className="fw-bold">{avgBillingRating.toFixed(2)} / 5</div>
            </div>
          </div>
          <div className="col-lg-8">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <h5 className="fw-bold mb-3"><FiMessageSquare className="me-2 text-purple" /> Recent Feedback Comments</h5>
              {recentFeedbackComments.length === 0 ? (
                <p className="small text-secondary mb-0">No written comments submitted for selected period.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Session</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Billing</th>
                        <th>Comment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentFeedbackComments.map((row: any) => (
                        <tr key={`${row.session_id}-${row.submitted_at}`}>
                          <td className="small">{row.session_code || row.session_id}</td>
                          <td className="small">{row.customer_name || 'Client'}</td>
                          <td className="small">{Number(row.service_rating || 0).toFixed(1)}</td>
                          <td className="small">{Number(row.billing_rating || 0).toFixed(1)}</td>
                          <td className="small">{row.feedback_text}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          {/* Revenue Chart Placeholder */}
          <div className="col-lg-8">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0"><FiBarChart2 className="me-2 text-purple" /> Revenue Growth</h5>
                <div className="d-flex gap-2">
                  <select className="form-select form-select-sm" value={period} onChange={(e) => setPeriod(e.target.value as ReportingPeriod)}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly (Mon-Sun)</option>
                    <option value="two_weeks">Two Weeks</option>
                    <option value="quarterly">Quarterly (Jan-based)</option>
                    <option value="yearly">Yearly (Jan-Dec)</option>
                  </select>
                  <input type="date" className="form-control form-control-sm" value={anchorDate} onChange={(e) => setAnchorDate(e.target.value)} />
                </div>
              </div>
              <div className="small text-secondary mb-3">
                Period: <strong>{reportRange.startDate}</strong> to <strong>{reportRange.endDate}</strong> ({reportRange.label})
              </div>
              {missingMonthsMessage && <div className="alert alert-warning py-2 small">{missingMonthsMessage}</div>}
              <div className="d-flex align-items-center gap-2 mb-3">
                <input type="checkbox" checked={manualEnabled} onChange={(e) => setManualEnabled(e.target.checked)} />
                <span className="small text-secondary">Add manual historical revenue</span>
                {manualEnabled && (
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ maxWidth: 220 }}
                    value={manualRevenue}
                    onChange={(e) => setManualRevenue(Number(e.target.value || 0))}
                    placeholder="Manual KES"
                  />
                )}
              </div>
              <div className="chart-container d-flex align-items-end justify-content-between gap-2 pt-5" style={{ height: '250px' }}>
                {weeklyRevenueBars.map((bar, i) => (
                  <motion.div 
                    key={bar.dateKey}
                    initial={{ height: 0 }}
                    animate={{ height: `${bar.height}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="bg-purple bg-opacity-25 rounded-top position-relative flex-grow-1"
                    title={`${bar.label}: KES ${bar.value.toLocaleString()}`}
                  >
                    <div className="bg-purple position-absolute top-0 start-0 w-100 h-2px rounded-top"></div>
                  </motion.div>
                ))}
              </div>
              <div className="d-flex justify-content-between mt-3 text-secondary x-small fw-bold opacity-50">
                {weeklyRevenueBars.map((bar) => (
                  <span key={`${bar.dateKey}-label`}>{bar.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Services */}
          <div className="col-lg-4">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <h5 className="fw-bold mb-4"><FiPieChart className="me-2 text-primary" /> Top Treatments</h5>
              <div className="service-list">
                {topTreatments.map((service, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-bold">{service.name}</span>
                      <span className="x-small text-secondary">{service.sales} sold</span>
                    </div>
                    <div className="progress rounded-pill bg-purple bg-opacity-10" style={{ height: '8px' }}>
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(service.sales / Math.max(topTreatments[0]?.sales || 1, 1)) * 100}%` }}
                        className="progress-bar bg-purple rounded-pill"
                      ></motion.div>
                    </div>
                    <div className="text-end x-small text-secondary mt-1">KES {service.revenue.toLocaleString()}</div>
                  </div>
                ))}
                {topTreatments.length === 0 && (
                  <p className="small text-secondary mb-0">No completed service data yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <h5 className="fw-bold mb-3"><FiUsers className="me-2 text-success" /> High Performing Staff</h5>
              {highPerformingStaff.length === 0 ? (
                <p className="small text-secondary mb-0">No commission performance data for selected period.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead><tr><th>Staff</th><th>Bookings</th><th>Total</th><th>Pending</th></tr></thead>
                    <tbody>
                      {highPerformingStaff.map((row: any) => (
                        <tr key={row.staff_id}>
                          <td className="small">{row.staff_name}</td>
                          <td className="small">{row.bookings}</td>
                          <td className="small fw-bold">KES {parseAmount(row.total_earnings).toLocaleString()}</td>
                          <td className="small text-warning">KES {parseAmount(row.pending_earnings).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <h5 className="fw-bold mb-3"><FiPackage className="me-2 text-primary" /> Fast Moving Products</h5>
              {fastMovingProducts.length === 0 ? (
                <p className="small text-secondary mb-0">No stock movement velocity data for selected period.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead><tr><th>Product</th><th>Consumed</th><th>Avg/Day</th><th>Class</th></tr></thead>
                    <tbody>
                      {fastMovingProducts.map((row: any) => (
                        <tr key={row.id}>
                          <td className="small">{row.name}</td>
                          <td className="small">{parseAmount(row.total_consumed).toLocaleString()}</td>
                          <td className="small fw-bold">{parseAmount(row.avg_daily_usage).toFixed(2)}</td>
                          <td className="small">{row.movement_class}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm">
              <h5 className="fw-bold mb-3"><FiFilter className="me-2 text-warning" /> Deductions Breakdown</h5>
              <div className="row g-3">
                <div className="col-md-2 small">Commissions (paid+pending): <strong>KES {totalCommissions.toLocaleString()}</strong></div>
                <div className="col-md-2 small">Tax: <strong>KES {totalTax.toLocaleString()}</strong></div>
                <div className="col-md-2 small">Product deductions: <strong>KES {productDeductedValue.toLocaleString()}</strong></div>
                <div className="col-md-3 small">Discount deductions ({discountRate}%): <strong>KES {discountDeductionValue.toLocaleString()}</strong></div>
                <div className="col-md-3 small">Other deductions ({otherDeductionRate}%): <strong>KES {otherDeductionValue.toLocaleString()}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Insight Cards */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm d-flex align-items-center bg-purple bg-opacity-5 border-purple border-opacity-10">
              <div className="p-3 bg-purple text-white rounded-circle me-4 shadow-sm"><FiClock size={24} /></div>
              <div>
                <h6 className="fw-bold mb-1">Peak Demand Insight</h6>
                <p className="small text-secondary mb-0">
                  Peak session day(s):{' '}
                  <strong>
                    {peakSessionDays.length > 0
                      ? peakSessionDays.map(([d, c]) => `${d} (${c})`).join(', ')
                      : 'No data for selected period'}
                  </strong>.
                </p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm d-flex align-items-center bg-primary bg-opacity-5 border-primary border-opacity-10">
              <div className="p-3 bg-primary text-white rounded-circle me-4 shadow-sm"><FiTrendingUp size={24} /></div>
              <div>
                <h6 className="fw-bold mb-1">Profitability Insight</h6>
                <p className="small text-secondary mb-0">
                  Net made after deductions: <strong>KES {netMade.toLocaleString()}</strong>.
                  Settings profit ({profitRemainingRate}% of gross): <strong>KES {settingsProfitValue.toLocaleString()}</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .h-2px { height: 4px; }
        .btn-purple-outline {
          border: 1px solid var(--purple);
          color: var(--purple);
          background: transparent;
        }
        .btn-outline-purple {
          border: 1px solid var(--purple);
          color: var(--purple);
        }
        .chart-container div:hover {
          background-opacity: 0.5 !important;
          background-color: var(--purple) !important;
          cursor: pointer;
        }
        .x-small { font-size: 0.65rem; }
        .bg-purple { background-color: var(--purple) !important; }
        .text-purple { color: var(--purple) !important; }
        .bg-primary { background-color: #0d6efd !important; }
        .text-primary { color: #0d6efd !important; }
        .bg-success { background-color: #198754 !important; }
        .text-success { color: #198754 !important; }
        .bg-warning { background-color: #ffc107 !important; }
        .text-warning { color: #ffc107 !important; }
        .bg-danger { background-color: #dc3545 !important; }
        .text-danger { color: #dc3545 !important; }
      `}} />
    </AdminLayout>
  );
};

export default AnalyticsPage;
