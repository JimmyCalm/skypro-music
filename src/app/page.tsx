// app/page.tsx
import { Suspense } from 'react';
import { getAllTracks, isApiError } from '@/api/tracks';
import { TrackType } from '@/sharedTypes/types';
import { extractUniqueGenres, extractUniqueAuthors } from '@/api/selections';
import TracksContent from './TracksContent';
import Loading from './loading';
import { getFallbackTracks } from '@/utils/fallbackData';

async function fetchTracks(): Promise<TrackType[]> {
  try {
    const result = await getAllTracks();

    if (isApiError(result)) {
      console.log('Ошибка загрузки треков, используем fallback');
      return getFallbackTracks();
    }

    // Если API вернул пустой массив, используем fallback
    if (result.length === 0) {
      console.log('API вернул пустой список треков, используем fallback');
      return getFallbackTracks();
    }

    return result;
  } catch (error) {
    console.error('Error in fetchTracks, using fallback:', error);
    return getFallbackTracks();
  }
}

export default async function Home() {
  const tracks = await fetchTracks();

  const genres = extractUniqueGenres(tracks);
  const authors = extractUniqueAuthors(tracks);
  const years = ['по умолчанию', 'сначала новые', 'сначала старые'];

  return (
    <Suspense fallback={<Loading pageTitle="Треки" />}>
      <TracksContent
        initialTracks={tracks}
        filterData={{ genres, authors, years }}
        pageTitle="Треки"
      />
    </Suspense>
  );
}
