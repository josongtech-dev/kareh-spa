import { useState, useContext, useEffect } from 'react';
import { 
  FiDollarSign, FiActivity, FiSearch, FiMoreHorizontal, 
  FiCheckCircle, FiTrendingUp
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import AdminTable from '../../components/admin/AdminTable';
import SuccessModal from '../../components/admin/SuccessModal';
import { commissionApi } from '../../api/commissions';
import { serviceApi } from '../../api/services';
import ServiceImageThumb from '../../components/ServiceImageThumb';
import { getCurrentAdminRole, getCurrentAdminUser, isAttendant, isManagerOrOwner } from '../../adminAccess';
import { buildReportingRange, getMissingMonthsMessage } from '../../adminReporting';
import type { ReportingPeriod } from '../../adminReporting';

const CommissionsManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const currentRole = getCurrentAdminRole();
  const currentUser = getCurrentAdminUser();
  const attendantView = isAttendant(currentRole);
  const canSeeCommissionRules = isManagerOrOwner(currentRole);
  const currentStaffId = Number(currentUser?.id || currentUser?.staff_id || 0);
  const [searchQuery, setSearchQuery] = useState('');
  const [period, setPeriod] = useState<ReportingPeriod>('monthly');
  const [anchorDate, setAnchorDate] = useState(new Date().toISOString().slice(0, 10));
  const [commissions, setCommissions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({ total_pending: 0, total_paid: 0 });
  const [firstRecordedDate, setFirstRecordedDate] = useState<string | null>(null);
  const [manualStatEnabled, setManualStatEnabled] = useState(false);
  const [manualPending, setManualPending] = useState<number>(0);
  const [manualPaid, setManualPaid] = useState<number>(0);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedStaffName, setSelectedStaffName] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [staffServiceDetails, setStaffServiceDetails] = useState<any[]>([]);
  /** Matches the aggregated table row (Pending vs Paid) so details are not mixed. */
  const [detailsStatusFilter, setDetailsStatusFilter] = useState<'Pending' | 'Paid' | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [settleForm, setSettleForm] = useState({
    payment_method: '',
    transaction_id: '',
    settled_at: new Date().toISOString().slice(0, 16),
    settlement_notes: '',
    handed_over_by: ''
  });
  const [settleError, setSettleError] = useState('');
  const [servicesCatalog, setServicesCatalog] = useState<any[]>([]);
  const reportRange = buildReportingRange(period, new Date(anchorDate));
  const selectedMonth = `${reportRange.start.getFullYear()}-${String(reportRange.start.getMonth() + 1).padStart(2, '0')}`;

  const formatDurationFromSeconds = (seconds?: number | string) => {
    const totalSec = Math.max(0, Number(seconds || 0));
    const hh = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const fetchData = async () => {
    try {
      const [syncRes, aggRes, summRes, allRes, svcRes] = await Promise.all([
        commissionApi.sync(),
        commissionApi.getAggregated(undefined, reportRange.startDate, reportRange.endDate),
        commissionApi.getSummary(undefined, reportRange.startDate, reportRange.endDate),
        commissionApi.getAll(),
        serviceApi.getAll()
      ]);
      const svcRows = svcRes.data?.data || svcRes.data || [];
      setServicesCatalog(Array.isArray(svcRows) ? svcRows : []);
      const syncData = syncRes.data?.data || syncRes.data;
      if (syncData?.inserted || syncData?.updated || syncData?.skipped_paid) {
        console.log(
          `Commission sync: inserted ${syncData.inserted || 0}, updated ${syncData.updated || 0}, skipped (already paid) ${syncData.skipped_paid || 0}`
        );
      }
      setCommissions(aggRes.data?.data || aggRes.data || []);
      setSummary(summRes.data?.data || summRes.data || { total_pending: 0, total_paid: 0 });
      const allRows = allRes.data?.data || allRes.data || [];
      const earliest = [...allRows]
        .map((row: any) => row?.created_at)
        .filter(Boolean)
        .sort()[0];
      setFirstRecordedDate(earliest || null);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, anchorDate]);

  const filteredCommissions = commissions.filter(c => 
    c.staff_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const scopedCommissions = attendantView
    ? filteredCommissions.filter((c) => Number(c.staff_id) === currentStaffId)
    : filteredCommissions;
  const ownTotals = scopedCommissions.reduce(
    (acc: any, row: any) => {
      acc.pending += Number(row.pending_earnings || 0);
      acc.paid += Number(row.paid_earnings || 0);
      return acc;
    },
    { pending: 0, paid: 0 }
  );
  const effectivePending = (attendantView ? ownTotals.pending : Number(summary.total_pending || 0)) + (manualStatEnabled ? manualPending : 0);
  const effectivePaid = (attendantView ? ownTotals.paid : Number(summary.total_paid || 0)) + (manualStatEnabled ? manualPaid : 0);
  const missingMonthsMessage = period === 'yearly' ? getMissingMonthsMessage(firstRecordedDate, reportRange.start.getFullYear()) : null;

  const handleSettle = () => {
    // This would normally call an API to settle all dues
    setSuccessMessage("All pending dues have been successfully settled.");
    setIsSuccessModalOpen(true);
  };

  const openSettleModal = (staffId: number, staffName: string) => {
    setSelectedStaffId(staffId);
    setSelectedStaffName(staffName);
    setSettleForm({
      payment_method: '',
      transaction_id: '',
      settled_at: new Date().toISOString().slice(0, 16),
      settlement_notes: '',
      handed_over_by: ''
    });
    setSettleError('');
    setIsSettleModalOpen(true);
  };

  const handleSettleStaff = async () => {
    if (!selectedStaffId) return;
    setSettleError('');
    try {
      await commissionApi.settleStaff(selectedStaffId, {
        ...settleForm,
        month: selectedMonth
      });
      setIsSettleModalOpen(false);
      setSuccessMessage(`Settled pending commissions for ${selectedStaffName}.`);
      setIsSuccessModalOpen(true);
      fetchData();
    } catch (error: any) {
      console.error('Settle staff commissions failed:', error);
      setSettleError(error?.response?.data?.message || 'Failed to settle commissions.');
    }
  };

  const handleViewDetails = async (
    staffId: number,
    staffName: string,
    paymentStatus: string,
    settlementBatchId?: number | null,
    payoutFingerprint?: { transactionId: string | null; settledAt: string | null } | null
  ) => {
    const bucket: 'Pending' | 'Paid' = paymentStatus === 'Paid' ? 'Paid' : 'Pending';
    try {
      const res = await commissionApi.getStaffDetails(
        staffId,
        undefined,
        reportRange.startDate,
        reportRange.endDate,
        bucket,
        settlementBatchId != null && settlementBatchId > 0 ? settlementBatchId : undefined,
        bucket === 'Paid' && (settlementBatchId == null || settlementBatchId <= 0) ? payoutFingerprint ?? null : null
      );
      setDetailsStatusFilter(bucket);
      setSelectedStaffName(staffName);
      setStaffServiceDetails(res.data?.data || res.data || []);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Error fetching commission details:', error);
      setSuccessMessage('Unable to load staff service details right now.');
      setIsSuccessModalOpen(true);
    }
  };

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Commissions & Payouts</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Transparent revenue allocation & staff earnings</p>
          </div>
          {!attendantView && (
            <div className="d-flex gap-2">
              <button className="btn btn-purple-outline rounded-pill px-4 py-2 fw-bold x-small">DOWNLOAD REPORT</button>
              <button 
                onClick={handleSettle}
                className="btn btn-purple rounded-pill px-4 py-2 fw-bold x-small d-flex align-items-center"
                disabled={period !== 'monthly'}
                title={period !== 'monthly' ? 'Settle-all is monthly only.' : ''}
              >
                <FiDollarSign className="me-2" /> SETTLE ALL DUES
              </button>
            </div>
          )}
        </div>

        {/* Global Stats */}
        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 bg-purple bg-opacity-10 text-purple rounded-3"><FiTrendingUp /></div>
              </div>
              <div className="text-secondary x-small text-uppercase tracking-wider fw-bold">Total Commission Due</div>
              <div className="h3 mb-0 fw-bold">KES {parseFloat(String(effectivePending)).toLocaleString()}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="p-2 bg-success bg-opacity-10 text-success rounded-3"><FiCheckCircle /></div>
              </div>
              <div className="text-secondary x-small text-uppercase tracking-wider fw-bold">Total Paid Out</div>
              <div className="h3 mb-0 fw-bold">KES {parseFloat(String(effectivePaid)).toLocaleString()}</div>
            </div>
          </div>
          {!attendantView && (
            <>
              <div className="col-md-3">
                <div className="glass-panel p-3 rounded-4 border-1 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="p-2 bg-warning bg-opacity-10 text-warning rounded-3"><FiActivity /></div>
                  </div>
                  <div className="text-secondary x-small text-uppercase tracking-wider fw-bold">Total Tax (12%)</div>
                  <div className="h3 mb-0 fw-bold">KES {parseFloat(summary.total_tax || 0).toLocaleString()}</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="glass-panel p-3 rounded-4 border-1 shadow-sm">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="p-2 bg-info bg-opacity-10 text-info rounded-3"><FiDollarSign /></div>
                  </div>
                  <div className="text-secondary x-small text-uppercase tracking-wider fw-bold">Service Profit (18%)</div>
                  <div className="h3 mb-0 fw-bold">KES {parseFloat(summary.total_service_profit || 0).toLocaleString()}</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="glass-panel p-3 rounded-4 mb-4 border-1 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="text" 
                  className="form-control glass-input-simple ps-5" 
                  placeholder="Search by practitioner name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4 col-lg-3">
              <select className="form-select glass-input-simple" value={period} onChange={(e) => setPeriod(e.target.value as ReportingPeriod)}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly (Mon-Sun)</option>
                <option value="two_weeks">Two Weeks</option>
                <option value="quarterly">Quarterly (Jan-based)</option>
                <option value="yearly">Yearly (Jan-Dec)</option>
              </select>
            </div>
            <div className="col-md-4 col-lg-3">
              <input
                type="date"
                className="form-control glass-input-simple"
                value={anchorDate}
                onChange={(e) => setAnchorDate(e.target.value)}
              />
            </div>
            <div className="col-12">
              <div className="small text-secondary">
                Period: <strong>{reportRange.startDate}</strong> to <strong>{reportRange.endDate}</strong> ({reportRange.label})
              </div>
            </div>
            {missingMonthsMessage && (
              <div className="col-12">
                <div className="alert alert-warning py-2 mb-0 small">{missingMonthsMessage}</div>
              </div>
            )}
            <div className="col-12">
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="manualStatToggle" checked={manualStatEnabled} onChange={(e) => setManualStatEnabled(e.target.checked)} />
                <label className="form-check-label small" htmlFor="manualStatToggle">
                  Add manual historical adjustments for out-of-system periods
                </label>
              </div>
            </div>
            {manualStatEnabled && (
              <>
                <div className="col-md-4">
                  <input type="number" className="form-control glass-input-simple" placeholder="Manual pending" value={manualPending} onChange={(e) => setManualPending(Number(e.target.value || 0))} />
                </div>
                <div className="col-md-4">
                  <input type="number" className="form-control glass-input-simple" placeholder="Manual paid" value={manualPaid} onChange={(e) => setManualPaid(Number(e.target.value || 0))} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Commissions Table */}
        <AdminTable 
          isDarkMode={isDarkMode}
          data={scopedCommissions}
          columns={[
            { header: 'Practitioner' },
            { header: 'Booking Vol.' },
            { header: 'Earnings (KES)' },
            { header: 'Status' },
            { header: 'Transaction ref.' },
            { header: 'Settled' },
            { header: 'Action', align: 'end' }
          ]}
          renderRow={(comm) => {
            const bucket = String(comm.payment_status || '').toLowerCase();
            const batchId = comm.settlement_batch_id != null ? Number(comm.settlement_batch_id) : null;
            const rowKey =
              batchId != null && batchId > 0
                ? `${comm.staff_id}-Paid-${batchId}`
                : bucket === 'pending'
                  ? `${comm.staff_id}-Pending`
                  : `${comm.staff_id}-Paid-${String(comm.transaction_id ?? '')}-${String(comm.settled_at ?? '')}`;
            const showSettle = !attendantView && bucket === 'pending' && Number(comm.pending_earnings || 0) > 0;
            const txnRef =
              bucket === 'paid'
                ? comm.transaction_id != null && String(comm.transaction_id).trim() !== ''
                  ? String(comm.transaction_id)
                  : comm.batch_payment_method === 'Cash'
                    ? 'Cash (see notes)'
                    : '—'
                : '—';
            const settledLabel =
              bucket === 'paid' && comm.settled_at
                ? new Date(comm.settled_at).toLocaleString()
                : '—';
            return (
            <tr key={rowKey} className="align-middle border-bottom border-opacity-10">
              <td className="px-4 py-4 border-0">
                <div className="d-flex align-items-center">
                  <div className="bg-purple bg-opacity-10 rounded-circle p-2 text-purple me-3 d-flex align-items-center justify-content-center fw-bold" style={{ width: '36px', height: '36px' }}>
                    {comm.staff_name.split(' ').map((n:any) => n[0]).join('')}
                  </div>
                  <div className="fw-bold">{comm.staff_name}</div>
                </div>
              </td>
              <td className="py-4 border-0 small text-secondary">{comm.bookings} services</td>
              <td className="py-4 border-0">
                <div className="fw-bold text-gradient">KES {parseFloat(comm.total_earnings).toLocaleString()}</div>
              </td>
              <td className={`py-4 border-0 fw-bold ${bucket === 'paid' ? 'text-success' : 'text-warning'}`}>
                {bucket === 'paid' ? 'Paid' : 'Pending'}
              </td>
              <td className="py-4 border-0 small text-nowrap">{txnRef}</td>
              <td className="py-4 border-0 small">{settledLabel}</td>
              <td className="px-4 py-4 border-0 text-end">
                <div className="dropdown">
                  <button className={`btn btn-sm p-2 rounded-circle border-0 ${isDarkMode ? 'text-white hover-bg-white-10' : 'text-dark hover-bg-black-10'}`} type="button" data-bs-toggle="dropdown">
                    <FiMoreHorizontal />
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                    <li><button className="dropdown-item py-2 d-flex align-items-center" onClick={() => handleViewDetails(Number(comm.staff_id), comm.staff_name, String(comm.payment_status || 'Pending'), batchId, comm.settled_at ? { transactionId: comm.transaction_id != null ? String(comm.transaction_id) : null, settledAt: String(comm.settled_at) } : null)}><FiActivity className="me-2" /> View Details</button></li>
                    {showSettle && <li><button className="dropdown-item py-2 d-flex align-items-center text-success" onClick={() => openSettleModal(Number(comm.staff_id), comm.staff_name)}><FiDollarSign className="me-2" /> Mark as Settled</button></li>}
                  </ul>
                </div>
              </td>
            </tr>
            );
          }}
        />
      </div>

      {/* Success Feedback Modal */}
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        isDarkMode={isDarkMode}
      />

      <AdminModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setStaffServiceDetails([]);
          setDetailsStatusFilter(null);
        }}
        title="Staff Service Commissions"
        subtitle={
          canSeeCommissionRules
            ? `${selectedStaffName} — ${reportRange.startDate} to ${reportRange.endDate}. ${
                detailsStatusFilter === 'Paid' ? 'Settled lines only.' : 'Outstanding lines only.'
              } Amounts use each service’s commission rule (or the site default).`
            : `${selectedStaffName} — ${reportRange.startDate} to ${reportRange.endDate}. ${
                detailsStatusFilter === 'Paid' ? 'Settled lines only.' : 'Outstanding lines only.'
              }`
        }
        isDarkMode={isDarkMode}
        maxWidth="1100px"
      >
        {(() => {
          const rows = staffServiceDetails;
          const total = rows.reduce((acc: number, r: any) => acc + Number(r.staff_amount || 0), 0);
          const bucket = detailsStatusFilter;
          const txns = [
            ...new Set(
              rows
                .map((r: any) => r.transaction_id)
                .filter((t: any) => t != null && String(t).trim() !== '')
            ),
          ];
          const settledTimes = [...new Set(rows.map((r: any) => r.settled_at).filter(Boolean))];
          const dateSummary =
            bucket === 'Pending'
              ? '—'
              : settledTimes.length === 0
                ? '—'
                : settledTimes.length === 1
                  ? new Date(settledTimes[0]).toLocaleString()
                  : 'Various (see rows)';
          const txnSummary =
            bucket === 'Pending'
              ? '—'
              : txns.length === 0
                ? '—'
                : txns.length === 1
                  ? String(txns[0])
                  : 'Various (see rows)';
          const totalLabel =
            bucket === 'Paid' ? 'Total settled (this view)' : 'Total outstanding (this view)';

          return (
            <div className="glass-panel p-3 rounded-4 border border-opacity-10 mb-3">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="small text-secondary text-uppercase fw-bold">{totalLabel}</div>
                  <div className="fw-bold">KES {total.toLocaleString()}</div>
                </div>
                <div className="col-md-4">
                  <div className="small text-secondary text-uppercase fw-bold">Date settled</div>
                  <div className="fw-bold">{dateSummary}</div>
                </div>
                <div className="col-md-4">
                  <div className="small text-secondary text-uppercase fw-bold">Transaction code</div>
                  <div className="fw-bold">{txnSummary}</div>
                </div>
              </div>
            </div>
          );
        })()}

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Session</th>
                <th>Service</th>
                {canSeeCommissionRules ? <th>Commission rule</th> : null}
                <th>Net staff %</th>
                <th>Charge (KES)</th>
                <th>Set Duration</th>
                <th>Duration Used</th>
                {!attendantView && <th>Tax</th>}
                <th>Your commission</th>
                {!attendantView && <th>Service Profit</th>}
                <th>Settlement</th>
                <th>Reference</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {staffServiceDetails.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      attendantView ? (canSeeCommissionRules ? 11 : 10) : canSeeCommissionRules ? 13 : 12
                    }
                    className="text-secondary small"
                  >
                    No services found for the selected period.
                  </td>
                </tr>
              ) : staffServiceDetails.map((row: any) => (
                <tr key={row.id}>
                  <td className="small">{row.session_code || '-'}</td>
                  <td className="small">
                    <div className="d-flex align-items-center gap-2">
                      <ServiceImageThumb
                        imageUrl={servicesCatalog.find((s: any) => String(s.id) === String(row.service_id))?.image_url}
                        alt=""
                        size={32}
                      />
                      <span>{row.service_name || '-'}</span>
                    </div>
                  </td>
                  {canSeeCommissionRules ? (
                    <td className="small">
                      {(row.commission_rule_name && String(row.commission_rule_name).trim()) || 'Site default'}
                    </td>
                  ) : null}
                  <td className="small text-nowrap">
                    {Number(row.net_staff_pct ?? row.commission_rate ?? 0).toFixed(1)}%
                  </td>
                  <td className="small fw-bold">KES {parseFloat(row.charge_amount || 0).toLocaleString()}</td>
                  <td className="small">{row.service_duration_minutes ? `${row.service_duration_minutes} min` : '-'}</td>
                  <td className="small">{formatDurationFromSeconds(row.duration_used_seconds)}</td>
                  {!attendantView && <td className="small text-warning">KES {parseFloat(row.tax_amount || 0).toLocaleString()}</td>}
                  <td className="small text-success fw-semibold">KES {parseFloat(row.staff_amount || 0).toLocaleString()}</td>
                  {!attendantView && <td className="small text-info">KES {parseFloat(row.service_profit_amount || 0).toLocaleString()}</td>}
                  <td className="small">{row.payment_status || '-'}</td>
                  <td className="small text-nowrap">
                    {row.payment_status === 'Paid' && row.transaction_id != null && String(row.transaction_id).trim() !== ''
                      ? String(row.transaction_id)
                      : '—'}
                  </td>
                  <td className="small">{row.service_date ? new Date(row.service_date).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isSettleModalOpen}
        onClose={() => { setIsSettleModalOpen(false); setSettleError(''); }}
        title="Settle Staff Commissions"
        subtitle={`${selectedStaffName} - ${selectedMonth}`}
        isDarkMode={isDarkMode}
        maxWidth="640px"
      >
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Payment Method</label>
            <select
              className="form-select glass-input-simple"
              value={settleForm.payment_method}
              onChange={(e) => setSettleForm({ ...settleForm, payment_method: e.target.value })}
            >
              <option value="">Select method</option>
              <option value="Bank">Bank</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Cash">Cash (Discouraged)</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Settlement Date & Time</label>
            <input
              type="datetime-local"
              className="form-control glass-input-simple"
              value={settleForm.settled_at}
              onChange={(e) => setSettleForm({ ...settleForm, settled_at: e.target.value })}
            />
          </div>

          {(settleForm.payment_method === 'Bank' || settleForm.payment_method === 'Mobile Money') && (
            <div className="col-12">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Transaction ID</label>
              <input
                type="text"
                className="form-control glass-input-simple"
                value={settleForm.transaction_id}
                onChange={(e) => setSettleForm({ ...settleForm, transaction_id: e.target.value })}
                placeholder="Enter transaction reference"
              />
            </div>
          )}

          {settleForm.payment_method === 'Cash' && (
            <div className="col-12">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Person Who Handed Over</label>
              <input
                type="text"
                className="form-control glass-input-simple"
                value={settleForm.handed_over_by}
                onChange={(e) => setSettleForm({ ...settleForm, handed_over_by: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
          )}

          <div className="col-12">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Notes</label>
            <textarea
              rows={3}
              className="form-control glass-input-simple"
              value={settleForm.settlement_notes}
              onChange={(e) => setSettleForm({ ...settleForm, settlement_notes: e.target.value })}
              placeholder="Add settlement notes..."
            />
          </div>
          {settleError && (
            <div className="col-12">
              <div className="alert alert-danger py-2 small mb-0">{settleError}</div>
            </div>
          )}
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button className="btn btn-outline-secondary" onClick={() => { setIsSettleModalOpen(false); setSettleError(''); }}>
            Cancel
          </button>
          <button className="btn btn-purple" onClick={handleSettleStaff}>
            Confirm Settlement
          </button>
        </div>
      </AdminModal>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input-simple {
          background: rgba(106, 13, 173, 0.03) !important;
          border: 1px solid rgba(106, 13, 173, 0.1) !important;
          padding: 0.75rem 1rem !important;
          border-radius: 12px !important;
        }
        .btn-purple-outline {
          border: 1px solid #6a0dad;
          color: #6a0dad;
          background: transparent;
        }
        .x-small { font-size: 0.65rem; }
        .text-gradient {
          background: linear-gradient(45deg, #6a0dad, #b026ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}} />
    </AdminLayout>
  );
};

export default CommissionsManagementPage;
