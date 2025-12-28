'use client';

import { ReactNode } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Player from '../Player/Player';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  pageTitle?: string;
}

export default function Layout({
  children,
  showSearch = false,
  pageTitle,
}: LayoutProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Navbar />

          <div className={styles.centerblock}>
            {/* Поиск, если нужен */}
            {showSearch && (
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
            )}

            {/* Заголовок страницы, если передан */}
            {pageTitle && (
              <h2 className={styles.centerblock__h2}>{pageTitle}</h2>
            )}

            {/* Контент страницы */}
            {children}
          </div>

          <Sidebar />
        </main>

        <Player />
        <footer className={styles.footer}></footer>
      </div>
    </div>
  );
}
