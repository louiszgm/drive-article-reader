import React from 'react';
import { ListTree, X, ChevronRight, Hash } from 'lucide-react';
import { TOCItem } from '../../types';

interface TOCSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  toc: TOCItem[];
  activeId: string | null;
  onItemClick: (id: string) => void;
}

export const TOCSidebar: React.FC<TOCSidebarProps> = ({
  isOpen,
  onClose,
  toc,
  activeId,
  onItemClick,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Container: Drawer on mobile, sidebar on large screens */}
      <aside
        className={`fixed top-14 bottom-0 right-0 z-40 flex w-80 max-w-[85vw] flex-col border-l border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl lg:shadow-none' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-between border-b border-gray-100 px-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <ListTree className="h-4 w-4 text-blue-600" />
            <span>文章大纲 ({toc.length})</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Close Outline"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {toc.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center text-xs text-gray-400">
              <Hash className="mb-2 h-6 w-6 text-gray-300" />
              <span>未检测到章节大纲</span>
              <span className="mt-1 text-[11px] text-gray-400">文章中未包含标题标签</span>
            </div>
          ) : (
            <nav className="space-y-1">
              {toc.map((item) => {
                const isActive = activeId === item.id;
                // Indent based on heading level
                const paddingLeft = `${Math.max(0, (item.level - 1) * 12 + 6)}px`;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onItemClick(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    style={{ paddingLeft }}
                    className={`group flex w-full items-center gap-1.5 rounded-lg py-1.5 pr-2 text-left text-xs transition-colors ${
                      isActive
                        ? 'bg-blue-50 font-medium text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-blue-600'
                          : 'bg-gray-300 group-hover:bg-gray-400'
                      }`}
                    />
                    <span className="truncate flex-1">{item.text}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      </aside>
    </>
  );
};
