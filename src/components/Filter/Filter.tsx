import classNames from 'classnames';
import styles from './Filter.module.css';

interface FilterProps {
  title: string;
  items: string[];
  isOpen: boolean;
  selectedItems: string[];
  onToggle: () => void;
  onItemSelect?: (items: string[]) => void;
  displayMode?: 'nameOnly' | 'titleOnly';
  selectionMode?: 'multiple' | 'single';
}

export default function Filter({
  title,
  items,
  isOpen,
  selectedItems = [],
  onToggle,
  onItemSelect,
  displayMode = 'nameOnly',
  selectionMode = 'multiple',
}: FilterProps) {
  const handleItemClick = (item: string) => {
    if (onItemSelect) {
      let newSelectedItems: string[];

      if (selectionMode === 'single') {
        const isSelected = selectedItems.includes(item);
        newSelectedItems = isSelected ? [] : [item];
      } else {
        const isSelected = selectedItems.includes(item);
        if (isSelected) {
          newSelectedItems = selectedItems.filter((i) => i !== item);
        } else {
          newSelectedItems = [...selectedItems, item];
        }
      }

      onItemSelect(newSelectedItems);
    }
  };

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
