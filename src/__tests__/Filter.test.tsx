import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Filter from '@/components/Filter/Filter';

// Моки
jest.mock('classnames', () => ({
  __esModule: true,
  default: (...args: unknown[]) => args.filter(Boolean).join(' '),
}));

jest.mock('./Filter.module.css', () => ({
  filter__wrapper: 'filter__wrapper',
  filter__button: 'filter__button',
  active: 'active',
  filter__popup: 'filter__popup',
  filter__list: 'filter__list',
  filter__item: 'filter__item',
  filter__item_selected: 'filter__item_selected',
}));

describe('Filter Component', () => {
  const defaultProps = {
    title: 'Жанр',
    items: ['Рок', 'Поп', 'Джаз'],
    isOpen: false,
    selectedItems: [],
    onToggle: jest.fn(),
    onItemSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('рендерится с заголовком', () => {
    render(<Filter {...defaultProps} />);
    expect(screen.getByText('Жанр')).toBeInTheDocument();
  });

  test('отображает количество выбранных элементов', () => {
    render(<Filter {...defaultProps} selectedItems={['Рок', 'Поп']} />);
    expect(screen.getByText('Жанр: 2')).toBeInTheDocument();
  });

  test('отображает название выбранного элемента', () => {
    render(<Filter {...defaultProps} selectedItems={['Рок']} />);
    expect(screen.getByText('Жанр: Рок')).toBeInTheDocument();
  });

  test('вызывает onToggle при клике', () => {
    render(<Filter {...defaultProps} />);
    fireEvent.click(screen.getByText('Жанр'));
    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1);
  });

  test('отображает элементы при открытии', () => {
    render(<Filter {...defaultProps} isOpen={true} />);
    expect(screen.getByText('Рок')).toBeInTheDocument();
    expect(screen.getByText('Поп')).toBeInTheDocument();
    expect(screen.getByText('Джаз')).toBeInTheDocument();
  });

  test('вызывает onItemSelect при клике на элемент', () => {
    render(<Filter {...defaultProps} isOpen={true} />);
    fireEvent.click(screen.getByText('Рок'));
    expect(defaultProps.onItemSelect).toHaveBeenCalledWith(['Рок']);
  });

  test('удаляет элемент при повторном клике', () => {
    render(<Filter {...defaultProps} isOpen={true} selectedItems={['Рок']} />);
    const rockItem = screen.getByText((content, element) => {
      return (
        element !== null &&
        element.textContent?.includes('Рок') &&
        element.classList.contains('filter__item')
      );
    });

    fireEvent.click(rockItem);
    expect(defaultProps.onItemSelect).toHaveBeenCalledWith([]);
  });
});
