import React, { useState, useMemo } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Edit3, ChevronLeft, ChevronRight } from 'lucide-react';
import { CartItem, MetroSchedule } from '../types';

const FONT = "'Inter', -apple-system, sans-serif";

const C = {
  bg:       '#F5F2EC',
  white:    '#FFFFFF',
  black:    '#111111',
  gray:     '#666666',
  grayLt:   '#AAAAAA',
  border:   '#E5E1DB',
  orange:   '#FF6A00',
  orangeBg: '#FFF3EC',
  orangeBd: '#FFD4B8',
  green:    '#16A34A',
  greenBg:  '#F0FDF4',
  blue:     '#2563EB',
  blueBg:   '#EFF6FF',
  blueBd:   '#BFDBFE',
  red:      '#DC2626',
};

const MONTHS_AZ = ['Yanvar','Fevral','Mart','Aprel','May','İyun','İyul','Avqust','Sentyabr','Oktyabr','Noyabr','Dekabr'];
const DAYS_LIST = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

// Günün adı (AZ) - JS getDay() sırasına görə
const WEEKDAY_AZ = ['Bazar','Bazar ertəsi','Çərşənbə axşamı','Çərşənbə','Cümə axşamı','Cümə','Şənbə'];

// 06:00 → 21:45 bütün saatlar
const TIME_SLOTS: string[] = [];
for (let h = 6; h < 22; h++) {
  ['00','15','30','45'].forEach(m => {
    TIME_SLOTS.push(`${String(h).padStart(2,'0')}:${m}`);
  });
}

// ── Tarix köməkçiləri ──────────────────────────────────────────
function todayDate(): Date {
  const d = new Date();
  d.setHours(0,0,0,0);
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function formatDate(d: Date): string {
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS_AZ[d.getMonth()]} ${d.getFullYear()}`;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0,10); // YYYY-MM-DD
}

function weekdayName(d: Date): string {
  return WEEKDAY_AZ[d.getDay()];
}

function getNext30Days(): Date[] {
  const t = todayDate();
  return Array.from({ length: 30 }, (_, i) => addDays(t, i));
}

// ── UI komponentləri ───────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' as const, color: C.gray, margin: '0 0 10px', fontFamily: FONT }}>
    {children}
  </p>
);

const Sec: React.FC<{ children: React.ReactNode; highlight?: boolean }> = ({ children, highlight }) => (
  <div style={{
    background: C.white, border: `1.5px solid ${highlight ? C.blue : C.border}`,
    borderRadius: 12, padding: '14px 16px', marginBottom: 12,
  }}>{children}</div>
);

const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ onFocus, onBlur, ...props }) => (
  <input
    {...props}
    style={{
      width: '100%', background: C.white, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '11px 14px',
      color: C.black, fontSize: 14, fontFamily: FONT,
      outline: 'none', boxSizing: 'border-box' as const,
      transition: 'border-color 0.15s', ...props.style,
    }}
    onFocus={e => { e.currentTarget.style.borderColor = C.blue; onFocus?.(e); }}
    onBlur={e => { e.currentTarget.style.borderColor = C.border; onBlur?.(e); }}
  />
);

const Sel: React.FC<{ value: string; onChange: (v: string) => void; opts: string[]; placeholder?: string }> = ({ value, onChange, opts, placeholder }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: '100%', background: C.bg, border: `1px solid ${C.border}`,
      borderRadius: 8, padding: '11px 10px',
      color: value ? C.black : C.grayLt, fontSize: 13,
      outline: 'none', fontFamily: FONT, cursor: 'pointer',
    }}
  >
    {placeholder && <option value="" disabled>{placeholder}</option>}
    {opts.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

const SRow: React.FC<{ l: string; r: string; accent?: boolean; bold?: boolean }> = ({ l, r, accent, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <span style={{ fontSize: 13, color: C.gray, fontFamily: FONT }}>{l}</span>
    <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: accent ? C.green : C.black, fontFamily: FONT }}>{r}</span>
  </div>
);

const Chip: React.FC<{
  label: string;
  selected: boolean;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
}> = ({ label, selected, onClick, color = C.black, disabled = false }) => (
  <div
    onClick={disabled ? undefined : onClick}
    style={{
      padding: '7px 13px', borderRadius: 100, fontSize: 12,
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: selected ? 600 : 400,
      background: disabled ? '#F0F0F0' : selected ? color : C.bg,
      color: disabled ? '#CCCCCC' : selected ? C.white : C.gray,
      border: `1px solid ${disabled ? '#E0E0E0' : selected ? color : C.border}`,
      transition: 'all 0.15s',
      opacity: disabled ? 0.6 : 1,
    }}
  >
    {label}
  </div>
);

// ── Tarix seçici mini-təqvim ───────────────────────────────────
const DatePicker: React.FC<{
  selected: string;
  onChange: (key: string, display: string, weekday: string) => void;
  availableWeekdays: string[];
}> = ({ selected, onChange, availableWeekdays }) => {
  const [offset, setOffset] = useState(0);
  const allDays = getNext30Days();
  const page = allDays.slice(offset * 7, offset * 7 + 7);
  const maxOffset = Math.floor((allDays.length - 1) / 7);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <button
          onClick={() => setOffset(o => Math.max(0, o - 1))}
          disabled={offset === 0}
          style={{
            background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
            width: 32, height: 32, cursor: offset === 0 ? 'not-allowed' : 'pointer',
            color: offset === 0 ? C.grayLt : C.gray,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronLeft size={16} />
        </button>
        <span style={{ fontSize: 12, color: C.gray, fontWeight: 600 }}>
          {page[0] ? `${page[0].getDate()} ${MONTHS_AZ[page[0].getMonth()]}` : ''}
          {page[6] ? ` – ${page[6].getDate()} ${MONTHS_AZ[page[6].getMonth()]}` : ''}
        </span>
        <button
          onClick={() => setOffset(o => Math.min(maxOffset, o + 1))}
          disabled={offset >= maxOffset}
          style={{
            background: 'none', border: `1px solid ${C.border}`, borderRadius: 8,
            width: 32, height: 32, cursor: offset >= maxOffset ? 'not-allowed' : 'pointer',
            color: offset >= maxOffset ? C.grayLt : C.gray,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {page.map(d => {
          const key     = dateKey(d);
          const wd      = weekdayName(d);
          const isAvail = availableWeekdays.includes(wd);
          const isSel   = selected === key;
          const isToday = key === dateKey(todayDate());

          return (
            <div
              key={key}
              onClick={isAvail ? () => onChange(key, formatDate(d), wd) : undefined}
              style={{
                textAlign: 'center' as const,
                padding: '8px 4px',
                borderRadius: 10,
                cursor: isAvail ? 'pointer' : 'not-allowed',
                background: isSel ? C.blue : isToday && isAvail ? C.blueBg : 'transparent',
                border: `1.5px solid ${isSel ? C.blue : isToday && isAvail ? C.blueBd : 'transparent'}`,
                opacity: isAvail ? 1 : 0.3,
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 9, color: isSel ? 'rgba(255,255,255,0.75)' : C.grayLt, marginBottom: 2, fontWeight: 600 }}>
                {wd.slice(0, 3).toUpperCase()}
              </div>
              <div style={{ fontSize: 14, fontWeight: isSel ? 700 : 500, color: isSel ? C.white : isAvail ? C.black : C.grayLt }}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Props ──────────────────────────────────────────────────────
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (cartId: string) => void;
  onEdit: (item: CartItem) => void;
  onGoToProducts?: () => void;
  metroSchedule?: MetroSchedule;
}

function getItemSubtotal(item: CartItem): number {
  if (item.finalTotal !== undefined) return item.finalTotal;
  const base = item.discountPrice ?? item.price;
  return base * item.quantity + (item.boxPrice ?? 0);
}

// ── Əsas komponent ─────────────────────────────────────────────
const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, items, onRemove, onEdit, onGoToProducts, metroSchedule,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [custName,     setCustName]     = useState('');
  const [phone,        setPhone]        = useState('');
  const [bdDay,        setBdDay]        = useState('');
  const [bdMonth,      setBdMonth]      = useState('');
  const [bdYear,       setBdYear]       = useState('');
  const [customerType, setCustomerType] = useState<'new' | 'loyal' | null>(null);
  const [delivery,     setDelivery]     = useState<'metro' | 'kuryer' | 'post'>('metro');
  const [metro,        setMetro]        = useState('');
  const [selDateKey,     setSelDateKey]     = useState('');
  const [selDateDisplay, setSelDateDisplay] = useState('');
  const [selWeekday,     setSelWeekday]     = useState('');
  const [delTime,      setDelTime]      = useState('');
  const [address,      setAddress]      = useState('');
  const [kurDay,       setKurDay]       = useState('');
  const [kurMonth,     setKurMonth]     = useState('');
  const [kurYear,      setKurYear]      = useState('2026');

  // ── Metro məlumatları ──────────────────────────────────────────
  const stations = (metroSchedule?.stations ?? []).filter(s => s.isActive !== false);
  const selectedStation = stations.find(s => s.name === metro);

  const availableWeekdays = useMemo(
    () => (selectedStation?.daySchedules ?? []).map((ds: any) => ds.day),
    [selectedStation]
  );

  const selectedDaySchedule = selWeekday
    ? (selectedStation?.daySchedules ?? []).find((ds: any) => ds.day === selWeekday)
    : null;

  // allDayOpen = true → bütün saatlar, false → yalnız seçilmiş saatlar
  const allTimeSlots: string[] = selectedDaySchedule
    ? (selectedDaySchedule.allDayOpen
        ? TIME_SLOTS
        : (selectedDaySchedule.timeSlots ?? []))
    : [];

  const handleStationChange = (name: string) => {
    setMetro(name);
    setSelDateKey('');
    setSelDateDisplay('');
    setSelWeekday('');
    setDelTime('');
  };

  const handleDateChange = (key: string, display: string, weekday: string) => {
    setSelDateKey(key);
    setSelDateDisplay(display);
    setSelWeekday(weekday);
    setDelTime('');
  };

  // ── Hesablamalar ───────────────────────────────────────────────
  const baseTotal   = items.reduce((s, item) => s + getItemSubtotal(item), 0);
  const deliveryFee = delivery === 'metro' ? 0 : 4.99;
  const subtotal    = baseTotal + deliveryFee;
  const discRate    = customerType === 'loyal' ? 20 : customerType === 'new' ? 10 : 0;
  const custDisc    = customerType ? Math.round(subtotal * discRate / 100 * 100) / 100 : 0;
  const grandTotal  = subtotal - custDisc;
  const grandBeh    = Math.ceil(grandTotal * 0.5);

  const checkoutValid =
    custName.trim().length > 0 &&
    phone.trim().length > 0 &&
    customerType !== null &&
    (
      delivery === 'metro'
        ? metro !== '' && selDateKey !== '' && delTime !== ''
        : kurDay !== '' && kurMonth !== '' && address.trim().length > 0
    );

  const handleWhatsApp = async () => {
    if (!checkoutValid) return;
    const birthStr = bdDay && bdMonth && bdYear
      ? `${bdDay} ${bdMonth} ${bdYear}`
      : 'Bildirilməyib';

    const delStr = delivery === 'metro'
      ? `Metro: ${metro} · Tarix: ${selDateDisplay} (${selWeekday}) · Saat: ${delTime}`
      : `${kurDay} ${kurMonth} ${kurYear} · ${delivery === 'kuryer' ? 'Kuryer' : 'Poçt'} · Ünvan: ${address}`;

    const itemsText = items.map((item, idx) => {
      const imgUrl = item.images?.[0] ?? '';
      let lines = `- Vahid qiyməti: ${(item.discountPrice ?? item.price).toFixed(2)} ₼\n`;
      lines += `- Say: ${item.quantity} ədəd\n`;
      if ((item.boxPrice ?? 0) > 0) lines += `  Qablaşdırma: +${item.boxPrice!.toFixed(2)} ₼\n`;
      lines += `  Məhsul cəmi: ${getItemSubtotal(item).toFixed(2)} ₼\n`;
      return (
        `━━━━━━━━━━━━━━━\n*MƏHSUL ${idx + 1}:*\n` +
        `- Ad: ${item.productName}\n- Model: ${item.modelName}\n- Rəng: ${item.colorName}\n` +
        (imgUrl ? `🖼 Şəkil: ${imgUrl}\n` : '') +
        lines +
        (item.customText    ? `- Yazı/Qeyd: ${item.customText}\n`    : '') +
        (item.specialRequest && item.specialRequest.startsWith('Müştəri şəkli:') ? `📎 ${item.specialRequest}\n` : item.specialRequest ? `- Xüsusi: ${item.specialRequest}\n` : '')
      );
    }).join('\n');

    const msg =
      `*🛍 YENİ SİFARİŞ — RAVIO.AZ*\n\n` +
      itemsText +
      `\n━━━━━━━━━━━━━━━\n*ÇATDIRILMA:* ${delStr}\n\n` +
      `*ƏLAQƏ:*\n- Ad: ${custName}\n- Telefon: ${phone}\n- Doğum tarixi: ${birthStr}\n` +
      `- Müştəri növü: ${customerType === 'loyal' ? 'Daimi müştəri' : 'Yeni müştəri'}\n\n` +
      `━━━━━━━━━━━━━━━\n` +
      `Məhsullar cəmi: ${baseTotal.toFixed(2)} ₼\n` +
      (deliveryFee > 0 ? `Çatdırılma: +${deliveryFee.toFixed(2)} ₼\n` : `Çatdırılma: Pulsuz\n`) +
      (custDisc > 0 ? `Endirim (${discRate}%): -${custDisc.toFixed(2)} ₼\n` : '') +
      `*ÜMUMİ: ${grandTotal.toFixed(2)} ₼*\n` +
      `*💳 ÖN ÖDƏNİŞ (50% beh): ${grandBeh.toFixed(2)} ₼*\n` +
      `Qalan ${(grandTotal - grandBeh).toFixed(2)} ₼ məhsul alınarkən`;

    // ── Sanity-ə sifariş yaz ──────────────────────────────────────────────
    try {
      const { createClient } = await import('@sanity/client');
      const sanityClient = createClient({
        projectId: 'w7scii42',
        dataset: 'production',
        apiVersion: '2024-01-01',
        useCdn: false,
        token: (import.meta as any).env?.VITE_SANITY_TOKEN,
      });

      const orderId = 'R-' + Date.now().toString(36).toUpperCase();

      await sanityClient.create({
        _type: 'order',
        orderId,
        status: 'new',
        customerName: custName,
        phone,
        deliveryMethod: delivery,
        deliveryDetails: delStr,
        totalAmount: grandTotal,
        depositAmount: grandBeh,
        createdAt: new Date().toISOString(),
        items: items.map(item => ({
          _key: item.cartId,
          productName: item.productName,
          modelName: item.modelName,
          colorName: item.colorName,
          quantity: item.quantity,
          price: item.discountPrice ?? item.price,
          customText: item.customText || '',
          boxType: item.boxType || '',
        })),
      });
    } catch (err) {
      // Sanity yazma xətası WhatsApp-ı dayandırmasın
      console.error('Sanity order error:', err);
    }

    window.open(`https://wa.me/994519831483?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.5)', fontFamily: FONT }}
      onClick={e => { if (e.target === e.currentTarget) { onClose(); setIsCheckingOut(false); } }}
    >
      <style>{`
        .ravio-cart-drawer {
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 100%;
          background: ${C.bg};
          display: flex;
          flex-direction: column;
          box-shadow: -8px 0 32px rgba(0,0,0,0.12);
        }
        @media (min-width: 480px) {
          .ravio-cart-drawer { max-width: 480px; }
        }
        @media (min-width: 768px) {
          .ravio-cart-drawer { max-width: 520px; }
        }
        @media (min-width: 1024px) {
          .ravio-cart-drawer { max-width: 560px; }
        }
      `}</style>
      <div className="ravio-cart-drawer">

        {/* Header */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '18px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isCheckingOut && (
                <button onClick={() => setIsCheckingOut(false)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  display: 'flex', alignItems: 'center', color: C.gray,
                }}>
                  <ChevronLeft size={20} />
                </button>
              )}
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.black }}>
                {isCheckingOut ? 'Sifarişi Tamamla' : `Səbətim (${items.length})`}
              </h2>
            </div>
            <button
              onClick={() => { onClose(); setIsCheckingOut(false); }}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: C.bg, border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray,
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Boş səbət */}
        {items.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
            <ShoppingBag size={48} color={C.grayLt} />
            <p style={{ fontSize: 15, color: C.gray, margin: 0, textAlign: 'center' as const }}>Səbətiniz boşdur</p>
            <button onClick={onGoToProducts} style={{
              padding: '12px 28px', background: C.orange, color: C.white,
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: FONT,
            }}>
              Məhsullara bax
            </button>
          </div>
        )}

        {/* SƏBƏT LİSTİ */}
        {items.length > 0 && !isCheckingOut && (
          <>
            <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px' }}>
              {items.map(item => (
                <div key={item.cartId} style={{
                  background: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '14px', marginBottom: 10,
                }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {item.images?.[0] && (
                      <img
                        src={item.images[0]} alt={item.productName}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.black, marginBottom: 2 }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginBottom: 4 }}>
                        {[item.modelName !== '—' && item.modelName, item.colorName !== '—' && item.colorName].filter(Boolean).join(' · ')}
                      </div>
                      {item.customText && (
                        <div style={{ fontSize: 11, color: C.blue, background: C.blueBg, borderRadius: 6, padding: '3px 8px', display: 'inline-block', marginBottom: 4 }}>
                          "{item.customText.length > 30 ? item.customText.slice(0, 30) + '...' : item.customText}"
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: C.grayLt }}>{item.quantity} ədəd</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: C.black }}>{getItemSubtotal(item).toFixed(2)} ₼</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    <button onClick={() => onEdit(item)} style={{
                      flex: 1, padding: '8px', borderRadius: 8,
                      background: C.bg, border: `1px solid ${C.border}`,
                      color: C.gray, fontSize: 12, cursor: 'pointer', fontFamily: FONT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                      <Edit3 size={13} /> Düzəlt
                    </button>
                    <button onClick={() => onRemove(item.cartId)} style={{
                      flex: 1, padding: '8px', borderRadius: 8,
                      background: '#FFF5F5', border: `1px solid #FFC9C9`,
                      color: C.red, fontSize: 12, cursor: 'pointer', fontFamily: FONT,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                    }}>
                      <Trash2 size={13} /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 20px 28px', background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: C.gray }}>{items.length} məhsul</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.black }}>{baseTotal.toFixed(2)} ₼</span>
              </div>
              <button onClick={() => setIsCheckingOut(true)} style={{
                width: '100%', padding: '15px', borderRadius: 10, border: 'none',
                background: C.orange, color: C.white,
                fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT,
                boxShadow: '0 4px 16px rgba(255,106,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                Sifarişi Tamamla <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {/* CHECKOUT */}
        {items.length > 0 && isCheckingOut && (
          <>
            <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px 20px' }}>

              {/* Çatdırılma üsulu */}
              <div style={{ marginBottom: 12 }}>
                <Label>Çatdırılma üsulu</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'metro'  as const, icon: '🚇', label: 'Metro',  sub: 'Ödənişsiz' },
                    { id: 'kuryer' as const, icon: '🛵', label: 'Kuryer', sub: '+4.99 ₼'   },
                    { id: 'post'   as const, icon: '📮', label: 'Poçt',   sub: '+4.99 ₼'   },
                  ].map(d => (
                    <div key={d.id} onClick={() => setDelivery(d.id)} style={{
                      flex: 1, background: delivery === d.id ? C.black : C.white,
                      border: `1.5px solid ${delivery === d.id ? C.black : C.border}`,
                      borderRadius: 10, padding: '12px 8px',
                      textAlign: 'center' as const, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{d.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: delivery === d.id ? C.white : C.black }}>{d.label}</div>
                      <div style={{ fontSize: 10, marginTop: 2, color: delivery === d.id ? 'rgba(255,255,255,0.55)' : C.grayLt }}>{d.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* METRO SEÇİMİ */}
              {delivery === 'metro' && (
                <Sec>
                  <Label>Metro stansiyası</Label>
                  {stations.length === 0 ? (
                    <p style={{ fontSize: 12, color: C.grayLt, margin: '0 0 14px' }}>
                      Admin paneldə stansiya əlavə edilməyib.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7, marginBottom: 16 }}>
                      {stations.map(s => (
                        <Chip
                          key={s.name}
                          label={s.name}
                          selected={metro === s.name}
                          onClick={() => handleStationChange(s.name)}
                          color={C.black}
                        />
                      ))}
                    </div>
                  )}

                  {/* Tarix seçimi */}
                  {metro !== '' && (
                    <>
                      <Label>Çatdırılma tarixi</Label>
                      {availableWeekdays.length === 0 ? (
                        <p style={{ fontSize: 12, color: C.grayLt, margin: '0 0 14px' }}>
                          Bu stansiya üçün aktiv gün yoxdur.
                        </p>
                      ) : (
                        <div style={{ marginBottom: 16 }}>
                          <p style={{ fontSize: 11, color: C.grayLt, margin: '0 0 10px' }}>
                            Aktiv günlər: {availableWeekdays.join(', ')}
                          </p>
                          <DatePicker
                            selected={selDateKey}
                            onChange={handleDateChange}
                            availableWeekdays={availableWeekdays}
                          />
                          {selDateKey && (
                            <div style={{
                              marginTop: 10, padding: '8px 12px',
                              background: C.blueBg, border: `1px solid ${C.blueBd}`,
                              borderRadius: 8, fontSize: 12, color: C.blue, fontWeight: 600,
                            }}>
                              ✅ {selDateDisplay} — {selWeekday}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Saat seçimi */}
                  {selDateKey !== '' && (
                    <>
                      <Label>Çatdırılma saatı</Label>
                      {allTimeSlots.length === 0 ? (
                        <p style={{ fontSize: 12, color: C.grayLt, margin: 0 }}>
                          Bu gün üçün boş saat yoxdur. Başqa tarix seçin.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                          {allTimeSlots.map(slot => (
                            <Chip
                              key={slot}
                              label={slot}
                              selected={delTime === slot}
                              onClick={() => setDelTime(slot)}
                              color={C.green}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </Sec>
              )}

              {/* KURYER / POÇT */}
              {(delivery === 'kuryer' || delivery === 'post') && (
                <Sec>
                  <Label>Çatdırılma ünvanı</Label>
                  <Inp
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder={delivery === 'post' ? 'Şəhər, poçt indeksi, ünvan' : 'Məhəllə, küçə, bina nömrəsi'}
                    style={{ marginBottom: 12 }}
                  />
                  <p style={{ margin: '0 0 14px', fontSize: 11, color: C.grayLt }}>
                    {delivery === 'post'
                      ? 'Nümunə: Bakı, AZ1000, Əliağa Vahid küç. 12'
                      : 'Nümunə: Qaraçuxur, Maşallah market yanı'}
                  </p>
                  <Label>Tarix</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
                    <Sel value={kurDay}   onChange={setKurDay}   opts={DAYS_LIST}       placeholder="Gün" />
                    <Sel value={kurMonth} onChange={setKurMonth} opts={MONTHS_AZ}       placeholder="Ay"  />
                    <Sel value={kurYear}  onChange={setKurYear}  opts={['2026','2027']} placeholder="İl"  />
                  </div>
                  <p style={{ margin: '8px 0 0', fontSize: 11, color: C.grayLt }}>
                    Çatdırılma üçün kuryer əlaqə saxlayacaq
                  </p>
                </Sec>
              )}

              {/* Əlaqə məlumatları */}
              <Sec highlight>
                <Label>Əlaqə məlumatları</Label>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  <Inp value={custName} onChange={e => setCustName(e.target.value)} placeholder="Adınız" />
                  <Inp value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon (+994 50 xxx xx xx)" type="tel" />
                  <div>
                    <p style={{ fontSize: 12, color: C.gray, margin: '0 0 6px', fontFamily: FONT }}>Doğum tarixi</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
                      <Sel value={bdDay}   onChange={setBdDay}   opts={DAYS_LIST} placeholder="Gün" />
                      <Sel value={bdMonth} onChange={setBdMonth} opts={MONTHS_AZ} placeholder="Ay"  />
                      <Sel value={bdYear}  onChange={setBdYear}
                        opts={['1970','1975','1980','1985','1990','1991','1992','1993','1994',
                               '1995','1996','1997','1998','1999','2000','2001','2002','2003',
                               '2004','2005','2006']}
                        placeholder="İl"
                      />
                    </div>
                  </div>
                </div>
              </Sec>

              {/* Müştəri növü */}
              <Sec>
                <Label>Müştəri növü</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'new'   as const, label: 'Yeni müştəri',  sub: 'İlk sifarişim'  },
                    { id: 'loyal' as const, label: 'Daimi müştəri', sub: 'Əvvəl vermişəm' },
                  ].map(opt => {
                    const sel = customerType === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setCustomerType(opt.id)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        background: sel ? C.bg : C.white,
                        border: `1.5px solid ${sel ? C.blue : C.border}`,
                        transition: 'all 0.15s',
                      }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${sel ? C.blue : C.border}`,
                          background: sel ? C.blue : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {sel && <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.white }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: sel ? 600 : 400, color: C.black, lineHeight: 1.2 }}>{opt.label}</div>
                          <div style={{ fontSize: 10, color: C.grayLt, marginTop: 1 }}>{opt.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Sec>

              {/* Sifariş xülasəsi */}
              <Sec>
                <Label>Sifariş xülasəsi</Label>
                {items.map(item => (
                  <SRow key={item.cartId} l={`${item.productName} ×${item.quantity}`} r={`${getItemSubtotal(item).toFixed(2)} ₼`} />
                ))}
                {deliveryFee > 0 && (
                  <SRow l={delivery === 'kuryer' ? 'Kuryer' : 'Poçt'} r={`+${deliveryFee.toFixed(2)} ₼`} />
                )}
                {custDisc > 0 && (
                  <SRow
                    l={customerType === 'loyal' ? 'Daimi müştəri endirimi' : 'Yeni müştəri endirimi'}
                    r={`−${custDisc.toFixed(2)} ₼`}
                    accent
                  />
                )}
                <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0 12px' }} />
                <SRow l="Ümumi məbləğ" r={`${grandTotal.toFixed(2)} ₼`} bold />
                <div style={{
                  background: C.orangeBg, border: `1px solid ${C.orangeBd}`,
                  borderRadius: 10, padding: '12px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4,
                }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>İndi ödəniləcək (50% beh)</div>
                    <div style={{ fontSize: 11, color: C.gray, marginTop: 2 }}>
                      Qalan {(grandTotal - grandBeh).toFixed(2)} ₼ məhsul alınarkən
                    </div>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: C.orange }}>{grandBeh.toFixed(2)} ₼</div>
                </div>
              </Sec>

            </div>

            <div style={{ padding: '14px 20px 28px', background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              {!checkoutValid && (
                <p style={{ fontSize: 12, color: C.grayLt, textAlign: 'center' as const, margin: '0 0 10px', fontFamily: FONT }}>
                  Bütün xanaları doldurun
                </p>
              )}
              <button
                disabled={!checkoutValid}
                onClick={handleWhatsApp}
                style={{
                  width: '100%', padding: '15px', borderRadius: 10, border: 'none',
                  background: checkoutValid ? '#25D366' : C.bg,
                  color: checkoutValid ? C.white : C.grayLt,
                  fontSize: 15, fontWeight: 700,
                  cursor: checkoutValid ? 'pointer' : 'not-allowed',
                  fontFamily: FONT,
                  boxShadow: checkoutValid ? '0 4px 16px rgba(37,211,102,0.3)' : 'none',
                }}
              >
                💬 WhatsApp ilə Göndər
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;