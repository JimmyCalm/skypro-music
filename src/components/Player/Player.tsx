'use client';

import { useRef, useEffect } from 'react';
import styles from './Player.module.css';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setIsPlaying, togglePlay } from '@/store/features/trackSlice';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();
  const { currentTrack, isPlaying } = useAppSelector((state) => state.tracks);

  // Управление воспроизведением при изменении isPlaying
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Обновление источника аудио при смене трека
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    audioRef.current.src = currentTrack.track_file;

    // Если трек сменился, начинаем воспроизведение
    if (isPlaying) {
      audioRef.current
        .play()
        .catch((e) => console.error('Error playing audio:', e));
    }
  }, [currentTrack]);

  const handlePlayPause = () => {
    dispatch(togglePlay());
  };

  const handleNotImplemented = () => {
    alert('Еще не реализовано');
  };

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
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
