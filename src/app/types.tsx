import type { ReactNode } from 'react';
import type { CatalogQuery } from '@/lib/catalog/types';
export type LayoutProps = { children: ReactNode };
export type SlugPageProps = { params: Promise<{ slug: string }> };
export type CoursesPageProps = { searchParams: Promise<CatalogQuery> };
export type CheckoutPageProps = {
  searchParams: Promise<{ offering?: string; package?: string; demo?: string }>;
};
export type ThanksPageProps = { searchParams: Promise<{ token?: string }> };
export type BookingPageProps = { searchParams: Promise<{ room?: string }> };
export type ErrorBoundaryProps = { reset: () => void };
export type ActionRouteProps = { params: Promise<{ action: string }> };
export type IdRouteProps = { params: Promise<{ id: string }> };
export type AccountPageProps = {
  searchParams: Promise<{
    next?: string;
    view?: string;
    q?: string;
    business?: string;
    from?: string;
    to?: string;
    page?: string;
    course?: string;
  }>;
};
export type LearningPageProps = { params: Promise<{ course: string; lesson: string }> };
