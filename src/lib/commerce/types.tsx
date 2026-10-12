export type PaymentMode = 'mock' | 'disabled' | 'wayforpay';
export type EnrollmentOptions = { mode: PaymentMode; packageIds: string[] };
export type PackageIdRow = { package_id: string };
