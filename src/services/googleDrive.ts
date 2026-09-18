import { DriveFile } from '../types';
import { getStoredAuthConfig } from './storage';

// Google Drive API endpoints
const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';
const DRIVE_READONLY_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

export interface UserProfile {
  name: string;
  email: string;
  picture?: string;
}

class GoogleDriveService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private tokenClient: any = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    // Attempt to restore token from sessionStorage
    const savedToken = sessionStorage.getItem('gdrive_token');
    const savedExpiry = sessionStorage.getItem('gdrive_expiry');
    const savedProfile = sessionStorage.getItem('gdrive_user');
    if (savedToken && savedExpiry && Number(savedExpiry) > Date.now()) {
      this.accessToken = savedToken;
      this.tokenExpiresAt = Number(savedExpiry);
      if (savedProfile) {
        try {
          this.userProfile = JSON.parse(savedProfile);
        } catch {
          // ignore
        }
      }
    }
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiresAt;
  }

  public getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  /**
   * Initializes Google Identity Services Token Client
   */
  public initTokenClient(clientId?: string): boolean {
    const config = getStoredAuthConfig();
    const activeClientId = clientId || config.clientId;

    if (!activeClientId) {
      console.warn('Google Client ID is not configured');
      return false;
    }

    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      console.warn('Google Identity Services script not yet loaded');
      return false;
    }

    try {
      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: activeClientId,
        scope: DRIVE_READONLY_SCOPE,
        callback: () => {}, // Handled dynamically in login()
      });
      return true;
    } catch (e) {
      console.error('Failed to init Google Token Client:', e);
      return false;
    }
  }

  /**
   * Trigger Google OAuth login popup
   */
  public async login(): Promise<string> {
    const config = getStoredAuthConfig();
    if (!config.clientId) {
      throw new Error('请先在“设置”中配置 Google OAuth Client ID');
    }

    if (!this.tokenClient) {
      const ok = this.initTokenClient(config.clientId);
      if (!ok) {
        throw new Error('Google Identity 脚本正在加载中，请稍候再试');
      }
    }

    return new Promise<string>((resolve, reject) => {
      this.tokenClient.callback = async (resp: any) => {
        if (resp.error) {
          reject(new Error(resp.error_description || resp.error || '登录授权失败'));
          return;
        }

        if (resp.access_token) {
          this.accessToken = resp.access_token;
          // resp.expires_in is in seconds
          const expiresInMs = (Number(resp.expires_in) || 3600) * 1000;
          this.tokenExpiresAt = Date.now() + expiresInMs - 60000; // 1 min buffer

          sessionStorage.setItem('gdrive_token', this.accessToken!);
          sessionStorage.setItem('gdrive_expiry', this.tokenExpiresAt.toString());

          // Fetch user info
          try {
            await this.fetchUserProfile();
          } catch (e) {
            console.warn('Failed to fetch user profile:', e);
          }

          resolve(this.accessToken!);
        } else {
          reject(new Error('未接收到访问令牌'));
        }
      };

      // Request token with prompt
      this.tokenClient.requestAccessToken({ prompt: 'select_account' });
    });
  }

  /**
   * Fetch current user profile info
   */
  private async fetchUserProfile(): Promise<UserProfile | null> {
    if (!this.accessToken) return null;
    try {
      const res = await fetch(USERINFO_ENDPOINT, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        this.userProfile = {
          name: data.name || data.email,
          email: data.email,
          picture: data.picture,
        };
        sessionStorage.setItem('gdrive_user', JSON.stringify(this.userProfile));
        return this.userProfile;
      }
    } catch (e) {
      console.warn('Error fetching user info:', e);
    }
    return null;
  }

  /**
   * Log out and clear tokens
   */
  public logout(): void {
    if (this.accessToken && (window as any).google?.accounts?.oauth2?.revoke) {
      try {
        (window as any).google.accounts.oauth2.revoke(this.accessToken, () => {});
      } catch (e) {
        console.warn('Revoke token error:', e);
      }
    }
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.userProfile = null;
    sessionStorage.removeItem('gdrive_token');
    sessionStorage.removeItem('gdrive_expiry');
    sessionStorage.removeItem('gdrive_user');
  }

  /**
   * Helper to perform authenticated GET requests
   */
  private async authFetch(url: string, isText = false): Promise<any> {
    if (!this.accessToken) {
      throw new Error('未授权，请先登录 Google 账号');
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (res.status === 401) {
      this.logout();
      throw new Error('授权已过期，请重新登录 Google 账号');
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Google API 请求失败 (${res.status}): ${errText || res.statusText}`);
    }

    if (isText) {
      return res.text();
    }
    return res.json();
  }

  /**
   * List files and folders from Google Drive
   * Returns HTML files and folders (for drill-down navigation)
   */
  public async listFiles(folderId: string = 'root', searchKeyword: string = ''): Promise<DriveFile[]> {
    let q = "trashed = false";

    if (searchKeyword.trim()) {
      const kw = searchKeyword.replace(/'/g, "\\'");
      q += ` and (name contains '${kw}' or fullText contains '${kw}')`;
      q += ` and (mimeType = 'text/html' or name contains '.html' or name contains '.htm')`;
    } else {
      q += ` and '${folderId}' in parents`;
      // Match folders OR html files
      q += ` and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'text/html' or name contains '.html' or name contains '.htm')`;
    }

    const fields = 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, parents)';
    const orderBy = 'folder,modifiedTime desc,name';
    const pageSize = 100;

    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=${encodeURIComponent(orderBy)}&pageSize=${pageSize}`;

    const data = await this.authFetch(url);
    const files: DriveFile[] = (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size ? `${Math.round(file.size / 1024)} KB` : undefined,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      parents: file.parents,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    }));

    return files;
  }

  /**
   * Search for a folder by name (with case-insensitive fallback), optionally under a parent folder
   */
  public async findFolderByName(name: string, parentId?: string): Promise<DriveFile | null> {
    const safeName = name.replace(/'/g, "\\'");
    let q = `mimeType = 'application/vnd.google-apps.folder' and (name = '${safeName}' or name contains '${safeName}') and trashed = false`;
    if (parentId) {
      q += ` and '${parentId}' in parents`;
    }
    const fields = 'files(id, name, mimeType, modifiedTime, parents)';
    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&pageSize=10`;
    try {
      const data = await this.authFetch(url);
      const files: any[] = data.files || [];
      if (files.length === 0) return null;

      // Prioritize exact match (case-insensitive)
      const exact = files.find((f) => f.name.toLowerCase() === name.toLowerCase());
      const matched = exact || files[0];
      return {
        id: matched.id,
        name: matched.name,
        mimeType: matched.mimeType,
        isFolder: true,
      };
    } catch (e) {
      console.warn(`Error finding folder "${name}":`, e);
      return null;
    }
  }

  /**
   * Resolve target folders: chatgptOs and SparkOs/articles
   */
  public async resolveTargetFolders(): Promise<{
    chatgptOsFolder: DriveFile | null;
    sparkOsArticlesFolder: DriveFile | null;
  }> {
    // 1. Search for chatgptOs folder
    const chatgptOsPromise = this.findFolderByName('chatgptOs');

    // 2. Search for SparkOs folder, then look for articles folder inside it
    const sparkOsArticlesPromise = (async () => {
      // First check if there is a direct folder named "SparkOs/articles"
      const directFolder = await this.findFolderByName('SparkOs/articles');
      if (directFolder) return directFolder;

      const sparkOs = await this.findFolderByName('SparkOs');
      if (sparkOs) {
        const articles = await this.findFolderByName('articles', sparkOs.id);
        if (articles) return articles;
        // If no 'articles' subfolder, maybe the articles are in SparkOs directly
        return sparkOs;
      }
      // Fallback: search for any folder named 'articles'
      return await this.findFolderByName('articles');
    })();

    const [chatgptOsFolder, sparkOsArticlesFolder] = await Promise.all([
      chatgptOsPromise,
      sparkOsArticlesPromise,
    ]);

    return { chatgptOsFolder, sparkOsArticlesFolder };
  }

  /**
   * List HTML articles in a specific folder (and any subfolders)
   */
  public async listArticlesInFolder(folderId: string, searchKeyword: string = ''): Promise<DriveFile[]> {
    let q = `'${folderId}' in parents and trashed = false`;
    if (searchKeyword.trim()) {
      const kw = searchKeyword.replace(/'/g, "\\'");
      q += ` and (name contains '${kw}' or fullText contains '${kw}')`;
      q += ` and (mimeType = 'text/html' or name contains '.html' or name contains '.htm')`;
    } else {
      q += ` and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'text/html' or name contains '.html' or name contains '.htm')`;
    }

    const fields = 'files(id, name, mimeType, modifiedTime, size, webViewLink, iconLink, parents)';
    const orderBy = 'folder,name,modifiedTime desc';
    const pageSize = 100;
    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=${encodeURIComponent(orderBy)}&pageSize=${pageSize}`;

    const data = await this.authFetch(url);
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size ? `${Math.round(file.size / 1024)} KB` : undefined,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      parents: file.parents,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    }));
  }

  /**
   * Batch fetch articles from both chatgptOs and SparkOs/articles folders
   */
  public async fetchTargetDirectoriesArticles(): Promise<{
    chatgptOsFolder: DriveFile | null;
    sparkOsArticlesFolder: DriveFile | null;
    chatgptOsFiles: DriveFile[];
    sparkOsFiles: DriveFile[];
  }> {
    const { chatgptOsFolder, sparkOsArticlesFolder } = await this.resolveTargetFolders();

    const chatgptFilesPromise = chatgptOsFolder
      ? this.listArticlesInFolder(chatgptOsFolder.id)
      : Promise.resolve([]);

    const sparkOsFilesPromise = sparkOsArticlesFolder
      ? this.listArticlesInFolder(sparkOsArticlesFolder.id)
      : Promise.resolve([]);

    const [chatgptOsFiles, sparkOsFiles] = await Promise.all([
      chatgptFilesPromise,
      sparkOsFilesPromise,
    ]);

    return {
      chatgptOsFolder,
      sparkOsArticlesFolder,
      chatgptOsFiles: chatgptOsFiles.map((f) => ({ ...f, directoryCategory: 'chatgptOs' as const })),
      sparkOsFiles: sparkOsFiles.map((f) => ({ ...f, directoryCategory: 'sparkOs' as const })),
    };
  }

  /**
   * Fetch raw HTML content of a file
   */
  public async getFileContent(fileId: string): Promise<string> {
    const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;
    return await this.authFetch(url, true);
  }

  /**
   * Fetch file metadata
   */
  public async getFileMetadata(fileId: string): Promise<DriveFile> {
    const fields = 'id, name, mimeType, modifiedTime, size, webViewLink, iconLink, parents';
    const url = `${DRIVE_API_BASE}/files/${fileId}?fields=${encodeURIComponent(fields)}`;
    const file = await this.authFetch(url);
    return {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      size: file.size ? `${Math.round(file.size / 1024)} KB` : undefined,
      webViewLink: file.webViewLink,
      iconLink: file.iconLink,
      parents: file.parents,
      isFolder: file.mimeType === 'application/vnd.google-apps.folder',
    };
  }

  /**
   * Open Google Picker Dialog for direct HTML file selection
   */
  public openGooglePicker(onSelect: (fileId: string, fileName: string) => void): void {
    const config = getStoredAuthConfig();
    if (!this.accessToken) {
      throw new Error('请先登录 Google 账号');
    }
    if (!config.apiKey) {
      throw new Error('使用原生 Picker 需要配置 Google API Key，请在“设置”中填写');
    }

    if (!(window as any).gapi) {
      throw new Error('Google API 客户端尚未加载，请稍后再试');
    }

    (window as any).gapi.load('picker', () => {
      const picker = (window as any).google.picker;
      if (!picker) {
        throw new Error('Google Picker 加载失败');
      }

      // View for HTML docs
      const view = new picker.DocsView(picker.ViewId.DOCS)
        .setMimeTypes('text/html')
        .setMode(picker.DocsViewMode.LIST);

      const pickerBuilder = new picker.PickerBuilder()
        .enableFeature(picker.Feature.NAV_HIDDEN)
        .setAppId(config.clientId.split('-')[0])
        .setOAuthToken(this.accessToken)
        .addView(view)
        .addView(new picker.DocsUploadView())
        .setDeveloperKey(config.apiKey)
        .setCallback((data: any) => {
          if (data.action === picker.Action.PICKED) {
            const doc = data.docs[0];
            if (doc) {
              onSelect(doc.id, doc.name);
            }
          }
        });

      pickerBuilder.build().setVisible(true);
    });
  }
}

export const googleDriveService = new GoogleDriveService();
