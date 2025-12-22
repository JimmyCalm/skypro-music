// components/AuthInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/store';
import { setUser } from '@/store/features/authSlice';

export default function AuthInitializer() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Проверяем, есть ли данные пользователя в localStorage
    if (typeof window !== 'undefined') {
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
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
  }, [dispatch]);

  return null; // Этот компонент ничего не рендерит
}
