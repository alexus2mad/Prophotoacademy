import {describe,it,expect} from 'vitest';
import {acquisitionFromUrl,decorateEcosystemUrl} from '../src/lib/attribution';
describe('cross-site attribution',()=>{
 it('retains campaign source and room selection on a cross-site journey',()=>{const first=acquisitionFromUrl('https://academy.example/course?utm_source=instagram&utm_campaign=october','academy');const link=new URL(decorateEcosystemUrl('https://hub.example/booking?room=podcast',first));expect(link.searchParams.get('room')).toBe('podcast');expect(link.searchParams.get('utm_source')).toBe('instagram');expect(link.searchParams.get('from_site')).toBe('academy');});
 it('excludes email, payment tokens and arbitrary query data',()=>{const source=acquisitionFromUrl('https://academy.example/thanks?token=private&email=qa@example.com&utm_source=qa@example.com','academy');expect(source.utmSource).toBeUndefined();expect(JSON.stringify(source)).not.toContain('private');expect(source.landingPath).toBe('/thanks');});
});
