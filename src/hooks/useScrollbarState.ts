import { useState, useEffect, useCallback } from 'react';

export function useScrollbarState(targetElementRef: React.RefObject<HTMLDivElement>, dependencies?: any[]) {
  const isBrowser = typeof window !== 'undefined';

  const [isVerticalScroll, setIsVerticalScroll] = useState(false);
  const [isHorizontalScroll, setIsHorizontalScroll] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollBottom, setScrollBottom] = useState(0);

  // resize event
  const handleResize = useCallback(() => {
    const element = targetElementRef?.current;
    if (!element) return;
    setIsVerticalScroll(element.scrollHeight > element.clientHeight);
    setIsHorizontalScroll(element.scrollWidth > element.clientWidth);
    setScrollTop(element.scrollTop);
    setScrollBottom(element.scrollHeight - element.offsetHeight - element.scrollTop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetElementRef?.current]);
  useEffect(() => {
    if (!isBrowser) return;
    handleResize();
    window.addEventListener('resize', handleResize);
    const element = targetElementRef?.current;
    // Create a ResizeObserver to track changes in the element's size
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (element) {
      if (element) {
        resizeObserver.observe(element);
      }
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      if (element) resizeObserver.unobserve(element);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowser, handleResize, targetElementRef?.current, ...(dependencies || [])]);

  // scroll event
  const handleScroll = useCallback(() => {
    const element = targetElementRef?.current;
    if (!element) return;
    setScrollTop(element.scrollTop);
    setScrollBottom(element.scrollHeight - element.offsetHeight - element.scrollTop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetElementRef?.current]);
  useEffect(() => {
    const element = targetElementRef?.current;
    if (!isBrowser || !element) return;
    handleScroll();
    element.addEventListener('scroll', handleScroll);
    // Create a ResizeObserver to track changes in the element's size
    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    if (element) {
      if (element) {
        resizeObserver.observe(element);
      }
    }
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowser, handleResize, targetElementRef?.current]);

  return { isVerticalScroll, isHorizontalScroll, scrollTop, scrollBottom };
}
