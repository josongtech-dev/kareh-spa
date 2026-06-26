import React, { useState, useContext, useEffect, useCallback } from 'react';
import {
  FiSearch, FiRefreshCw, FiFilter, FiChevronLeft, FiChevronRight,
  FiUser, FiActivity, FiLogIn, FiLogOut, FiDollarSign,
  FiEdit, FiTrash2, FiPlus, FiX
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import { activityLogsApi } from '../../api/activityLogs';
import type { ActivityLog } from '../../api/activityLogs';

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'auth', label: 'Auth' },
  { value: 'session', label: 'Sessions' },
  { value: 'appointment', label: 'Appointments' },
  { value: 'payment', label: 'Payments' },
  { value: 'staff', label: 'Staff' },
  { value: 'member', label: 'Members' },
  { value: 'service', label: 'Services' },
  { value: 'addon', label: 'Add-ons' },
  { value: 'offer', label: 'Offers' },
  { value: 'product', label: 'Products' },
  { value: 'expense', label: 'Expenses' },
  { value: 'commission', label: 'Commissions' },
  { value: 'settings', label: 'Settings' },
];

const ACTION_ICONS: Record<string, React.ReactNode> = {
  'login': <FiLogIn size={12} />,
  'logout': <FiLogOut size={12} />,
  'login_activation': <FiLogIn size={12} />,
  'registered': <FiPlus size={12} />,
  'created': <FiPlus size={12} />,
  'updated': <FiEdit size={12} />,
  'deleted': <FiTrash2 size={12} />,
  'cancelled': <FiX size={12} />,
  'paid': <FiDollarSign size={12} />,
  'initiated': <FiDollarSign size={12} />,
  'manual': <FiDollarSign size={12} />,
  'settled': <FiDollarSign size={12} />,
  'service_added': <FiPlus size={12} />,
  'service_removed': <FiTrash2 size={12} />,
  'addon_added': <FiPlus size={12} />,
  'addon_removed': <FiTrash2 size={12} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'auth': 'text-info',
  'session': 'text-purple',
  'appointment': 'text-primary',
  'payment': 'text-success',
  'staff': 'text-warning',
  'member': 'text-info',
  'service': 'text-purple',
  'addon': 'text-secondary',
  'offer': 'text-danger',
  'product': 'text-primary',
  'expense': 'text-danger',
  'commission': 'text-success',
  'settings': 'text-secondary',
};

const formatDateTime = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const ActivityLogsPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 50 };
      if (category) params.category = category;
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await activityLogsApi.getAll(params);
      const data = res.data;
      setLogs(data.logs || []);
      setTotalPages(data.total_pages || 0);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    } finally {
      setLoading(false);
    }
  }, [page, category, search, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleFilterReset = () => {
    setCategory('');
    setSearch('');
    setSearchInput('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <AdminLayout>
      <div className="container-fluid px-4 py-4">
        {/* Filters */}
        <div className="glass-panel rounded-4 p-3 mb-4 border-1 shadow-sm">
          <form onSubmit={handleSearch}>
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label x-small text-uppercase tracking-wider text-secondary fw-bold">Search</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-transparent border-end-0"><FiSearch size={14} /></span>
                  <input
                    type="text"
                    className="form-control form-control-sm border-start-0"
                    placeholder="Search description, actor, action..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label x-small text-uppercase tracking-wider text-secondary fw-bold">Category</label>
                <select className="form-select form-select-sm" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label x-small text-uppercase tracking-wider text-secondary fw-bold">Date From</label>
                <input type="date" className="form-control form-control-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label x-small text-uppercase tracking-wider text-secondary fw-bold">Date To</label>
                <input type="date" className="form-control form-control-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <div className="col-md-3 d-flex gap-2">
                <button type="submit" className="btn btn-sm btn-purple rounded-pill px-3">
                  <FiFilter size={12} className="me-1" /> Filter
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={handleFilterReset}>
                  <FiX size={12} className="me-1" /> Clear
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => fetchLogs()}>
                  <FiRefreshCw size={12} />
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <span className="small text-secondary">{total} activity {total === 1 ? 'entry' : 'entries'}</span>
        </div>

        {/* Table */}
        <div className="glass-panel rounded-4 overflow-hidden border-1 shadow-sm">
          <div className="table-responsive">
            <table className={`table mb-0 ${isDarkMode ? 'table-dark' : ''}`}>
              <thead className={isDarkMode ? 'bg-white bg-opacity-5' : 'bg-light'}>
                <tr>
                  <th className="px-4 py-3 border-0 small text-uppercase tracking-wider" style={{ width: '20%' }}>Actor</th>
                  <th className="px-4 py-3 border-0 small text-uppercase tracking-wider" style={{ width: '12%' }}>Category</th>
                  <th className="px-4 py-3 border-0 small text-uppercase tracking-wider" style={{ width: '48%' }}>Description</th>
                  <th className="px-4 py-3 border-0 small text-uppercase tracking-wider text-end" style={{ width: '20%' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5">
                      <div className="spinner-border text-purple" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5">
                      <FiActivity size={28} className="mb-2 d-block mx-auto text-secondary opacity-50" />
                      <span className="small text-secondary opacity-50">No activity log entries found</span>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="align-middle border-bottom border-opacity-10">
                      <td className="px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-2">
                          <span className={`d-inline-flex align-items-center justify-content-center rounded-circle ${isDarkMode ? 'bg-white bg-opacity-10' : 'bg-dark bg-opacity-10'}`} style={{ width: 28, height: 28 }}>
                            <FiUser size={12} className="text-secondary" />
                          </span>
                          <div>
                            <div className="fw-semibold small">{log.actor_name || 'System'}</div>
                            {log.actor_type && <div className="x-small text-muted">{log.actor_type}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-2">
                          <span className={CATEGORY_COLORS[log.category] || 'text-secondary'}>
                            {ACTION_ICONS[log.action] || <FiActivity size={12} />}
                          </span>
                          <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-normal" style={{ fontSize: '0.55rem' }}>
                            {log.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-0">
                        <div className="small">{log.description}</div>
                        {log.ip_address && (
                          <div className="x-small text-muted mt-1">IP: {log.ip_address}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 border-0 text-end">
                        <div className="small text-secondary">{formatDateTime(log.created_at)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <FiChevronLeft size={14} className="me-1" /> Previous
            </button>
            <span className="small text-secondary">
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next <FiChevronRight size={14} className="ms-1" />
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ActivityLogsPage;
