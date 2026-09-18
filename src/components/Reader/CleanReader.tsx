import React, { useEffect, useRef } from 'react';
import { Clock, User, Globe, CheckCircle2 } from 'lucide-react';
import { ArticleData, ReaderSettings } from '../../types';
import { highlightKeywords } from '../../utils/parser';

interface CleanReaderProps {
  article: ArticleData;
  settings: ReaderSettings;
  searchQuery: string;
  onSearchMatchCount: (count: number) => void;
}

export const CleanReader: React.FC<CleanReaderProps> = ({
  article,
  settings,
  searchQuery,
  onSearchMatchCount,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Apply search query highlighting safely
  useEffect(() => {
    if (contentRef.current) {
      const count = highlightKeywords(contentRef.current, searchQuery);
      onSearchMatchCount(count);

      // If we have matches, scroll smoothly to the first match
      if (count > 0 && searchQuery) {
        const firstMark = contentRef.current.querySelector('mark.search-highlight');
        if (firstMark) {
          firstMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [searchQuery, article.cleanContent]);

  // Font family mapping
  const fontClass =
    settings.fontFamily === 'serif'
      ? 'font-serif'
      : settings.fontFamily === 'kai'
      ? 'font-kai'
      : settings.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  return (
    <div className={`w-full transition-colors duration-300 theme-${settings.theme}`}>
      <div
        className="mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 pb-safe-nav"
        style={{
          maxWidth: `${settings.maxWidth}px`,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
        }}
      >
        {/* Article Header */}
        <header className="mb-8 border-b border-current/15 pb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            {article.title}
          </h1>

          {/* Metadata: Author, Reading Time, Site */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs opacity-75">
            {article.byline && (
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{article.byline}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>约 {article.readingTimeMinutes} 分钟阅读</span>
            </span>
            {article.siteName && (
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                <span>{article.siteName}</span>
              </span>
            )}
            <span className="rounded-full bg-current/10 px-2 py-0.5 text-[11px]">
              {article.source === 'drive' ? 'Google Drive' : '示例文章'}
            </span>
          </div>

          {/* Excerpt if present */}
          {article.excerpt && (
            <div className="mt-4 rounded-lg bg-current/5 p-3 text-xs sm:text-sm italic opacity-85 border-l-2 border-current/30">
              {article.excerpt}
            </div>
          )}
        </header>

        {/* Clean Article Content */}
        <main
          ref={contentRef}
          className={`reader-content ${fontClass}`}
          dangerouslySetInnerHTML={{ __html: article.cleanContent }}
        />

        {/* End of article notice */}
        <footer className="mt-16 border-t border-current/15 pt-8 text-center opacity-60">
          <div className="inline-flex items-center gap-1.5 text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span>你已读完本篇内容</span>
          </div>
          <p className="mt-1 text-[11px]">Drive Article Reader · 纯净专注阅读</p>
        </footer>
      </div>
    </div>
  );
};
