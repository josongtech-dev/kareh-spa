import React from 'react';

interface Column {
  header: string;
  align?: 'start' | 'center' | 'end';
}

interface AdminTableProps<T> {
  columns: Column[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  isDarkMode?: boolean;
  loading?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
}

function AdminTable<T>({ 
  columns, 
  data, 
  renderRow, 
  isDarkMode = false,
  loading = false,
  defaultPageSize = 15,
  pageSizeOptions = [15, 30, 50, 100]
}: AdminTableProps<T>) {
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPageSize(defaultPageSize);
  }, [defaultPageSize]);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);

  React.useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  React.useEffect(() => {
    setPage(1);
  }, [data.length, pageSize]);

  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pagedData = data.slice(start, end);

  return (
    <div className="glass-panel rounded-4 overflow-hidden border-1 shadow-sm">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-3 border-bottom border-opacity-10">
        <div className="small text-secondary">
          Showing {data.length === 0 ? 0 : start + 1}-{Math.min(end, data.length)} of {data.length}
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="small text-secondary mb-0">Rows per page</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 90 }}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive p-0">
        <table className={`table table-hover mb-0 ${isDarkMode ? 'table-dark text-white' : 'text-dark'}`}>
          <thead className={`${isDarkMode ? 'bg-white bg-opacity-5' : 'bg-light'}`}>
            <tr>
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={`px-4 py-3 border-0 small text-uppercase tracking-wider ${col.align ? `text-${col.align}` : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5">
                  <div className="spinner-border text-purple" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-secondary">
                  No records found.
                </td>
              </tr>
            ) : (
              pagedData.map((item, index) => renderRow(item, start + index))
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="d-flex justify-content-between align-items-center px-3 py-3 border-top border-opacity-10">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
          >
            Previous
          </button>
          <div className="small text-secondary">Page {safePage} of {totalPages}</div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminTable;
