export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  iconLink?: string;
  parents?: string[];
  isFolder?: boolean;
  directoryCategory?: 'chatgptOs' | 'sparkOs' | 'other';
}

export interface DriveFolderBreadcrumb {
  id: string;
  name: string;
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export interface ArticleData {
  id: string;
  title: string;
  rawHtml: string;
  cleanContent: string;
  textContent: string;
  byline?: string;
  excerpt?: string;
  siteName?: string;
  toc: TOCItem[];
  readingTimeMinutes: number;
  source: 'drive' | 'demo';
}

export type ReaderTheme = 'light' | 'sepia' | 'dark' | 'eyegreen' | 'midnight';
export type ReaderFont = 'sans' | 'serif' | 'mono' | 'kai';
export type ReaderMode = 'clean' | 'raw';

export interface ReaderSettings {
  theme: ReaderTheme;
  fontFamily: ReaderFont;
  fontSize: number; // e.g., 18
  lineHeight: number; // e.g., 1.8
  maxWidth: number; // e.g., 760
  mode: ReaderMode;
  autoHideBars: boolean;
}

export interface GoogleAuthConfig {
  clientId: string;
  apiKey: string;
}

export interface ReadingProgress {
  fileId: string;
  title: string;
  percentage: number;
  scrollTop: number;
  lastReadAt: number;
}
