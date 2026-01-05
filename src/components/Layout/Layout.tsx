'use client';

import { ReactNode } from 'react';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';
import Player from '../Player/Player';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  pageTitle?: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Navbar />

          <div className={styles.centerblock}>
            {pageTitle && (
              <h2 className={styles.centerblock__h2}>{pageTitle}</h2>
            )}

            {/* Контент страницы (поиск теперь в компонентах страниц) */}
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
