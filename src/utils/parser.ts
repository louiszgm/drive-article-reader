import DOMPurify from 'dompurify';
import { Readability } from '@mozilla/readability';
import { ArticleData, TOCItem } from '../types';

/**
 * Calculate estimated reading time in minutes
 */
export const calculateReadingTime = (text: string): number => {
  if (!text) return 1;
  // Count Chinese characters and English words
  const cjkCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const nonCjkWords = text.replace(/[\u4e00-\u9fa5]/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const totalWords = cjkCount + nonCjkWords;
  const wordsPerMinute = 300;
  return Math.max(1, Math.ceil(totalWords / wordsPerMinute));
};

/**
 * Sanitize raw HTML for secure display
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target'],
    USE_PROFILES: { html: true },
  });
};

/**
 * Extract Table of Contents (TOC) from an element and ensure headings have unique IDs
 */
export const extractTOC = (container: HTMLElement): TOCItem[] => {
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const toc: TOCItem[] = [];

  headings.forEach((heading, index) => {
    let id = heading.id;
    if (!id) {
      const cleanText = heading.textContent?.trim().slice(0, 30).replace(/[^\w\u4e00-\u9fa5]/g, '-') || 'section';
      id = `heading-${index}-${cleanText}`;
      heading.id = id;
    }

    const level = parseInt(heading.tagName.substring(1), 10);
    const text = heading.textContent?.trim() || `第 ${index + 1} 节`;

    toc.push({
      id,
      text,
      level,
    });
  });

  return toc;
};

/**
 * Parse an HTML document string into ArticleData
 */
export const parseHtmlArticle = (
  rawHtml: string,
  fileName: string,
  fileId: string,
  source: 'drive' | 'demo' = 'drive'
): ArticleData => {
  // First, parse into a DOM document
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Document title fallback
  const fallbackTitle =
    doc.querySelector('title')?.textContent?.trim() ||
    doc.querySelector('h1')?.textContent?.trim() ||
    fileName.replace(/\.html?$/i, '');

  let title = fallbackTitle;
  let cleanContent = '';
  let textContent = '';
  let byline: string | undefined;
  let excerpt: string | undefined;
  let siteName: string | undefined;

  try {
    // Clone doc for Readability since it mutates DOM
    const cloneDoc = doc.cloneNode(true) as Document;
    const reader = new Readability(cloneDoc, {
      charThreshold: 20,
      classesToPreserve: ['table', 'pre', 'code', 'highlight'],
    });
    const parsed = reader.parse();

    if (parsed && parsed.content) {
      title = parsed.title || fallbackTitle;
      cleanContent = parsed.content;
      textContent = parsed.textContent || '';
      byline = parsed.byline || undefined;
      excerpt = parsed.excerpt || undefined;
      siteName = parsed.siteName || undefined;
    } else {
      // Fallback if Readability fails
      cleanContent = doc.body.innerHTML;
      textContent = doc.body.textContent || '';
    }
  } catch (err) {
    console.warn('Readability extraction failed, falling back to body content:', err);
    cleanContent = doc.body.innerHTML;
    textContent = doc.body.textContent || '';
  }

  // Sanitize cleanContent
  const sanitizedClean = sanitizeHtml(cleanContent);

  // Extract TOC and ensure IDs are inserted into cleanContent
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizedClean;
  const toc = extractTOC(tempDiv);
  const finalCleanContent = tempDiv.innerHTML;

  return {
    id: fileId,
    title,
    rawHtml,
    cleanContent: finalCleanContent,
    textContent,
    byline,
    excerpt,
    siteName,
    toc,
    readingTimeMinutes: calculateReadingTime(textContent),
    source,
  };
};

/**
 * Highlights matches of query within container's text nodes safely
 */
export const highlightKeywords = (element: HTMLElement, query: string): number => {
  if (!query || !query.trim()) {
    // Remove existing highlights
    const marks = element.querySelectorAll('mark.search-highlight');
    marks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });
    return 0;
  }

  const cleanQuery = query.trim();
  const regex = new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');

  let matchCount = 0;

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue;
      if (val && regex.test(val)) {
        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        val.replace(regex, (match, _p1, offset) => {
          // Add text before match
          frag.appendChild(document.createTextNode(val.slice(lastIdx, offset)));
          // Add highlighted element
          const mark = document.createElement('mark');
          mark.className = 'search-highlight';
          mark.textContent = match;
          frag.appendChild(mark);
          matchCount++;
          lastIdx = offset + match.length;
          return match;
        });
        frag.appendChild(document.createTextNode(val.slice(lastIdx)));
        node.parentNode?.replaceChild(frag, node);
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT', 'STYLE', 'MARK'].includes((node as Element).tagName)
    ) {
      Array.from(node.childNodes).forEach(walk);
    }
  };

  walk(element);
  return matchCount;
};
