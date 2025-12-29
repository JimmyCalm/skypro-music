'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './Track.module.css';
import { useAppDispatch, useAppSelector } from '@/store/store';
import {
  setIsPlaying,
  togglePlay,
  toggleShuffle,
  toggleLoop,
  setVolume,
  setCurrentTime,
  setDuration,
  nextTrack,
  prevTrack,
  resetCurrentTime,
  updateCurrentTrackStaredUser,
  playTrack,
} from '@/store/features/trackSlice';
import {
  addToFavoritesRedux,
  loadFavorites,
  removeFromFavoritesRedux,
} from '@/store/features/favoritesSlice';
import { TrackType } from '@/sharedTypes/types';
import { addToFavorites, removeFromFavorites, isApiError } from '@/api';

interface TrackProps extends TrackType {}

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
  const router = useRouter();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { tracks: favoriteTracks } = useAppSelector((state) => state.favorites);

  // Проверяем, есть ли трек в избранном
  const isTrackInFavorites = favoriteTracks.some((track) => track._id === _id);
  const [isFavorite, setIsFavorite] = useState(
    isTrackInFavorites ||
      (user &&
        stared_user.some((userItem: unknown) => {
          if (typeof userItem === 'object' && userItem !== null) {
            const userObj = userItem as Record<string, unknown>;
            return '_id' in userObj && userObj._id === user._id;
          }
          return userItem === user._id;
        })),
  );
  const [isLoading, setIsLoading] = useState(false);

  // Синхронизируем состояние избранного при изменении favoriteTracks или stared_user
  useEffect(() => {
    const isInFavorites = favoriteTracks.some((track) => track._id === _id);
    const isInStaredUser =
      user &&
      stared_user.some((userItem: unknown) => {
        if (typeof userItem === 'object' && userItem !== null) {
          const userObj = userItem as Record<string, unknown>;
          return '_id' in userObj && userObj._id === user._id;
        }
        return userItem === user._id;
      });
    setIsFavorite(isInFavorites || !!isInStaredUser);
  }, [isTrackInFavorites, stared_user, user, _id]);

  const isCurrentTrack = currentTrack?._id === _id;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === undefined || seconds === null)
      return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    // Не запускаем воспроизведение если кликнули на кнопку избранного
    if ((e.target as HTMLElement).closest(`.${styles.track__favoriteBtn}`)) {
      return;
    }

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
    e.stopPropagation();

    // Проверяем авторизацию
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);

    try {
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

      if (isFavorite) {
        // Удаляем из избранного
        const result = await removeFromFavorites(_id);
        if (!isApiError(result)) {
          setIsFavorite(false);

          const updatedStaredUser = stared_user.filter((userItem) => {
            if (typeof userItem === 'object' && userItem !== null) {
              const userObj = userItem as Record<string, unknown>;
              return !('_id' in userObj && user && userObj._id === user._id);
            }
            return user && userItem !== user._id;
          });

          // Обновляем Redux store немедленно
          dispatch(removeFromFavoritesRedux(_id));

          // Если это текущий трек, обновляем в Redux
          if (currentTrack && currentTrack._id === _id) {
            dispatch(
              updateCurrentTrackStaredUser({
                stared_user: updatedStaredUser,
              }),
            );
          }

          console.log(`Трек ${name} удален из избранного`);
          // Обновляем список избранного
          dispatch(loadFavorites());
        } else {
          console.error('Ошибка удаления из избранного:', result.message);
          alert(`Ошибка: ${result.message}`);
        }
      } else {
        // Добавляем в избранное
        const result = await addToFavorites(_id);
        if (!isApiError(result)) {
          setIsFavorite(true);

          const updatedStaredUser = [...stared_user];
          if (
            user &&
            user._id &&
            !updatedStaredUser.some((userItem) => {
              if (typeof userItem === 'object' && userItem !== null) {
                const userObj = userItem as Record<string, unknown>;
                return '_id' in userObj && userObj._id === user._id;
              }
              return userItem === user._id;
            })
          ) {
            updatedStaredUser.push(user._id);
          }

          // Обновляем Redux store немедленно
          dispatch(addToFavoritesRedux(trackData));

          // Если это текущий трек, обновляем в Redux
          if (currentTrack && currentTrack._id === _id) {
            dispatch(
              updateCurrentTrackStaredUser({
                stared_user: updatedStaredUser,
              }),
            );
          }

          console.log(`Трек ${name} добавлен в избранное`);
          // Обновляем список избранного
          dispatch(loadFavorites());
        } else {
          console.error('Ошибка добавления в избранное:', result.message);
          alert(`Ошибка: ${result.message}`);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      alert('Произошла ошибка при обновлении избранного');
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
        }
      }}
    >
      <div className={styles.playlist__track}>
        {/* Колонка 1: Название трека и кнопка избранного */}
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
            {isCurrentTrack && (
              <div
                className={`${styles.track__currentIndicator} ${isPlaying ? styles.pulsing : ''}`}
              ></div>
            )}
          </div>
          <div className={styles.track__titleText}>
            <span className={styles.track__titleLink}>{name}</span>
            <div className={styles.track__meta}>
              {genre && genre.length > 0 && (
                <span className={styles.track__genre}>
                  {Array.isArray(genre) ? genre.join(', ') : genre}
                </span>
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
          <span className={styles.track__authorLink}>
            {author || 'Неизвестен'}
          </span>
        </div>

        {/* Колонка 3: Альбом */}
        <div className={styles.track__album}>
          <span className={styles.track__albumLink}>
            {album || 'Без альбома'}
          </span>
        </div>

        {/* Кнопка добавления в избранное */}
        <button
          className={`${styles.track__favoriteBtn} ${isFavorite ? styles.active : ''}`}
          onClick={handleFavoriteClick}
          disabled={isLoading}
          aria-label={
            isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'
          }
          title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
        >
          <svg className={styles.track__favoriteSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          {isLoading && <div className={styles.loadingSpinner}></div>}
        </button>

        {/* Колонка 4: Длительность */}
        <div className={styles.track__time}>
          <span className={styles.track__timeText}>
            {formatTime(duration_in_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
