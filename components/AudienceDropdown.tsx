import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { C, F } from '../tokens';
import { AudienceCategory } from '../types';
import { localizedAudienceName } from '../lib/productLocale';
import { withLangPrefix } from '../i18n/useLocalizedNav';

interface AudienceDropdownProps {
  items: AudienceCategory[];
  lang: 'az' | 'en';
  label: string;
}

/** Masaüstü naviqasiyada "Kimə alırsan?" düyməsi + açılan siyahı. Sanity-dən
 * gələn siyahı boşdursa (hələ heç bir bölmə əlavə edilməyibsə) heç nə göstərmir. */
export default function AudienceDropdown({ items, lang, label }: AudienceDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  if (!items.length) return null;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          background: open ? C.bg : 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 14px',
          fontSize: 13,
          fontWeight: 500,
          color: open ? C.black : '#444444',
          fontFamily: F.sans,
          borderRadius: 6,
          transition: 'color 0.15s, background 0.15s',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.color = C.black;
            e.currentTarget.style.background = C.bg;
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.color = '#444444';
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        {label}
        <ChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 44,
            left: 0,
            minWidth: 240,
            background: C.white,
            border: '1px solid #E5E1DB',
            borderRadius: 12,
            boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: 500,
            padding: 6,
          }}
        >
          {items.map((it) => (
            <Link
              key={it.slug}
              to={withLangPrefix(`/kime/${it.slug}`, lang)}
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: C.black,
                fontFamily: F.sans,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {localizedAudienceName(it, lang)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
