import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import AuthInitializer from '@/components/AuthInitializer';

describe('AuthInitializer Component', () => {
  let localStorageMock: { [key: string]: string };

  beforeEach(() => {
    localStorageMock = {};

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => localStorageMock[key]),
        setItem: jest.fn((key, value) => {
          localStorageMock[key] = value;
        }),
        removeItem: jest.fn((key) => {
          delete localStorageMock[key];
        }),
        clear: jest.fn(() => {
          localStorageMock = {};
        }),
      },
      writable: true,
    });

    jest.clearAllMocks();
  });

  test('загружает пользователя из localStorage', () => {
    const userData = {
      _id: 1,
      username: 'testuser',
      email: 'test@test.com',
    };

    localStorageMock['user'] = JSON.stringify(userData);
    localStorageMock['accessToken'] = 'test-access-token';
    localStorageMock['refreshToken'] = 'test-refresh-token';

    const store = configureStore({
      reducer: {
        auth: () => ({ user: null, isAuthenticated: false }),
        favorites: () => ({ tracks: [] }),
      },
    });

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <AuthInitializer />
      </Provider>,
    );

    expect(dispatchSpy).toHaveBeenCalled();
  });

  test('обрабатывает невалидный JSON в localStorage', () => {
    localStorageMock['user'] = 'invalid-json';
    localStorageMock['accessToken'] = 'token';

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const store = configureStore({
      reducer: {
        auth: () => ({ user: null, isAuthenticated: false }),
        favorites: () => ({ tracks: [] }),
      },
    });

    render(
      <Provider store={store}>
        <AuthInitializer />
      </Provider>,
    );

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('ничего не рендерит', () => {
    const store = configureStore({
      reducer: {
        auth: () => ({ user: null, isAuthenticated: false }),
        favorites: () => ({ tracks: [] }),
      },
    });

    const { container } = render(
      <Provider store={store}>
        <AuthInitializer />
      </Provider>,
    );

    expect(container.firstChild).toBeNull();
  });
});
