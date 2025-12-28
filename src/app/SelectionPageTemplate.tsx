import { Suspense } from 'react';
import Layout from '@/components/Layout/Layout';
import { getAllTracks, isApiError } from '@/api';
import { TrackType } from '@/sharedTypes/types';
import SelectionContent from '@/app/SelectionContent';
import { extractUniqueGenres, extractUniqueAuthors } from '@/api/selections';
import { getFallbackTracksBySelection } from '@/utils/fallbackData';
import Loading from './loading';

interface SelectionPageTemplateProps {
  selectionName: string;
  pageTitle: string;
  fallbackName: string;
}

async function fetchSelectionTracks({
  selectionName,
  fallbackName,
}: SelectionPageTemplateProps): Promise<TrackType[]> {
  try {
    // 1. Пытаемся получить подборку по имени
    const allSelections = await getAllTracks();

    if (isApiError(allSelections)) {
      console.log(
        `Ошибка загрузки подборок, используем fallback для "${selectionName}"`,
      );
      return getFallbackTracksBySelection(fallbackName);
    }

    // 2. Если API не работает, используем fallback
    if (allSelections.length === 0) {
      console.log(
        `API вернул пустой список, используем fallback для "${selectionName}"`,
      );
      return getFallbackTracksBySelection(fallbackName);
    }

    // 3. Фильтруем треки по типу подборки
    let filteredTracks: TrackType[] = [];

    switch (selectionName.toLowerCase()) {
      case 'танцевальных хитов':
        filteredTracks = allSelections.filter((track) =>
          track.genre.some(
            (g) =>
              g.toLowerCase().includes('танцевальн') ||
              g.toLowerCase().includes('dance') ||
              g.toLowerCase().includes('электро'),
          ),
        );
        break;

      case 'инди заряд':
        filteredTracks = allSelections.filter(
          (track) =>
            track.genre.some(
              (g) =>
                g.toLowerCase().includes('инди') ||
                g.toLowerCase().includes('indie'),
            ) ||
            track.name.toLowerCase().includes('indie') ||
            track.author.toLowerCase().includes('indie'),
        );
        break;

      case 'плейлист дня':
        // Случайные 10 треков
        const shuffled = [...allSelections].sort(() => Math.random() - 0.5);
        filteredTracks = shuffled.slice(0, 10);
        break;

      default:
        filteredTracks = allSelections;
    }

    // 4. Если после фильтрации ничего не нашлось, используем fallback
    if (filteredTracks.length === 0) {
      console.log(
        `После фильтрации треков не найдено, используем fallback для "${selectionName}"`,
      );
      return getFallbackTracksBySelection(fallbackName);
    }

    return filteredTracks;
  } catch (error) {
    console.error(`Error fetching ${selectionName}:`, error);
    return getFallbackTracksBySelection(fallbackName);
  }
}

export default async function SelectionPageTemplate(
  props: SelectionPageTemplateProps,
) {
  const { pageTitle } = props;

  try {
    const tracks = await fetchSelectionTracks(props);

    const genres = extractUniqueGenres(tracks);
    const authors = extractUniqueAuthors(tracks);
    const years = ['по умолчанию', 'сначала новые', 'сначала старые'];

    return (
      <Suspense fallback={<Loading pageTitle={pageTitle} />}>
        <Layout pageTitle={pageTitle} showSearch>
          <SelectionContent
            initialTracks={tracks}
            filterData={{ genres, authors, years }}
            pageTitle={pageTitle}
          />
        </Layout>
      </Suspense>
    );
  } catch (error) {
    console.error(`Error in ${pageTitle} page:`, error);

    // В случае ошибки все равно показываем fallback данные
    const fallbackTracks = getFallbackTracksBySelection(props.fallbackName);
    const genres = extractUniqueGenres(fallbackTracks);
    const authors = extractUniqueAuthors(fallbackTracks);
    const years = ['по умолчанию', 'сначала новые', 'сначала старые'];

    return (
      <Layout pageTitle={pageTitle} showSearch>
        <div
          style={{
            padding: '20px',
            background: '#f8f8f8',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <p style={{ color: '#888' }}>
            Используются демо-данные. Для работы с реальными данными
            подключитесь к API.
          </p>
        </div>
        <SelectionContent
          initialTracks={fallbackTracks}
          filterData={{ genres, authors, years }}
          pageTitle={pageTitle}
        />
      </Layout>
    );
  }
}
