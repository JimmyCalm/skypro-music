'use client';

import { useState, useMemo, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
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

interface SelectionContentProps {
  initialTracks: TrackType[];
  filterData: {
    genres: string[];
    authors: string[];
    years: string[];
  };
  pageTitle: string;
}

export default function SelectionContent({
  initialTracks,
  filterData,
  pageTitle,
}: SelectionContentProps) {
  const [activeFilter, setActiveFilter] = useState<
    'author' | 'year' | 'genre' | null
  >(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setCurrentPlaylist(initialTracks));
  }, [dispatch, initialTracks]);

  const filteredTracks = useMemo(() => {
    let result = [...initialTracks];

    if (selectedAuthor) {
      result = filterTracksByAuthor(result, selectedAuthor);
    }

    if (selectedGenre) {
      result = filterTracksByGenre(result, selectedGenre);
    }

    if (selectedYear) {
      const order = selectedYear === 'сначала новые' ? 'newest' : 'oldest';
      result = sortTracksByDate(result, order);
    }

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

  const handleFilterToggle = (filterType: 'author' | 'year' | 'genre') => {
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

  return (
    <>
      {/* Фильтры */}
      <div className={styles.centerblock__filter}>
        <div className={styles.filter__title}>Искать по:</div>
        <Filter
          title="исполнителю"
          items={filterData.authors}
          isOpen={activeFilter === 'author'}
          selectedItem={selectedAuthor}
          onToggle={() => handleFilterToggle('author')}
          onItemSelect={setSelectedAuthor}
        />
        <Filter
          title="году выпуска"
          items={filterData.years}
          isOpen={activeFilter === 'year'}
          selectedItem={selectedYear}
          onToggle={() => handleFilterToggle('year')}
          onItemSelect={setSelectedYear}
        />
        <Filter
          title="жанру"
          items={filterData.genres}
          isOpen={activeFilter === 'genre'}
          selectedItem={selectedGenre}
          onToggle={() => handleFilterToggle('genre')}
          onItemSelect={setSelectedGenre}
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
              <h3 className={styles.emptyState__title}>Треки не найдены</h3>
              <p className={styles.emptyState__text}>
                Попробуйте изменить параметры поиска
              </p>
            </div>
          ) : (
            filteredTracks.map((track) => <Track key={track._id} {...track} />)
          )}
        </div>
      </div>
    </>
  );
}
