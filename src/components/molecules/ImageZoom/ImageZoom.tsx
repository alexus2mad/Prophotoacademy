'use client';
import { Minus, Plus } from 'lucide-react';
import { IconButton } from '@/components/atoms/IconButton/IconButton';
import { useImageZoom } from './hooks';
import type { ImageZoomProps } from './types';

export function ImageZoom(props: ImageZoomProps) {
  const view = useImageZoom(props);
  return (
    <div className="image-zoom" onKeyDown={view.keyDown}>
      <div className="image-zoom-controls" role="group" aria-label="Масштаб фото">
        <IconButton
          aria-label="Зменшити фото"
          disabled={!view.loaded || view.transform.scale <= 1}
          onClick={() => view.zoom(view.transform.scale - 0.5)}
        >
          <Minus size={20} />
        </IconButton>
        <button
          type="button"
          className="image-zoom-reset"
          aria-label="Повернути початковий масштаб"
          disabled={!view.loaded}
          onClick={() => view.zoom(1)}
        >
          {Math.round(view.transform.scale * 100)}%
        </button>
        <IconButton
          aria-label="Збільшити фото"
          disabled={!view.loaded || view.transform.scale >= 4}
          onClick={() => view.zoom(view.transform.scale + 0.5)}
        >
          <Plus size={20} />
        </IconButton>
      </div>
      <div
        ref={view.viewport}
        className="image-zoom-viewport"
        data-zoomed={view.transform.scale > 1}
        style={view.style}
        tabIndex={0}
        role="group"
        aria-label="Фото: подвійне натискання або клавіші + та − змінюють масштаб, перетягування або Shift зі стрілками переміщують фото"
        onPointerDown={view.pointerDown}
        onPointerMove={view.pointerMove}
        onPointerUp={view.pointerEnd}
        onPointerCancel={view.pointerEnd}
        onLostPointerCapture={view.pointerEnd}
        onDoubleClick={() => view.zoom(view.transform.scale > 1 ? 1 : 2)}
      >
        <img
          src={props.src}
          alt={props.alt}
          draggable={false}
          onLoad={(event) => view.imageLoaded(event.currentTarget)}
          onError={props.onError}
        />
        {!view.loaded && (
          <p className="image-zoom-loading" role="status">
            Завантаження фото…
          </p>
        )}
      </div>
    </div>
  );
}
