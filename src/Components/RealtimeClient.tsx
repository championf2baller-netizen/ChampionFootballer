"use client";
import { useEffect } from 'react';
import { ensureRealtime } from '@/lib/realtime';

export default function RealtimeClient() {
  useEffect(() => {
    const timer = setTimeout(() => {
      ensureRealtime();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  return null;
}
