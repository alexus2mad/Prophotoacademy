---
name: ProPhoto editorial film
preset: editorial-forest, corrected for ProPhoto brand
colors:
  canvas: '#101211'
  surface: '#191C1A'
  ink: '#F2EFE7'
  accent: '#D5E4B9'
  muted: '#B9BDB4'
typography:
  display: { fontFamily: 'KyivType', weight: 400, lineHeight: 1.05 }
  body: { fontFamily: 'Manrope', weight: 400, lineHeight: 1.4 }
  label: { fontFamily: 'Manrope', weight: 500, lineHeight: 1.3 }
spacing:
  safe: 96
  gap: 40
components:
  primary: { background: '#D5E4B9', color: '#101211', radius: 999 }
---
# ProPhoto photographic editorial

The editorial-forest preset was adopted by build-frame.mjs then corrected: automatic mapping retained JetBrains Mono and light-canvas assumptions contrary to the existing brand. This correction is normative.

1920×1080. Key content x=96..1824,y=96..896. Bottom 184px reserved for sentence captions. Display 80–116px KyivType regular, body 30–36px Manrope, eyebrow 22px. Exact local font files assets/fonts/kyivtype-regular.woff2, manrope-0.woff2 (400), manrope-1.woff2 (500). Declare local @font-face in every frame. No remote fonts.

Three modes: photographic diptych, oversized editorial title beside native-resolution UI, quiet brand lockup. Original prophoto-study-trimmed.svg only. No monogram, fake UI, ornamental numbering, arrows, title punctuation, gradient, shadows, particle/glow/blur effects, floating cards or device chrome. Real image colors stay unchanged. Screenshot plates remain at or BELOW source pixel resolution. Crop, never rebuild.

One deliberate camera settlement per state then hold. Use long-tail easing. Hard cuts between real observed interaction states. No invented progress, live typing or click events. No lazy breathing/panning through a readable hold. Photos can bleed, typography uses 96px margin. No repeated top/bottom chrome. Source screenshots from functional synthetic sandbox; root labels the UI section as demonstration.

@font-face{font-family:KyivType;src:url('assets/fonts/kyivtype-regular.woff2') format('woff2');font-weight:400}
@font-face{font-family:Manrope;src:url('assets/fonts/manrope-0.woff2') format('woff2');font-weight:400}
@font-face{font-family:Manrope;src:url('assets/fonts/manrope-1.woff2') format('woff2');font-weight:500}
