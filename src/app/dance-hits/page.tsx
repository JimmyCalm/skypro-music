import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import Player from '@/components/Player/Player';
import Track from '@/components/Track/Track';
import styles from '../page.module.css';

export default function DanceHits() {
  const tracks = [
    {
      name: 'Guilt',
      author: 'Nero',
      album: 'Welcome Reality',
      duration: '4:44',
    },
    {
      name: 'Elektro',
      author: 'Dynoro, Outwork, Mr. Gee',
      album: 'Elektro',
      duration: '2:22',
    },
    {
      name: "I'm Fire",
      author: 'Ali Bakgor',
      album: "I'm Fire",
      duration: '2:22',
    },
    {
      name: 'Non Stop',
      author: 'Стоункат, Psychopath',
      album: 'Non Stop',
      duration: '4:12',
    },
    {
      name: 'Run Run',
      author: 'Jaded, Will Clarke, AR/CO',
      album: 'Run Run',
      duration: '2:54',
    },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Navbar />

          <div className={styles.centerblock}>
            <div className={styles.centerblock__search}>
              <svg className={styles.search__svg}>
                <use xlinkHref="/img/icon/sprite.svg#icon-search"></use>
              </svg>
              <input
                className={styles.search__text}
                type="search"
                placeholder="Поиск"
                name="search"
              />
            </div>
            <h2 className={styles.centerblock__h2}>100 танцевальных хитов</h2>
            <div className={styles.centerblock__filter}>
              <div className={styles.filter__title}>Искать по:</div>
              <div className={styles.filter__button}>исполнителю</div>
              <div className={styles.filter__button}>году выпуска</div>
              <div className={styles.filter__button}>жанру</div>
            </div>
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
                {tracks.map((track, index) => (
                  <Track
                    key={index}
                    name={track.name}
                    author={track.author}
                    album={track.album}
                    duration={track.duration}
                  />
                ))}
              </div>
            </div>
          </div>

          <Sidebar />
        </main>

        <Player />
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}
