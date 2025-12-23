import { getAllSelections } from '@/api';

export async function getSelectionIdByName(
  name: string,
): Promise<number | null> {
  try {
    const selections = await getAllSelections();

    if ('message' in selections) {
      console.error('Ошибка загрузки подборок:', selections.message);
      return null;
    }

    const selection = selections.find((s) =>
      s.name.toLowerCase().includes(name.toLowerCase()),
    );

    return selection ? selection._id : null;
  } catch (error) {
    console.error('Error getting selection ID:', error);
    return null;
  }
}

// ID по умолчанию для разных подборок
export const DEFAULT_SELECTION_IDS = {
  'playlist-day': 1, // Плейлист дня
  'dance-hits': 2, // 100 танцевальных хитов
  'indie-charge': 3, // Инди заряд
} as const;
