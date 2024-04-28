import { useState, useEffect, useCallback } from 'react';

export function useWindowDimensions() {
  const isBrowser = typeof window !== 'undefined';

  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = isBrowser ? window : { innerWidth: 0, innerHeight: 0 };
    const isMobile = width < 768;
    return {
      width,
      height,
      isMobile,
    };
  };

  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  const handleResize = useCallback(() => {
    setWindowDimensions(getWindowDimensions());
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isBrowser, handleResize]);

  return windowDimensions;
}
