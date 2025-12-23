'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import { signUp, signIn, getTokens, isApiError } from '@/api';
import { setUser } from '@/store/features/authSlice';
import { useAppDispatch } from '@/store/store';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа');
      return;
    }

    if (!email.includes('@')) {
      setError('Введите корректный email');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Регистрация
      const signUpResult = await signUp(email, password, username);

      if (isApiError(signUpResult)) {
        // Специфичная обработка ошибок из API
        if (signUpResult.status === 403) {
          setError('Пользователь с таким email уже существует');
        } else {
          setError(signUpResult.message || 'Ошибка регистрации');
        }
        setIsLoading(false);
        return;
      }

      // 2. После успешной регистрации сразу логиним пользователя
      const authResult = await signIn(email, password);

      if (isApiError(authResult)) {
        setError(
          'Регистрация успешна, но вход не удался. Попробуйте войти вручную.',
        );
        setIsLoading(false);
        return;
      }

      // 3. Получение токенов
      const tokenResult = await getTokens(email, password);

      if (isApiError(tokenResult)) {
        setError(tokenResult.message || 'Ошибка получения токенов');
        setIsLoading(false);
        return;
      }

      // 4. Сохраняем данные
      localStorage.setItem('accessToken', tokenResult.access);
      localStorage.setItem('refreshToken', tokenResult.refresh);
      localStorage.setItem('user', JSON.stringify(authResult));

      // 5. Сохраняем в Redux
      dispatch(
        setUser({
          ...authResult,
          accessToken: tokenResult.access,
          refreshToken: tokenResult.refresh,
        }),
      );

      // 6. Перенаправляем на главную
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      console.error('Sign up error:', err);

      // Типизируем ошибку
      const typedError = err as Record<string, unknown>;

      if (typedError.response || typedError.status === 412) {
        const response = typedError.response as Record<string, unknown>;
        const status = response?.status || typedError.status;

        if (status === 412) {
          setError('Требуется повторная авторизация');
          localStorage.clear();
        } else {
          setError(`Ошибка ${status}. Попробуйте снова.`);
        }
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при регистрации',
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
                type="text"
                name="username"
                placeholder="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                minLength={3}
              />

              <input
                className={classNames(styles.modal__input)}
                type="email"
                name="email"
                placeholder="Почта"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <input
                className={styles.modal__input}
                type="password"
                name="password"
                placeholder="Пароль (минимум 6 символов)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />

              <input
                className={styles.modal__input}
                type="password"
                name="confirmPassword"
                placeholder="Повторите пароль"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                minLength={6}
              />

              {error && (
                <div className={styles.errorContainer}>
                  <div className={styles.errorText}>{error}</div>
                </div>
              )}

              <button
                className={styles.modal__btnSignupEnt}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>

              <div className={styles.signup__footer}>
                <p>Уже есть аккаунт?</p>
                <Link href="/signin" className={styles.signup__link}>
                  Войти
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
