export type TrackType = {
  _id: number;
  name: string;
  author: string;
  release_date: string;
  genre: string[];
  duration_in_seconds: number;
  album: string;
  logo: string | null;
  track_file: string;
  stared_user: unknown[];
};

// Тип для пользователя
export type UserType = {
  _id: number;
  email: string;
  username: string;
};

// Ответ при успешной авторизации
export type AuthResponse = {
  email: string;
  username: string;
  _id: number;
};

// Ответ при успешной регистрации
export type SignUpResponse = {
  message: string;
  result: {
    username: string;
    email: string;
    _id: number;
  };
  success: boolean;
};

// Ответ с токенами
export type TokenResponse = {
  refresh: string;
  access: string;
};

// Ответ с обновленным access токеном
export type RefreshTokenResponse = {
  access: string;
};

// Тип ошибки API - ОБНОВЛЕНО: добавлено поле status
export type ApiError = {
  message: string;
  success?: boolean;
  detail?: string;
  code?: string;
  status?: number; // <-- ДОБАВЛЕНО
};

// Тип для подборки
export type SelectionType = {
  _id: number;
  name: string;
  author: string;
  tracks: TrackType[];
  logo: string | null;
  description?: string;
};

// Тип для избранного трека
export type FavoriteTrackType = TrackType & {
  isFavorite?: boolean;
};

// Type guard для проверки, является ли ответ ошибкой
export function isApiError(data: unknown): data is ApiError {
  const error = data as ApiError;
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof error.message === 'string' &&
    // Проверяем дополнительные поля
    (error.success === undefined || typeof error.success === 'boolean') &&
    (error.status === undefined || typeof error.status === 'number') &&
    (error.detail === undefined || typeof error.detail === 'string') &&
    (error.code === undefined || typeof error.code === 'string')
  );
}

// Type guard для проверки массива треков
export function isTrackArray(data: unknown): data is TrackType[] {
  if (!Array.isArray(data) || data.length === 0) return false;

  const firstItem = data[0] as TrackType;
  return (
    '_id' in firstItem &&
    typeof firstItem._id === 'number' &&
    'name' in firstItem &&
    typeof firstItem.name === 'string' &&
    'track_file' in firstItem &&
    typeof firstItem.track_file === 'string'
  );
}

// Type guard для проверки подборки
export function isSelection(data: unknown): data is SelectionType {
  const selection = data as SelectionType;
  return (
    typeof data === 'object' &&
    data !== null &&
    '_id' in selection &&
    typeof selection._id === 'number' &&
    'tracks' in selection &&
    Array.isArray(selection.tracks)
  );
}
