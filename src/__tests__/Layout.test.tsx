import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '@/components/Layout/Layout';

// Моки для дочерних компонентов
jest.mock('@/components/Navbar/Navbar', () => {
  const MockNavbar = () => <nav data-testid="navbar">Navbar</nav>;
  MockNavbar.displayName = 'MockNavbar';
  return MockNavbar;
});

jest.mock('@/components/Sidebar/Sidebar', () => {
  const MockSidebar = () => <aside data-testid="sidebar">Sidebar</aside>;
  MockSidebar.displayName = 'MockSidebar';
  return MockSidebar;
});

jest.mock('@/components/Player/Player', () => {
  const MockPlayer = () => <div data-testid="player">Player</div>;
  MockPlayer.displayName = 'MockPlayer';
  return MockPlayer;
});

describe('Layout Component', () => {
  test('отображает все дочерние компоненты', () => {
    render(
      <Layout>
        <div data-testid="content">Основной контент</div>
      </Layout>,
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('player')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
  });

  test('отображает заголовок страницы если передан', () => {
    render(
      <Layout pageTitle="Моя музыка">
        <div>Контент</div>
      </Layout>,
    );

    expect(
      screen.getByRole('heading', { name: 'Моя музыка' }),
    ).toBeInTheDocument();
  });

  test('не отображает заголовок если не передан', () => {
    render(
      <Layout>
        <div>Контент</div>
      </Layout>,
    );

    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
  });
});
