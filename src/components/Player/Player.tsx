// src/components/Player/Player.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import styles from './Player.module.css';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setIsPlaying, togglePlay } from '@/store/features/trackSlice';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  // Управление воспроизведением при изменении isPlaying
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      // Воспроизводим только если аудио готово
      if (isReadyToPlay) {
        audioRef.current.play().catch((e) => {
          console.error('Error playing audio:', e);
          // Если воспроизведение не удалось, сбрасываем состояние
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

    // Сбрасываем флаг готовности
    setIsReadyToPlay(false);

    // Настраиваем слушатель события готовности аудио
    const handleCanPlay = () => {
      setIsReadyToPlay(true);

      // Автовоспроизведение только если isPlaying равно true
      if (isPlaying) {
        audio.play().catch((e) => {
          console.error('Error playing audio:', e);
          dispatch(setIsPlaying(false));
        });
      }
    };

    const handleError = (e: Event) => {
      console.error('Audio loading error:', e);
      dispatch(setIsPlaying(false));
      setIsReadyToPlay(false);
    };

    // Удаляем предыдущие слушатели событий
    audio.removeEventListener('canplay', handleCanPlay);
    audio.removeEventListener('error', handleError);

    // Добавляем слушатели событий
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Устанавливаем новый источник
    audio.src = currentTrack.track_file;
    // Принудительно начинаем загрузку
    audio.load();

    // Функция очистки
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, dispatch]); // Убрали isPlaying из зависимостей

  const handlePlayPause = () => {
    dispatch(togglePlay());
  };

  const handleNotImplemented = () => {
    alert('Еще не реализовано');
  };

  return (
    <>
      {/* Скрытый аудио элемент */}
      <audio ref={audioRef} />

      <div className={styles.bar}>
        <div className={styles.bar__content}>
          <div className={styles.bar__playerProgress}></div>
          <div className={styles.bar__playerBlock}>
            <div className={styles.bar__player}>
              <div className={styles.player__controls}>
                <div
                  className={styles.player__btnPrev}
                  onClick={handleNotImplemented}
                >
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
                <div
                  className={styles.player__btnNext}
                  onClick={handleNotImplemented}
                >
                  <svg className={styles.player__btnNextSvg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-next"></use>
                  </svg>
                </div>
                <div
                  className={`${styles.player__btnRepeat} ${styles.btnIcon}`}
                  onClick={handleNotImplemented}
                >
                  <svg className={styles.player__btnRepeatSvg}>
                    <use xlinkHref="/img/icon/sprite.svg#icon-repeat"></use>
                  </svg>
                </div>
                <div
                  className={`${styles.player__btnShuffle} ${styles.btnIcon}`}
                  onClick={handleNotImplemented}
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
                  <div
                    className={`${styles.player__btnShuffle} ${styles.btnIcon}`}
                  >
                    <svg className={styles.trackPlay__likeSvg}>
                      <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
                    </svg>
                  </div>
                  <div
                    className={`${styles.trackPlay__dislike} ${styles.btnIcon}`}
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
                    name="range"
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
