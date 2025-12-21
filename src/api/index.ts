// Реэкспортируем все API функции для удобного импорта

// Auth
export {
  signUp,
  signIn,
  getTokens,
  refreshToken,
  validateToken,
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
  isTrackArray,
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
