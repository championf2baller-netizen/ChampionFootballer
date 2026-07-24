'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { initializeFromStorage } from '@/lib/features/authSlice';
import { AppDispatch } from '@/lib/store';
import Cookies from 'js-cookie';

export default function AuthCheck() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Add storage event listener to handle changes from other tabs
    const handleStorageChange = () => {
      dispatch(initializeFromStorage());
    };
    window.addEventListener('storage', handleStorageChange);

    // Initialize from storage before checking auth
    const timer = setTimeout(() => {
      try {
        dispatch({
          type: 'auth/initializeFromStorage'
        });
      } catch (err) {
        console.error('Failed to initialize auth from storage:', err);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearTimeout(timer);
    };
  }, [dispatch]);

  return null;
}