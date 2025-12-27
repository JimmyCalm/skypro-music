import { api } from './axios';
import {
  SelectionType,
  TrackType,
  ApiError,
  isApiError,
  isSelection,
} from '@/sharedTypes/types';

async function handleApiError(error: unknown): Promise<ApiError> {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const err = error as {
      response?: {
        status?: number;
        data?: { message?: string; detail?: string } | number;
      };
    };
    if (err.response?.data) {
      const message =
        (typeof err.response.data === 'object' && err.response.data?.message) ||
        (typeof err.response.data === 'object' && err.response.data?.detail) ||
        `Ошибка ${err.response.status}`;
      return { message, status: err.response.status };
    }
  }

  if (typeof error === 'object' && error !== null && 'request' in error) {
    return { message: 'Ошибка сети. Проверьте подключение к интернету.' };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: 'Произошла ошибка' };
}

export async function getAllSelections(): Promise<SelectionType[] | ApiError> {
  try {
    const response = await api.get('/catalog/selection/all');
    return response.data as SelectionType[];
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function getSelectionById(
  id: number | string,
): Promise<SelectionType | ApiError> {
  try {
    const response = await api.get(`/catalog/selection/${id}/`);
    return response.data as SelectionType;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function searchSelections(
  query: string,
): Promise<SelectionType[] | ApiError> {
  try {
    const allSelections = await getAllSelections();

    if (isApiError(allSelections)) {
      return allSelections;
    }

    const filtered = allSelections.filter(
      (selection) =>
        selection.name.toLowerCase().includes(query.toLowerCase()) ||
        selection.author.toLowerCase().includes(query.toLowerCase()),
    );

    return filtered;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function getTracksFromSelection(
  selectionId: number,
): Promise<TrackType[] | ApiError> {
  try {
    const selection = await getSelectionById(selectionId);

    if (isApiError(selection)) {
      return selection;
    }

    if (
      selection.tracks &&
      Array.isArray(selection.tracks) &&
      selection.tracks.length > 0
    ) {
      return selection.tracks;
    }

    return [];
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

// Вспомогательные функции для работы с данными
export function extractUniqueGenres(tracks: TrackType[]): string[] {
  if (!Array.isArray(tracks)) {
    return [];
  }

  const genres = new Set<string>();

  tracks.forEach((track) => {
    if (Array.isArray(track.genre)) {
      track.genre.forEach((genre: string) => {
        if (typeof genre === 'string' && genre.trim()) {
          genres.add(genre);
        }
      });
    }
  });

  return Array.from(genres);
}

export function extractUniqueAuthors(tracks: TrackType[]): string[] {
  if (!Array.isArray(tracks)) {
    return [];
  }

  const authors = new Set<string>();

  tracks.forEach((track) => {
    if (
      track.author &&
      typeof track.author === 'string' &&
      track.author.trim() &&
      track.author !== '-'
    ) {
      authors.add(track.author);
    }
  });

  return Array.from(authors);
}

export function filterTracksByGenre(
  tracks: TrackType[],
  genre: string,
): TrackType[] {
  if (!genre || !Array.isArray(tracks)) return tracks;
  return tracks.filter(
    (track) => Array.isArray(track.genre) && track.genre.includes(genre),
  );
}

export function filterTracksByAuthor(
  tracks: TrackType[],
  author: string,
): TrackType[] {
  if (!author || !Array.isArray(tracks)) return tracks;
  return tracks.filter((track) => track.author === author);
}

export function sortTracksByDate(
  tracks: TrackType[],
  order: 'newest' | 'oldest' = 'newest',
): TrackType[] {
  if (!Array.isArray(tracks)) return [];

  return [...tracks].sort((a, b) => {
    const dateA = new Date(a.release_date).getTime();
    const dateB = new Date(b.release_date).getTime();
    return order === 'newest' ? dateB - dateA : dateA - dateB;
  });
}

export { isApiError, isSelection };
