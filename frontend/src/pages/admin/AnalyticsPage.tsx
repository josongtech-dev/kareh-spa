import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  FiTrendingUp, FiDollarSign, FiUsers,
  FiDownload, FiFilter, FiActivity,
  FiBarChart2, FiClock, FiPackage, FiMessageSquare,
  FiFileText, FiCalendar, FiPieChart, FiShoppingCart
} from 'react-icons/fi';
import AdminLayout from './AdminLayout';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell, PieChart, Pie
} from 'recharts';
import { sessionsApi } from '../../api/sessions';
import { memberApi } from '../../api/members';
import { productApi } from '../../api/products';
import { staffApi } from '../../api/staff';
import { commissionApi } from '../../api/commissions';
import { settingsApi } from '../../api/settings';
import { appointmentApi } from '../../api/appointments';
import { expensesApi } from '../../api/expenses';
import { buildReportingRange, getMissingMonthsMessage, isDateWithinRange } from '../../adminReporting';
import type { ReportingPeriod } from '../../adminReporting';
import { exportAnalyticsCSV, exportAnalyticsPDF } from '../../utils/exportAnalytics';
import type { AnalyticsExportData } from '../../utils/exportAnalytics';

const AnalyticsPage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [, setMembers] = useState<any[]>([]);
  const [, setProducts] = useState<any[]>([]);
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
  const [, setLoading] = useState(true);
  const [period, setPeriod] = useState<ReportingPeriod>('monthly');
  const [anchorDate, setAnchorDate] = useState(new Date().toISOString().slice(0, 10));
  const ChartMetrics = ['revenue', 'commissions', 'expenses', 'tax', 'profit'] as const;
  type ChartMetric = typeof ChartMetrics[number];
  const [chartMetric, setChartMetric] = useState<ChartMetric>('revenue');
  const [servicePerfMode, setServicePerfMode] = useState<'monthly' | 'average'>('monthly');
  const [servicePerfMonthIndex, setServicePerfMonthIndex] = useState(() => new Date().getMonth());
  const [staffPerfMode, setStaffPerfMode] = useState<'monthly' | 'average'>('monthly');
  const [staffPerfMonthIndex, setStaffPerfMonthIndex] = useState(() => new Date().getMonth());
  const [staffChartMode, setStaffChartMode] = useState<'monthly' | 'average'>('monthly');
  const [staffChartMonthIndex, setStaffChartMonthIndex] = useState(() => new Date().getMonth());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [bookingChartMode, setBookingChartMode] = useState<'monthly' | 'average'>('monthly');
  const [bookingChartMonthIndex, setBookingChartMonthIndex] = useState(() => new Date().getMonth());

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
      const results = await Promise.allSettled([
        sessionsApi.getAll(),
        memberApi.getAll(),
        productApi.getAll(),
        staffApi.getAll(),
        commissionApi.getSummary(undefined, reportRange.startDate, reportRange.endDate),
        commissionApi.getAggregated(undefined, reportRange.startDate, reportRange.endDate),
        productApi.getVelocitySummary(Math.max(7, rangeDays)),
        settingsApi.getAll(),
        productApi.getCostSummary(reportRange.startDate, reportRange.endDate),
        sessionsApi.getFeedbackSummary(reportRange.startDate, reportRange.endDate, 5),
        appointmentApi.getAll(),
        expensesApi.getAll(),
      ]);

      const extract = (res: PromiseSettledResult<any>, fallback: any) =>
        res.status === 'fulfilled' ? (res.value.data?.data || res.value.data || fallback) : fallback;

      setSessions(extract(results[0], []));
      setMembers(extract(results[1], []));
      setProducts(extract(results[2], []));
      setStaff(extract(results[3], []));
      setCommissionSummary(extract(results[4], {}));
      setCommissionAgg(extract(results[5], []));
      setVelocityRows(extract(results[6], []));
      setSettings(extract(results[7], {}));
      setCostSummary(extract(results[8], {}));
      setFeedbackSummary(extract(results[9], {}));
      setAppointments(extract(results[10], []));
      setExpenses(extract(results[11], []));
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
    () => paidSessions.reduce((acc: number, s: any) => acc + parseAmount(s.total_amount), 0),
    [paidSessions]
  );

  const avgTicket = useMemo(
    () => (paidSessions.length > 0 ? grossRevenue / paidSessions.length : 0),
    [paidSessions.length, grossRevenue]
  );

  const totalSessions = sessionsInRange.length;
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
  const productDeductedValue = parseAmount(costSummary.total_consumption_cost || 0);
  const discountRate = parseAmount(settings.discount_deduction_rate || 0);
  const otherDeductionRate = parseAmount(settings.other_deductions_rate || 0);
  const discountDeductionValue = grossRevenue * (discountRate / 100);
  const otherDeductionValue = grossRevenue * (otherDeductionRate / 100);
  const operationalCost = productDeductedValue + totalCommissions + totalTax + discountDeductionValue + otherDeductionValue;
  const actualExpensesTotal = expenses.reduce((sum, e: any) => sum + parseAmount(e.amount), 0);
  const totalExpenses = actualExpensesTotal + productDeductedValue + discountDeductionValue + otherDeductionValue;
  const netMade = grossRevenue - operationalCost - actualExpensesTotal;
  const profitRemainingRate = parseAmount(settings.profit_remaining_rate || 0);
  const settingsProfitValue = grossRevenue * (profitRemainingRate / 100);
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

  const monthlyData = useMemo(() => {
    const year = new Date(anchorDate).getFullYear();
    const months: { month: string; revenue: number; commissions: number; expenses: number; tax: number; profit: number }[] = [];
    const monthMap: Record<string, number> = {};
    for (let m = 0; m < 12; m++) {
      const d = new Date(year, m, 1);
      const key = d.toISOString().slice(0, 7);
      const ml = d.toLocaleDateString('en-GB', { month: 'short' });
      monthMap[key] = m;
      months.push({ month: ml, revenue: 0, commissions: 0, expenses: 0, tax: 0, profit: 0 });
    }

    const paid = sessions.filter((s: any) => s.billing_status === 'paid');
    paid.forEach((s: any) => {
      const dt = s.paid_at || s.updated_at || s.created_at;
      if (!dt) return;
      const d = new Date(dt);
      if (d.getFullYear() !== year) return;
      const key = d.toISOString().slice(0, 7);
      const idx = monthMap[key];
      if (idx !== undefined) months[idx].revenue += parseAmount(s.total_amount);
    });

    expenses.forEach((e: any) => {
      const dt = e.expense_date || e.created_at;
      if (!dt) return;
      const d = new Date(dt);
      if (d.getFullYear() !== year) return;
      const key = d.toISOString().slice(0, 7);
      const idx = monthMap[key];
      if (idx !== undefined) months[idx].expenses += parseAmount(e.amount);
    });

    const totalYearRevenue = months.reduce((s, m) => s + m.revenue, 0) || 1;
    const nonCommissionExpenses = (productDeductedValue + discountDeductionValue + otherDeductionValue) || 0;

    return months.map((m) => {
      const share = m.revenue / totalYearRevenue;
      const commissions = Math.round(share * totalCommissions);
      const opExpenses = Math.round(share * nonCommissionExpenses);
      const tax = Math.round(share * totalTax);
      const totalExpenses = m.expenses + opExpenses;
      const profit = m.revenue - commissions - totalExpenses - tax;
      return { ...m, commissions, expenses: totalExpenses, tax, profit };
    });
  }, [sessions, expenses, anchorDate, grossRevenue, totalCommissions, totalTax, productDeductedValue, discountDeductionValue, otherDeductionValue]);

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

  const anchorYear = new Date(anchorDate).getFullYear();

  const topServicesByCount = useMemo(() => {
    const countInSessions = (sessionList: any[]) => {
      const serviceCount: Record<string, number> = {};
      sessionList.forEach((s: any) => {
        const lines = s.service_lines || [];
        if (lines.length > 0) {
          lines.forEach((line: any) => {
            const name = line.service_name || 'Service';
            serviceCount[name] = (serviceCount[name] || 0) + 1;
          });
        } else {
          const name = s.service_name || 'Service';
          serviceCount[name] = (serviceCount[name] || 0) + 1;
        }
      });
      return serviceCount;
    };

    if (servicePerfMode === 'monthly') {
      const monthStr = `${anchorYear}-${String(servicePerfMonthIndex + 1).padStart(2, '0')}`;
      const monthSessions = sessions.filter((s: any) => {
        if (s.billing_status !== 'paid') return false;
        const dt = s.paid_at || s.updated_at || s.created_at;
        if (!dt) return false;
        const d = new Date(dt);
        return d.toISOString().slice(0, 7) === monthStr;
      });
      const counts = countInSessions(monthSessions);
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    // Average mode: all paid sessions in the anchor year
    const yearSessions = sessions.filter((s: any) => {
      if (s.billing_status !== 'paid') return false;
      const dt = s.paid_at || s.updated_at || s.created_at;
      if (!dt) return false;
      const d = new Date(dt);
      return d.getFullYear() === anchorYear;
    });
    const counts = countInSessions(yearSessions);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count / 12 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sessions, anchorYear, servicePerfMode, servicePerfMonthIndex]);

  const topStaffByCount = useMemo(() => {
    const countStaff = (sessionList: any[]) => {
      const staffCount: Record<string, number> = {};
      sessionList.forEach((s: any) => {
        const lines = s.service_lines || [];
        lines.forEach((line: any) => {
          const name = line.assigned_staff_name || '';
          if (!name) return;
          staffCount[name] = (staffCount[name] || 0) + 1;
        });
      });
      return staffCount;
    };

    if (staffPerfMode === 'monthly') {
      const monthStr = `${anchorYear}-${String(staffPerfMonthIndex + 1).padStart(2, '0')}`;
      const monthSessions = sessions.filter((s: any) => {
        if (s.billing_status !== 'paid') return false;
        const dt = s.paid_at || s.updated_at || s.created_at;
        if (!dt) return false;
        const d = new Date(dt);
        return d.toISOString().slice(0, 7) === monthStr;
      });
      const counts = countStaff(monthSessions);
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    const yearSessions = sessions.filter((s: any) => {
      if (s.billing_status !== 'paid') return false;
      const dt = s.paid_at || s.updated_at || s.created_at;
      if (!dt) return false;
      const d = new Date(dt);
      return d.getFullYear() === anchorYear;
    });
    const counts = countStaff(yearSessions);
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count: count / 12 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [sessions, anchorYear, staffPerfMode, staffPerfMonthIndex]);

  const countServicesInSessions = useCallback((sessionList: any[]) => {
    const serviceCount: Record<string, number> = {};
    sessionList.forEach((s: any) => {
      const lines = s.service_lines || [];
      if (lines.length > 0) {
        lines.forEach((line: any) => {
          const name = line.service_name || 'Service';
          serviceCount[name] = (serviceCount[name] || 0) + 1;
        });
      } else {
        const name = s.service_name || 'Service';
        serviceCount[name] = (serviceCount[name] || 0) + 1;
      }
    });
    return serviceCount;
  }, []);

  const countStaffInSessions = useCallback((sessionList: any[]) => {
    const staffCount: Record<string, number> = {};
    sessionList.forEach((s: any) => {
      const lines = s.service_lines || [];
      lines.forEach((line: any) => {
        const name = line.assigned_staff_name || '';
        if (!name) return;
        staffCount[name] = (staffCount[name] || 0) + 1;
      });
    });
    return staffCount;
  }, []);

  const getMonthSessions = useCallback((year: number, monthIndex: number) =>
    sessions.filter((s: any) => {
      if (s.billing_status !== 'paid') return false;
      const dt = s.paid_at || s.updated_at || s.created_at;
      if (!dt) return false;
      const d = new Date(dt);
      return d.toISOString().slice(0, 7) === `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
    }), [sessions]);

  const getYearSessions = useCallback((year: number) =>
    sessions.filter((s: any) => {
      if (s.billing_status !== 'paid') return false;
      const dt = s.paid_at || s.updated_at || s.created_at;
      if (!dt) return false;
      const d = new Date(dt);
      return d.getFullYear() === year;
    }), [sessions]);

  const buildRanked = useCallback((
    countMap: Record<string, number>,
    mode: 'monthly' | 'average'
  ) =>
    Object.entries(countMap)
      .map(([name, count]) => ({ name, count: mode === 'average' ? count / 12 : count }))
      .filter((e) => e.count > 0)
  , []);

  const worstServicesByCount = useMemo(() => {
    const list = servicePerfMode === 'monthly'
      ? getMonthSessions(anchorYear, servicePerfMonthIndex)
      : getYearSessions(anchorYear);
    return buildRanked(countServicesInSessions(list), servicePerfMode)
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);
  }, [sessions, anchorYear, servicePerfMode, servicePerfMonthIndex, countServicesInSessions, getMonthSessions, getYearSessions, buildRanked]);

  const worstStaffByCount = useMemo(() => {
    const list = staffPerfMode === 'monthly'
      ? getMonthSessions(anchorYear, staffPerfMonthIndex)
      : getYearSessions(anchorYear);
    return buildRanked(countStaffInSessions(list), staffPerfMode)
      .sort((a, b) => a.count - b.count)
      .slice(0, 5);
  }, [sessions, anchorYear, staffPerfMode, staffPerfMonthIndex, countStaffInSessions, getMonthSessions, getYearSessions, buildRanked]);

  const staffChartData = useMemo(() => {
    const list = staffChartMode === 'monthly'
      ? getMonthSessions(anchorYear, staffChartMonthIndex)
      : getYearSessions(anchorYear);
    const counts = countStaffInSessions(list);
    const all = Object.entries(counts)
      .map(([name, count]) => ({ name, count: staffChartMode === 'average' ? count / 12 : count }))
      .sort((a, b) => b.count - a.count);
    return all;
  }, [sessions, anchorYear, staffChartMode, staffChartMonthIndex, countStaffInSessions, getMonthSessions, getYearSessions]);

  const bookingVolumeData = useMemo(() => {
    const months: { month: string; count: number }[] = [];
    const monthMap: Record<string, number> = {};
    for (let m = 0; m < 12; m++) {
      const d = new Date(anchorYear, m, 1);
      const key = d.toISOString().slice(0, 7);
      const ml = d.toLocaleDateString('en-GB', { month: 'short' });
      monthMap[key] = m;
      months.push({ month: ml, count: 0 });
    }
    appointments.forEach((a: any) => {
      const dt = a.appointment_date || a.created_at;
      if (!dt) return;
      const d = new Date(dt);
      if (d.getFullYear() !== anchorYear) return;
      const key = d.toISOString().slice(0, 7);
      const idx = monthMap[key];
      if (idx !== undefined) months[idx].count += 1;
    });
    if (bookingChartMode === 'average') {
      return months.map((m) => ({ ...m, count: m.count / 12 }));
    }
    return months;
  }, [appointments, anchorYear, bookingChartMode]);

  const bookingMonthData = useMemo(() => {
    if (bookingChartMode !== 'monthly') return null;
    const days: Record<string, number> = {};
    const daysInMonth = new Date(anchorYear, bookingChartMonthIndex + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${anchorYear}-${String(bookingChartMonthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days[key] = 0;
    }
    appointments.forEach((a: any) => {
      const dt = a.appointment_date || a.created_at;
      if (!dt) return;
      const key = new Date(dt).toISOString().slice(0, 10);
      if (days[key] !== undefined) days[key] += 1;
    });
    return Object.entries(days).map(([date, count]) => ({
      day: new Date(date).getDate().toString(),
      count,
    }));
  }, [appointments, anchorYear, bookingChartMode, bookingChartMonthIndex]);

  const addonPerformanceData = useMemo(() => {
    const addonMap: Record<string, { name: string; count: number; revenue: number }> = {};
    const list = bookingChartMode === 'monthly'
      ? getMonthSessions(anchorYear, bookingChartMonthIndex)
      : getYearSessions(anchorYear);
    list.forEach((s: any) => {
      const lines = s.addon_lines || [];
      lines.forEach((line: any) => {
        const name = line.addon_name || 'Addon';
        const revenue = parseAmount(line.line_total || 0);
        if (!addonMap[name]) addonMap[name] = { name, count: 0, revenue: 0 };
        addonMap[name].count += Number(line.quantity || 1);
        addonMap[name].revenue += revenue;
      });
    });
    if (bookingChartMode === 'average') {
      Object.values(addonMap).forEach((a) => {
        a.count = a.count / 12;
        a.revenue = a.revenue / 12;
      });
    }
    return Object.values(addonMap).sort((a, b) => b.revenue - a.revenue);
  }, [sessions, anchorYear, bookingChartMode, bookingChartMonthIndex, getMonthSessions, getYearSessions]);

  const expensesByPurpose = useMemo(() => {
    const purposeMap: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const dt = e.expense_date || e.created_at;
      if (!dt) return;
      const d = new Date(dt);
      if (d.getFullYear() !== anchorYear) return;
      const purpose = (e.purpose || 'General').trim() || 'General';
      purposeMap[purpose] = (purposeMap[purpose] || 0) + parseAmount(e.amount);
    });
    const colors = ['#6a0dad', '#f59e0b', '#ef4444', '#16a34a', '#0ea5e9', '#f97316', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];
    return Object.entries(purposeMap)
      .map(([name, value], idx) => ({ name, value, fill: colors[idx % colors.length] }))
      .sort((a, b) => b.value - a.value);
  }, [expenses, anchorYear]);

  const stats = [
    { title: 'Gross Revenue', value: grossRevenue, icon: <FiDollarSign />, color: 'purple' },
    { title: 'Commissions (Paid + Pending)', value: totalCommissions, icon: <FiDollarSign />, color: 'warning' },
    { title: 'Operational Cost', value: operationalCost, icon: <FiTrendingUp />, color: 'danger' },
    { title: 'Net Made', value: netMade, icon: <FiDollarSign />, color: 'success' },
    { title: `Profit @ ${profitRemainingRate}%`, value: settingsProfitValue, icon: <FiTrendingUp />, color: 'purple' },
    { title: 'Total Sessions', value: totalSessions, icon: <FiActivity />, color: 'primary', isNumber: true },
    { title: 'Avg. Ticket', value: avgTicket, icon: <FiBarChart2 />, color: 'warning' },
    { title: 'Active Staff', value: activeStaffCount, icon: <FiUsers />, color: 'info', isNumber: true },
  ];

  const buildExportData = useCallback((): AnalyticsExportData => ({
    periodLabel: reportRange.label,
    startDate: reportRange.startDate,
    endDate: reportRange.endDate,
    stats,
    feedbackCount,
    avgServiceRating,
    avgBillingRating,
    recentFeedbackComments: recentFeedbackComments,
    revenueBars: weeklyRevenueBars.map(b => ({ label: b.label, value: b.value })),
    topTreatments,
    highPerformingStaff,
    fastMovingProducts,
    deductions: {
      commissions: totalCommissions,
      tax: totalTax,
      productDeductions: productDeductedValue,
      discountDeductions: discountDeductionValue,
      otherDeductions: otherDeductionValue,
    },
    peakSessionDays,
    netMade,
    settingsProfitValue,
    profitRemainingRate,
  }), [stats, feedbackCount, avgServiceRating, avgBillingRating, recentFeedbackComments, weeklyRevenueBars, topTreatments, highPerformingStaff, fastMovingProducts, totalCommissions, totalTax, productDeductedValue, discountDeductionValue, otherDeductionValue, peakSessionDays, netMade, settingsProfitValue, profitRemainingRate, reportRange]);

  return (
    <AdminLayout>
      <div className="container-fluid px-4">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-1">Business Intelligence</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Data-driven insights & performance tracking</p>
          </div>
          <div className="d-flex gap-2">
            <div className="dropdown">
              <button className="btn btn-purple-outline rounded-pill px-4 py-2 fw-bold small d-flex align-items-center dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" type="button">
                <FiDownload className="me-2" /> EXPORT
              </button>
              <ul className="dropdown-menu shadow-lg border-opacity-10">
                <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Export Format</h6></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-2" onClick={() => exportAnalyticsCSV(buildExportData())}>
                    <FiFileText className="me-2 text-success" /> CSV (.csv)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item d-flex align-items-center py-2" onClick={() => exportAnalyticsPDF(buildExportData())}>
                    <FiFileText className="me-2 text-danger" /> PDF (.pdf)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Monthly Comparison Chart — Full Width, Top Hero */}
        <div className="mb-5">
          <div className="glass-panel p-4 p-xl-5 rounded-4 border-1 shadow-sm">
            {/* Integrated Header */}
            <div className="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-3 mb-4">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FiBarChart2 className="text-purple" size={20} />
                  <span>Monthly Comparison</span>
                </h5>
                <div className="btn-group" role="group" style={{ gap: 0 }}>
                  {ChartMetrics.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${chartMetric === m ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setChartMetric(m)}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <select
                  className="form-select form-select-sm period-select"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as ReportingPeriod)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="two_weeks">Two Weeks</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <div className="d-flex align-items-center gap-2 small text-secondary bg-body-tertiary rounded-pill px-3 py-1">
                  <FiCalendar size={12} className="opacity-50" />
                  <span>{reportRange.startDate}</span>
                  <span className="opacity-25">—</span>
                  <span>{reportRange.endDate}</span>
                </div>
                <input
                  type="date"
                  className="form-control form-control-sm period-date"
                  value={anchorDate}
                  onChange={(e) => setAnchorDate(e.target.value)}
                  title="Anchor date"
                />
              </div>
            </div>

            {missingMonthsMessage && <div className="alert alert-warning py-2 small mb-3">{missingMonthsMessage}</div>}

            {/* Chart */}
            {monthlyData.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 360 }}>
                <div className="text-center">
                  <FiBarChart2 size={48} className="opacity-25 mb-3" />
                  <div>No paid session data available for this period.</div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={monthlyData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: 'rgba(128,128,128,0.6)', fontWeight: 500 }}
                    axisLine={{ stroke: 'rgba(128,128,128,0.15)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'rgba(128,128,128,0.6)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => {
                      if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(1)}M`;
                      if (v >= 1_000) return `KES ${(v / 1_000).toFixed(0)}k`;
                      return `KES ${v}`;
                    }}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(106,13,173,0.06)' }}
                    contentStyle={{
                      background: 'rgba(0,0,0,0.9)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      fontSize: '13px',
                      padding: '12px 16px',
                      boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: any, name: any) => {
                      const labels: Record<string, string> = { revenue: 'Revenue', commissions: 'Commissions', expenses: 'Expenses', tax: 'Tax', profit: 'Profit' };
                      return [`KES ${Number(value).toLocaleString()}`, labels[name] || name];
                    }}
                  />
                  <Bar
                    dataKey={chartMetric}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={56}
                    fillOpacity={0.88}
                  >
                    {monthlyData.map((entry, idx) => {
                      const val = (entry as any)[chartMetric];
                      let fill: string;
                      if (chartMetric === 'profit') {
                        fill = val < 0 ? '#ef4444' : '#16a34a';
                      } else if (chartMetric === 'revenue') {
                        fill = '#6a0dad';
                      } else if (chartMetric === 'commissions') {
                        fill = '#f59e0b';
                      } else if (chartMetric === 'tax') {
                        fill = '#eab308';
                      } else {
                        fill = '#ef4444';
                      }
                      return <Cell key={idx} fill={fill} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Summary chips below chart */}
            {monthlyData.length > 0 && (
              <div className="d-flex gap-3 flex-wrap mt-4 pt-3 border-top border-opacity-10">
                <div className="d-flex align-items-center gap-2 small text-secondary">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#6a0dad' }} />
                  Revenue: <strong className="text-dark">KES {grossRevenue.toLocaleString()}</strong>
                </div>
                <div className="d-flex align-items-center gap-2 small text-secondary">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#f59e0b' }} />
                  Commissions: <strong className="text-dark">KES {totalCommissions.toLocaleString()}</strong>
                </div>
                <div className="d-flex align-items-center gap-2 small text-secondary">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#ef4444' }} />
                  Expenses: <strong className="text-dark">KES {(totalExpenses).toLocaleString()}</strong>
                </div>
                <div className="d-flex align-items-center gap-2 small text-secondary">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#eab308' }} />
                  Tax: <strong className="text-dark">KES {totalTax.toLocaleString()}</strong>
                </div>
                <div className="d-flex align-items-center gap-2 small text-secondary">
                  <span className="d-inline-block rounded-circle" style={{ width: 10, height: 10, backgroundColor: '#16a34a' }} />
                  Profit: <strong className="text-dark" style={netMade < 0 ? { color: '#ef4444' } : {}}>KES {netMade.toLocaleString()}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Services by Count */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="glass-panel p-4 p-xl-5 rounded-4 border-1 shadow-sm">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FiActivity className="text-purple" size={20} />
                  <span>Top Performing Services</span>
                  <span className="badge bg-dark text-white rounded-pill fw-normal small ms-2">
                    {servicePerfMode === 'monthly' ? 'By Count' : 'Monthly Average'}
                  </span>
                </h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="btn-group" role="group" style={{ gap: 0 }}>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${servicePerfMode === 'monthly' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setServicePerfMode('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${servicePerfMode === 'average' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setServicePerfMode('average')}
                    >
                      Yearly Average
                    </button>
                  </div>
                  {servicePerfMode === 'monthly' && (
                    <select
                      className="form-select form-select-sm period-select"
                      value={servicePerfMonthIndex}
                      onChange={(e) => setServicePerfMonthIndex(Number(e.target.value))}
                      style={{ minWidth: '110px' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(anchorYear, i, 1).toLocaleDateString('en-GB', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {topServicesByCount.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 120 }}>
                  <div className="text-center">
                    <FiActivity size={32} className="opacity-25 mb-2" />
                    <div>No completed service data for this period.</div>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {topServicesByCount.map((service, idx) => {
                    const maxCount = topServicesByCount[0].count || 1;
                    const pct = (service.count / maxCount) * 100;
                    return (
                      <div key={idx} className="col-md-6 col-lg-4 col-xl">
                        <div className={`p-3 rounded-4 h-100 d-flex flex-column justify-content-between ${idx === 0 ? '' : 'bg-body-tertiary bg-opacity-50'}`}
                          style={idx === 0 ? { border: '1px solid var(--purple)', background: 'linear-gradient(135deg, rgba(106,13,173,0.08) 0%, rgba(106,13,173,0.03) 100%)' } : { border: '1px solid rgba(128,128,128,0.08)' }}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className={`fw-bold fs-5 ${idx === 0 ? 'text-primary' : 'text-dark'}`}>
                              #{idx + 1}
                            </span>
                            <span className={`small fw-medium text-truncate ${idx === 0 ? 'fw-bold text-dark' : 'text-secondary'}`}>{service.name}</span>
                          </div>
                          <div className="d-flex align-items-baseline gap-2">
                            <span className={`fw-bold ${idx === 0 ? 'fs-3' : 'fs-4'} text-purple`}>
                              {servicePerfMode === 'average' ? service.count.toFixed(1) : service.count}
                            </span>
                            <span className="x-small text-secondary text-uppercase tracking-wider">
                              {servicePerfMode === 'average' ? 'avg/month' : 'times'}
                            </span>
                          </div>
                          <div className="progress rounded-pill mt-2" style={{ height: '6px', background: 'rgba(128,128,128,0.1)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              className={`progress-bar rounded-pill ${idx === 0 ? 'bg-primary' : 'bg-purple'}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Best Performing Staff by Count */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="glass-panel p-4 p-xl-5 rounded-4 border-1 shadow-sm">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FiUsers className="text-success" size={20} />
                  <span>Best Performing Staff</span>
                  <span className="badge bg-dark text-white rounded-pill fw-normal small ms-2">
                    {staffPerfMode === 'monthly' ? 'By Count' : 'Monthly Average'}
                  </span>
                </h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="btn-group" role="group" style={{ gap: 0 }}>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${staffPerfMode === 'monthly' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setStaffPerfMode('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${staffPerfMode === 'average' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setStaffPerfMode('average')}
                    >
                      Yearly Average
                    </button>
                  </div>
                  {staffPerfMode === 'monthly' && (
                    <select
                      className="form-select form-select-sm period-select"
                      value={staffPerfMonthIndex}
                      onChange={(e) => setStaffPerfMonthIndex(Number(e.target.value))}
                      style={{ minWidth: '110px' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(anchorYear, i, 1).toLocaleDateString('en-GB', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {topStaffByCount.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 120 }}>
                  <div className="text-center">
                    <FiUsers size={32} className="opacity-25 mb-2" />
                    <div>No completed service data for this period.</div>
                  </div>
                </div>
              ) : (
                <div className="row g-3">
                  {topStaffByCount.map((staff, idx) => {
                    const maxCount = topStaffByCount[0].count || 1;
                    const pct = (staff.count / maxCount) * 100;
                    return (
                      <div key={idx} className="col-md-6 col-lg-4 col-xl">
                        <div className={`p-3 rounded-4 h-100 d-flex flex-column justify-content-between ${idx === 0 ? '' : 'bg-body-tertiary bg-opacity-50'}`}
                          style={idx === 0 ? { border: '1px solid #198754', background: 'linear-gradient(135deg, rgba(25,135,84,0.08) 0%, rgba(25,135,84,0.03) 100%)' } : { border: '1px solid rgba(128,128,128,0.08)' }}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className={`fw-bold fs-5 ${idx === 0 ? 'text-success' : 'text-dark'}`}>
                              #{idx + 1}
                            </span>
                            <span className={`small fw-medium text-truncate ${idx === 0 ? 'fw-bold text-dark' : 'text-secondary'}`}>{staff.name}</span>
                          </div>
                          <div className="d-flex align-items-baseline gap-2">
                            <span className={`fw-bold ${idx === 0 ? 'fs-3' : 'fs-4'} text-success`}>
                              {staffPerfMode === 'average' ? staff.count.toFixed(1) : staff.count}
                            </span>
                            <span className="x-small text-secondary text-uppercase tracking-wider">
                              {staffPerfMode === 'average' ? 'avg/month' : 'services'}
                            </span>
                          </div>
                          <div className="progress rounded-pill mt-2" style={{ height: '6px', background: 'rgba(128,128,128,0.1)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              className="progress-bar rounded-pill bg-success"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Staff Performance Comparison Chart */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="glass-panel p-4 p-xl-5 rounded-4 border-1 shadow-sm">
              <div className="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-3 mb-4">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FiUsers className="text-purple" size={20} />
                  <span>Staff Performance Comparison</span>
                </h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="btn-group" role="group" style={{ gap: 0 }}>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${staffChartMode === 'monthly' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setStaffChartMode('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${staffChartMode === 'average' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setStaffChartMode('average')}
                    >
                      Yearly Average
                    </button>
                  </div>
                  {staffChartMode === 'monthly' && (
                    <select
                      className="form-select form-select-sm period-select"
                      value={staffChartMonthIndex}
                      onChange={(e) => setStaffChartMonthIndex(Number(e.target.value))}
                      style={{ minWidth: '110px' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(anchorYear, i, 1).toLocaleDateString('en-GB', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {staffChartData.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 320 }}>
                  <div className="text-center">
                    <FiBarChart2 size={48} className="opacity-25 mb-3" />
                    <div>No staff service data for this period.</div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={staffChartData} margin={{ top: 12, right: 12, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: 'rgba(128,128,128,0.6)', fontWeight: 500 }}
                      axisLine={{ stroke: 'rgba(128,128,128,0.15)' }}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: 'rgba(128,128,128,0.6)' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      width={50}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(106,13,173,0.06)' }}
                      contentStyle={{
                        background: 'rgba(0,0,0,0.9)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '16px',
                        fontSize: '13px',
                        padding: '12px 16px',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      }}
                      labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => [`${Number(value)} services`, 'Count']}
                    />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      maxBarSize={48}
                      fillOpacity={0.88}
                      fill="#6a0dad"
                      label={{ position: 'top', fontSize: 11, fill: 'rgba(128,128,128,0.6)', fontWeight: 600 }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Worst Performing Services & Staff */}
        <div className="row g-4 mb-5">
          <div className="col-lg-6">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FiActivity className="text-danger" size={18} />
                <h5 className="fw-bold m-0">Worst Performing Services</h5>
                <span className="badge bg-dark text-white rounded-pill fw-normal small ms-1">
                  {servicePerfMode === 'monthly' ? 'By Count' : 'Monthly Average'}
                </span>
              </div>
              {worstServicesByCount.length === 0 ? (
                <p className="small text-secondary mb-0">All services performed at least once.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {worstServicesByCount.map((svc, idx) => {
                    const maxCount = worstServicesByCount[worstServicesByCount.length - 1]?.count || 1;
                    const pct = (svc.count / maxCount) * 100;
                    return (
                      <div key={idx} className="d-flex align-items-center gap-3 small">
                        <span className="fw-bold text-danger" style={{ minWidth: 24 }}>#{idx + 1}</span>
                        <span className="text-secondary text-truncate flex-shrink-1" style={{ minWidth: 0 }}>{svc.name}</span>
                        <span className="fw-bold ms-auto text-nowrap">{servicePerfMode === 'average' ? svc.count.toFixed(1) : svc.count}</span>
                        <div className="progress rounded-pill flex-shrink-0" style={{ width: 60, height: '4px', background: 'rgba(128,128,128,0.1)' }}>
                          <div className="progress-bar rounded-pill bg-danger" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <FiUsers className="text-danger" size={18} />
                <h5 className="fw-bold m-0">Worst Performing Staff</h5>
                <span className="badge bg-dark text-white rounded-pill fw-normal small ms-1">
                  {staffPerfMode === 'monthly' ? 'By Count' : 'Monthly Average'}
                </span>
              </div>
              {worstStaffByCount.length === 0 ? (
                <p className="small text-secondary mb-0">All staff performed at least one service.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {worstStaffByCount.map((st, idx) => {
                    const maxCount = worstStaffByCount[worstStaffByCount.length - 1]?.count || 1;
                    const pct = (st.count / maxCount) * 100;
                    return (
                      <div key={idx} className="d-flex align-items-center gap-3 small">
                        <span className="fw-bold text-danger" style={{ minWidth: 24 }}>#{idx + 1}</span>
                        <span className="text-secondary text-truncate flex-shrink-1" style={{ minWidth: 0 }}>{st.name}</span>
                        <span className="fw-bold ms-auto text-nowrap">{staffPerfMode === 'average' ? st.count.toFixed(1) : st.count}</span>
                        <div className="progress rounded-pill flex-shrink-0" style={{ width: 60, height: '4px', background: 'rgba(128,128,128,0.1)' }}>
                          <div className="progress-bar rounded-pill bg-danger" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Volume Graph */}
        <div className="row g-4 mb-5">
          <div className="col-12">
            <div className="glass-panel p-4 p-xl-5 rounded-4 border-1 shadow-sm">
              <div className="d-flex flex-column flex-xl-row justify-content-between align-items-start align-items-xl-center gap-3 mb-4">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FiCalendar className="text-purple" size={20} />
                  <span>Booking Volume</span>
                  <span className="badge bg-dark text-white rounded-pill fw-normal small ms-2">
                    {bookingChartMode === 'monthly' ? 'By Day' : 'Monthly Average'}
                  </span>
                </h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="btn-group" role="group" style={{ gap: 0 }}>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${bookingChartMode === 'monthly' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setBookingChartMode('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${bookingChartMode === 'average' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setBookingChartMode('average')}
                    >
                      Yearly Average
                    </button>
                  </div>
                  {bookingChartMode === 'monthly' && (
                    <select
                      className="form-select form-select-sm period-select"
                      value={bookingChartMonthIndex}
                      onChange={(e) => setBookingChartMonthIndex(Number(e.target.value))}
                      style={{ minWidth: '110px' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(anchorYear, i, 1).toLocaleDateString('en-GB', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {bookingMonthData && bookingChartMode === 'monthly' ? (
                bookingMonthData.length === 0 ? (
                  <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 260 }}>
                    <div className="text-center">
                      <FiCalendar size={32} className="opacity-25 mb-2" />
                      <div>No bookings for this month.</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingMonthData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: 'rgba(128,128,128,0.6)', fontWeight: 500 }}
                        axisLine={{ stroke: 'rgba(128,128,128,0.15)' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'rgba(128,128,128,0.6)' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(14,165,233,0.06)' }}
                        contentStyle={{
                          background: 'rgba(0,0,0,0.9)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '16px',
                          fontSize: '13px',
                          padding: '12px 16px',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`${value} bookings`, 'Count']}
                        labelFormatter={(label: any) => `${new Date(anchorYear, bookingChartMonthIndex, Number(label)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={20} fill="#0ea5e9" fillOpacity={0.88} />
                    </BarChart>
                  </ResponsiveContainer>
                )
              ) : (
                bookingVolumeData.length === 0 ? (
                  <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 260 }}>
                    <div className="text-center">
                      <FiCalendar size={32} className="opacity-25 mb-2" />
                      <div>No booking data for {anchorYear}.</div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingVolumeData} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: 'rgba(128,128,128,0.6)', fontWeight: 500 }}
                        axisLine={{ stroke: 'rgba(128,128,128,0.15)' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: 'rgba(128,128,128,0.6)' }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                        width={50}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(14,165,233,0.06)' }}
                        contentStyle={{
                          background: 'rgba(0,0,0,0.9)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '16px',
                          fontSize: '13px',
                          padding: '12px 16px',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => [`${bookingChartMode === 'average' ? (Number(value)).toFixed(1) : value} bookings`, bookingChartMode === 'average' ? 'Avg/Month' : 'Count']}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={44} fill="#0ea5e9" fillOpacity={0.88}>
                        {bookingVolumeData.map((_, idx) => (
                          <Cell key={idx} fill="#0ea5e9" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )
              )}
            </div>
          </div>
        </div>

        {/* Addon Performance & Expenses Pie Chart */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <div className="glass-panel p-4 p-xl-5 rounded-4 border-1 shadow-sm h-100">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                <h5 className="fw-bold m-0 d-flex align-items-center gap-2">
                  <FiShoppingCart className="text-purple" size={20} />
                  <span>Addon Performance</span>
                  <span className="badge bg-dark text-white rounded-pill fw-normal small ms-2">
                    {bookingChartMode === 'monthly' ? 'By Month' : 'Monthly Average'}
                  </span>
                </h5>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="btn-group" role="group" style={{ gap: 0 }}>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${bookingChartMode === 'monthly' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setBookingChartMode('monthly')}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-3 py-1-5 fw-semibold ${bookingChartMode === 'average' ? 'chart-toggle-active' : 'chart-toggle'}`}
                      onClick={() => setBookingChartMode('average')}
                    >
                      Yearly Average
                    </button>
                  </div>
                  {bookingChartMode === 'monthly' && (
                    <select
                      className="form-select form-select-sm period-select"
                      value={bookingChartMonthIndex}
                      onChange={(e) => setBookingChartMonthIndex(Number(e.target.value))}
                      style={{ minWidth: '110px' }}
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(anchorYear, i, 1).toLocaleDateString('en-GB', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {addonPerformanceData.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 200 }}>
                  <div className="text-center">
                    <FiShoppingCart size={32} className="opacity-25 mb-2" />
                    <div>No addon data for this period.</div>
                  </div>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {addonPerformanceData.map((a, idx) => {
                    const maxRev = addonPerformanceData[0].revenue || 1;
                    const pct = (a.revenue / maxRev) * 100;
                    return (
                      <div key={idx} className="d-flex align-items-center gap-3 py-2 border-bottom border-opacity-10" style={{ borderColor: 'rgba(128,128,128,0.1)' }}>
                        <span className={`fw-bold ${idx === 0 ? 'text-purple' : 'text-dark'}`} style={{ minWidth: 24 }}>#{idx + 1}</span>
                        <span className="text-secondary text-truncate flex-shrink-1" style={{ minWidth: 0, maxWidth: 200 }}>{a.name}</span>
                        <div className="progress rounded-pill flex-grow-1" style={{ height: '6px', background: 'rgba(128,128,128,0.1)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            className="progress-bar rounded-pill bg-purple"
                          />
                        </div>
                        <span className="fw-bold small text-nowrap">{a.count} {bookingChartMode === 'average' ? 'avg' : 'sold'}</span>
                        <span className="fw-bold small text-purple text-nowrap" style={{ minWidth: 100, textAlign: 'right' }}>KES {a.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-4">
            <div className="glass-panel p-4 rounded-4 border-1 shadow-sm h-100">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <FiPieChart className="text-purple" size={20} />
                <span>Expenses by Purpose</span>
                <span className="badge bg-dark text-white rounded-pill fw-normal small ms-2">{anchorYear}</span>
              </h5>
              {expensesByPurpose.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center text-secondary small" style={{ height: 260 }}>
                  <div className="text-center">
                    <FiPieChart size={32} className="opacity-25 mb-2" />
                    <div>No expenses for {anchorYear}.</div>
                  </div>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={expensesByPurpose}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={50}
                        paddingAngle={3}
                      >
                        {expensesByPurpose.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(0,0,0,0.9)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '16px',
                          fontSize: '13px',
                          padding: '12px 16px',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any, name: any) => [`KES ${Number(value).toLocaleString()}`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex flex-wrap gap-2 mt-2">
                    {expensesByPurpose.map((e, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-1 small">
                        <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, backgroundColor: e.fill }} />
                        <span className="text-secondary">{e.name}</span>
                        <span className="fw-bold text-dark">KES {e.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* KPI Summary Strip */}
        <div className="row g-2 mb-5">
          {stats.map((stat, idx) => (
            <div key={idx} className="col-6 col-md-3 col-xl">
              <div className="kpi-card p-3 rounded-4 h-100 d-flex align-items-center gap-3 border-0 shadow-sm">
                <div className={`kpi-icon d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 text-${stat.color}`}
                  style={{ width: 38, height: 38, background: `var(--bs-${stat.color === 'purple' ? 'purple' : stat.color}-bg, rgba(106,13,173,0.1))` }}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <div className="kpi-label x-small text-secondary text-uppercase tracking-wider fw-semibold mb-0 text-truncate">{stat.title}</div>
                  <div className={`kpi-value fw-bold ${stat.isNumber ? '' : ''}`} style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {stat.isNumber
                      ? `${Number(stat.value).toLocaleString(undefined, { maximumFractionDigits: 1 })}`
                      : `KES ${Number(stat.value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                  </div>
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

        .chart-toggle {
          background: transparent;
          border: 1px solid rgba(128,128,128,0.2);
          color: rgba(128,128,128,0.7);
          transition: all 0.2s ease;
        }
        .chart-toggle:hover {
          border-color: var(--purple);
          color: var(--purple);
        }
        .chart-toggle-active {
          background: var(--purple) !important;
          border-color: var(--purple) !important;
          color: #fff !important;
        }
        .chart-toggle:first-child,
        .chart-toggle-active:first-child {
          border-radius: 50px 0 0 50px;
        }
        .chart-toggle:last-child,
        .chart-toggle-active:last-child {
          border-radius: 0 50px 50px 0;
        }
        .chart-toggle + .chart-toggle,
        .chart-toggle + .chart-toggle-active,
        .chart-toggle-active + .chart-toggle {
          border-left: none;
        }
        .period-select {
          min-width: 120px;
          border-radius: 50px !important;
          border: 1px solid rgba(128,128,128,0.2);
          background: transparent;
          font-size: 0.8rem;
          padding: 0.35rem 0.75rem;
        }
        .period-select:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 2px rgba(106,13,173,0.15);
        }
        .period-date {
          border-radius: 50px !important;
          border: 1px solid rgba(128,128,128,0.2);
          background: transparent;
          font-size: 0.8rem;
          padding: 0.35rem 0.75rem;
          max-width: 150px;
        }
        .period-date:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 2px rgba(106,13,173,0.15);
        }
        .py-1-5 {
          padding-top: 0.3rem !important;
          padding-bottom: 0.3rem !important;
        }
        .kpi-card {
          background: #fff;
          border: 1px solid rgba(128,128,128,0.06) !important;
          transition: all 0.2s ease;
        }
        .kpi-card:hover {
          border-color: rgba(106,13,173,0.2) !important;
          box-shadow: 0 4px 16px rgba(106,13,173,0.08) !important;
        }
        .kpi-icon {
          transition: all 0.2s ease;
        }
        .kpi-card:hover .kpi-icon {
          transform: scale(1.05);
        }
        .kpi-value {
          color: #1a1a1a;
        }
        .kpi-label {
          line-height: 1.3;
        }
      `}} />
    </AdminLayout>
  );
};

export default AnalyticsPage;
