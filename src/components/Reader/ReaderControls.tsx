import React, { useState } from 'react';
import {
  Type,
  Sun,
  Moon,
  Coffee,
  Leaf,
  Sliders,
  Search,
  X,
  AlignLeft,
  Columns,
  ListTree,
  Sparkles,
  FileCode,
} from 'lucide-react';
import { ReaderFont, ReaderMode, ReaderSettings, ReaderTheme } from '../../types';

interface ReaderControlsProps {
  settings: ReaderSettings;
  onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
  onToggleTOC: () => void;
  isTOCOpen: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchMatchCount: number;
}

export const ReaderControls: React.FC<ReaderControlsProps> = ({
  settings,
  onUpdateSettings,
  onToggleTOC,
  isTOCOpen,
  searchQuery,
  onSearchChange,
  searchMatchCount,
}) => {
  const [showTypographyMenu, setShowTypographyMenu] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const themes: { id: ReaderTheme; label: string; icon: any; bgClass: string; textClass: string }[] = [
    { id: 'light', label: '浅色', icon: Sun, bgClass: 'bg-white border-gray-300', textClass: 'text-gray-800' },
    { id: 'sepia', label: '羊皮纸', icon: Coffee, bgClass: 'bg-[#f6f0e2] border-[#e2d5bd]', textClass: 'text-[#5c4125]' },
    { id: 'eyegreen', label: '护眼绿', icon: Leaf, bgClass: 'bg-[#eaf1e7] border-[#c9dec5]', textClass: 'text-[#203e22]' },
    { id: 'dark', label: '暗黑', icon: Moon, bgClass: 'bg-[#1e1e1e] border-gray-700', textClass: 'text-gray-200' },
    { id: 'midnight', label: '午夜蓝', icon: Moon, bgClass: 'bg-[#0f172a] border-slate-700', textClass: 'text-slate-200' },
  ];

  const fonts: { id: ReaderFont; label: string }[] = [
    { id: 'serif', label: '衬线 (典雅)' },
    { id: 'sans', label: '无衬线 (现代)' },
    { id: 'kai', label: '楷体 (书法)' },
    { id: 'mono', label: '等宽 (代码)' },
  ];

  return (
    <div className="hidden lg:flex items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 py-2 text-xs backdrop-blur-md transition-all">
      {/* Left: Quick search & TOC button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTOC}
          className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-medium transition-colors ${
            isTOCOpen
              ? 'border-blue-300 bg-blue-50 text-blue-600'
              : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          title="展开/折叠大纲"
        >
          <ListTree className="h-3.5 w-3.5" />
          <span>大纲目录</span>
        </button>

        {/* In-page Search */}
        {showSearchInput ? (
          <div className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/50 px-2 py-1">
            <Search className="h-3.5 w-3.5 text-blue-500" />
            <input
              type="text"
              placeholder="搜索正文..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-36 bg-transparent text-xs outline-hidden"
            />
            {searchQuery && (
              <span className="rounded bg-blue-200/60 px-1 py-0.2 text-[10px] text-blue-800 font-mono">
                {searchMatchCount} 处
              </span>
            )}
            <button
              onClick={() => {
                onSearchChange('');
                setShowSearchInput(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSearchInput(true)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
            title="搜索文章文字"
          >
            <Search className="h-3.5 w-3.5" />
            <span>搜正文</span>
          </button>
        )}
      </div>

      {/* Right: Typography, Theme, Width Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Pills */}
        <div className="flex items-center gap-1">
          {themes.map((t) => {
            const isSelected = settings.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onUpdateSettings({ theme: t.id })}
                className={`flex h-6 items-center gap-1 rounded-full border px-2 text-[11px] font-medium transition-all ${
                  t.bgClass
                } ${t.textClass} ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-1 font-bold shadow-xs'
                    : 'opacity-80 hover:opacity-100'
                }`}
                title={`切换为${t.label}主题`}
              >
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="h-4 w-px bg-gray-200" />

        {/* Font Size A- / A+ */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
          <button
            onClick={() => onUpdateSettings({ fontSize: Math.max(14, settings.fontSize - 1) })}
            className="flex h-6 w-6 items-center justify-center rounded-md font-bold text-gray-600 hover:bg-gray-100"
            title="缩小字号"
          >
            A-
          </button>
          <span className="w-7 text-center font-mono text-[11px] text-gray-700">
            {settings.fontSize}
          </span>
          <button
            onClick={() => onUpdateSettings({ fontSize: Math.min(26, settings.fontSize + 1) })}
            className="flex h-6 w-6 items-center justify-center rounded-md font-bold text-gray-600 hover:bg-gray-100"
            title="放大字号"
          >
            A+
          </button>
        </div>

        {/* Typography Settings Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTypographyMenu(!showTypographyMenu)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1.5 transition-colors ${
              showTypographyMenu
                ? 'border-blue-400 bg-blue-50 text-blue-600'
                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
            }`}
            title="排版与字体设置"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>排版</span>
          </button>

          {showTypographyMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="mb-3">
                <label className="mb-1.5 block text-[11px] font-semibold text-gray-500 uppercase">
                  字体族
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {fonts.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => onUpdateSettings({ fontFamily: f.id })}
                      className={`rounded-md border p-1.5 text-left text-xs transition-colors ${
                        settings.fontFamily === f.id
                          ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="mb-1.5 block text-[11px] font-semibold text-gray-500 uppercase">
                  行距 ({settings.lineHeight})
                </label>
                <div className="flex gap-1.5">
                  {[1.6, 1.8, 2.0].map((lh) => (
                    <button
                      key={lh}
                      onClick={() => onUpdateSettings({ lineHeight: lh })}
                      className={`flex-1 rounded-md border py-1 text-center text-xs ${
                        settings.lineHeight === lh
                          ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {lh}倍
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-gray-500 uppercase">
                  页面宽度 ({settings.maxWidth}px)
                </label>
                <div className="flex gap-1.5">
                  {[680, 780, 920].map((w) => (
                    <button
                      key={w}
                      onClick={() => onUpdateSettings({ maxWidth: w })}
                      className={`flex-1 rounded-md border py-1 text-center text-xs ${
                        settings.maxWidth === w
                          ? 'border-blue-500 bg-blue-50 font-semibold text-blue-700'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {w === 680 ? '窄' : w === 780 ? '中' : '宽'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
