'use client';

import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import Track from '@/components/Track/Track';
import Filter from '@/components/Filter/Filter';
import { TrackType } from '@/sharedTypes/types';
import { setCurrentPlaylist } from '@/store/features/trackSlice';
import { useAppDispatch } from '@/store/store';
import {
  filterTracksByGenres,
  filterTracksByAuthors,
  sortTracksByDate,
} from '@/api/selections';
import { useFilters } from '@/hooks/useFilters';
import styles from './page.module.css';

interface TracksContentProps {
  initialTracks: TrackType[];
  filterData: {
    genres: string[];
    authors: string[];
    years: string[];
  };
  pageTitle: string;
}

export default function TracksContent({
  initialTracks,
  filterData,
  pageTitle = 'Треки',
}: TracksContentProps) {
  const dispatch = useAppDispatch();
  const {
    filters,
    activeFilter,
    updateFilters,
    resetFilters,
    handleFilterToggle,
    hasActiveFilters,
  } = useFilters();

  useEffect(() => {
    dispatch(setCurrentPlaylist(initialTracks));
  }, [dispatch, initialTracks]);

  const filteredTracks = useMemo(() => {
    let result = [...initialTracks];

    // Фильтрация по нескольким авторам
    if (filters.authors.length > 0) {
      result = filterTracksByAuthors(result, filters.authors);
    }

    // Фильтрация по нескольким жанрам
    if (filters.genres.length > 0) {
      result = filterTracksByGenres(result, filters.genres);
    }

    // Сортировка по году (только одна опция может быть активна)
    if (filters.years.length > 0) {
      const yearFilter = filters.years[0]; // Берем первую выбранную опцию
      if (yearFilter === 'сначала новые' || yearFilter === 'сначала старые') {
        const order = yearFilter === 'сначала новые' ? 'newest' : 'oldest';
        result = sortTracksByDate(result, order);
      }
    }

    // Поиск
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (track) =>
          track.name.toLowerCase().includes(query) ||
          track.author.toLowerCase().includes(query) ||
          track.album.toLowerCase().includes(query) ||
          track.genre.some((g) => g.toLowerCase().includes(query)),
      );
    }

    return result;
  }, [initialTracks, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ searchQuery: e.target.value });
  };

  const handleSearchClear = () => {
    updateFilters({ searchQuery: '' });
  };

  const handleResetAllFilters = () => {
    resetFilters();
  };

  return (
    <Layout pageTitle={pageTitle}>
      {/* Поиск с кнопкой очистки */}
      <div className={styles.centerblock__search}>
        <svg className={styles.search__svg}>
          <use xlinkHref="/img/icon/sprite.svg#icon-search"></use>
        </svg>
        <input
          className={styles.search__text}
          type="search"
          placeholder="Поиск по трекам, исполнителям, альбомам..."
          name="search"
          value={filters.searchQuery}
          onChange={handleSearchChange}
        />
        {filters.searchQuery && (
          <button
            className={styles.search__clear}
            onClick={handleSearchClear}
            title="Очистить поиск"
          >
            ✕
          </button>
        )}
      </div>

      <h2 className={styles.centerblock__h2}>{pageTitle}</h2>

      {/* Фильтры */}
      <div className={styles.centerblock__filter}>
        <div className={styles.filter__title}>Искать по:</div>
        <Filter
          title="исполнителю"
          items={filterData.authors}
          isOpen={activeFilter === 'author'}
          selectedItems={filters.authors}
          onToggle={() => handleFilterToggle('author')}
          onItemSelect={(items) => updateFilters({ authors: items })}
        />
        <Filter
          title="году выпуска"
          items={filterData.years}
          isOpen={activeFilter === 'year'}
          selectedItems={filters.years}
          onToggle={() => handleFilterToggle('year')}
          onItemSelect={(items) => updateFilters({ years: items })}
        />
        <Filter
          title="жанру"
          items={filterData.genres}
          isOpen={activeFilter === 'genre'}
          selectedItems={filters.genres}
          onToggle={() => handleFilterToggle('genre')}
          onItemSelect={(items) => updateFilters({ genres: items })}
        />

        {/* Кнопка сброса всех фильтров */}
        {hasActiveFilters && (
          <button
            className={styles.filter__reset}
            onClick={handleResetAllFilters}
            title="Сбросить все фильтры"
          >
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Статус фильтров */}
      {hasActiveFilters && (
        <div className={styles.filter__status}>
          <span className={styles.filter__status__label}>
            Активные фильтры:
          </span>
          {filters.authors.length > 0 && (
            <span className={styles.filter__status__item}>
              Исполнители: {filters.authors.join(', ')}
            </span>
          )}
          {filters.genres.length > 0 && (
            <span className={styles.filter__status__item}>
              Жанры: {filters.genres.join(', ')}
            </span>
          )}
          {filters.years.length > 0 && (
            <span className={styles.filter__status__item}>
              Сортировка: {filters.years.join(', ')}
            </span>
          )}
          {filters.searchQuery && (
            <span className={styles.filter__status__item}>
              Поиск: "{filters.searchQuery}"
            </span>
          )}
        </div>
      )}

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
              <h3 className={styles.emptyState__title}>Треки не найдены</h3>
              <p className={styles.emptyState__text}>
                Попробуйте изменить параметры поиска
              </p>
              <button
                className={styles.emptyState__button}
                onClick={handleResetAllFilters}
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              <div className={styles.trackCount}>
                Найдено треков: {filteredTracks.length}
              </div>
              {filteredTracks.map((track) => (
                <Track key={track._id} {...track} />
              ))}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
