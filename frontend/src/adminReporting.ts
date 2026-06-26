export type ReportingPeriod = 'monthly' | 'weekly' | 'two_weeks' | 'quarterly' | 'half_yearly' | 'yearly';

export interface ReportingRange {
  key: ReportingPeriod;
  label: string;
  start: Date;
  end: Date;
  startDate: string;
  endDate: string;
}

const toDateOnly = (value: Date): Date => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const formatDate = (value: Date): string => {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const mondayStartOfWeek = (input: Date): Date => {
  const d = toDateOnly(input);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

export const buildReportingRange = (period: ReportingPeriod, anchorInput: Date): ReportingRange => {
  const anchor = toDateOnly(anchorInput);

  if (period === 'weekly') {
    const start = mondayStartOfWeek(anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      key: period,
      label: 'Weekly (Mon-Sun)',
      start,
      end,
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  if (period === 'two_weeks') {
    const start = mondayStartOfWeek(anchor);
    const end = new Date(start);
    end.setDate(start.getDate() + 13);
    return {
      key: period,
      label: 'Two Weeks (14 days from Monday)',
      start,
      end,
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  if (period === 'quarterly') {
    // Business rule requested: Jan-Apr, May-Aug, Sep-Dec.
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const blockStartMonth = month <= 3 ? 0 : month <= 7 ? 4 : 8;
    const start = new Date(year, blockStartMonth, 1);
    const end = new Date(year, blockStartMonth + 4, 0);
    return {
      key: period,
      label: 'Quarterly (4-month blocks from January)',
      start,
      end,
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  if (period === 'half_yearly') {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();
    const startMonth = month <= 5 ? 0 : 6;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 6, 0);
    return {
      key: period,
      label: 'Half Yearly (Jan-Jun / Jul-Dec)',
      start,
      end,
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  if (period === 'yearly') {
    const year = anchor.getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return {
      key: period,
      label: 'Yearly (Jan-Dec)',
      start,
      end,
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }

  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return {
    key: 'monthly',
    label: 'Monthly (calendar month)',
    start,
    end,
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};

export const isDateWithinRange = (value: string | Date | undefined, range: ReportingRange): boolean => {
  if (!value) return false;
  const dt = toDateOnly(new Date(value));
  if (Number.isNaN(dt.getTime())) return false;
  return dt.getTime() >= range.start.getTime() && dt.getTime() <= range.end.getTime();
};

export const getMissingMonthsMessage = (
  firstRecordedIso: string | null,
  year: number
): string | null => {
  if (!firstRecordedIso) return null;
  const first = new Date(firstRecordedIso);
  if (Number.isNaN(first.getTime())) return null;

  if (first.getFullYear() > year) {
    return `No system records were captured in ${year}.`;
  }
  if (first.getFullYear() < year) {
    return null;
  }
  if (first.getMonth() === 0) {
    return null;
  }

  const missing = first.getMonth();
  return `${missing} month(s) in ${year} were not recorded before system go-live (${first.toLocaleDateString()}).`;
};
