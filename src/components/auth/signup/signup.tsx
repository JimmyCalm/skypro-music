'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './signup.module.css';
import classNames from 'classnames';
import Link from 'next/link';
import { signUp, isApiError } from '@/api';
import { useAppDispatch } from '@/store/store';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

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
      // Регистрация
      const signUpResult = await signUp(email, password, username);

      // Проверяем, является ли результат ошибкой
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

      // Проверяем структуру успешного ответа
      if (signUpResult.success) {
        // Успешная регистрация
        setSuccessMessage(
          signUpResult.message || 'Регистрация прошла успешно!',
        );

        // Перенаправляем через 1.5 секунды
        setTimeout(() => {
          router.push('/signin');
        }, 1500);
      } else {
        // Если success === false
        setError(signUpResult.message || 'Неизвестная ошибка регистрации');
      }
    } catch (err: unknown) {
      console.error('Sign up error:', err);
      setError('Произошла ошибка при регистрации');
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

              {successMessage && (
                <div className={styles.successContainer}>
                  <div className={styles.successText}>{successMessage}</div>
                  <div className={styles.successText}>
                    Перенаправляем на страницу входа...
                  </div>
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
