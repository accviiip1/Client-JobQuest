import { useState, useEffect, useCallback } from 'react';

const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Đang tải...');

  const startLoading = useCallback((text = 'Đang tải...') => {
    setLoadingText(text);
    setIsLoading(true);
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 500);
  }, []);

  const updateProgress = useCallback((newProgress, text) => {
    if (text) setLoadingText(text);
    setProgress(Math.min(100, Math.max(0, newProgress)));
  }, []);

  const updateText = useCallback((text) => {
    setLoadingText(text);
  }, []);

  // Auto progress simulation
  useEffect(() => {
    if (isLoading && progress < 100) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // Stop at 90% until manually completed
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isLoading, progress]);

  return {
    isLoading,
    progress,
    loadingText,
    startLoading,
    stopLoading,
    updateProgress,
    updateText
  };
};

export default useLoading;
