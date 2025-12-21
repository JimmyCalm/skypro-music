// app/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { getAllTracks, isApiError } from '@/api/tracks';
import { TrackType } from '@/sharedTypes/types';
import { extractUniqueGenres, extractUniqueAuthors } from '@/api/selections';
import TracksContent from './TracksContent';
import Loading from './loading';
import styles from './page.module.css';

// Серверный компонент для загрузки данных
async function fetchTracks(): Promise<TrackType[]> {
  try {
    console.log('Fetching tracks from API...');
    const result = await getAllTracks();

    if (isApiError(result)) {
      console.error('API error:', result.message);
      throw new Error(result.message);
    }

    // Теперь result уже массив, проверяем это
    if (!Array.isArray(result)) {
      console.error('API response is not an array:', result);
      throw new Error('Некорректный формат данных от сервера');
    }

    console.log(`Successfully fetched ${result.length} tracks`);
    return result;
  } catch (error) {
    console.error('Error in fetchTracks:', error);
    throw error;
  }
}

export default async function Home() {
  try {
    const tracks = await fetchTracks();

    // Получаем данные для фильтров
    const genres = extractUniqueGenres(tracks);
    const authors = extractUniqueAuthors(tracks);
    const years = ['по умолчанию', 'сначала новые', 'сначала старые'];

    return (
      <Suspense fallback={<Loading />}>
        <TracksContent
          initialTracks={tracks}
          filterData={{ genres, authors, years }}
          pageTitle="Треки"
        />
      </Suspense>
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Неизвестная ошибка при загрузке треков';

    return (
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <main className={styles.main}>
            <div className={styles.centerblock}>
              <div className={styles.errorContent}>
                <div className={styles.errorIcon}>
                  {/* <svg
                    width="120"
                    height="120"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <path
                      d="M50 0C22.4 0 0 22.4 0 50C0 77.6 22.4 100 50 100C77.6 100 100 77.6 100 50C100 22.4 77.6 0 50 0ZM50 90C27.9 90 10 72.1 10 50C10 27.9 27.9 10 50 10C72.1 10 90 27.9 90 50C90 72.1 72.1 90 50 90Z"
                      fill="#696969"
                    />
                    <path
                      d="M65.4 34.6C64.6 33.8 63.4 33.8 62.6 34.6L50 47.2L37.4 34.6C36.6 33.8 35.4 33.8 34.6 34.6C33.8 35.4 33.8 36.6 34.6 37.4L47.2 50L34.6 62.6C33.8 63.4 33.8 64.6 34.6 65.4C35 65.8 35.6 66 36 66C36.4 66 37 65.8 37.4 65.4L50 52.8L62.6 65.4C63 65.8 63.6 66 64 66C64.4 66 65 65.8 65.4 65.4C66.2 64.6 66.2 63.4 65.4 62.6L52.8 50L65.4 37.4C66.2 36.6 66.2 35.4 65.4 34.6Z"
                      fill="#696969"
                    />
                  </svg> */}
                </div>
                <h1 className={styles.errorTitle}>Ошибка загрузки данных</h1>
                <p className={styles.errorMessage}>{errorMessage}</p>
                <div className={styles.errorActions}>
                  <Link href="/" className={styles.errorButton}>
                    Вернуться на главную
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
