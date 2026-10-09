'use client';
import { Button } from '@/components/atoms/Button/Button';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useCatalogFilters } from './hooks';
import type { CatalogFiltersProps } from './types';

export function CatalogFilters({ type = '', format = '', level = '', count }: CatalogFiltersProps) {
  const { expanded, setExpanded, submit } = useCatalogFilters({ format, level });
  return (
    <form className="filters" action="/courses">
      <label className="type-filter">
        Тип програми
        <select name="type" defaultValue={type} onChange={submit}>
          <option value="">Усі програми</option>
          <option value="course">Курси</option>
          <option value="class">Класи та події</option>
          <option value="individual">Індивідуально</option>
          <option value="corporate">Для команди</option>
        </select>
      </label>
      <div className="secondary-filters" id="catalog-secondary-filters" data-expanded={expanded}>
        <label>
          Формат
          <select name="format" defaultValue={format} onChange={submit}>
            <option value="">Будь-який</option>
            <option value="online">Онлайн</option>
            <option value="offline">У Києві</option>
            <option value="hybrid">Онлайн + Київ</option>
          </select>
        </label>
        <label>
          Ваш досвід
          <select name="level" defaultValue={level} onChange={submit}>
            <option value="">Будь-який</option>
            <option value="beginner">Починаю</option>
            <option value="intermediate">Уже знімаю</option>
            <option value="all">Для всіх</option>
          </select>
        </label>
      </div>
      <div className="filter-actions">
        <Button
          type="button"
          className="text-link filters-toggle"
          aria-expanded={expanded}
          aria-controls="catalog-secondary-filters"
          onClick={() => setExpanded((value) => !value)}
        >
          <SlidersHorizontal size={16} />
          Фільтри
          {(format || level) && (
            <span aria-label="Є активні фільтри"> · {[format, level].filter(Boolean).length}</span>
          )}
        </Button>
        <p className="filter-count" role="status">
          Програм: {count}
        </p>
        {(type || format || level) && (
          <Link href="/courses" className="text-link filter-reset">
            Очистити
          </Link>
        )}
      </div>
      <noscript>
        <style>{'.secondary-filters{display:flex!important;}'}</style>
        <Button type="submit" className="button button-secondary">
          Застосувати
        </Button>
      </noscript>
    </form>
  );
}
