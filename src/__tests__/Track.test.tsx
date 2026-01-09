import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Track from '@/components/Track/Track';
import { TrackType, UserType } from '@/sharedTypes/types';
import { AuthState } from '@/store/features/authSlice';
import { initialStateType } from '@/store/features/trackSlice';
import { FavoritesState } from '@/store/features/favoritesSlice';

// Моки
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/api', () => ({
  addToFavorites: jest.fn(),
  removeFromFavorites: jest.fn(),
  isApiError: jest.fn(),
}));

describe('Track Component', () => {
  const mockTrack: TrackType = {
    _id: 1,
    name: 'Test Track',
    author: 'Test Artist',
    album: 'Test Album',
    duration_in_seconds: 180,
    track_file: 'test.mp3',
    release_date: '2023-01-01',
    genre: ['Rock', 'Pop'],
    logo: null,
    stared_user: [],
  };

  const mockUser: UserType = {
    _id: 1,
    username: 'testuser',
    email: 'test@test.com',
  };

  const mockUserWithTokens = {
    ...mockUser,
    accessToken: 'token',
    refreshToken: 'refresh',
  };

  // Правильные типы для состояний
  const defaultAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
  };

  const defaultTrackState: initialStateType = {
    currentTrack: null,
    currentPlaylist: [],
    currentTrackIndex: -1,
    isPlaying: false,
    isShuffled: false,
    isLoop: false,
    shuffledPlaylist: [],
    volume: 0.5,
    currentTime: 0,
    duration: 0,
  };

  const defaultFavoritesState: FavoritesState = {
    tracks: [],
    loading: false,
    error: null,
  };

  const createMockStore = (
    authState: Partial<AuthState> = {},
    trackState: Partial<initialStateType> = {},
    favoritesState: Partial<FavoritesState> = {},
  ) => {
    return configureStore({
      reducer: {
        auth: (state = { ...defaultAuthState, ...authState }) => state,
        tracks: (state = { ...defaultTrackState, ...trackState }) => state,
        favorites: (state = { ...defaultFavoritesState, ...favoritesState }) =>
          state,
      },
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('отображает данные трека', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <Track {...mockTrack} />
      </Provider>,
    );

    expect(screen.getByText('Test Track')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Test Album')).toBeInTheDocument();
    expect(screen.getByText('3:00')).toBeInTheDocument();
  });

  test('отображает жанры и год выпуска', () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <Track {...mockTrack} />
      </Provider>,
    );

    expect(screen.getByText('Rock, Pop')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  test('клик по треку вызывает playTrack', () => {
    const store = createMockStore();
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <Track {...mockTrack} />
      </Provider>,
    );

    const trackElement = screen.getAllByRole('button');
    fireEvent.click(trackElement[0]);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'track/playTrack',
        payload: mockTrack,
      }),
    );
  });

  test('перенаправляет на signin при клике на избранное без авторизации', () => {
    const mockPush = jest.fn();
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
    });

    const store = createMockStore();

    render(
      <Provider store={store}>
        <Track {...mockTrack} />
      </Provider>,
    );

    const favoriteButton = screen.getByLabelText(/войдите/i);
    fireEvent.click(favoriteButton);

    expect(mockPush).toHaveBeenCalledWith('/signin');
  });

  test('показывает активное состояние избранного', () => {
    const store = createMockStore(
      {
        isAuthenticated: true,
        user: mockUserWithTokens,
        isLoading: false,
        error: null,
      },
      {},
      {
        tracks: [mockTrack],
        loading: false,
        error: null,
      },
    );

    render(
      <Provider store={store}>
        <Track
          {...mockTrack}
          stared_user={[
            { _id: 1, username: 'testuser', email: 'test@test.com' },
          ]}
        />
      </Provider>,
    );

    const favoriteButton = screen.getByLabelText(/удалить из избранного/i);
    expect(favoriteButton).toBeInTheDocument();
  });
});
