import { useState } from 'react';
export function useAccountMenu() {
  const [error, setError] = useState('');
  async function logout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      window.location.assign('/login');
    } catch {
      setError('Не вдалося вийти. Спробуйте ще раз');
    }
  }
  return { logout, error };
}
