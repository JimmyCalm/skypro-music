import { Suspense } from 'react';
import { getSelectionById, getAllTracks, isApiError } from '@/api';
import { TrackType } from '@/sharedTypes/types';
import SelectionContent from '@/app/SelectionContent';
import Loading from '@/app/loading';
import ErrorComponent from '@/app/error';

// ID подборки "Инди заряд" - нужно узнать из API
const SELECTION_ID = 3; // Замените на реальный ID

async function fetchSelectionTracks(): Promise<TrackType[]> {
  try {
    // Вариант 1: Получаем подборку по ID
    const selection = await getSelectionById(SELECTION_ID);

    if (isApiError(selection)) {
      console.error('Selection error:', selection.message);

      // Вариант 2: Если подборка не найдена, используем фильтрацию
      const allTracks = await getAllTracks();
      if (isApiError(allTracks)) {
        throw new Error(allTracks.message);
      }

      // Фильтруем треки по жанру "Инди" или другим критериям
      return allTracks.filter((track) =>
        track.genre.some((g) => g.toLowerCase().includes('инди')),
      );
    }

    // Если подборка содержит треки
    if (selection.tracks && Array.isArray(selection.tracks)) {
      return selection.tracks;
    }

    // Если треков нет, возвращаем пустой массив
    return [];
  } catch (error) {
    console.error('Error fetching selection:', error);
    throw error;
  }
}

export default async function IndieChargePage() {
  let tracks: TrackType[] = [];
  let error: string | null = null;

  try {
    tracks = await fetchSelectionTracks();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Ошибка загрузки подборки';
  }

  if (error) {
    // Можно использовать ErrorComponent или свой fallback
    return <div>Ошибка: {error}</div>;
  }

  // Получаем данные для фильтров
  const genres = [...new Set(tracks.flatMap((t) => t.genre))].filter(Boolean);
  const authors = [...new Set(tracks.map((t) => t.author))].filter(Boolean);
  const years = ['по умолчанию', 'сначала новые', 'сначала старые'];

  return (
    <Suspense fallback={<Loading />}>
      <SelectionContent
        initialTracks={tracks}
        filterData={{ genres, authors, years }}
        pageTitle="Инди заряд"
      />
    </Suspense>
  );
}
