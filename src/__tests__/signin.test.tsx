import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Signin from '@/components/auth/signin/signin';
import { authReducer } from '@/store/features/authSlice';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/api', () => ({
  signIn: jest.fn(),
  getTokens: jest.fn(),
  isApiError: jest.fn(),
}));

describe('Signin Page', () => {
  const mockStore = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('рендерит форму входа', () => {
    render(
      <Provider store={mockStore}>
        <Signin />
      </Provider>,
    );

    expect(screen.getByPlaceholderText('Почта')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument();
  });

  test('показывает ошибку при неверных данных', async () => {
    const { signIn, isApiError } = require('@/api');
    isApiError.mockReturnValue(true);
    signIn.mockResolvedValue({
      error: true,
      status: 401,
      message: 'Неверный email или пароль',
    });

    render(
      <Provider store={mockStore}>
        <Signin />
      </Provider>,
    );

    fireEvent.change(screen.getByPlaceholderText('Почта'), {
      target: { value: 'wrong@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(screen.getByText('Неверный email или пароль')).toBeInTheDocument();
    });
  });

  test('показывает состояние загрузки', async () => {
    const { signIn } = require('@/api');
    signIn.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    render(
      <Provider store={mockStore}>
        <Signin />
      </Provider>,
    );

    fireEvent.change(screen.getByPlaceholderText('Почта'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Войти'));

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.getByText('Загрузка...')).toBeDisabled();
  });

  test('валидирует обязательные поля', () => {
    render(
      <Provider store={mockStore}>
        <Signin />
      </Provider>,
    );

    const form = screen.getByRole('form', { name: 'Форма входа' });

    // Проверяем, что поля обязательны
    const emailInput = screen.getByPlaceholderText('Почта');
    const passwordInput = screen.getByPlaceholderText('Пароль');

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();

    // Проверяем, что поля пустые
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');

    // Отправляем форму
    fireEvent.submit(form);
  });

  test('имеет ссылки на регистрацию и главную', () => {
    render(
      <Provider store={mockStore}>
        <Signin />
      </Provider>,
    );

    const signupLink = screen.getByText('Зарегистрироваться');
    expect(signupLink).toHaveAttribute('href', '/signup');

    const logoLink = screen.getByAltText('logo').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });
});
