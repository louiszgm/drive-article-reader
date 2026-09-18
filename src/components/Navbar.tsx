import React, { useState } from 'react';
import {
  Menu,
  BookOpen,
  Settings,
  LogIn,
  LogOut,
  Maximize2,
  Minimize2,
  FolderOpen,
  Clock,
  Sparkles,
  FileCode,
  Layers,
} from 'lucide-react';
import { googleDriveService, UserProfile } from '../services/googleDrive';
import { ArticleData, ReaderMode } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onOpenSettings: () => void;
  article: ArticleData | null;
  mode: ReaderMode;
  onChangeMode: (mode: ReaderMode) => void;
  user: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenSettings,
  article,
  mode,
  onChangeMode,
  user,
  onLoginSuccess,
  onLogout,
}) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      await googleDriveService.login();
      const profile = googleDriveService.getUserProfile();
      if (profile) {
        onLoginSuccess(profile);
      }
    } catch (err: any) {
      alert(err.message || 'Google 登录失败');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white/95 px-3 sm:px-5 backdrop-blur-md transition-all">
      {/* Left: Brand & Sidebar toggle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
            isSidebarOpen
              ? 'border-blue-200 bg-blue-50 text-blue-600'
              : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
          title={isSidebarOpen ? '收起文件列表' : '展开文件列表'}
          aria-label="Toggle File List"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5 select-none cursor-pointer">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
            <BookOpen className="h-4 w-4" />
          </div>
          <span className="hidden text-base font-bold tracking-tight text-gray-900 sm:inline-block">
            Drive Reader
          </span>
        </div>
      </div>

      {/* Center: Article Title / Info */}
      <div className="flex flex-1 items-center justify-center px-2 min-w-0 mx-2">
        {article ? (
          <div className="flex items-center gap-2 text-center truncate max-w-full">
            <span className="truncate text-xs sm:text-sm font-medium text-gray-800">
              {article.title}
            </span>
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-normal text-blue-600 shrink-0">
              <Clock className="h-3 w-3" />
              约 {article.readingTimeMinutes} 分钟
            </span>
          </div>
        ) : (
          <span className="text-xs sm:text-sm text-gray-400 truncate">
            请从左侧选择文章或打开 Google Drive 文件
          </span>
        )}
      </div>

      {/* Right: Actions, Settings, User */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          title={isFullscreen ? '退出全屏' : '全屏沉浸阅读'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
          title="Google API 与凭据设置"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* Google User Authentication */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 p-0.5 hover:ring-2 hover:ring-blue-400 transition-all"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <div className="border-b border-gray-100 px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 mt-1"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isLoggingIn ? '登录中...' : '连接 Drive'}</span>
            <span className="sm:hidden">{isLoggingIn ? '...' : '登录'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
