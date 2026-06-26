export type AdminRole = 'owner' | 'manager' | 'receptionist' | 'attendant' | 'unknown';

const normalizeRoleValue = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getCurrentAdminUser = (): any | null => {
  try {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getCurrentAdminRole = (): AdminRole => {
  const user = getCurrentAdminUser();
  const normalized = normalizeRoleValue(
    String(user?.role ?? user?.user_role ?? user?.designation ?? '')
  );

  if (normalized === 'owner' || normalized.includes('owner')) return 'owner';
  if (normalized === 'manager') return 'manager';
  if (normalized === 'receptionist') return 'receptionist';
  if (normalized === 'attendant' || normalized === 'staff attendant' || normalized.includes('attendant')) return 'attendant';
  return 'unknown';
};

export const isOwner = (role: AdminRole): boolean => role === 'owner';
export const isManager = (role: AdminRole): boolean => role === 'manager';
export const isReceptionist = (role: AdminRole): boolean => role === 'receptionist';
export const isAttendant = (role: AdminRole): boolean => role === 'attendant';
export const isManagerOrOwner = (role: AdminRole): boolean => role === 'manager' || role === 'owner';

export const canManageServices = (role: AdminRole): boolean => isManagerOrOwner(role);
export const canManageOffers = (role: AdminRole): boolean => isManagerOrOwner(role);
export const canAddOrEditProducts = (role: AdminRole): boolean => isManagerOrOwner(role) || isReceptionist(role);
export const canDeleteProducts = (role: AdminRole): boolean => isManager(role) || isOwner(role);
export const canSeeCommissions = (role: AdminRole): boolean => isManagerOrOwner(role) || isAttendant(role);
export const canSeeAnalytics = (role: AdminRole): boolean => isManagerOrOwner(role);
export const canCreateAdmin = (role: AdminRole): boolean => isManagerOrOwner(role);

/** Expenses: managers & owners (full); receptionists may record and view only. */
export const canAccessExpenses = (role: AdminRole): boolean =>
  isManagerOrOwner(role) || isReceptionist(role);

export const canFullyManageExpenses = (role: AdminRole): boolean => isManagerOrOwner(role);
