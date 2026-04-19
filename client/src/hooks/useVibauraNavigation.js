import { useState, useEffect, useCallback } from 'react';
import { findItemById } from '../utils/navigation';

const HISTORY_KEY = 'vibaura_history';
const INDEX_KEY = 'vibaura_history_index';

export const useVibauraNavigation = () => {
  // 1. Initialize State from URL and SessionStorage
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
  });

  const [history, setHistory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';
    const saved = sessionStorage.getItem(HISTORY_KEY);
    
    // Clear history if refreshing on home for a fresh session start
    if (page === 'home' || !saved) {
      return [{ page: 'home', dataId: null }];
    }
    return JSON.parse(saved);
  });

  const [historyIndex, setHistoryIndex] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';
    const saved = sessionStorage.getItem(INDEX_KEY);
    
    if (page === 'home' || !saved) {
      return 0;
    }
    return parseInt(saved);
  });

  const [selectedData, setSelectedData] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    const id = params.get('id');
    return findItemById(id, page);
  });

  // 2. Persistence Synchronization
  useEffect(() => {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    sessionStorage.setItem(INDEX_KEY, historyIndex.toString());
  }, [historyIndex]);

  // Sync URL visually with the browser bar
  const syncUrl = useCallback((page, data) => {
    const params = new URLSearchParams();
    params.set('page', page);
    if (data?.id) params.set('id', data.id);
    const newPath = window.location.pathname + '?' + params.toString();
    window.history.pushState({ page, dataId: data?.id }, '', newPath);
  }, []);

  // 3. Navigation Actions
  const navigateTo = useCallback((page, data = null, isBrowserAction = false) => {
    setCurrentPage(page);
    setSelectedData(data);
    
    if (!isBrowserAction) {
      // Manual click: Add to stack, pruning any forward history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ page, dataId: data?.id });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      syncUrl(page, data);
    }

    // Scroll back to top on page change
    setTimeout(() => {
      const scrollArea = document.querySelector('.page-scroll-area');
      if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'instant' });
    }, 10);
  }, [history, historyIndex, syncUrl]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      const data = findItemById(prev.dataId, prev.page);
      setHistoryIndex(historyIndex - 1);
      navigateTo(prev.page, data, true);
      syncUrl(prev.page, data);
    }
  }, [history, historyIndex, navigateTo, syncUrl]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      const data = findItemById(next.dataId, next.page);
      setHistoryIndex(historyIndex + 1);
      navigateTo(next.page, data, true);
      syncUrl(next.page, data);
    }
  }, [history, historyIndex, navigateTo, syncUrl]);

  return {
    currentPage,
    selectedData,
    historyIndex,
    historyLength: history.length,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
    navigateTo,
    goBack,
    goForward
  };
};
