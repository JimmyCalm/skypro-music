'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signin.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import { signIn, getTokens, isApiError } from '@/api';
import { setUser } from '@/store/features/authSlice';
import { useAppDispatch } from '@/store/store';

export default function Signin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Очищаем старые токены
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }

      // 1. Авторизация - используем правильный endpoint /user/login/
      const authResult = await signIn(email, password);

      if (isApiError(authResult)) {
        // Проверяем специфичные ошибки
        if (authResult.status === 401) {
          setError('Неверный email или пароль');
        } else {
          setError(authResult.message);
        }
        return;
      }

      // 2. Получение токенов
      const tokenResult = await getTokens(email, password);

      if (isApiError(tokenResult)) {
        setError(tokenResult.message || 'Ошибка получения токенов');
        return;
      }

      // 3. Сохраняем данные в localStorage
      localStorage.setItem('accessToken', tokenResult.access);
      localStorage.setItem('refreshToken', tokenResult.refresh);
      localStorage.setItem('user', JSON.stringify(authResult));

      // 4. Сохраняем в Redux
      dispatch(
        setUser({
          ...authResult,
          accessToken: tokenResult.access,
          refreshToken: tokenResult.refresh,
        }),
      );

      // 5. Перенаправляем на главную
      router.push('/');
      router.refresh();
    } catch (err: any) {
      console.error('Sign in error:', err);

      // Обработка 412 ошибки
      if (err?.response?.status === 412 || err?.status === 412) {
        setError('Требуется повторная авторизация');
        localStorage.clear();
      } else {
        setError(
          err instanceof Error ? err.message : 'Произошла ошибка при входе',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.containerEnter}>
          <div className={styles.modal__block}>
            <form className={styles.modal__form} onSubmit={handleSubmit}>
              <Link href="/">
                <div className={styles.modal__logo}>
                  <img src="/img/logo_modal.png" alt="logo" />
                </div>
              </Link>

              <input
                className={classNames(styles.modal__input, styles.login)}
                type="email"
                name="email"
                placeholder="Почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <input
                className={classNames(styles.modal__input)}
                type="password"
                name="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />

              {/* Блок для ошибок */}
              {error && (
                <div className={styles.errorContainer}>
                  <div className={styles.errorText}>{error}</div>
                </div>
              )}

              <button
                className={styles.modal__btnEnter}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : 'Войти'}
              </button>

              <Link href="/signup" className={styles.modal__btnSignup}>
                Зарегистрироваться
              </Link>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
