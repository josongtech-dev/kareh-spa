import type { ReportingPeriod, ReportingRange } from '../../adminReporting';

interface PeriodFilterBarProps {
  period: ReportingPeriod;
  anchorDate: string;
  reportRange: ReportingRange;
  onPeriodChange: (period: ReportingPeriod) => void;
  onAnchorChange: (date: string) => void;
}

const PERIOD_LABELS: Record<ReportingPeriod, string> = {
  monthly: 'Monthly',
  weekly: 'Weekly (Mon-Sun)',
  two_weeks: 'Two Weeks',
  quarterly: 'Quarterly (4-month)',
  half_yearly: 'Half Yearly',
  yearly: 'Yearly (Jan-Dec)',
};

const PeriodFilterBar = ({ period, anchorDate, reportRange, onPeriodChange, onAnchorChange }: PeriodFilterBarProps) => (
  <>
    <div className="col-md-4 col-lg-2">
      <select
        className="form-select glass-input-simple"
        value={period}
        onChange={(e) => onPeriodChange(e.target.value as ReportingPeriod)}
      >
        {Object.entries(PERIOD_LABELS).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </select>
    </div>
    <div className="col-md-4 col-lg-2">
      <input
        type="date"
        className="form-control glass-input-simple"
        value={anchorDate}
        onChange={(e) => onAnchorChange(e.target.value)}
      />
    </div>
    <div className="col-12">
      <div className="small text-secondary">
        Period: <strong>{reportRange.startDate}</strong> to <strong>{reportRange.endDate}</strong> ({reportRange.label})
      </div>
    </div>
  </>
);

export default PeriodFilterBar;
