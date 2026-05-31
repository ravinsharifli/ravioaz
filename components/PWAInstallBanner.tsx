import React, { useState, useEffect } from 'react';

// ── Sabitlər ──────────────────────────────────────────────────────────────────
const STORAGE_KEY  = 'ravio_pwa_dismissed_at';
const COOLDOWN_MS  = 7 * 24 * 60 * 60 * 1000; // 7 gün
const SHOW_DELAY   = 3500;                      // ms — sayt açıldıqdan sonra gözləmə

function wasDismissed(): boolean {
  try {
    const ts = localStorage.getItem(STORAGE_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < COOLDOWN_MS;
  } catch { return false; }
}

function markDismissed(): void {
  try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch {}
}

function isAlreadyInstalled(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isMobile(): boolean {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

// ── Komponent ─────────────────────────────────────────────────────────────────
export default function PWAInstallBanner() {
  const [visible,        setVisible]        = useState(false);
  const [animIn,         setAnimIn]         = useState(false);
  const [platform,       setPlatform]       = useState<'android' | 'ios' | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIosSteps,   setShowIosSteps]   = useState(false);

  useEffect(() => {
    if (wasDismissed() || isAlreadyInstalled() || !isMobile()) return;

    const ua  = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);

    if (ios) {
      // iOS Safari — brauzer öz promtunu dəstəkləmir, əl ilə təlimatlı göstəririk
      setPlatform('ios');
      const t = setTimeout(() => { setVisible(true); setTimeout(() => setAnimIn(true), 30); }, SHOW_DELAY);
      return () => clearTimeout(t);
    }

    // Android / Desktop Chrome — beforeinstallprompt hadisəsini gözləyirik
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setPlatform('android');
      setTimeout(() => { setVisible(true); setTimeout(() => setAnimIn(true), 30); }, SHOW_DELAY);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const dismiss = () => {
    setAnimIn(false);
    setTimeout(() => setVisible(false), 320);
    markDismissed();
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setAnimIn(false);
      setTimeout(() => setVisible(false), 320);
    }
  };

  if (!visible) return null;

  // ── Ortaq stil dəyişənləri ─────────────────────────────────────────────────
  const wrap: React.CSSProperties = {
    position:    'fixed',
    bottom:      animIn ? 16 : -120,
    left:        '50%',
    transform:   'translateX(-50%)',
    width:       'calc(100% - 32px)',
    maxWidth:    480,
    zIndex:      9999,
    transition:  'bottom 0.35s cubic-bezier(0.34, 1.20, 0.64, 1)',
    display:     'flex',
    flexDirection: 'column' as const,
    gap:         0,
    filter:      'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
  };

  const card: React.CSSProperties = {
    background:   '#111111',
    borderRadius: 16,
    padding:      '14px 16px',
    display:      'flex',
    alignItems:   'center',
    gap:          14,
    border:       '1px solid rgba(255,255,255,0.08)',
  };

  const iconBox: React.CSSProperties = {
    width:        44,
    height:       44,
    borderRadius: 10,
    flexShrink:   0,
    overflow:     'hidden',
    background:   '#1a1a1a',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
  };

  const btnInstall: React.CSSProperties = {
    padding:       '8px 16px',
    background:    '#FF6A00',
    color:         '#ffffff',
    border:        'none',
    borderRadius:  8,
    fontSize:      13,
    fontWeight:    700,
    cursor:        'pointer',
    whiteSpace:    'nowrap' as const,
    fontFamily:    'Inter, sans-serif',
    flexShrink:    0,
    letterSpacing: 0.2,
  };

  const btnClose: React.CSSProperties = {
    background:   'transparent',
    border:       'none',
    color:        'rgba(255,255,255,0.4)',
    fontSize:     20,
    cursor:       'pointer',
    padding:      '4px 6px',
    lineHeight:   1,
    flexShrink:   0,
  };

  const textMain: React.CSSProperties = {
    flex:         1,
    minWidth:     0,
  };

  const t1: React.CSSProperties = {
    fontSize:     13,
    fontWeight:   700,
    color:        '#ffffff',
    fontFamily:   'Inter, sans-serif',
    margin:       0,
    lineHeight:   1.3,
  };

  const t2: React.CSSProperties = {
    fontSize:     11,
    color:        'rgba(255,255,255,0.45)',
    fontFamily:   'Inter, sans-serif',
    margin:       '3px 0 0',
    lineHeight:   1.4,
  };

  // ── iOS addım genişlənməsi ─────────────────────────────────────────────────
  const iosSteps: React.CSSProperties = {
    background:   '#1a1a1a',
    borderRadius: '0 0 16px 16px',
    padding:      '12px 16px 14px',
    borderTop:    '1px solid rgba(255,255,255,0.06)',
    display:      'flex',
    flexDirection: 'column' as const,
    gap:          8,
  };

  const step = (emoji: string, text: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>{text}</span>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={wrap} role="dialog" aria-label="Uygulamanı quraşdır">
      {/* ── Əsas kart ── */}
      <div style={{ ...card, borderRadius: showIosSteps ? '16px 16px 0 0' : 16 }}>
        {/* İkon */}
        <div style={iconBox}>
          <img src="/icon-192.png" alt="Ravio" style={{ width: 44, height: 44, objectFit: 'cover' }} />
        </div>

        {/* Mətn */}
        <div style={textMain}>
          <p style={t1}>Ravio-nu telefonuna əlavə et</p>
          <p style={t2}>Tez giriş · Tətbiq kimi açılır · Pulsuzdur</p>
        </div>

        {/* Düymələr */}
        {platform === 'android' && (
          <button onClick={install} style={btnInstall}>Quraşdır</button>
        )}
        {platform === 'ios' && (
          <button
            onClick={() => setShowIosSteps(v => !v)}
            style={btnInstall}
          >
            Necə?
          </button>
        )}
        <button onClick={dismiss} style={btnClose} aria-label="Bağla">×</button>
      </div>

      {/* ── iOS addım genişlənməsi ── */}
      {platform === 'ios' && showIosSteps && (
        <div style={iosSteps}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#FF6A00', fontFamily: 'Inter, sans-serif', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            3 addımda quraşdır
          </p>
          {step('⬆️', 'Aşağı toolbarda paylaşma (□↑) düyməsinə bas')}
          {step('📋', '"Ana Ekrana Əlavə Et" seçimini tap')}
          {step('✅', '"Əlavə Et" düyməsinə bas — hazırdır!')}
        </div>
      )}
    </div>
  );
}