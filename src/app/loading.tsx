// app/loading.tsx
import styles from './page.module.css';

export default function Loading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          {/* Skeleton для Navbar */}
          <div className={styles.navSkeleton}></div>

          <div className={styles.centerblock}>
            {/* Skeleton для поиска */}
            <div className={styles.searchSkeleton}></div>

            {/* Skeleton для заголовка */}
            <div className={styles.titleSkeleton}></div>

            {/* Skeleton для фильтров */}
            <div className={styles.filterSkeleton}>
              <div className={styles.filterTitleSkeleton}></div>
              <div className={styles.filterButtonSkeleton}></div>
              <div className={styles.filterButtonSkeleton}></div>
              <div className={styles.filterButtonSkeleton}></div>
            </div>

            {/* Skeleton для списка треков */}
            <div className={styles.contentSkeleton}>
              <div className={styles.contentTitleSkeleton}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={styles.titleColSkeleton}></div>
                ))}
              </div>
              <div className={styles.playlistSkeleton}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={styles.trackSkeleton}>
                    <div className={styles.trackImageSkeleton}></div>
                    <div className={styles.trackTextSkeleton}></div>
                    <div className={styles.trackTextSkeleton}></div>
                    <div className={styles.trackTextSkeleton}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Skeleton для Sidebar */}
          <div className={styles.sidebarSkeleton}></div>
        </main>

        {/* Skeleton для Player */}
        <div className={styles.playerSkeleton}></div>
      </div>
    </div>
  );
}
