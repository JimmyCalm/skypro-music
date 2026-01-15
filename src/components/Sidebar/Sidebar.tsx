'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/features/authSlice';
import { clearFavorites } from '@/store/features/favoritesSlice';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearFavorites());
    router.push('/signin');
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebar__personal}>
        <p className={styles.sidebar__personalName}>
          {user?.username || 'Гость'}
        </p>
        <div
          className={styles.sidebar__icon}
          onClick={handleLogout}
          style={{ cursor: 'pointer' }}
        >
          <svg width="43" height="43">
            <use xlinkHref="/img/icon/sprite.svg#logout"></use>
          </svg>
        </div>
      </div>
      <div className={styles.sidebar__block}>
        <div className={styles.sidebar__list}>
          <div className={styles.sidebar__item}>
            <Link className={styles.sidebar__link} href="/playlist-day">
              <Image
                className={styles.sidebar__img}
                src="/img/playlist01.png"
                alt="Плейлист дня"
                width={250}
                height={150}
              />
            </Link>
          </div>
          <div className={styles.sidebar__item}>
            <Link className={styles.sidebar__link} href="/dance-hits">
              <Image
                className={styles.sidebar__img}
                src="/img/playlist02.png"
                alt="100 танцевальных хитов"
                width={250}
                height={150}
              />
            </Link>
          </div>
          <div className={styles.sidebar__item}>
            <Link className={styles.sidebar__link} href="/indie-charge">
              <Image
                className={styles.sidebar__img}
                src="/img/playlist03.png"
                alt="Инди заряд"
                width={250}
                height={150}
              />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
