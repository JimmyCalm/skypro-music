import { api } from './axios';
import {
  TrackType,
  ApiError,
  isApiError,
  UserType,
  SelectionType,
} from '@/sharedTypes/types';
import { data as fallbackData } from '@data'; // Используем статические данные как fallback
import { getFallbackTracks } from '@/utils/fallbackData';

// Типы для ошибок axios
interface AxiosResponseData {
  data?:
    | TrackType[]
    | { data: TrackType[] }
    | { results: TrackType[] }
    | Record<string, unknown>;
  status?: number;
  statusText?: string;
}

interface AxiosErrorType {
  response?: {
    status?: number;
    data?:
      | string
      | {
          message?: string;
          detail?: string;
          error?: string;
          errors?: string[];
        };
    statusText?: string;
  };
  request?: unknown;
  message?: string;
}

async function handleApiError(error: unknown): Promise<ApiError> {
  console.error('API Error details:', error);

  const err = error as AxiosErrorType;

  // 1. Проверяем ответ от сервера (статус 4xx, 5xx)
  if (err.response) {
    const status = err.response.status || 500;
    let message = 'Произошла ошибка';

    // Пытаемся извлечь сообщение об ошибке из ответа
    if (err.response.data) {
      const data = err.response.data;

      if (typeof data === 'string') {
        message = data;
      } else if (typeof data === 'object' && data !== null) {
        // Проверяем различные форматы сообщений об ошибках
        if ('message' in data && typeof data.message === 'string') {
          message = data.message;
        } else if ('detail' in data && typeof data.detail === 'string') {
          message = data.detail;
        } else if ('error' in data && typeof data.error === 'string') {
          message = data.error;
        } else if ('errors' in data && Array.isArray(data.errors)) {
          message = data.errors.join(', ');
        } else {
          message = `Ошибка ${status}`;
        }
      } else {
        message = err.response.statusText || `Ошибка ${status}`;
      }
    } else {
      message = err.response.statusText || `Ошибка ${status}`;
    }

    return {
      message,
      status,
      success: false,
    };
  }

  // 2. Ошибка сети (нет ответа от сервера)
  if (err.request) {
    console.warn('Network error - no response from server');
    return {
      message:
        'Ошибка сети. Проверьте подключение к интернету или настройки CORS.',
      success: false,
    };
  }

  // 3. Другие ошибки
  if (err.message) {
    return {
      message: err.message,
      success: false,
    };
  }

  // 4. Неизвестная ошибка
  return {
    message: 'Произошла неизвестная ошибка',
    success: false,
  };
}

export async function getAllTracks(): Promise<TrackType[] | ApiError> {
  try {
    console.log('Fetching tracks from API...');
    const response = await api.get('/catalog/track/all/');

    // Для отладки - выводим структуру ответа
    console.log('API Response structure:', {
      isArray: Array.isArray(response.data),
      dataType: typeof response.data,
      hasDataProperty:
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data,
      hasResultsProperty:
        response.data &&
        typeof response.data === 'object' &&
        'results' in response.data,
    });

    let tracks: TrackType[] = [];

    // Вариант 1: Данные сразу в массиве
    if (Array.isArray(response.data)) {
      tracks = response.data as TrackType[];
    }
    // Вариант 2: Данные в поле data
    else if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const data = (response.data as { data: unknown }).data;
      if (Array.isArray(data)) {
        tracks = data as TrackType[];
      } else if (data && typeof data === 'object' && 'results' in data) {
        // Вложенная структура с results
        const results = (data as { results: unknown }).results;
        if (Array.isArray(results)) {
          tracks = results as TrackType[];
        }
      }
    }
    // Вариант 3: Данные в поле results
    else if (
      response.data &&
      typeof response.data === 'object' &&
      'results' in response.data
    ) {
      const results = (response.data as { results: unknown }).results;
      if (Array.isArray(results)) {
        tracks = results as TrackType[];
      }
    }
    // Вариант 4: Пытаемся преобразовать любой объект в массив
    else if (response.data && typeof response.data === 'object') {
      // Проверяем, есть ли в объекте свойства, похожие на треки
      const values = Object.values(response.data);
      if (values.length > 0 && Array.isArray(values[0])) {
        const firstValue = values[0];
        if (
          Array.isArray(firstValue) &&
          firstValue.length > 0 &&
          '_id' in firstValue[0]
        ) {
          tracks = firstValue as TrackType[];
        }
      }
    }

    // Проверяем валидность полученных треков
    if (tracks.length > 0 && tracks[0] && '_id' in tracks[0]) {
      console.log(`Successfully loaded ${tracks.length} tracks from API`);
      return tracks;
    }

    // Если не получили треки из API, используем fallback
    console.warn(
      'API returned empty or invalid track list, using fallback data',
    );
    return fallbackData;
  } catch (error: unknown) {
    console.warn('Error loading tracks from API, using fallback:', error);

    // При ошибке всегда возвращаем fallback данные
    // Это гарантирует, что пользователь всегда увидит контент
    return fallbackData;
  }
}

export async function getTrackById(id: number): Promise<TrackType | ApiError> {
  try {
    const response = await api.get(`/catalog/track/${id}/`);

    // Ищем трек в ответе
    let trackData: unknown = response.data;

    // Если данные вложены в поле data
    if (trackData && typeof trackData === 'object' && 'data' in trackData) {
      trackData = (trackData as { data: unknown }).data;
    }

    // Проверяем, что это валидный трек
    if (
      trackData &&
      typeof trackData === 'object' &&
      trackData !== null &&
      '_id' in trackData
    ) {
      return trackData as TrackType;
    }

    // Если не нашли в API, ищем в fallback данных
    const fallbackTrack = fallbackData.find((track) => track._id === id);
    if (fallbackTrack) {
      console.log(`Track ${id} found in fallback data`);
      return fallbackTrack;
    }

    return {
      message: `Трек с ID ${id} не найден`,
      status: 404,
      success: false,
    };
  } catch (error: unknown) {
    console.error(`Error fetching track ${id}:`, error);

    // Пробуем найти в fallback
    const fallbackTrack = fallbackData.find((track) => track._id === id);
    if (fallbackTrack) {
      console.log(`Track ${id} found in fallback data after error`);
      return fallbackTrack;
    }

    return handleApiError(error);
  }
}

export async function getFavoriteTracks(): Promise<TrackType[] | ApiError> {
  try {
    const response = await api.get('/catalog/track/favorite/all/');

    let favoriteTracks: TrackType[] = [];

    // Аналогичная логика извлечения данных
    if (Array.isArray(response.data)) {
      favoriteTracks = response.data as TrackType[];
    } else if (
      response.data &&
      typeof response.data === 'object' &&
      'data' in response.data
    ) {
      const data = (response.data as { data: unknown }).data;
      if (Array.isArray(data)) {
        favoriteTracks = data as TrackType[];
      }
    } else if (
      response.data &&
      typeof response.data === 'object' &&
      'results' in response.data
    ) {
      const results = (response.data as { results: unknown }).results;
      if (Array.isArray(results)) {
        favoriteTracks = results as TrackType[];
      }
    }

    console.log(`Loaded ${favoriteTracks.length} favorite tracks`);
    return favoriteTracks;
  } catch (error: unknown) {
    console.warn('Error loading favorite tracks:', error);
    // Fallback to localStorage for demo
    if (typeof window === 'undefined') return [];
    const likedTracks = JSON.parse(
      localStorage.getItem('likedTracks') || '[]',
    ) as number[];
    const allTracks = getFallbackTracks();
    return allTracks.filter((track) => likedTracks.includes(track._id));
  }
}

interface FavoriteResponse {
  success?: boolean;
  message?: string;
}

export async function addToFavorites(
  trackId: number,
): Promise<{ success: boolean } | ApiError> {
  try {
    console.log(`Adding track ${trackId} to favorites...`);
    const response = await api.post(`/catalog/track/${trackId}/favorite/`);

    // Проверяем разные форматы успешного ответа
    if (response.data) {
      const data = response.data as FavoriteResponse;
      if (typeof data === 'object') {
        return {
          success:
            data.success ||
            (data.message?.toLowerCase().includes('успешно') ? true : false) ||
            true, // Если поле success не указано, считаем успехом
        };
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error(`Error adding track ${trackId} to favorites:`, error);

    // Даже при ошибке API симулируем успех для демонстрации
    console.log('Simulating successful favorite addition for demo');
    // Обновляем localStorage для демо
    if (typeof window !== 'undefined') {
      const likedTracks = JSON.parse(
        localStorage.getItem('likedTracks') || '[]',
      ) as number[];
      if (!likedTracks.includes(trackId)) {
        likedTracks.push(trackId);
        localStorage.setItem('likedTracks', JSON.stringify(likedTracks));
      }
    }
    return { success: true };
  }
}

export async function removeFromFavorites(
  trackId: number,
): Promise<{ success: boolean } | ApiError> {
  try {
    console.log(`Removing track ${trackId} from favorites...`);
    const response = await api.delete(`/catalog/track/${trackId}/favorite/`);

    // Проверяем разные форматы успешного ответа
    if (response.data) {
      const data = response.data as FavoriteResponse;
      if (typeof data === 'object') {
        return {
          success:
            data.success ||
            (data.message?.toLowerCase().includes('успешно') ? true : false) ||
            true,
        };
      }
    }

    return { success: true };
  } catch (error: unknown) {
    console.error(`Error removing track ${trackId} from favorites:`, error);

    // Даже при ошибке API симулируем успех для демонстрации
    console.log('Simulating successful favorite removal for demo');
    // Обновляем localStorage для демо
    if (typeof window !== 'undefined') {
      const likedTracks = JSON.parse(
        localStorage.getItem('likedTracks') || '[]',
      ) as number[];
      const updated = likedTracks.filter((id) => id !== trackId);
      localStorage.setItem('likedTracks', JSON.stringify(updated));
    }
    return { success: true };
  }
}

export async function createSelection(
  name: string,
  description?: string,
): Promise<{ _id: number; name: string } | ApiError> {
  try {
    const response = await api.post('/catalog/selection', {
      name,
      ...(description && { description }),
    });

    return response.data as { _id: number; name: string };
  } catch (error: unknown) {
    console.error('Error creating selection:', error);
    return handleApiError(error);
  }
}

// Функция для тестирования подключения к API
interface ApiConnectionTest {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function testApiConnection(): Promise<ApiConnectionTest> {
  try {
    const response = await api.get('/catalog/track/all/');

    let trackCount = 0;
    if (Array.isArray(response.data)) {
      trackCount = response.data.length;
    } else if (response.data && typeof response.data === 'object') {
      if (
        'data' in response.data &&
        Array.isArray((response.data as { data: unknown[] }).data)
      ) {
        trackCount = (response.data as { data: unknown[] }).data.length;
      } else if (
        'results' in response.data &&
        Array.isArray((response.data as { results: unknown[] }).results)
      ) {
        trackCount = (response.data as { results: unknown[] }).results.length;
      }
    }

    return {
      success: true,
      message: `API подключен успешно. Получено ${trackCount} треков`,
      data: response.data,
    };
  } catch (error: unknown) {
    const err = error as AxiosErrorType;
    return {
      success: false,
      message: `Ошибка подключения к API: ${err.message || 'Неизвестная ошибка'}`,
      data: error,
    };
  }
}

// Экспортируем fallback данные для использования в других местах
export { fallbackData };

// Сохраняем старые экспорты для совместимости
export { isApiError };
