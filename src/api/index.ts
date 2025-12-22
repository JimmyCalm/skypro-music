// Реэкспортируем все API функции для удобного импорта

export { api } from './axios';

// Auth
export {
  signUp,
  signIn,
  getTokens,
  refreshToken,
  logout,
  isApiError,
} from './auth';

// Tracks
export {
  getAllTracks,
  getTrackById,
  getFavoriteTracks,
  addToFavorites,
  removeFromFavorites,
  createSelection,
} from './tracks';

// Selections
export {
  getAllSelections,
  getSelectionById,
  searchSelections,
  getTracksFromSelection,
  extractUniqueGenres,
  extractUniqueAuthors,
  filterTracksByGenre,
  filterTracksByAuthor,
  sortTracksByDate,
  isSelection,
} from './selections';

// Types
export type {
  TrackType,
  UserType,
  AuthResponse,
  SignUpResponse,
  TokenResponse,
  RefreshTokenResponse,
  ApiError,
  SelectionType,
  FavoriteTrackType,
} from '@/sharedTypes/types';
