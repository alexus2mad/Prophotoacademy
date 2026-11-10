export function headerUsesInk(surface: Element | undefined, fallback: boolean) {
  if (!surface) return fallback;
  const explicitTone = surface.getAttribute('data-header-tone');
  if (explicitTone) return explicitTone === 'light';
  const section = surface.getAttribute('data-home-section');
  if (section === 'hero' || section === 'exposure') return false;
  if (surface.matches('.studio-light, .studio-form-section')) return true;
  if (surface.matches('.studio-dark, .studio-footer')) return false;
  return getComputedStyle(surface).color === 'rgb(21, 11, 8)';
}
