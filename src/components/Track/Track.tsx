'use client';

import styles from './Track.module.css';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { playTrack } from '@/store/features/trackSlice';
import { TrackType } from '@/sharedTypes/types';

interface TrackProps {
  _id: number;
  name: string;
  author: string;
  album: string;
  duration_in_seconds: number;
  track_file: string;
  // Добавляем недостающие поля из data
  release_date?: string;
  genre?: string[];
  logo?: string | null;
  stared_user?: unknown[];
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

  const isCurrentTrack = currentTrack?._id === _id;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleClick = () => {
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

  return (
    <div className={styles.playlist__item} onClick={handleClick}>
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
            {/* Фиолетовая точка для текущего трека */}
            {isCurrentTrack && (
              <div
                className={`${styles.track__currentIndicator} ${isPlaying ? styles.pulsing : ''}`}
              ></div>
            )}
          </div>
          <div className={styles.track__titleText}>
            <a
              className={styles.track__titleLink}
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              {name}
            </a>
          </div>
        </div>
        <div className={styles.track__author}>
          <a
            className={styles.track__authorLink}
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            {author}
          </a>
        </div>
        <div className={styles.track__album}>
          <a
            className={styles.track__albumLink}
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            {album}
          </a>
        </div>
        <div className={styles.track__time}>
          <svg className={styles.track__timeSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={styles.track__timeText}>
            {formatTime(duration_in_seconds)}
          </span>
        </div>
      </div>
    </div>
  );
}
