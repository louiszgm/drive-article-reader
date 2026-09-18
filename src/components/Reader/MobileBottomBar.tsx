import React, { useState } from 'react';
import {
  ListTree,
  Type,
  Sun,
  Moon,
  Coffee,
  Leaf,
  Sparkles,
  FileCode,
  Search,
  X,
  Sliders,
} from 'lucide-react';
import { ReaderFont, ReaderMode, ReaderSettings, ReaderTheme } from '../../types';

interface MobileBottomBarProps {
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  onToggleTOC: () => void;
  mode: ReaderMode;
  onChangeMode: (m: ReaderMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchMatchCount: number;
  isVisible: boolean;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  settings,
  onUpdateSettings,
  onToggleTOC,
  mode,
  onChangeMode,
  searchQuery,
  onSearchChange,
  searchMatchCount,
  isVisible,
}) => {
  const [showTypographySheet, setShowTypographySheet] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const themes: { id: ReaderTheme; label: string; bgClass: string; textClass: string }[] = [
    { id: 'light', label: '浅色', bgClass: 'bg-white border-gray-300', textClass: 'text-gray-800' },
    { id: 'sepia', label: '羊皮', bgClass: 'bg-[#f6f0e2] border-[#e2d5bd]', textClass: 'text-[#5c4125]' },
    { id: 'eyegreen', label: '护眼', bgClass: 'bg-[#eaf1e7] border-[#c9dec5]', textClass: 'text-[#203e22]' },
    { id: 'dark', label: '暗黑', bgClass: 'bg-[#1e1e1e] border-gray-700', textClass: 'text-gray-200' },
    { id: 'midnight', label: '午夜', bgClass: 'bg-[#0f172a] border-slate-700', textClass: 'text-slate-200' },
  ];

  const fonts: { id: ReaderFont; label: string }[] = [
    { id: 'serif', label: '衬线' },
    { id: 'sans', label: '无衬线' },
    { id: 'kai', label: '楷体' },
    { id: 'mono', label: '等宽' },
  ];

  return (
    <>
      {/* Mobile Search Input Overlay */}
      {showMobileSearch && (
        <div className="fixed top-14 left-0 right-0 z-30 border-b border-gray-200 bg-white p-2.5 shadow-md lg:hidden">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文章内关键词..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs outline-hidden focus:border-blue-500"
              />
            </div>
            {searchQuery && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-mono text-blue-700">
                {searchMatchCount}处
              </span>
            )}
            <button
              onClick={() => {
                onSearchChange('');
                setShowMobileSearch(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Bar */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-gray-200/80 bg-white/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-300 lg:hidden shadow-lg ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* TOC Button */}
        <button
          onClick={onToggleTOC}
          className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600"
        >
          <ListTree className="h-4 w-4" />
          <span className="text-[10px]">目录</span>
        </button>

        {/* Search Button */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className={`flex flex-col items-center gap-0.5 ${
            showMobileSearch ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <Search className="h-4 w-4" />
          <span className="text-[10px]">搜索</span>
        </button>

        {/* Typography & Settings ActionSheet trigger */}
        <button
          onClick={() => setShowTypographySheet(true)}
          className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600"
        >
          <Sliders className="h-4 w-4" />
          <span className="text-[10px]">排版</span>
        </button>

        {/* Mode Switcher */}
        <button
          onClick={() => onChangeMode(mode === 'clean' ? 'raw' : 'clean')}
          className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600"
        >
          {mode === 'clean' ? (
            <>
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span className="text-[10px]">纯净</span>
            </>
          ) : (
            <>
              <FileCode className="h-4 w-4 text-blue-500" />
              <span className="text-[10px]">原网页</span>
            </>
          )}
        </button>
      </nav>

      {/* Typography ActionSheet Bottom Drawer */}
      {showTypographySheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden animate-in fade-in">
          {/* Backdrop */}
          <div
            onClick={() => setShowTypographySheet(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Sheet Body */}
          <div className="relative z-10 rounded-t-2xl border-t border-gray-200 bg-white p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-700">阅读偏好与排版设置</span>
              <button
                onClick={() => setShowTypographySheet(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Theme Colors */}
            <div className="mt-3">
              <span className="mb-2 block text-[11px] font-semibold text-gray-500 uppercase">
                阅读主题
              </span>
              <div className="grid grid-cols-5 gap-2">
                {themes.map((t) => {
                  const isSelected = settings.theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ theme: t.id })}
                      className={`flex flex-col items-center justify-center rounded-xl border py-2 text-xs font-medium transition-all ${
                        t.bgClass
                      } ${t.textClass} ${
                        isSelected
                          ? 'ring-2 ring-blue-500 ring-offset-2 font-bold shadow-xs'
                          : 'opacity-85'
                      }`}
                    >
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font Size */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase">
                  字号调整
                </span>
                <span className="font-mono text-xs text-gray-600">{settings.fontSize} px</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdateSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 font-bold text-gray-700 active:bg-gray-200"
                >
                  A- 缩小
                </button>
                <button
                  onClick={() => onUpdateSettings({ fontSize: Math.min(28, settings.fontSize + 1) })}
                  className="flex h-10 flex-1 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 font-bold text-gray-700 active:bg-gray-200"
                >
                  A+ 放大
                </button>
              </div>
            </div>

            {/* Font Family */}
            <div className="mt-4">
              <span className="mb-2 block text-[11px] font-semibold text-gray-500 uppercase">
                排版字体
              </span>
              <div className="grid grid-cols-4 gap-2">
                {fonts.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => onUpdateSettings({ fontFamily: f.id })}
                    className={`rounded-lg border py-2 text-xs text-center font-medium ${
                      settings.fontFamily === f.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="mt-4">
              <span className="mb-2 block text-[11px] font-semibold text-gray-500 uppercase">
                段落行间距
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[1.6, 1.8, 2.0].map((lh) => (
                  <button
                    key={lh}
                    onClick={() => onUpdateSettings({ lineHeight: lh })}
                    className={`rounded-lg border py-2 text-xs text-center font-medium ${
                      settings.lineHeight === lh
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                        : 'border-gray-200 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {lh} 倍行距
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
