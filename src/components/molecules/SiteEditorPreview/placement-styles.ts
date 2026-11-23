// The same-origin preview intentionally cannot execute scripts or load the admin shell's styles.
export const placementStyles = `
[data-site-placement] [data-canvas-boundary], [data-site-placement] [data-canvas-block-bar] {
  box-sizing:border-box; position:relative; isolation:isolate; font:500 14px/1.3 system-ui,sans-serif;
  letter-spacing:normal; text-transform:none;
}
[data-canvas-boundary] { display:flex; align-items:center; justify-content:center; gap:6px; width:100%; height:44px; border:0; border-radius:0; margin:0; padding:0 10px; background:#f6f5f2; color:#4e4a48; cursor:pointer; }
[data-canvas-line] { width:min(14%,75px); border-top:1px dashed #898582; }
[data-canvas-insert-icon] { display:grid; place-items:center; width:23px; height:23px; border-radius:50%; border:1px solid currentColor; }
[data-canvas-boundary]:is(:hover,:focus-visible),[data-canvas-boundary][data-drop-active] { color:#98201c; background:#fcebe7; }
[data-canvas-boundary][data-drop-active] [data-canvas-line] { width:auto; flex:1; border-top:3px solid #be342b; }
[data-canvas-block-bar] { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:44px; margin:0; padding:0 clamp(12px,4vw,40px); background:#f4f2ef; color:#222; border-block:1px solid #ccc7c0; }
[data-canvas-block-bar] > span {min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
[data-canvas-block-bar][data-canvas-selected] {border-inline-start:3px solid #b83429;}
[data-canvas-grip] { display:inline-flex; align-items:center; justify-content:center; gap:4px; flex:none; background:transparent; color:inherit; border:0; margin:0; padding:0 6px; height:44px; font:inherit; touch-action:none; cursor:grab; user-select:none; }
[data-canvas-grip]:focus-visible,[data-canvas-boundary]:focus-visible {outline:2px solid #a12822;outline-offset:-3px}
html[data-moving-block],html[data-moving-block] * {cursor:grabbing!important;user-select:none!important;}
[data-canvas-drag-source] {background:#fbe1d9!important;}
[data-canvas-feedback] { position:fixed; z-index:2147483646; pointer-events:none; max-width:min(80vw,340px); padding:9px 14px; border-radius:6px; background:#171514; color:white; font:600 14px/1.35 system-ui,sans-serif; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
[data-site-placement] [data-canvas-boundary], [data-site-placement] [data-canvas-block-bar], [data-canvas-feedback] {font-size:var(--canvas-control-text,14px);}
[data-canvas-boundary],[data-canvas-grip] {height:var(--canvas-control-size,44px);}
[data-canvas-boundary] {touch-action:manipulation;}
[data-canvas-boundary] *,[data-canvas-grip] svg {pointer-events:none;}
/* Several templates overlay the public masthead directly on the hero. */
[data-site-placement="hero"]:has(> [data-canvas-boundary]) {padding-block-start:var(--studio-header-height,64px);}
[data-canvas-boundary],[data-canvas-grip] {scroll-margin-block-start:calc(var(--studio-header-height,64px) + 8px);}
`;
