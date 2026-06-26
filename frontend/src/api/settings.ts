import api from './axiosInstance';

export type SystemSettings = Record<string, any>;

export const settingsApi = {
  getAll: () => api.get<SystemSettings>('/settings.php'),
  update: (settings: SystemSettings) => api.put('/settings.php', { settings }),
};
