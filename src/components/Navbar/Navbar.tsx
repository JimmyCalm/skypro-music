'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/features/authSlice';
import { clearFavorites } from '@/store/features/favoritesSlice';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearFavorites());
    router.push('/signin');
    closeMenu();
  };

  return (
    <nav className={`${styles.nav} ${isMenuOpen ? styles.nav_menu_open : ''}`}>
      <Link href="/" className={styles.nav__logo}>
        <Image
          src="/img/logo.png"
          alt="logo"
          width={113}
          height={17}
          className={styles.logo__image}
          priority
        />
      </Link>

      <div
        className={`${styles.nav__burger} ${isMenuOpen ? styles.nav__burger_open : ''}`}
        onClick={toggleMenu}
      >
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
      </div>

      <div className={styles.nav__menu}>
        <ul className={styles.menu__list}>
          <li className={styles.menu__item}>
            <Link href="/" className={styles.menu__link} onClick={closeMenu}>
              Главное
            </Link>
          </li>
          <li className={styles.menu__item}>
            <Link
              href="/favorites"
              className={styles.menu__link}
              onClick={closeMenu}
            >
              Мой плейлист
            </Link>
          </li>
          <li className={styles.menu__item}>
            {hasMounted && isAuthenticated ? (
              <button
                className={styles.menu__link}
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                Выйти
              </button>
            ) : (
              <Link
                href="/signin"
                className={styles.menu__link}
                onClick={closeMenu}
              >
                Войти
              </Link>
            )}
          </li>
        </ul>
      </div>

      {isMenuOpen && (
        <div className={styles.menu__overlay} onClick={closeMenu} />
      )}
    </nav>
  );
}
