// components/Track/Track.tsx
'use client';

import { useState } from 'react';
import styles from './Track.module.css';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { playTrack } from '@/store/features/trackSlice';
import { TrackType } from '@/sharedTypes/types';
import { addToFavorites, removeFromFavorites, isApiError } from '@/api';

interface TrackProps extends TrackType {
  // Все поля уже определены в TrackType
}

export default function Track({
  _id,
  name,
  author,
  album,
  duration_in_seconds,
  track_file,
  release_date = '',
  genre = [],
  logo = null,
  stared_user = [],
}: TrackProps) {
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);
  const [isFavorite, setIsFavorite] = useState(
    Array.isArray(stared_user) && stared_user.length > 0,
  );
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentTrack = currentTrack?._id === _id;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === undefined) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayClick = () => {
    const trackData: TrackType = {
      _id,
      name,
      author,
      album,
      duration_in_seconds,
      track_file,
      release_date: release_date || '',
      genre,
      logo,
      stared_user,
    };
    dispatch(playTrack(trackData));
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем запуск трека
    setIsLoading(true);

    try {
      if (isFavorite) {
        // Удаляем из избранного
        const result = await removeFromFavorites(_id);
        if (!isApiError(result)) {
          setIsFavorite(false);
        }
      } else {
        // Добавляем в избранное
        const result = await addToFavorites(_id);
        if (!isApiError(result)) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.getFullYear();
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`${styles.playlist__item} ${isCurrentTrack ? styles.currentTrack : ''}`}
      onClick={handlePlayClick}
      role="button"
      tabIndex={0}
      aria-label={`Воспроизвести трек: ${name} - ${author}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePlayClick();
        }
      }}
    >
      <div className={styles.playlist__track}>
        {/* Колонка 1: Название трека */}
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
            {/* Индикатор текущего трека */}
            {isCurrentTrack && (
              <div
                className={`${styles.track__currentIndicator} ${isPlaying ? styles.pulsing : ''}`}
              ></div>
            )}
          </div>
          <div className={styles.track__titleText}>
            <span className={styles.track__titleLink}>{name}</span>
            <div className={styles.track__meta}>
              {genre.length > 0 && (
                <span className={styles.track__genre}>{genre.join(', ')}</span>
              )}
              {release_date && (
                <span className={styles.track__year}>
                  {formatReleaseDate(release_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Колонка 2: Исполнитель */}
        <div className={styles.track__author}>
          <span className={styles.track__authorLink}>{author}</span>
        </div>

        {/* Колонка 3: Альбом */}
        <div className={styles.track__album}>
          <span className={styles.track__albumLink}>{album}</span>
        </div>

        {/* Колонка 4: Длительность и избранное */}
        <div className={styles.track__time}>
          <button
            className={`${styles.track__favoriteBtn} ${isFavorite ? styles.active : ''}`}
            onClick={handleFavoriteClick}
            disabled={isLoading}
            aria-label={
              isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
            }
          >
            <svg className={styles.track__favoriteSvg}>
              <use
                xlinkHref={
                  isFavorite
                    ? '/img/icon/sprite.svg#icon-like-filled'
                    : '/img/icon/sprite.svg#icon-like'
                }
              ></use>
            </svg>
            {isLoading && <span className={styles.favoriteLoading}></span>}
          </button>
          <span className={styles.track__timeText}>
            {formatTime(duration_in_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
