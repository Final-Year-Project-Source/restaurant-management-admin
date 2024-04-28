'use client';
import { SessionProvider } from 'next-auth/react';
import React, { ReactNode, useCallback, useEffect } from 'react';

interface Props {
  children: ReactNode;
}

function Provider({ children }: Props) {
  const handleResize = useCallback(() => {
    // We execute the same script as before
    let vh = window.innerHeight;
    document.documentElement.style.setProperty('--100vh', `${vh}px`);
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return <SessionProvider>{children}</SessionProvider>;
}
export default Provider;
