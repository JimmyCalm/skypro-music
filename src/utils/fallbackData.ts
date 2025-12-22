// utils/fallbackData.ts
import { TrackType } from '@/sharedTypes/types';

// Импортируем данные из data.ts
import { data as staticData } from '@/data';

// Функция для получения fallback данных
export function getFallbackTracks(): TrackType[] {
  return [...staticData];
}

// Функция для фильтрации fallback данных по подборкам
export function getFallbackTracksBySelection(
  selectionName: string,
): TrackType[] {
  switch (selectionName.toLowerCase()) {
    case 'танцевальных хитов':
    case 'dance hits':
    case 'dance':
      return staticData.filter((track) =>
        track.genre.some(
          (g) =>
            g.toLowerCase().includes('танцевальн') ||
            g.toLowerCase().includes('dance'),
        ),
      );

    case 'инди заряд':
    case 'indie':
    case 'indie-charge':
      return staticData.filter(
        (track) =>
          track.genre.some(
            (g) =>
              g.toLowerCase().includes('инди') ||
              g.toLowerCase().includes('indie'),
          ) ||
          track.name.toLowerCase().includes('indie') ||
          track.author.toLowerCase().includes('indie'),
      );

    case 'плейлист дня':
    case 'playlist day':
      // Возвращаем случайные 10 треков для плейлиста дня
      const shuffled = [...staticData].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 10);

    default:
      return staticData;
  }
}
