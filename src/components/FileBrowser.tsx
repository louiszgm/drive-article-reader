import React, { useState, useEffect, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Search,
  RefreshCw,
  Clock,
  ExternalLink,
  ChevronRight,
  HardDrive,
  BookMarked,
  X,
  AlertCircle,
  FolderTree,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DriveFile, DriveFolderBreadcrumb, ReadingProgress } from '../types';
import { googleDriveService } from '../services/googleDrive';
import { getStoredReadingHistory } from '../services/storage';
import { DEMO_ARTICLES, DemoArticle } from '../utils/demoData';

interface FileBrowserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDriveFile: (file: DriveFile) => void;
  onSelectDemoArticle: (demo: DemoArticle) => void;
  currentArticleId?: string;
  isAuthenticated: boolean;
  onPromptLogin: () => void;
}

type TargetDirectoryFilter = 'all' | 'chatgptOs' | 'sparkOs' | 'explorer';

export const FileBrowser: React.FC<FileBrowserProps> = ({
  isOpen,
  onClose,
  onSelectDriveFile,
  onSelectDemoArticle,
  currentArticleId,
  isAuthenticated,
  onPromptLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'demo' | 'history'>(
    isAuthenticated ? 'drive' : 'demo'
  );

  // Target folders state (chatgptOs & SparkOs/articles)
  const [targetFilter, setTargetFilter] = useState<TargetDirectoryFilter>('all');
  const [chatgptOsFiles, setChatgptOsFiles] = useState<DriveFile[]>([]);
  const [sparkOsFiles, setSparkOsFiles] = useState<DriveFile[]>([]);
  const [chatgptOsFolder, setChatgptOsFolder] = useState<DriveFile | null>(null);
  const [sparkOsFolder, setSparkOsFolder] = useState<DriveFile | null>(null);
  const [isLoadingTargets, setIsLoadingTargets] = useState(false);
  const [targetError, setTargetError] = useState<string | null>(null);

  // General explorer state (for 'explorer' mode)
  const [explorerFiles, setExplorerFiles] = useState<DriveFile[]>([]);
  const [isLoadingExplorer, setIsLoadingExplorer] = useState(false);
  const [explorerError, setExplorerError] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<DriveFolderBreadcrumb[]>([
    { id: 'root', name: '我的云端硬盘' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [historyList, setHistoryList] = useState<ReadingProgress[]>([]);

  // Update history list whenever history tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      setHistoryList(getStoredReadingHistory());
    }
  }, [activeTab]);

  // When authentication changes, auto-switch tab
  useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('drive');
    }
  }, [isAuthenticated]);

  // Load target directory articles when authenticated and on drive tab
  const loadTargetArticles = async () => {
    try {
      setIsLoadingTargets(true);
      setTargetError(null);
      const res = await googleDriveService.fetchTargetDirectoriesArticles();
      setChatgptOsFolder(res.chatgptOsFolder);
      setSparkOsFolder(res.sparkOsArticlesFolder);
      setChatgptOsFiles(res.chatgptOsFiles);
      setSparkOsFiles(res.sparkOsFiles);
    } catch (err: any) {
      console.error('Failed to load target directories:', err);
      setTargetError(err.message || '加载专属目录文章失败');
    } finally {
      setIsLoadingTargets(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'drive') {
      loadTargetArticles();
    }
  }, [isAuthenticated, activeTab]);

  // Explorer folder drill-down loader
  const loadExplorerFiles = async (folderId: string, query: string) => {
    try {
      setIsLoadingExplorer(true);
      setExplorerError(null);
      const files = await googleDriveService.listFiles(folderId, query);
      setExplorerFiles(files);
    } catch (err: any) {
      console.error('Failed to load explorer files:', err);
      setExplorerError(err.message || '加载云盘文件失败');
    } finally {
      setIsLoadingExplorer(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'drive' && targetFilter === 'explorer') {
      const currentFolder = breadcrumbs[breadcrumbs.length - 1];
      loadExplorerFiles(currentFolder.id, searchQuery);
    }
  }, [isAuthenticated, activeTab, targetFilter, breadcrumbs, searchQuery]);

  const handleFolderClick = (folder: DriveFile) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchQuery('');
  };

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSearchQuery('');
  };

  const handleOpenPicker = () => {
    try {
      googleDriveService.openGooglePicker(async (fileId, fileName) => {
        onSelectDriveFile({
          id: fileId,
          name: fileName,
          mimeType: 'text/html',
        });
        onClose();
      });
    } catch (err: any) {
      alert(err.message || '打开 Google Picker 失败');
    }
  };

  // Filter articles based on user search query
  const filteredChatgptFiles = useMemo(() => {
    if (!searchQuery.trim()) return chatgptOsFiles;
    const q = searchQuery.toLowerCase();
    return chatgptOsFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [chatgptOsFiles, searchQuery]);

  const filteredSparkFiles = useMemo(() => {
    if (!searchQuery.trim()) return sparkOsFiles;
    const q = searchQuery.toLowerCase();
    return sparkOsFiles.filter((f) => f.name.toLowerCase().includes(q));
  }, [sparkOsFiles, searchQuery]);

  const totalTargetCount = chatgptOsFiles.length + sparkOsFiles.length;

  const renderFileItem = (file: DriveFile) => {
    const isSelected = file.id === currentArticleId;
    return (
      <button
        key={file.id}
        onClick={() => {
          onSelectDriveFile(file);
          if (window.innerWidth < 1024) onClose();
        }}
        className={`group flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-all ${
          isSelected
            ? 'bg-blue-50 border border-blue-200/80 text-blue-900 font-semibold shadow-xs'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
        }`}
      >
        <FileText
          className={`h-4 w-4 mt-0.5 shrink-0 ${
            isSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
          }`}
        />
        <div className="flex-1 min-w-0">
          <p className="truncate leading-snug">{file.name}</p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400 font-normal">
            {file.size && <span>{file.size}</span>}
            {file.modifiedTime && (
              <span>
                {new Date(file.modifiedTime).toLocaleDateString('zh-CN', {
                  month: 'numeric',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar / Drawer Container */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 flex w-80 max-w-[85vw] flex-col border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:w-72 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* Header & Main Tabs */}
        <div className="border-b border-gray-200 bg-gray-50/70 p-3">
          <div className="flex items-center justify-between pb-2">
            <h2 className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
              文章资源库
            </h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-200 hover:text-gray-700 lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-gray-200/80 p-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('drive')}
              className={`flex items-center justify-center gap-1 rounded-md py-1.5 transition-all ${
                activeTab === 'drive'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <HardDrive className="h-3.5 w-3.5" />
              <span>Drive</span>
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center justify-center gap-1 rounded-md py-1.5 transition-all ${
                activeTab === 'demo'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>演示</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center justify-center gap-1 rounded-md py-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>历史</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Google Drive Targeted & Explorer */}
        {activeTab === 'drive' && (
          <div className="flex flex-1 flex-col overflow-hidden">
            {!isAuthenticated ? (
              <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-600">
                  <HardDrive className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">尚未连接 Google Drive</h3>
                <p className="mt-1 text-xs text-gray-500">
                  连接后可直接读取 chatgptOs 与 SparkOs/articles 中的文章
                </p>
                <button
                  onClick={onPromptLogin}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700"
                >
                  立即连接 Google Drive
                </button>
              </div>
            ) : (
              <>
                {/* Search Bar & Refresh */}
                <div className="p-3 pb-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索文章名称..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-7 text-xs outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <button
                      onClick={() => {
                        if (targetFilter === 'explorer') {
                          loadExplorerFiles(breadcrumbs[breadcrumbs.length - 1].id, searchQuery);
                        } else {
                          loadTargetArticles();
                        }
                      }}
                      disabled={isLoadingTargets || isLoadingExplorer}
                      className="flex items-center gap-1 rounded-md px-1.5 py-1 hover:bg-gray-100 disabled:opacity-50"
                      title="重新扫描并获取最新文章"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${isLoadingTargets || isLoadingExplorer ? 'animate-spin text-blue-600' : ''}`}
                      />
                      <span>刷新</span>
                    </button>

                    <button
                      onClick={handleOpenPicker}
                      className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
                      title="打开 Google 官方文件选择器"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>云端选择器</span>
                    </button>
                  </div>

                  {/* Dedicated Directory Segmented Pills */}
                  <div className="mt-2 flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                    <button
                      onClick={() => setTargetFilter('all')}
                      className={`shrink-0 rounded-full px-2.5 py-1 transition-all ${
                        targetFilter === 'all'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      全部 ({totalTargetCount})
                    </button>
                    <button
                      onClick={() => setTargetFilter('chatgptOs')}
                      className={`shrink-0 rounded-full px-2.5 py-1 transition-all ${
                        targetFilter === 'chatgptOs'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      chatgptOs ({chatgptOsFiles.length})
                    </button>
                    <button
                      onClick={() => setTargetFilter('sparkOs')}
                      className={`shrink-0 rounded-full px-2.5 py-1 transition-all ${
                        targetFilter === 'sparkOs'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      SparkOs/articles ({sparkOsFiles.length})
                    </button>
                    <button
                      onClick={() => setTargetFilter('explorer')}
                      className={`shrink-0 rounded-full px-2 py-1 transition-all ${
                        targetFilter === 'explorer'
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="浏览任意云端硬盘文件夹"
                    >
                      云盘目录树
                    </button>
                  </div>
                </div>

                {/* Explorer Breadcrumbs (only active in explorer mode) */}
                {targetFilter === 'explorer' && !searchQuery && breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-1 overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-3 py-1.5 text-xs text-gray-600">
                    {breadcrumbs.map((crumb, idx) => (
                      <React.Fragment key={crumb.id}>
                        {idx > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-gray-400" />}
                        <button
                          onClick={() => handleBreadcrumbClick(idx)}
                          className={`truncate hover:underline shrink-0 max-w-[100px] ${
                            idx === breadcrumbs.length - 1
                              ? 'font-bold text-gray-900'
                              : 'text-gray-500'
                          }`}
                        >
                          {crumb.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Article Lists Container */}
                <div className="flex-1 overflow-y-auto p-2">
                  {targetFilter !== 'explorer' ? (
                    // Target Directory View
                    isLoadingTargets ? (
                      <div className="flex h-40 flex-col items-center justify-center text-xs text-gray-400">
                        <RefreshCw className="mb-2 h-5 w-5 animate-spin text-blue-600" />
                        <span>正在检索 chatgptOs 与 SparkOs/articles...</span>
                      </div>
                    ) : targetError ? (
                      <div className="p-4 text-center">
                        <AlertCircle className="mx-auto h-6 w-6 text-amber-500" />
                        <p className="mt-2 text-xs text-red-600">{targetError}</p>
                        <button
                          onClick={loadTargetArticles}
                          className="mt-3 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          重试扫描
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Section 1: chatgptOs */}
                        {(targetFilter === 'all' || targetFilter === 'chatgptOs') && (
                          <div>
                            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1.5">
                                <Folder className="h-3.5 w-3.5 text-amber-500" />
                                <span>chatgptOs</span>
                              </div>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-mono">
                                {filteredChatgptFiles.length} 篇
                              </span>
                            </div>

                            {filteredChatgptFiles.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                                {!chatgptOsFolder
                                  ? '云盘中未找到名为 chatgptOs 的文件夹'
                                  : 'chatgptOs 目录下暂无 HTML 文章'}
                              </div>
                            ) : (
                              <div className="space-y-0.5 mt-1">
                                {filteredChatgptFiles.map(renderFileItem)}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Section 2: SparkOs / articles */}
                        {(targetFilter === 'all' || targetFilter === 'sparkOs') && (
                          <div>
                            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-700">
                              <div className="flex items-center gap-1.5">
                                <Folder className="h-3.5 w-3.5 text-indigo-500" />
                                <span>SparkOs / articles</span>
                              </div>
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 font-mono">
                                {filteredSparkFiles.length} 篇
                              </span>
                            </div>

                            {filteredSparkFiles.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                                {!sparkOsFolder
                                  ? '云盘中未找到 SparkOs/articles 文件夹'
                                  : 'SparkOs/articles 目录下暂无 HTML 文章'}
                              </div>
                            ) : (
                              <div className="space-y-0.5 mt-1">
                                {filteredSparkFiles.map(renderFileItem)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    // Traditional Explorer Drill-down View
                    isLoadingExplorer ? (
                      <div className="flex h-36 items-center justify-center text-xs text-gray-400">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin text-blue-600" />
                        加载云盘目录中...
                      </div>
                    ) : explorerError ? (
                      <div className="p-4 text-center">
                        <AlertCircle className="mx-auto h-6 w-6 text-amber-500" />
                        <p className="mt-2 text-xs text-red-600">{explorerError}</p>
                        <button
                          onClick={() =>
                            loadExplorerFiles(
                              breadcrumbs[breadcrumbs.length - 1].id,
                              searchQuery
                            )
                          }
                          className="mt-3 rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-200"
                        >
                          重试
                        </button>
                      </div>
                    ) : explorerFiles.length === 0 ? (
                      <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-gray-400">
                        <FileText className="mb-2 h-6 w-6 text-gray-300" />
                        <span>当前目录下未找到 HTML 文件</span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {explorerFiles.map((file) => {
                          if (file.isFolder) {
                            return (
                              <button
                                key={file.id}
                                onClick={() => handleFolderClick(file)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                                <span className="flex-1 truncate font-medium">{file.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                              </button>
                            );
                          }
                          return renderFileItem(file);
                        })}
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Demo Articles */}
        {activeTab === 'demo' && (
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            <div className="mb-2 rounded-lg bg-blue-50/80 p-2.5 text-[11px] text-blue-700">
              💡 演示文章可在未登录 Google 时随时阅读，体验阅读器功能。
            </div>
            <div className="space-y-1">
              {DEMO_ARTICLES.map((demo) => {
                const isSelected = demo.id === currentArticleId;
                return (
                  <button
                    key={demo.id}
                    onClick={() => {
                      onSelectDemoArticle(demo);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`flex w-full items-start gap-2.5 rounded-lg p-2.5 text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50 border border-blue-200 text-blue-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100 border border-transparent'
                    }`}
                  >
                    <BookMarked
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium leading-snug">{demo.name}</p>
                      <p className="mt-1 text-[11px] text-gray-400">{demo.size}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Reading History */}
        {activeTab === 'history' && (
          <div className="flex flex-1 flex-col overflow-y-auto p-3">
            {historyList.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-gray-400">
                <Clock className="mb-2 h-6 w-6 text-gray-300" />
                <span>暂无阅读记录</span>
                <span className="mt-1 text-[11px] text-gray-400">阅读的文章会自动保存进度</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {historyList.map((item) => {
                  const dateStr = new Date(item.lastReadAt).toLocaleDateString('zh-CN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <div
                      key={item.fileId}
                      className="rounded-lg border border-gray-100 bg-gray-50/60 p-2.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <p className="truncate font-medium">{item.title}</p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                        <span>进度: {item.percentage}%</span>
                        <span>{dateStr}</span>
                      </div>
                      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};
