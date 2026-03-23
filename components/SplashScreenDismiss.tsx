'use client';
import { useEffect } from 'react';

export default function SplashScreenDismiss() {
  useEffect(() => {
    const el = document.getElementById('splash-screen');
    if (!el) return;
    el.classList.add('splash-hidden');
    const t = setTimeout(() => el.remove(), 500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
