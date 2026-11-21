import React from 'react';
import { useTranslation } from 'react-i18next';
import { C } from '../../tokens';
import { useCharityStats } from '../../lib/siteExtras';

// Xeyriyyə sayğacı: "Aylıq gəlirin 5%-i küçə heyvanlarına" vədinin şəffaf hesabatı.
// Rəqəm, tarix və sübut şəkilləri Sanity-dən gəlir (Sayt tənzimləmələri → 🐾 Xeyriyyə sayğacı).
// Məbləğ boş/0-dırsa komponent HEÇ NƏ göstərmir.
// variant="strip" — ana səhifədə nazik zolaq; variant="card" — Haqqımızda səhifəsində tam blok.

function formatAmount(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
}

function formatDate(iso: string | undefined, en: boolean): string {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString(en ? 'en-GB' : 'az-Latn-AZ', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function CharityImpact({ variant = 'card' }: { variant?: 'card' | 'strip' }) {
  const { t, i18n } = useTranslation();
  const stats = useCharityStats();

  if (!stats || !stats.totalAmount || stats.totalAmount <= 0) return null;

  const en = Boolean(i18n.language?.startsWith('en'));
  const amount = formatAmount(stats.totalAmount);

  if (variant === 'strip') {
    return (
      <div
        role="note"
        style={{ background: '#111111', color: '#ffffff', textAlign: 'center', padding: '14px 16px', fontSize: 13, lineHeight: 1.5 }}
      >
        {t('charity.strip', { amount })}
      </div>
    );
  }

  const date = formatDate(stats.asOfDate, en);
  const recipient = (en ? stats.recipientEn || stats.recipient : stats.recipient) || '';
  const note = (en ? stats.noteEn || stats.note : stats.note) || '';
  const photos = (stats.proofPhotos || []).filter((p) => p?.url);

  return (
    <div style={{ background: C.white, padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,48px)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: C.primaryText, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 12px' }}>
          {t('charity.eyebrow')}
        </p>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 800, color: C.black, margin: '0 0 24px', letterSpacing: '-0.3px' }}>
          {t('charity.title')}
        </h2>

        <div style={{ background: C.bg, borderRadius: 16, padding: 'clamp(20px,4vw,32px)', textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.textSec, textTransform: 'uppercase', letterSpacing: 1 }}>{t('charity.total')}</div>
          <div style={{ fontSize: 'clamp(34px,7vw,56px)', fontWeight: 800, color: C.black, margin: '6px 0 10px' }}>
            {amount} <span style={{ color: C.primaryText }}>₼</span>
          </div>
          {date && <div style={{ fontSize: 13, color: C.textSec }}>{t('charity.asOf', { date })}</div>}
          {recipient && <div style={{ fontSize: 13, color: C.textSec, marginTop: 4 }}>{t('charity.recipient', { name: recipient })}</div>}
          {note && <p style={{ fontSize: 14, color: C.black, lineHeight: 1.7, margin: '14px auto 0', maxWidth: 520 }}>{note}</p>}
        </div>

        {photos.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textSec, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', marginBottom: 12 }}>
              {t('charity.proof')}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {photos.map((p, i) => {
                const caption = (en ? p.captionEn || p.caption : p.caption) || '';
                return (
                  <a key={p.url + i} href={p.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: 104, textDecoration: 'none' }}>
                    <img
                      src={`${p.url}?w=208&h=208&fit=crop&auto=format&q=70`}
                      alt={caption || t('charity.proof')}
                      width={104}
                      height={104}
                      loading="lazy"
                      style={{ width: 104, height: 104, objectFit: 'cover', borderRadius: 10, border: `1px solid ${C.border}`, display: 'block' }}
                    />
                    {caption && <span style={{ display: 'block', fontSize: 11, color: C.textSec, marginTop: 4, lineHeight: 1.3 }}>{caption}</span>}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
