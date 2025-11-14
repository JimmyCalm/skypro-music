import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import Player from '@/components/Player/Player';
import Track from '@/components/Track/Track';
import styles from '../page.module.css';

export default function FavoritesPage() {
  const favoriteTracks = [
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
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Navbar />

          <div className={styles.centerblock}>
            <h2 className={styles.centerblock__h2}>Мой плейлист</h2>
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
                {favoriteTracks.map((track, index) => (
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
