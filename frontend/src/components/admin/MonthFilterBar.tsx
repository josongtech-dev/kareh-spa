interface Props {
  selectedMonth: string;
  onMonthChange: (ym: string) => void;
}

const getAvailableMonths = (): string[] => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
};

const formatMonthLabel = (ym: string): string => {
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

const currentMonth = (() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
})();

const MonthFilterBar = ({ selectedMonth, onMonthChange }: Props) => {
  const btnClass = (active: boolean) =>
    active
      ? 'btn-purple'
      : 'btn-outline-secondary';

  return (
    <div className="d-flex align-items-center gap-1 flex-wrap justify-content-end">
      <button
        className={`rounded-pill ${btnClass(selectedMonth === currentMonth)}`}
        onClick={() => onMonthChange(currentMonth)}
        style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', border: '1px solid', background: selectedMonth === currentMonth ? '#6a0dad' : 'transparent', color: selectedMonth === currentMonth ? '#fff' : 'inherit', borderColor: selectedMonth === currentMonth ? '#6a0dad' : 'rgba(128,128,128,0.3)' }}
      >
        This Month
      </button>
      <button
        className="rounded-pill"
        onClick={() => {
          const d = new Date(selectedMonth + '-01');
          d.setMonth(d.getMonth() - 1);
          onMonthChange(d.toISOString().slice(0, 7));
        }}
        style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', border: '1px solid rgba(128,128,128,0.3)', background: 'transparent', color: 'inherit' }}
      >
        Prev Month
      </button>
      <select
        className="form-select form-select-sm border-opacity-10 bg-transparent"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
        style={{ width: 'auto', minWidth: '145px', fontSize: '0.75rem' }}
      >
        {getAvailableMonths().map((ym) => (
          <option key={ym} value={ym}>{formatMonthLabel(ym)}</option>
        ))}
      </select>
    </div>
  );
};

export default MonthFilterBar;
