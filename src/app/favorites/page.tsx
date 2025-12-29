'use client';

import { useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import Track from '@/components/Track/Track';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { loadFavorites } from '@/store/features/favoritesSlice';
import styles from '../page.module.css';

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const {
    tracks: favoriteTracks,
    loading: isLoading,
    error,
  } = useAppSelector((state) => state.favorites);

  // Загружаем избранное при монтировании
  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  // Также обновляем при изменении localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      dispatch(loadFavorites());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [dispatch]);

  return (
    <Layout pageTitle="Мой плейлист">
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка избранного...</p>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3 className={styles.errorTitle}>Ошибка загрузки избранного</h3>
          <p className={styles.errorMessage}>{error}</p>
          <button
            className={styles.retryButton}
            onClick={() => dispatch(loadFavorites())}
          >
            Попробовать снова
          </button>
        </div>
      ) : favoriteTracks.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>💙</div>
          <h3 className={styles.emptyStateTitle}>
            У вас пока нет избранных треков
          </h3>
          <p className={styles.emptyStateText}>
            Добавляйте треки в избранное, нажимая на сердечко
          </p>
        </div>
      ) : (
        <div className={styles.centerblock__content}>
          <div className={styles.content__title}>
            <div className={`${styles.playlistTitle__col} ${styles.col01}`}>
              Трек
            </div>
            <div className={`${styles.playlistTitle__col} ${styles.col02}`}>
              Исполнитель
            </div>
            <div className={`${styles.playlistTitle__col} ${styles.col03}`}>
              Альбом
            </div>
            <div className={`${styles.playlistTitle__col} ${styles.col04}`}>
              <svg className={styles.playlistTitle__svg}>
                <use xlinkHref="/img/icon/sprite.svg#icon-watch"></use>
              </svg>
            </div>
          </div>

          <div className={styles.content__playlist}>
            {favoriteTracks.map((track) => (
              <Track
                key={track._id}
                _id={track._id}
                name={track.name}
                author={track.author}
                album={track.album}
                duration_in_seconds={track.duration_in_seconds}
                track_file={track.track_file}
                release_date={track.release_date}
                genre={track.genre}
                logo={track.logo}
                stared_user={track.stared_user}
              />
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
