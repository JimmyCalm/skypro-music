import classNames from 'classnames';
import styles from './Filter.module.css';

interface FilterProps {
  title: string;
  items: string[];
  isOpen: boolean;
  selectedItems: string[]; // Изменяем на массив
  onToggle: () => void;
  onItemSelect?: (items: string[]) => void; // Изменяем сигнатуру
  displayMode?: 'nameOnly' | 'titleOnly';
}

export default function Filter({
  title,
  items,
  isOpen,
  selectedItems = [], // По умолчанию пустой массив
  onToggle,
  onItemSelect,
  displayMode = 'nameOnly',
}: FilterProps) {
  const handleItemClick = (item: string) => {
    if (onItemSelect) {
      // Проверяем, выбран ли уже элемент
      const isSelected = selectedItems.includes(item);
      let newSelectedItems: string[];

      if (isSelected) {
        // Удаляем элемент из выбранных
        newSelectedItems = selectedItems.filter((i) => i !== item);
      } else {
        // Добавляем элемент к выбранным
        newSelectedItems = [...selectedItems, item];
      }

      onItemSelect(newSelectedItems);
    }
  };

  // Формируем текст для кнопки фильтра
  const getButtonText = () => {
    if (selectedItems.length === 0) {
      return title;
    }

    if (selectedItems.length === 1) {
      return `${title}: ${selectedItems[0]}`;
    }

    return `${title}: ${selectedItems.length}`;
  };

  const displayTitle = getButtonText();

  return (
    <div className={styles.filter__wrapper}>
      <div
        className={classNames(styles.filter__button, {
          [styles.active]: isOpen || selectedItems.length > 0,
        })}
        onClick={onToggle}
        title={selectedItems.join(', ')}
      >
        {displayTitle}
      </div>
      {isOpen && (
        <div className={styles.filter__popup}>
          <div className={styles.filter__list}>
            {items.map((item, index) => (
              <div
                key={index}
                className={classNames(styles.filter__item, {
                  [styles.filter__item_selected]: selectedItems.includes(item),
                })}
                onClick={() => handleItemClick(item)}
              >
                {item}
                {selectedItems.includes(item) && ' ✓'}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
