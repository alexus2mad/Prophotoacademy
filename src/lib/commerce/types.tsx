export type PaymentMode = 'mock' | 'disabled' | 'wayforpay';
export type EnrollmentOptions = {
  mode: PaymentMode;
  packageIds: string[];
  lessonTitles?: Record<string, string[]>;
};
export type PackageIdRow = { package_id: string; lesson_titles: string[] };
