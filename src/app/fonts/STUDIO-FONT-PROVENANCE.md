# Studio presentation fonts

These files are self-hosted through `src/lib/typography/fonts.ts`. The pre-existing
Academy and lesson font files and exports remain unchanged.

- `studio-kyivtype-{300,400,500,700,900}.woff2`: original embedded KyivType Sans
  faces extracted without conversion from the owner-provided interactive design
  [FwrroMxpu7ApuHRefQRW3t](https://claude.ai/artifact/FwrroMxpu7ApuHRefQRW3t),
  preserved in the local audit capture. Internal names identify KyivType Sans
  Light, Regular, Medium, Bold and Black, version 1.002. The regular face shares
  185 encoded glyphs and identical advance widths with the previously supplied
  KyivType Sans Regular. The smaller files are the supplied subset, not a
  different family. All five include Ukrainian Ґґ, Єє, Іі and Її.
- `studio-roboto-condensed.ttf`: original variable upright font downloaded from
  the [official Google Fonts repository](https://github.com/google/fonts/blob/main/ofl/robotocondensed/RobotoCondensed%5Bwght%5D.ttf).
  Figma section headings use its Bold weight (700). Its supplied license is
  `ROBOTO-CONDENSED-LICENSE.txt`.
- `studio-marck-script.ttf`: original regular font downloaded from the
  [official Google Fonts repository](https://github.com/google/fonts/blob/main/ofl/marckscript/MarckScript-Regular.ttf).
  Its supplied license is `MARCK-SCRIPT-LICENSE.txt`.

Roboto Condensed and Marck Script were also checked for the Ukrainian glyphs
above. No running page requests fonts from Google or the source artifact.
