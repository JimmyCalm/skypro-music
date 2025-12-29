'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './Player.module.css';
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
} from '@/store/features/trackSlice';
import { loadFavorites } from '@/store/features/favoritesSlice';
import { useRouter } from 'next/navigation';
import { addToFavorites, removeFromFavorites, isApiError } from '@/api';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const {
    currentTrack,
    isPlaying,
    isShuffled,
    isLoop,
    volume,
    currentTime,
    duration,
  } = useAppSelector((state) => state.tracks);

  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Инициализация состояния избранного для текущего трека
  useEffect(() => {
    if (currentTrack && Array.isArray(currentTrack.stared_user)) {
      const staredUsers = currentTrack.stared_user;
      if (user && user._id) {
        const userInFavorites = staredUsers.some((userItem: unknown) => {
          if (typeof userItem === 'object' && userItem !== null) {
            const userObj = userItem as Record<string, unknown>;
            return '_id' in userObj && userObj._id === user._id;
          }
          return userItem === user._id;
        });
        setIsFavorite(userInFavorites);
      } else {
        setIsFavorite(staredUsers.length > 0);
      }
    } else {
      setIsFavorite(false);
    }
  }, [currentTrack, user]);

  // Инициализация громкости
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, []);

  // Управление громкостью
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Управление воспроизведением при изменении isPlaying
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      if (isReadyToPlay) {
        audioRef.current.play().catch((e) => {
          console.error('Error playing audio:', e);
          dispatch(setIsPlaying(false));
        });
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isReadyToPlay, dispatch]);

  // Обновление источника аудио при смене трека
  useEffect(() => {
    if (!audioRef.current || !currentTrack) {
      setIsReadyToPlay(false);
      return;
    }

    const audio = audioRef.current;

    const handleCanPlay = () => {
      setIsReadyToPlay(true);
      dispatch(setDuration(audio.duration));

      if (isPlaying) {
        audio.play().catch((e) => {
          console.error('Error playing audio:', e);
          dispatch(setIsPlaying(false));
        });
      }
    };

    const handleTimeUpdate = () => {
      if (!isDragging) {
        dispatch(setCurrentTime(audio.currentTime));
      }
    };

    const handleEnded = () => {
      if (isLoop) {
        // Сбрасываем время и начинаем сначала
        audio.currentTime = 0;
        dispatch(resetCurrentTime());
        audio.play().catch((e) => {
          console.error('Error playing audio after loop:', e);
        });
      } else {
        dispatch(nextTrack());
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        const audioDuration = audioRef.current.duration;
        if (!isNaN(audioDuration) && isFinite(audioDuration)) {
          dispatch(setDuration(audioDuration));
        }
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio loading error:', e);
      dispatch(setIsPlaying(false));
      setIsReadyToPlay(false);
    };

    // Удаляем предыдущие слушатели
    audio.removeEventListener('canplay', handleCanPlay);
    audio.removeEventListener('timeupdate', handleTimeUpdate);
    audio.removeEventListener('ended', handleEnded);
    audio.removeEventListener('error', handleError);

    // Добавляем слушатели
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // Устанавливаем новый источник
    audio.src = currentTrack.track_file;
    audio.loop = false;
    audio.load();

    // Функция очистки
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentTrack, dispatch, isDragging, isPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.loop = isLoop;
  }, [isLoop]);

  const handlePlayPause = () => {
    dispatch(togglePlay());
  };

  const handleNext = () => {
    dispatch(nextTrack());
  };

  const handlePrev = () => {
    dispatch(prevTrack());
  };

  const handleShuffle = () => {
    dispatch(toggleShuffle());
  };

  const handleLoop = () => {
    dispatch(toggleLoop());
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setVolume(newVolume));
  };

  const handleFavoriteClick = async () => {
    if (!currentTrack) return;

    // Проверяем авторизацию
    if (!isAuthenticated) {
      router.push('/signin');
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Удаляем из избранного
        const result = await removeFromFavorites(currentTrack._id);
        if (!isApiError(result)) {
          setIsFavorite(false);
          // Обновляем stared_user в Redux для текущего трека
          if (currentTrack) {
            const newStaredUser = currentTrack.stared_user.filter(
              (userItem) => {
                if (typeof userItem === 'object' && userItem !== null) {
                  const userObj = userItem as Record<string, unknown>;
                  return !('_id' in userObj && userObj._id === user?._id);
                }
                return userItem !== user?._id;
              },
            );
            dispatch(
              updateCurrentTrackStaredUser({ stared_user: newStaredUser }),
            );
          }
          console.log(`Трек ${currentTrack.name} удален из избранного`);
          dispatch(loadFavorites());
        } else {
          console.error('Ошибка удаления из избранного:', result.message);
        }
      } else {
        // Добавляем в избранное
        const result = await addToFavorites(currentTrack._id);
        if (!isApiError(result)) {
          setIsFavorite(true);
          // Обновляем stared_user в Redux для текущего трека
          if (currentTrack && user && user._id) {
            const newStaredUser = [...currentTrack.stared_user];
            if (
              !newStaredUser.some((userItem) => {
                if (typeof userItem === 'object' && userItem !== null) {
                  const userObj = userItem as Record<string, unknown>;
                  return '_id' in userObj && userObj._id === user._id;
                }
                return userItem === user._id;
              })
            ) {
              newStaredUser.push(user._id);
            }
            dispatch(
              updateCurrentTrackStaredUser({ stared_user: newStaredUser }),
            );
          }
          console.log(`Трек ${currentTrack.name} добавлен в избранное`);
          dispatch(loadFavorites());
        } else {
          console.error('Ошибка добавления в избранное:', result.message);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNewTime = (clientX: number) => {
    if (!progressContainerRef.current) return 0;
    const container = progressContainerRef.current;
    const rect = container.getBoundingClientRect();
    const clickPosition = clientX - rect.left;
    const containerWidth = rect.width;
    const percentage = Math.min(Math.max(clickPosition / containerWidth, 0), 1);
    return percentage * duration;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;

    const newTime = calculateNewTime(e.clientX);
    audioRef.current.currentTime = newTime;
    dispatch(setCurrentTime(newTime));
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !audioRef.current || duration === 0) return;

      const newTime = calculateNewTime(e.clientX);
      audioRef.current.currentTime = newTime;
      dispatch(setCurrentTime(newTime));
    },
    [isDragging, duration, dispatch],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Форматирование времени
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds === undefined)
      return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Рассчитываем процент прогресса
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <audio ref={audioRef} />

      <div className={styles.bar}>
        <div className={styles.bar__content}>
          {/* Время трека справа сверху */}
          <div className={styles.timeDisplay}>
            <span className={styles.currentTime}>
              {formatTime(currentTime)}
            </span>
            <span className={styles.timeSeparator}> / </span>
            <span className={styles.totalTime}>{formatTime(duration)}</span>
          </div>

          {/* Полоса прогресса трека - кликабельная */}
          <div
            className={styles.progressContainer}
            ref={progressContainerRef}
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className={styles.progressBar}
              style={{ width: `${progressPercent}%` }}
            >
              <div className={styles.progressThumb}></div>
            </div>
          </div>

          <div className={styles.bar__playerBlock}>
            <div className={styles.bar__player}>
              <div className={styles.player__controls}>
                <div className={styles.player__btnPrev} onClick={handlePrev}>
                  <svg className={styles.player__btnPrevSvg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-prev"></use>
                  </svg>
                </div>
                <div
                  className={`${styles.player__btnPlay} ${styles.btn}`}
                  onClick={handlePlayPause}
                >
                  <svg className={styles.player__btnPlaySvg}>
                    <use
                      xlinkHref={
                        isPlaying
                          ? '/img/icon/sprite.svg#icon-pause'
                          : '/img/icon/sprite.svg#icon-play'
                      }
                    ></use>
                  </svg>
                </div>
                <div className={styles.player__btnNext} onClick={handleNext}>
                  <svg className={styles.player__btnNextSvg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
                  </svg>
                </div>
                <div
                  className={`${styles.player__btnRepeat} ${styles.btnIcon} ${isLoop ? styles.active : ''}`}
                  onClick={handleLoop}
                >
                  <svg className={styles.player__btnRepeatSvg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
                  </svg>
                </div>
                <div
                  className={`${styles.player__btnShuffle} ${styles.btnIcon} ${isShuffled ? styles.active : ''}`}
                  onClick={handleShuffle}
                >
                  <svg className={styles.player__btnShuffleSvg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-shuffle"></use>
                  </svg>
                </div>
              </div>

              <div className={styles.player__trackPlay}>
                <div className={styles.trackPlay__contain}>
                  <div className={styles.trackPlay__image}>
                    <svg className={styles.trackPlay__svg}>
                      <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
                    </svg>
                  </div>
                  <div className={styles.trackPlay__author}>
                    <a
                      className={styles.trackPlay__authorLink}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                    >
                      {currentTrack?.name || 'Выберите трек'}
                    </a>
                  </div>
                  <div className={styles.trackPlay__album}>
                    <a
                      className={styles.trackPlay__albumLink}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                    >
                      {currentTrack?.author || ''}
                    </a>
                  </div>
                </div>

                <div className={styles.trackPlay__likeDis}>
                  {/* Кнопка лайка (добавление в избранное) */}
                  <div
                    className={`${styles.trackPlay__like} ${styles.btnIcon} ${isFavorite ? styles.active : ''}`}
                    onClick={handleFavoriteClick}
                    title={
                      isFavorite
                        ? 'Удалить из избранного'
                        : 'Добавить в избранное'
                    }
                  >
                    <svg className={styles.trackPlay__likeSvg}>
                      <use
                        xlinkHref={
                          isFavorite
                            ? '/img/icon/sprite.svg#icon-like-active'
                            : '/img/icon/sprite.svg#icon-like'
                        }
                      ></use>
                    </svg>
                    {isLoading && <div className={styles.loadingSpinner}></div>}
                  </div>

                  {/* Кнопка дизлайка (нереализованная функциональность) */}
                  <div
                    className={`${styles.trackPlay__dislike} ${styles.btnIcon}`}
                    onClick={() => alert('Функция пока не реализована')}
                    title="Не нравится"
                  >
                    <svg className={styles.trackPlay__dislikeSvg}>
                      <use xlinkHref="/img/icon/sprite.svg#icon-dislike"></use>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.bar__volumeBlock}>
              <div className={styles.volume__content}>
                <div className={styles.volume__image}>
                  <svg className={styles.volume__svg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-volume"></use>
                  </svg>
                </div>
                <div className={`${styles.volume__progress} ${styles.btn}`}>
                  <input
                    className={`${styles.volume__progressLine} ${styles.btn}`}
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
