// app/HomeContent.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Sidebar from '@/components/Sidebar/Sidebar';
import Player from '@/components/Player/Player';
import Track from '@/components/Track/Track';
import Filter from '@/components/Filter/Filter';
import { TrackType } from '@/sharedTypes/types';
import { setCurrentPlaylist } from '@/store/features/trackSlice';
import { useAppDispatch } from '@/store/store';
import {
  filterTracksByGenre,
  filterTracksByAuthor,
  sortTracksByDate,
} from '@/api/selections';
import styles from './page.module.css';

interface TracksContentProps {
  initialTracks: TrackType[];
  filterData: {
    genres: string[];
    authors: string[];
    years: string[];
  };
  pageTitle: string; // Добавили пропс для заголовка
}

type FilterType = 'author' | 'year' | 'genre' | null;

export default function HomeContent({
  initialTracks,
  filterData,
}: TracksContentProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();

  // Устанавливаем плейлист при монтировании
  useEffect(() => {
    dispatch(setCurrentPlaylist(initialTracks));
  }, [dispatch, initialTracks]);

  // Функции для работы с фильтрами
  const handleFilterToggle = (filterType: FilterType) => {
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

  const handleAuthorSelect = (author: string | null) => {
    setSelectedAuthor(author === selectedAuthor ? null : author);
    setSelectedYear(null);
    setSelectedGenre(null);
  };

  const handleYearSelect = (year: string | null) => {
    const normalizedYear = year === 'по умолчанию' ? null : year;
    setSelectedYear(normalizedYear === selectedYear ? null : normalizedYear);
    setSelectedAuthor(null);
    setSelectedGenre(null);
  };

  const handleGenreSelect = (genre: string | null) => {
    setSelectedGenre(genre === selectedGenre ? null : genre);
    setSelectedAuthor(null);
    setSelectedYear(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Фильтрация и поиск треков
  const filteredTracks = useMemo(() => {
    let result = [...initialTracks];

    // Применяем фильтр по автору
    if (selectedAuthor) {
      result = filterTracksByAuthor(result, selectedAuthor);
    }

    // Применяем фильтр по жанру
    if (selectedGenre) {
      result = filterTracksByGenre(result, selectedGenre);
    }

    // Применяем сортировку по дате
    if (selectedYear) {
      const order = selectedYear === 'сначала новые' ? 'newest' : 'oldest';
      result = sortTracksByDate(result, order);
    }

    // Применяем поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (track) =>
          track.name.toLowerCase().includes(query) ||
          track.author.toLowerCase().includes(query) ||
          track.album.toLowerCase().includes(query) ||
          track.genre.some((g) => g.toLowerCase().includes(query)),
      );
    }

    return result;
  }, [initialTracks, selectedAuthor, selectedGenre, selectedYear, searchQuery]);

  // Обработчик сброса всех фильтров
  const handleResetFilters = () => {
    setSelectedAuthor(null);
    setSelectedGenre(null);
    setSelectedYear(null);
    setSearchQuery('');
    setActiveFilter(null);
  };

  // Проверка, применены ли фильтры
  const hasActiveFilters =
    selectedAuthor || selectedGenre || selectedYear || searchQuery;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <main className={styles.main}>
          <Navbar />

          <div className={styles.centerblock}>
            {/* Поиск */}
            <div className={styles.centerblock__search}>
              <svg className={styles.search__svg}>
                <use xlinkHref="/img/icon/sprite.svg#icon-search"></use>
              </svg>
              <input
                className={styles.search__text}
                type="search"
                placeholder="Поиск по названию, исполнителю или альбому"
                name="search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className={styles.search__clear}
                  onClick={() => setSearchQuery('')}
                  aria-label="Очистить поиск"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Заголовок и сброс фильтров */}
            <div className={styles.centerblock__header}>
              <h2 className={styles.centerblock__h2}>Треки</h2>
              {hasActiveFilters && (
                <button
                  className={styles.resetFilters}
                  onClick={handleResetFilters}
                >
                  Сбросить фильтры
                </button>
              )}
            </div>

            {/* Информация о результатах */}
            {hasActiveFilters && (
              <div className={styles.filterInfo}>
                <span className={styles.filterInfo__text}>
                  Найдено треков: {filteredTracks.length}
                </span>
                {selectedAuthor && (
                  <span className={styles.filterInfo__tag}>
                    Исполнитель: {selectedAuthor}
                  </span>
                )}
                {selectedGenre && (
                  <span className={styles.filterInfo__tag}>
                    Жанр: {selectedGenre}
                  </span>
                )}
                {selectedYear && (
                  <span className={styles.filterInfo__tag}>
                    Сортировка: {selectedYear}
                  </span>
                )}
              </div>
            )}

            {/* Фильтры */}
            <div className={styles.centerblock__filter}>
              <div className={styles.filter__title}>Искать по:</div>
              <Filter
                title="исполнителю"
                items={filterData.authors}
                isOpen={activeFilter === 'author'}
                selectedItem={selectedAuthor}
                onToggle={() => handleFilterToggle('author')}
                onItemSelect={handleAuthorSelect}
              />
              <Filter
                title="году выпуска"
                items={filterData.years}
                isOpen={activeFilter === 'year'}
                selectedItem={selectedYear}
                onToggle={() => handleFilterToggle('year')}
                onItemSelect={handleYearSelect}
              />
              <Filter
                title="жанру"
                items={filterData.genres}
                isOpen={activeFilter === 'genre'}
                selectedItem={selectedGenre}
                onToggle={() => handleFilterToggle('genre')}
                onItemSelect={handleGenreSelect}
              />
            </div>

            {/* Список треков */}
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
                {filteredTracks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg
                      className={styles.emptyState__icon}
                      width="64"
                      height="64"
                      viewBox="0 0 64 64"
                    >
                      <path
                        d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8zm0 44c-11 0-20-9-20-20s9-20 20-20 20 9 20 20-9 20-20 20z"
                        fill="#696969"
                      />
                      <path
                        d="M40.2 23.8L32 32l8.2 8.2c.8.8.8 2 0 2.8-.8.8-2 .8-2.8 0L32 37.7l-8.2 8.2c-.8.8-2 .8-2.8 0-.8-.8-.8-2 0-2.8L29.3 32l-8.2-8.2c-.8-.8-.8-2 0-2.8.8-.8 2-.8 2.8 0L32 26.3l8.2-8.2c.8-.8 2-.8 2.8 0 .8.8.8 2 0 2.8z"
                        fill="#696969"
                      />
                    </svg>
                    <h3 className={styles.emptyState__title}>
                      Треки не найдены
                    </h3>
                    <p className={styles.emptyState__text}>
                      Попробуйте изменить параметры поиска или сбросить фильтры
                    </p>
                    <button
                      className={styles.emptyState__button}
                      onClick={handleResetFilters}
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                ) : (
                  filteredTracks.map((track) => (
                    <Track
                      key={track._id}
                      _id={track._id}
                      name={track.name}
                      author={track.author}
                      album={track.album}
                      duration_in_seconds={track.duration_in_seconds}
                      track_file={track.track_file}
                      release_date={track.release_date}
                      genre={track.genre}
                      logo={track.logo}
                      stared_user={track.stared_user}
                    />
                  ))
                )}
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
