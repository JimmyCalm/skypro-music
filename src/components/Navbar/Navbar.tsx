'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`${styles.nav} ${isMenuOpen ? styles.nav_menu_open : ''}`}>
      <div className={styles.nav__logo}>
        <Image
          src="/img/logo.png"
          alt="logo"
          width={113}
          height={17}
          className={styles.logo__image}
          priority
        />
      </div>

      {/* Бургер меню - всегда на своем месте */}
      <div
        className={`${styles.nav__burger} ${isMenuOpen ? styles.nav__burger_open : ''}`}
        onClick={toggleMenu}
      >
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
        <span className={styles.burger__line}></span>
      </div>

      {/* Основное меню - скрывается/показывается */}
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
            <Link
              href="/signin"
              className={styles.menu__link}
              onClick={closeMenu}
            >
              Войти
            </Link>
          </li>
        </ul>
      </div>

      {/* Оверлей для закрытия меню по клику вне его (только на мобильных) */}
      {isMenuOpen && (
        <div className={styles.menu__overlay} onClick={closeMenu} />
      )}
    </nav>
  );
}
