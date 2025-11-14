import classNames from 'classnames';
import styles from './Filter.module.css';

interface FilterProps {
  title: string;
  items: string[];
  isOpen: boolean;
  selectedItem: string | null;
  onToggle: () => void;
  onItemSelect?: (item: string) => void;
  displayMode?: 'nameOnly' | 'titleOnly';
}

export default function Filter({
  title,
  items,
  isOpen,
  selectedItem,
  onToggle,
  onItemSelect,
  displayMode = 'nameOnly',
}: FilterProps) {
  const handleItemClick = (item: string) => {
    onItemSelect?.(item);
    onToggle();
  };

  const getDisplayTitle = () => {
    if (!selectedItem) {
      return title; // Если ничего не выбрано, показываем стандартный заголовок
    }

    if (displayMode === 'nameOnly') {
      return selectedItem;
    } else {
      return selectedItem;
    }
  };

  const displayTitle = getDisplayTitle();

  return (
    <div className={styles.filter__wrapper}>
      <div
        className={classNames(styles.filter__button, {
          [styles.active]: isOpen || selectedItem,
        })}
        onClick={onToggle}
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
                  [styles.filter__item_selected]: item === selectedItem,
                })}
                onClick={() => handleItemClick(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
