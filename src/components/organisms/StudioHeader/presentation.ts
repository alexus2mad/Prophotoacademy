export function headerUsesInk(surface: Element | undefined, mobile: boolean, fallback: boolean) {
  if (!surface) return fallback;
  const explicitTone = surface.getAttribute('data-header-tone');
  if (explicitTone) return explicitTone === 'light';
  const section = surface.getAttribute('data-home-section');
  if (mobile && (section === 'exposure' || section === 'directions')) {
    if (
      section === 'directions' &&
      (surface.matches(':focus-within') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    )
      return true;
    return Number(getComputedStyle(surface).getPropertyValue('--exposure-transition')) >= 0.5;
  }
  if (section === 'hero' || section === 'exposure') return false;
  if (surface.matches('.studio-light, .studio-form-section')) return true;
  if (surface.matches('.studio-dark, .studio-footer')) return false;
  return getComputedStyle(surface).color === 'rgb(21, 11, 8)';
}
