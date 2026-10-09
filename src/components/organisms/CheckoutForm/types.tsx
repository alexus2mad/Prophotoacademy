export type CheckoutFormProps = { offeringId: string; packageId: string; mock: boolean };
export type CheckoutIdentity = { token: string; key: string };
export type CheckoutState = 'idle' | 'sending' | 'error';
