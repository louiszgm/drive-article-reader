import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ExternalLink, ShieldCheck } from 'lucide-react';
import { ArticleData } from '../../types';

interface RawReaderProps {
  article: ArticleData;
}

export const RawReader: React.FC<RawReaderProps> = ({ article }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const iframe = iframeRef.current;
    if (!iframe) return;

    let processedHtml = article.rawHtml;

    // Inject mobile viewport meta if not already present
    if (!processedHtml.includes('name="viewport"') && !processedHtml.includes("name='viewport'")) {
      const metaViewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
      if (processedHtml.includes('<head>')) {
        processedHtml = processedHtml.replace('<head>', `<head>${metaViewport}`);
      } else {
        processedHtml = `${metaViewport}${processedHtml}`;
      }
    }

    // Use blob URL for clean sandbox isolation
    const blob = new Blob([processedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    const handleLoad = () => {
      setIsLoading(false);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      URL.revokeObjectURL(url);
    };
  }, [article.rawHtml, article.id]);

  const handleOpenNewWindow = () => {
    const blob = new Blob([article.rawHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleReload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      const blob = new Blob([article.rawHtml], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
    }
  };

  return (
    <div className="relative flex flex-1 flex-col h-full w-full bg-gray-50">
      {/* Top Banner indicating Raw Mode & Security */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white/95 px-3 py-1.5 text-xs text-gray-600 backdrop-blur-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="font-medium text-gray-700 truncate">原网页沙箱模式</span>
          <span className="text-[11px] text-gray-400 hidden md:inline truncate">
            (安全隔离渲染，保留完整样式与动效)
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReload}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            title="重新渲染当前页面"
          >
            <RefreshCw className="h-3 w-3" />
            <span className="hidden sm:inline">刷新</span>
          </button>
          <button
            onClick={handleOpenNewWindow}
            className="flex items-center gap-1 rounded-md px-2 py-0.5 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
            title="在新标签页中独立打开原网页"
          >
            <ExternalLink className="h-3 w-3" />
            <span>新窗口打开</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-xs">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="mt-2 text-xs text-gray-500">正在渲染原始网页...</span>
        </div>
      )}

      {/* Sandboxed iframe */}
      <div className="flex-1 w-full h-full overflow-hidden">
        <iframe
          ref={iframeRef}
          title={article.title}
          sandbox="allow-same-origin allow-scripts allow-forms"
          className="w-full h-full border-0 bg-white"
        />
      </div>
    </div>
  );
};
