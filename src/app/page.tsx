'use client';

import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import Player from '@/components/Player/Player';
import Track from '@/components/Track/Track';
import Filter from '@/components/Filter/Filter';
import { data } from '@data';
import { useState, useMemo } from 'react';
import styles from './page.module.css';

type FilterType = 'author' | 'year' | 'genre' | null;

export default function Home() {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  // Получаем уникальные данные из моковых данных
  const filterData = useMemo(() => {
    const authors = Array.from(
      new Set(data.map((track) => track.author)),
    ).filter((author) => author !== '-');
    const genres = Array.from(new Set(data.flatMap((track) => track.genre)));

    const yearOptions = ['по умолчанию', 'сначала новые', 'сначала старые'];

    return {
      authors,
      genres,
      years: yearOptions,
    };
  }, []);

  const handleFilterToggle = (filterType: FilterType) => {
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

  const handleAuthorSelect = (author: string) => {
    setSelectedAuthor(author === selectedAuthor ? null : author);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year === 'по умолчанию' ? null : year);
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre === selectedGenre ? null : genre);
  };

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
            <h2 className={styles.centerblock__h2}>Треки</h2>
            <div className={styles.centerblock__filter}>
              <div className={styles.filter__title}>Искать по:</div>
              <Filter
                title="исполнителю"
                items={filterData.authors}
                isOpen={activeFilter === 'author'}
                selectedItem={selectedAuthor}
                onToggle={() => handleFilterToggle('author')}
                onItemSelect={handleAuthorSelect}
                displayMode="nameOnly"
              />
              <Filter
                title="году выпуска"
                items={filterData.years}
                isOpen={activeFilter === 'year'}
                selectedItem={selectedYear}
                onToggle={() => handleFilterToggle('year')}
                onItemSelect={handleYearSelect}
                displayMode="titleOnly"
              />
              <Filter
                title="жанру"
                items={filterData.genres}
                isOpen={activeFilter === 'genre'}
                selectedItem={selectedGenre}
                onToggle={() => handleFilterToggle('genre')}
                onItemSelect={handleGenreSelect}
                displayMode="nameOnly"
              />
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
