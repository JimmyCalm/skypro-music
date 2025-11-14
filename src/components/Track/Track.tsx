import styles from './Track.module.css';

interface TrackProps {
  name: string;
  author: string;
  album: string;
  duration: string;
}

export default function Track({ name, author, album, duration }: TrackProps) {
  return (
    <div className={styles.playlist__item}>
      <div className={styles.playlist__track}>
        <div className={styles.track__title}>
          <div className={styles.track__titleImage}>
            <svg className={styles.track__titleSvg}>
              <use xlinkHref="/img/icon/sprite.svg#icon-note"></use>
            </svg>
          </div>
          <div className={styles.track__titleText}>
            <a className={styles.track__titleLink} href="">
              {name} <span className={styles.track__titleSpan}></span>
            </a>
          </div>
        </div>
        <div className={styles.track__author}>
          <a className={styles.track__authorLink} href="">
            {author}
          </a>
        </div>
        <div className={styles.track__album}>
          <a className={styles.track__albumLink} href="">
            {album}
          </a>
        </div>
        <div className={styles.track__time}>
          <svg className={styles.track__timeSvg}>
            <use xlinkHref="/img/icon/sprite.svg#icon-like"></use>
          </svg>
          <span className={styles.track__timeText}>{duration}</span>
        </div>
      </div>
    </div>
  );
}
