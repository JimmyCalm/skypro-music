import {
  SelectionType,
  TrackType,
  ApiError,
  isApiError,
  isSelection,
} from '@/sharedTypes/types';

const BASE_URL = 'https://webdev-music-003b5b991590.herokuapp.com';

async function handleResponse<T>(response: Response): Promise<T | ApiError> {
  try {
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return { message: 'Ресурс не найден' };
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
 * Получение всех подборок
 * @param cacheOptions - опции кеширования Next.js
 */
export async function getAllSelections(
  cacheOptions: RequestCache = 'force-cache',
): Promise<SelectionType[] | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/catalog/selection/all`, {
      method: 'GET',
      cache: cacheOptions,
      next: { revalidate: 3600 }, // Автоматическое обновление каждые 60 минут
    });

    return handleResponse<SelectionType[]>(response);
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : 'Ошибка загрузки подборок',
    };
  }
}

/**
 * Получение подборки по ID
 * @param id - ID подборки
 * @param cacheOptions - опции кеширования
 */
export async function getSelectionById(
  id: number | string,
  cacheOptions: RequestCache = 'force-cache',
): Promise<SelectionType | ApiError> {
  try {
    const response = await fetch(`${BASE_URL}/catalog/selection/${id}/`, {
      method: 'GET',
      cache: cacheOptions,
    });

    return handleResponse<SelectionType>(response);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Подборка не найдена',
    };
  }
}

/**
 * Поиск подборок по названию
 */
export async function searchSelections(
  query: string,
): Promise<SelectionType[] | ApiError> {
  try {
    // Если API не поддерживает поиск, фильтруем на клиенте
    const allSelections = await getAllSelections('no-store');

    if (isApiError(allSelections)) {
      return allSelections;
    }

    const filtered = allSelections.filter(
      (selection) =>
        selection.name.toLowerCase().includes(query.toLowerCase()) ||
        selection.author.toLowerCase().includes(query.toLowerCase()),
    );

    return filtered;
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'Ошибка поиска',
    };
  }
}

/**
 * Получение треков из подборки (альтернативный способ если подборка не содержит tracks)
 */
export async function getTracksFromSelection(
  selectionId: number,
): Promise<TrackType[] | ApiError> {
  try {
    // Сначала получаем подборку
    const selection = await getSelectionById(selectionId);

    if (isApiError(selection)) {
      return selection;
    }

    // Если в подборке уже есть треки, возвращаем их
    if (selection.tracks && selection.tracks.length > 0) {
      return selection.tracks;
    }

    // Если треков нет, делаем отдельный запрос (если API поддерживает)
    // Или возвращаем пустой массив
    return [];
  } catch (error) {
    return {
      message:
        error instanceof Error
          ? error.message
          : 'Ошибка загрузки треков из подборки',
    };
  }
}

// Вспомогательные функции для работы с данными

/**
 * Получение уникальных жанров из треков
 */
export function extractUniqueGenres(tracks: unknown): string[] {
  if (!Array.isArray(tracks)) {
    console.error('tracks is not an array:', tracks);
    return [];
  }

  const genres = new Set<string>();

  tracks.forEach((track) => {
    if (
      typeof track === 'object' &&
      track !== null &&
      'genre' in track &&
      Array.isArray((track as any).genre)
    ) {
      (track as any).genre.forEach((genre: unknown) => {
        if (typeof genre === 'string') {
          genres.add(genre);
        }
      });
    }
  });

  return Array.from(genres);
}

/**
 * Получение уникальных авторов из треков
 */
export function extractUniqueAuthors(tracks: unknown): string[] {
  if (!Array.isArray(tracks)) {
    console.error('tracks is not an array:', tracks);
    return [];
  }

  const authors = new Set<string>();

  tracks.forEach((track) => {
    if (
      typeof track === 'object' &&
      track !== null &&
      'author' in track &&
      typeof (track as any).author === 'string'
    ) {
      const author = (track as any).author;
      if (author && author !== '-') {
        authors.add(author);
      }
    }
  });

  return Array.from(authors);
}

/**
 * Фильтрация треков по жанру
 */
export function filterTracksByGenre(
  tracks: TrackType[],
  genre: string,
): TrackType[] {
  if (!genre) return tracks;
  return tracks.filter(
    (track) => Array.isArray(track.genre) && track.genre.includes(genre),
  );
}

/**
 * Фильтрация треков по автору
 */
export function filterTracksByAuthor(
  tracks: TrackType[],
  author: string,
): TrackType[] {
  if (!author) return tracks;
  return tracks.filter((track) => track.author === author);
}

/**
 * Сортировка треков по дате выпуска
 */
export function sortTracksByDate(
  tracks: TrackType[],
  order: 'newest' | 'oldest' = 'newest',
): TrackType[] {
  return [...tracks].sort((a, b) => {
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    return order === 'newest' ? dateB - dateA : dateA - dateB;
  });
}

export { isApiError, isSelection };
