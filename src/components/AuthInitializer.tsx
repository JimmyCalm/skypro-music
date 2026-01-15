'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { setUser } from '@/store/features/authSlice';
import { loadFavorites } from '@/store/features/favoritesSlice';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncUserFromStorage = () => {
      const userData = localStorage.getItem('user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (userData && accessToken) {
        try {
          const user = JSON.parse(userData);
          dispatch(
            setUser({
              ...user,
              accessToken,
              refreshToken: refreshToken || undefined,
            }),
          );
          dispatch(loadFavorites());
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    };

    syncUserFromStorage();

    const handleUserLoggedIn = () => {
      syncUserFromStorage();
    };

    window.addEventListener('user-logged-in', handleUserLoggedIn);

    return () => {
      window.removeEventListener('user-logged-in', handleUserLoggedIn);
    };
  }, [dispatch]);

  return null;
}
