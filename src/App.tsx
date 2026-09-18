import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { FileBrowser } from './components/FileBrowser';
import { ReaderContainer } from './components/Reader/ReaderContainer';
import { TOCSidebar } from './components/Reader/TOCSidebar';
import { ReaderControls } from './components/Reader/ReaderControls';
import { MobileBottomBar } from './components/Reader/MobileBottomBar';
import { SettingsModal } from './components/SettingsModal';
import { ArticleData, DriveFile, ReaderMode, ReaderSettings } from './types';
import {
  DEFAULT_SETTINGS,
  getStoredSettings,
  saveStoredSettings,
  getStoredAuthConfig,
} from './services/storage';
import { googleDriveService, UserProfile } from './services/googleDrive';
import { DEMO_ARTICLES, DemoArticle } from './utils/demoData';
import { parseHtmlArticle } from './utils/parser';
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<ReaderSettings>(getStoredSettings);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [articleError, setArticleError] = useState<string | null>(null);

  // Layout & UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTOCOpen, setIsTOCOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileBottomBarVisible, setIsMobileBottomBarVisible] = useState(true);

  // Reading state
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMatchCount, setSearchMatchCount] = useState(0);

  // Auth state
  const [user, setUser] = useState<UserProfile | null>(() => googleDriveService.getUserProfile());
  const [isAuthenticated, setIsAuthenticated] = useState(() => googleDriveService.isAuthenticated());

  // Initialize Google Token Client on launch if Client ID exists
  useEffect(() => {
    const authConfig = getStoredAuthConfig();
    if (authConfig.clientId) {
      googleDriveService.initTokenClient(authConfig.clientId);
    }
  }, []);

  // Set default article to Demo #1 on first visit
  useEffect(() => {
    if (!article && DEMO_ARTICLES.length > 0) {
      const firstDemo = DEMO_ARTICLES[0];
      const parsed = parseHtmlArticle(firstDemo.html, firstDemo.name, firstDemo.id, 'demo');
      setArticle(parsed);
    }
  }, [article]);

  // Sync settings changes to localStorage
  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveStoredSettings(updated);
      return updated;
    });
  };

  const handleSelectDemoArticle = (demo: DemoArticle) => {
    setArticleError(null);
    const parsed = parseHtmlArticle(demo.html, demo.name, demo.id, 'demo');
    setArticle(parsed);
    setSearchQuery('');
  };

  const handleSelectDriveFile = async (file: DriveFile) => {
    try {
      setIsLoadingArticle(true);
      setArticleError(null);
      setSearchQuery('');
      const rawHtml = await googleDriveService.getFileContent(file.id);
      const parsed = parseHtmlArticle(rawHtml, file.name, file.id, 'drive');
      setArticle(parsed);
    } catch (err: any) {
      console.error('Failed to load drive article:', err);
      setArticleError(err.message || '加载文件失败，请检查网络或授权');
    } finally {
      setIsLoadingArticle(false);
    }
  };

  const handleScrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveHeadingId(id);
    }
  };

  const handleScrollDirection = useCallback((isScrollingDown: boolean) => {
    setIsMobileBottomBarVisible(!isScrollingDown);
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        article={article}
        mode={settings.mode}
        onChangeMode={(m: ReaderMode) => handleUpdateSettings({ mode: m })}
        user={user}
        onLoginSuccess={(u) => {
          setUser(u);
          setIsAuthenticated(true);
        }}
        onLogout={() => {
          googleDriveService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }}
      />

      {/* Desktop Reader Controls Bar (for clean mode) */}
      {article && settings.mode === 'clean' && (
        <ReaderControls
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onToggleTOC={() => setIsTOCOpen(!isTOCOpen)}
          isTOCOpen={isTOCOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMatchCount={searchMatchCount}
        />
      )}

      {/* Main Content Workspace */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left: File Browser (Drawer on mobile, Sidebar on desktop) */}
        <FileBrowser
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onSelectDriveFile={handleSelectDriveFile}
          onSelectDemoArticle={handleSelectDemoArticle}
          currentArticleId={article?.id}
          isAuthenticated={isAuthenticated}
          onPromptLogin={() => {
            const config = getStoredAuthConfig();
            if (!config.clientId) {
              setIsSettingsOpen(true);
            } else {
              googleDriveService.login().then(() => {
                setUser(googleDriveService.getUserProfile());
                setIsAuthenticated(true);
              }).catch((e) => alert(e.message));
            }
          }}
        />

        {/* Center: Article Reader Container */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-white">
          {isLoadingArticle ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-medium text-gray-700">正在从 Google Drive 下载并排版文章...</p>
              <p className="text-xs text-gray-400 mt-1">稍候片刻，正在净化杂质与生成大纲目录</p>
            </div>
          ) : articleError ? (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
              <h3 className="text-base font-semibold text-gray-800">读取文章失败</h3>
              <p className="mt-1 max-w-sm text-xs text-red-600">{articleError}</p>
              <button
                onClick={() => {
                  if (article) {
                    handleSelectDriveFile({ id: article.id, name: article.title, mimeType: 'text/html' });
                  }
                }}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700"
              >
                重新加载
              </button>
            </div>
          ) : article ? (
            <ReaderContainer
              article={article}
              settings={settings}
              searchQuery={searchQuery}
              onSearchMatchCount={setSearchMatchCount}
              onActiveHeadingChange={setActiveHeadingId}
              onScrollDirectionChange={handleScrollDirection}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-gray-400">
              <BookOpen className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm">尚未选择文章</p>
              <p className="text-xs text-gray-400 mt-1">请从左侧文件浏览器中打开任意 HTML 文件</p>
            </div>
          )}
        </main>

        {/* Right: Table of Contents (TOC) Sidebar */}
        {article && settings.mode === 'clean' && isTOCOpen && (
          <TOCSidebar
            isOpen={isTOCOpen}
            onClose={() => setIsTOCOpen(false)}
            toc={article.toc}
            activeId={activeHeadingId}
            onItemClick={handleScrollToHeading}
          />
        )}
      </div>

      {/* Mobile Floating Bottom Bar (for clean mode) */}
      {article && settings.mode === 'clean' && (
        <MobileBottomBar
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onToggleTOC={() => setIsTOCOpen(!isTOCOpen)}
          mode={settings.mode}
          onChangeMode={(m) => handleUpdateSettings({ mode: m })}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMatchCount={searchMatchCount}
          isVisible={isMobileBottomBarVisible}
        />
      )}

      {/* Settings Dialog */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={() => {
          setIsAuthenticated(googleDriveService.isAuthenticated());
          setUser(googleDriveService.getUserProfile());
        }}
      />
    </div>
  );
};
export default App;
