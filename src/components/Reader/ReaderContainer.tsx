import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArticleData, ReaderSettings } from '../../types';
import { CleanReader } from './CleanReader';
import { RawReader } from './RawReader';
import { saveReadingProgress, getFileProgress } from '../../services/storage';

interface ReaderContainerProps {
  article: ArticleData;
  settings: ReaderSettings;
  searchQuery: string;
  onSearchMatchCount: (count: number) => void;
  onActiveHeadingChange: (id: string | null) => void;
  onScrollDirectionChange: (isScrollingDown: boolean) => void;
}

export const ReaderContainer: React.FC<ReaderContainerProps> = ({
  article,
  settings,
  searchQuery,
  onSearchMatchCount,
  onActiveHeadingChange,
  onScrollDirectionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const lastScrollTop = useRef(0);
  const isRestoringScroll = useRef(false);

  // Restore scroll position when article changes
  useEffect(() => {
    const saved = getFileProgress(article.id);
    const container = containerRef.current;
    if (container && saved && saved.scrollTop > 0) {
      isRestoringScroll.current = true;
      // Slight delay to allow DOM render
      const timer = setTimeout(() => {
        container.scrollTo({
          top: saved.scrollTop,
          behavior: 'auto',
        });
        setProgress(saved.percentage);
        isRestoringScroll.current = false;
      }, 100);
      return () => clearTimeout(timer);
    } else {
      if (container) {
        container.scrollTo({ top: 0, behavior: 'auto' });
      }
      setProgress(0);
    }
  }, [article.id]);

  // Handle scroll events: reading progress & active TOC tracking
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || isRestoringScroll.current) return;

    const currentScrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;

    // Detect scroll direction for mobile UI hiding
    if (Math.abs(currentScrollTop - lastScrollTop.current) > 20) {
      const isDown = currentScrollTop > lastScrollTop.current && currentScrollTop > 60;
      onScrollDirectionChange(isDown);
      lastScrollTop.current = currentScrollTop;
    }

    // Calculate percentage
    let pct = 0;
    if (scrollHeight > 0) {
      pct = Math.min(100, Math.max(0, (currentScrollTop / scrollHeight) * 100));
    }
    setProgress(Math.round(pct));

    // Save progress to local storage (debounced)
    saveReadingProgress(article.id, article.title, pct, currentScrollTop);

    // Track active TOC section (scrollspy)
    if (article.toc.length > 0) {
      const headingElements = article.toc
        .map((t) => document.getElementById(t.id))
        .filter(Boolean) as HTMLElement[];

      let currentActiveId: string | null = null;
      for (const heading of headingElements) {
        const rect = heading.getBoundingClientRect();
        // If heading is near the top of the viewport
        if (rect.top <= 120) {
          currentActiveId = heading.id;
        } else {
          break;
        }
      }
      onActiveHeadingChange(currentActiveId || (article.toc[0]?.id ?? null));
    }
  }, [article.id, article.title, article.toc, onActiveHeadingChange, onScrollDirectionChange]);

  return (
    <div className="relative flex flex-1 flex-col h-full w-full overflow-hidden">
      {/* Top Reading Progress Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-gray-200/50">
        <div
          className="h-full bg-blue-600 transition-all duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Scrollable Reader Area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
      >
        <RawReader article={article} />
      </div>
    </div>
  );
};
