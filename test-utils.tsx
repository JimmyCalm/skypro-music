import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore, Reducer, UnknownAction } from '@reduxjs/toolkit';
import { AppStore, RootState } from '@/store/store';
import { authReducer, AuthState } from '@/store/features/authSlice';
import {
  trackSliceReducer,
  initialStateType,
} from '@/store/features/trackSlice';
import {
  favoritesReducer,
  FavoritesState,
} from '@/store/features/favoritesSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

// Используем Reducer<any, UnknownAction> для совместимости
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer as Reducer<unknown, UnknownAction>,
        tracks: trackSliceReducer as Reducer<unknown, UnknownAction>,
        favorites: favoritesReducer as Reducer<unknown, UnknownAction>,
      },
      preloadedState,
    }) as AppStore,
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export * from '@testing-library/react';
export { renderWithProviders as render };
