import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Navbar from '@/components/Navbar/Navbar';

// Моки
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('next/image', () => {
  const MockImage = ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  );
  MockImage.displayName = 'MockImage';
  return MockImage;
});

describe('Navbar Component', () => {
  const createMockStore = (isAuthenticated = false) => {
    return configureStore({
      reducer: {
        auth: () => ({
          isAuthenticated,
          user: isAuthenticated ? { username: 'testuser' } : null,
          accessToken: null,
          refreshToken: null,
        }),
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает логотип', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>,
    );

    expect(screen.getByAltText('logo')).toBeInTheDocument();
  });

  test('показывает ссылку "Войти" когда не авторизован', () => {
    const store = createMockStore(false);

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>,
    );

    expect(screen.getByText('Войти')).toBeInTheDocument();
    expect(screen.queryByText('Выйти')).not.toBeInTheDocument();
  });

  test('показывает кнопку "Выйти" когда авторизован', () => {
    const store = createMockStore(true);

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>,
    );

    expect(screen.getByText('Выйти')).toBeInTheDocument();
    expect(screen.queryByText('Войти')).not.toBeInTheDocument();
  });

  test('открывает/закрывает меню бургер', () => {
    const store = createMockStore();

    const { container } = render(
      <Provider store={store}>
        <Navbar />
      </Provider>,
    );

    const burgerButton = container.querySelector('.nav__burger');

    // Убеждаемся, что элемент найден
    expect(burgerButton).toBeInTheDocument();

    fireEvent.click(burgerButton!);
    fireEvent.click(burgerButton!);
  });

  test('имеет правильные ссылки', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <Navbar />
      </Provider>,
    );

    const homeLink = screen.getByText('Главное').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');

    const favoritesLink = screen.getByText('Мой плейлист').closest('a');
    expect(favoritesLink).toHaveAttribute('href', '/favorites');
  });
});
