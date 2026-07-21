import React, { useCallback, useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';

interface ZoomableImageProps {
  src: string;
  srcSet?: string;
  sizes?: string;
  /** Lupa daxilində göstərilən yüksək keyfiyyətli versiya — yalnız ilk toxunuşda/hoverdə yüklənir */
  zoomSrc: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  /** Lupa böyütmə əmsalı */
  zoom?: number;
  /** Lupa dairəsinin diametri (px) */
  lensSize?: number;
}

/**
 * Masaüstündə: siçanı şəklin üzərində gəzdirdikdə dairəvi lupa o nöqtəni
 * böyüdülmüş göstərir (cursor mövqeyinə görə background-position hesablanır).
 * Mobil/toxunma: barmaqla şəklin üzərində sürüşdürdükdə eyni lupa
 * barmağı izləyir (touch-action:none — səhifə scroll-u ilə qarışmasın deyə).
 */
const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src, srcSet, sizes, zoomSrc, alt,
  loading = 'eager', fetchPriority = 'auto', onError,
  zoom = 2.4, lensSize = 150,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [box, setBox] = useState({ w: 0, h: 0 });

  const updatePos = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    setPos({ x, y });
    setBox({ w: rect.width, h: rect.height });
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    updatePos(e.touches[0].clientX, e.touches[0].clientY);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'none' }}
      onMouseEnter={(e) => { updatePos(e.clientX, e.clientY); setActive(true); }}
      onMouseMove={(e) => updatePos(e.clientX, e.clientY)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={(e) => {
        if (e.touches.length === 1) { updatePos(e.touches[0].clientX, e.touches[0].clientY); setActive(true); }
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setActive(false)}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        draggable={false}
        onError={onError}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />

      {/* Sabit ipucu nişanı — aktiv olanda solur. Sağ-üst küncdə: sol-üst endirim
          nişanı, sağ-alt şəkil sayğacı ilə üst-üstə düşməsin deyə bura qoyulub. */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 16, right: 16,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(0,0,0,0.5)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: active ? 0 : 1, transition: 'opacity 0.2s',
          pointerEvents: 'none', zIndex: 3,
        }}
      >
        <ZoomIn size={16} />
      </div>

      {active && box.w > 0 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: pos.x - lensSize / 2,
            top: pos.y - lensSize / 2,
            width: lensSize,
            height: lensSize,
            borderRadius: '50%',
            border: '3px solid #fff',
            boxShadow: '0 6px 24px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.08)',
            pointerEvents: 'none',
            backgroundColor: '#fff',
            backgroundImage: `url(${zoomSrc})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${box.w * zoom}px ${box.h * zoom}px`,
            backgroundPosition: `${lensSize / 2 - pos.x * zoom}px ${lensSize / 2 - pos.y * zoom}px`,
            zIndex: 6,
          }}
        />
      )}
    </div>
  );
};

export default ZoomableImage;
