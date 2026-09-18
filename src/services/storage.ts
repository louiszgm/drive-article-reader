import { GoogleAuthConfig, ReaderSettings, ReadingProgress } from '../types';

const SETTINGS_KEY = 'drive_reader_settings';
const AUTH_KEY = 'drive_reader_auth';
const PROGRESS_KEY = 'drive_reader_progress';

export const DEFAULT_SETTINGS: ReaderSettings = {
  theme: 'sepia',
  fontFamily: 'serif',
  fontSize: 18,
  lineHeight: 1.8,
  maxWidth: 780,
  mode: 'raw',
  autoHideBars: true,
};

export const getStoredSettings = (): ReaderSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed, mode: 'raw' };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: ReaderSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
};

export const getStoredAuthConfig = (): GoogleAuthConfig => {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse auth config:', e);
  }
  // Fallback to Vite environment variables if defined
  return {
    clientId: (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '',
    apiKey: (import.meta as any).env?.VITE_GOOGLE_API_KEY || '',
  };
};

export const saveStoredAuthConfig = (config: GoogleAuthConfig): void => {
  try {
    localStorage.setItem(AUTH_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save auth config:', e);
  }
};

export const getStoredReadingHistory = (): ReadingProgress[] => {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveReadingProgress = (
  fileId: string,
  title: string,
  percentage: number,
  scrollTop: number
): void => {
  try {
    const history = getStoredReadingHistory();
    const existingIndex = history.findIndex((h) => h.fileId === fileId);
    const newEntry: ReadingProgress = {
      fileId,
      title,
      percentage: Math.min(100, Math.max(0, Math.round(percentage))),
      scrollTop,
      lastReadAt: Date.now(),
    };

    if (existingIndex >= 0) {
      history[existingIndex] = newEntry;
    } else {
      history.unshift(newEntry);
    }

    // Keep top 30 recent items
    const pruned = history
      .sort((a, b) => b.lastReadAt - a.lastReadAt)
      .slice(0, 30);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(pruned));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
};

export const getFileProgress = (fileId: string): ReadingProgress | undefined => {
  const history = getStoredReadingHistory();
  return history.find((h) => h.fileId === fileId);
};
