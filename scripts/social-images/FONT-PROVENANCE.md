# Raster artwork font

`kyivtype-regular.ttf` is a lossless WOFF2 decode of the existing
`src/app/fonts/studio-kyivtype-400.woff2`, using the already available fontTools
installation in the private design audit. No outlines, metrics or characters
were altered. The original file and its provenance remain authoritative; see
`src/app/fonts/STUDIO-FONT-PROVENANCE.md`.

Sharp/Pango needs this decoded file to select the correct font consistently.
The generator also uses the original Roboto Condensed TTF already in the app.
No system-font fallback, external font request, or Python runtime is needed
to generate or serve the published JPEGs.
