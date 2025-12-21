import {
  TrackType,
  FavoriteTrackType,
  ApiError,
  isApiError,
  isTrackArray,
} from '@/sharedTypes/types';

const BASE_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

// Утилита для создания заголовков с авторизацией
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('accessToken');
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : {
        'Content-Type': 'application/json',
      };
}

async function handleResponse<T>(response: Response): Promise<T | ApiError> {
  try {
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return { message: 'Требуется авторизация' };
      }
      if (typeof data === 'object' && data !== null && 'message' in data) {
        return { message: String(data.message) };
      }
      return { message: `Ошибка ${response.status}: ${response.statusText}` };
    }

    return data as T;
  } catch (error) {
    return {
      message: 'Ошибка при обработке ответа сервера',
    };
  }
}

/**
 * Получение всех треков
 * @param cacheOptions - опции кеширования Next.js
 */
export async function getAllTracks(
  cacheOptions: RequestCache = 'force-cache',
): Promise<TrackType[] | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/catalog/track/all/`, {
      method: 'GET',
      cache: cacheOptions,
      next: { revalidate: 3600 },
    });

    const result = await handleResponse<any>(response);

    if (isApiError(result)) {
      return result;
    }

    // ↓↓↓ ВАЖНО: Извлекаем массив из поля data ↓↓↓
    if (result && typeof result === 'object' && 'data' in result) {
      const data = result.data;
      if (Array.isArray(data)) {
        return data; // ← Возвращаем только массив треков
      }
    }

    // Если структура неожиданная
    return {
      message: 'Некорректный формат данных от сервера',
    };
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'Ошибка загрузки треков',
    };
  }
}

/**
 * Получение трека по ID
 */
export async function getTrackById(
  id: number,
  cacheOptions: RequestCache = 'force-cache',
): Promise<TrackType | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/catalog/track/${id}/`, {
      method: 'GET',
      cache: cacheOptions,
    });

    return handleResponse<TrackType>(response);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Трек не найден',
    };
  }
}

/**
 * Получение избранных треков (требует авторизации)
 */
export async function getFavoriteTracks(): Promise<
  FavoriteTrackType[] | ApiError
> {
  try {
    // Получаем токен из cookies на сервере или localStorage на клиенте
    let token: string | null = null;

    if (typeof window !== 'undefined') {
      // Клиентская сторона
      token = localStorage.getItem('accessToken');
    } else {
      // Серверная сторона
      const { cookies } = await import('next/headers');
      const cookieStore = cookies();
      token = cookieStore.get('accessToken')?.value || null;
    }

    if (!token) {
      return { message: 'Требуется авторизация' };
    }

    const response = await fetch(`${BASE_URL}/catalog/track/favorite/all/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    return handleResponse<FavoriteTrackType[]>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'Ошибка загрузки избранного',
    };
  }
}

/**
 * Добавление трека в избранное (требует авторизации)
 */
export async function addToFavorites(
  trackId: number,
): Promise<{ success: boolean } | ApiError> {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { message: 'Требуется авторизация' };
    }

    const response = await fetch(
      `${BASE_URL}/catalog/track/${trackId}/favorite/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    return handleResponse<{ success: boolean }>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Ошибка добавления в избранное',
    };
  }
}

/**
 * Удаление трека из избранного (требует авторизации)
 */
export async function removeFromFavorites(
  trackId: number,
): Promise<{ success: boolean } | ApiError> {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { message: 'Требуется авторизация' };
    }

    const response = await fetch(
      `${BASE_URL}/catalog/track/${trackId}/favorite/`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return handleResponse<{ success: boolean }>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Ошибка удаления из избранного',
    };
  }
}

/**
 * Создание новой подборки (требует авторизации)
 */
export async function createSelection(
  name: string,
  description?: string,
): Promise<{ _id: number; name: string } | ApiError> {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { message: 'Требуется авторизация' };
    }

    const response = await fetch(`${BASE_URL}/catalog/selection`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        ...(description && { description }),
      }),
    });

    return handleResponse<{ _id: number; name: string }>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'Ошибка создания подборки',
    };
  }
}

export { isApiError, isTrackArray };
