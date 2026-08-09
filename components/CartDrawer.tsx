import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Edit3, ChevronLeft, Minus, Plus } from 'lucide-react';
import { CartItem, MetroSchedule, Coupon, Product } from '../types';
import { F } from '../tokens';
import { WHATSAPP_NUMBER } from '../constants';
import { FONT_STYLES } from '../constants/defaults';
import { toWebP } from '../lib/image';
import { getMaxQuantityForItem } from '../lib/cartPricing';
import '../styles/cart-drawer.css';

const FONT = F.sans;

const C = {
  bg: 'var(--clr-bg)',
  white: 'var(--clr-white)',
  black: 'var(--clr-black)',
  gray: 'var(--clr-text-sec)',
  grayLt: 'var(--clr-text-muted)',
  border: '#E5E1DB',
  orange: 'var(--clr-primary)',
  green: '#16A34A',
  red: '#DC2626',
  blue: '#2563EB',
};

const MONTHS_AZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
];

const DAYS_LIST = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
const ORDER_YEARS = Array.from({ length: 3 }, (_, i) => String(new Date().getFullYear() + i));
const currentYear = new Date().getFullYear();
const BIRTH_YEARS = Array.from({ length: currentYear - 1969 }, (_, i) => String(1970 + i)).reverse();

function getMinDeliveryDate(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3);
  return d;
}

function azDateStr(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS_AZ[date.getMonth()]} ${date.getFullYear()}`;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  products?: Product[];
  onRemove: (cartId: string) => void;
  onEdit: (item: CartItem) => void;
  onUpdateQuantity?: (cartId: string, quantity: number) => void;
  onGoToProducts?: () => void;
  onClearCart?: () => void;
  metroSchedule?: MetroSchedule;
  coupons?: Coupon[];
}

function getItemSubtotal(item: CartItem): number {
  if (item.finalTotal !== undefined) return item.finalTotal;
  const base = item.discountPrice ?? item.price;
  return base * item.quantity + (item.boxPrice ?? 0);
}

function money(value: number): string {
  return `${value.toFixed(2)} ₼`;
}

function openWhatsAppMessage(message: string) {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 700, color: C.gray, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.4 }}>
    {children}
  </p>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={{
      width: '100%',
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '12px 14px',
      color: C.black,
      fontSize: 14,
      fontFamily: FONT,
      outline: 'none',
      boxSizing: 'border-box',
      ...props.style,
    }}
  />
);

const Select: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  ariaLabel?: string;
}> = ({ value, onChange, options, placeholder, ariaLabel }) => (
  <select
    value={value}
    aria-label={ariaLabel || placeholder}
    onChange={(event) => onChange(event.target.value)}
    style={{
      width: '100%',
      background: C.white,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: '12px 10px',
      color: value ? C.black : C.grayLt,
      fontSize: 13,
      fontFamily: FONT,
      outline: 'none',
      boxSizing: 'border-box',
    }}
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((option) => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

const Section: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 12 }}>
    {children}
  </div>
);

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  products,
  onRemove,
  onEdit,
  onUpdateQuantity,
  onGoToProducts,
  onClearCart,
  metroSchedule,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [custName, setCustName] = useState('');
  const [phone, setPhone] = useState('');
  const [bdDay, setBdDay] = useState('');
  const [bdMonth, setBdMonth] = useState('');
  const [bdYear, setBdYear] = useState('');

  const [delivery, setDelivery] = useState<'kuryer' | 'metro' | 'post'>('kuryer');
  const [address, setAddress] = useState('');
  const [kurDay, setKurDay] = useState('');
  const [kurMonth, setKurMonth] = useState('');
  const [kurYear, setKurYear] = useState(String(new Date().getFullYear()));
  const [metro, setMetro] = useState('');
  const [metroDay, setMetroDay] = useState('');
  const [metroTime, setMetroTime] = useState('');

  if (!isOpen) return null;

  const stations = (metroSchedule?.stations ?? []).filter((station) => station.isActive !== false);
  const selectedStation = stations.find((station) => station.name === metro);
  const metroDays = (selectedStation?.daySchedules ?? []).map((day) => day.day);
  const selectedMetroSchedule = selectedStation?.daySchedules?.find((day) => day.day === metroDay);
  const metroTimes = selectedMetroSchedule?.allDayOpen
    ? ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']
    : selectedMetroSchedule?.timeSlots ?? [];

  const baseTotal = items.reduce((sum, item) => sum + getItemSubtotal(item), 0);
  const deliveryFee = 0;
  const grandTotal = baseTotal;
  const deposit = Math.ceil(grandTotal * 0.5);
  const remaining = grandTotal - deposit;

  // Endirim xülasəsi üçün hesablamalar
  const originalTotal = items.reduce((sum, item) => sum + item.price * item.quantity + (item.boxPrice ?? 0), 0);
  const totalSaleDiscount = items.reduce((sum, item) => {
    if (item.discountPrice && item.discountPrice < item.price) {
      return sum + (item.price - item.discountPrice) * item.quantity;
    }
    return sum;
  }, 0);
  const totalBulkDiscount = items.reduce((sum, item) => sum + (item.bulkDiscountAmount ?? 0), 0);
  const totalCustomerDiscount = items.reduce((sum, item) => sum + (item.customerDiscount ?? 0), 0);
  const totalCouponDiscount = items.reduce((sum, item) => sum + (item.couponDiscount ?? 0), 0);
  const hasAnyDiscount = totalSaleDiscount > 0 || totalBulkDiscount > 0 || totalCustomerDiscount > 0 || totalCouponDiscount > 0;
  const customerTypeLabel = items.find(i => i.customerType === 'loyal') ? 'Daimi müştəri (−20%)' :
                            items.find(i => i.customerType === 'new')   ? 'Yeni müştəri (−10%)'  : '';
  const couponCodeLabel = items.map(i => i.couponCode).filter(Boolean).join(', ');

  const birthDate = bdDay && bdMonth && bdYear ? `${bdDay} ${bdMonth} ${bdYear}` : 'Bildirilməyib';
  const deliveryLabel = delivery === 'metro' ? 'Metro' : delivery === 'post' ? 'Poçt' : 'Ünvana çatdırılma';
  const deliveryDate = delivery === 'metro' ? metroDay : `${kurDay} ${kurMonth} ${kurYear}`;
  const deliveryTime = delivery === 'metro' ? metroTime : 'Gün ərzində';
  const deliveryPlace = delivery === 'metro' ? metro : address;

  const minDeliveryDate = getMinDeliveryDate();
  const minDateDisplay = azDateStr(minDeliveryDate);
  const selectedDeliveryDate: Date | null = (() => {
    if (delivery === 'metro' || !kurDay || !kurMonth || !kurYear) return null;
    const mi = MONTHS_AZ.indexOf(kurMonth);
    if (mi === -1) return null;
    return new Date(parseInt(kurYear), mi, parseInt(kurDay));
  })();
  const deliveryDateValid = delivery === 'metro' || (selectedDeliveryDate !== null && selectedDeliveryDate >= minDeliveryDate);

  const checkoutValid =
    custName.trim().length > 0 &&
    phone.trim().length > 0 &&
    deliveryDateValid &&
    (delivery === 'metro'
      ? metro.trim().length > 0 && metroDay.trim().length > 0 && metroTime.trim().length > 0
      : address.trim().length > 0 && kurDay.trim().length > 0 && kurMonth.trim().length > 0 && kurYear.trim().length > 0);

  function makeOrderNumber(date: Date) {
    return `RV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}${String(date.getSeconds()).padStart(2, '0')}`;
  }

  function buildMessage(orderNumber: string) {
    const fullItemsText = items.map((item, index) => {
      const imageUrl = item.images?.[0] ?? '';
      return [
        `MƏHSUL ${index + 1}`,
        `- Ad: ${item.productName}`,
        `- Model: ${item.modelName}`,
        `- Rəng: ${item.colorName}`,
        `- Say: ${item.quantity} ədəd`,
        item.boxType && item.boxType !== 'simple' ? `- Qablaşdırma: ${item.boxType}` : '',
        item.customText ? `- Yazı/Qeyd: ${item.customText}` : '',
        item.customText && item.printFontId ? `- Yazı forması: ${FONT_STYLES.find(f => f.id === item.printFontId)?.label ?? ''}` : '',
        item.specialRequest ? `- Xüsusi istək: ${item.specialRequest}` : '',
        imageUrl ? `- Məhsul şəkli: ${imageUrl}` : '',
      ].filter(Boolean).join('\n');
    }).join('\n\n');

    const priceLines: string[] = [
      `- İlkin qiymət: ${money(originalTotal)}`,
    ];
    if (totalSaleDiscount > 0) priceLines.push(`- Satış endirimi: −${money(totalSaleDiscount)}`);
    if (totalBulkDiscount > 0) priceLines.push(`- Toplu endirim: −${money(totalBulkDiscount)}`);
    if (totalCustomerDiscount > 0) priceLines.push(`- Müştəri endirimi${customerTypeLabel ? ` (${customerTypeLabel})` : ''}: −${money(totalCustomerDiscount)}`);
    if (totalCouponDiscount > 0) priceLines.push(`- Kupon endirimi${couponCodeLabel ? ` (${couponCodeLabel})` : ''}: −${money(totalCouponDiscount)}`);
    priceLines.push(`- Yekun məbləğ: ${money(grandTotal)}`);
    priceLines.push(`- Beh (50%): ${money(deposit)}`);
    priceLines.push(`- Qalıq: ${money(remaining)}`);

    return [
      `SİFARİŞ: ${orderNumber}`,
      '',
      fullItemsText,
      '',
      '─────────────────',
      'ÇATDIRILMA',
      `- Növ: ${deliveryLabel}`,
      `- Ünvan/Metro: ${deliveryPlace}`,
      `- Tarix: ${deliveryDate}`,
      `- Saat: ${deliveryTime}`,
      '',
      'MÜŞTƏRİ',
      `- Ad: ${custName}`,
      `- Telefon: ${phone}`,
      `- Doğum tarixi: ${birthDate}`,
      '',
      '─────────────────',
      'MƏBLƏĞ',
      ...priceLines,
    ].join('\n');
  }

  function handleWhatsApp() {
    if (!checkoutValid || isSubmitting) return;

    setIsSubmitting(true);

    const now = new Date();
    const orderNumber = makeOrderNumber(now);
    const message = buildMessage(orderNumber);

    // VACİB: WhatsApp pəncərəsi klikin İÇİNDƏ, HEÇ bir gözləmə (await/fetch) olmadan,
    // dərhal açılır. Əvvəlki versiyada bu sətir server sorğusundan (Sanity-yə yazıdan)
    // SONRA çağırılırdı — mobil brauzerlər (xüsusilə iOS Safari) istifadəçi klikindən
    // bir qədər gec açılan pəncərələri "pop-up" sayıb ya bloklayır, ya da əlavə təsdiq
    // istəyir. Məhz müştərinin "3 dəfə təsdiq etmək" problemi buradan yaranırdı.
    openWhatsAppMessage(message);

    // GA4 purchase
    if (typeof (window as any).trackEvent !== 'undefined') {
      (window as any).trackEvent('purchase', {
        transaction_id: orderNumber,
        value: grandTotal,
        currency: 'AZN',
        items: items.map(item => ({
          item_id: item.productId,
          item_name: item.productName,
          price: item.discountPrice ?? item.price,
          quantity: item.quantity,
        })),
      });
    }
    // Meta Pixel Purchase (brauzer tərəfi)
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', 'Purchase', {
        value: grandTotal,
        currency: 'AZN',
        content_ids: items.map(i => i.productId),
        content_type: 'product',
      }, { eventID: orderNumber });
    }
    try {
      localStorage.setItem('ravio_has_ordered', '1');
    } catch {}

    // Server-side Meta Purchase hadisəsi (reklam izləməsinin dəqiqliyi üçün) —
    // Sanity-yə HEÇ NƏ yazılmır, sadəcə Meta-ya bildiriş göndərilir. Nəticəsini
    // gözləmirik ki, müştərinin WhatsApp keçidinə görə ən kiçik gecikmə belə olmasın.
    fetch('/api/track-purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderNumber,
        value: grandTotal,
        phone,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.discountPrice ?? item.price,
        })),
      }),
    }).catch((err) => console.error('Purchase izləmə sorğusu uğursuz oldu (sifarişə təsiri yoxdur):', err));

    onClearCart?.();
    setIsCheckingOut(false);
    onClose();
    setIsSubmitting(false);
  }

  return (
    <div
      role="presentation"
      style={{ position: 'fixed', inset: 0, zIndex: 1500, background: 'rgba(0,0,0,0.5)', fontFamily: FONT }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
          setIsCheckingOut(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Alış-veriş səbəti"
        className="ravio-cart-drawer"
        style={{ background: C.bg }}
      >
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '18px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {isCheckingOut && (
                <button
                  onClick={() => setIsCheckingOut(false)}
                  aria-label="Geri qayıt"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: C.gray }}
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: C.black }}>
                {isCheckingOut ? 'Sifarişi tamamla' : `Səbətim (${items.length})`}
              </h2>
            </div>
            <button
              aria-label="Səbəti bağla"
              onClick={() => {
                onClose();
                setIsCheckingOut(false);
              }}
              style={{ width: 32, height: 32, borderRadius: '50%', background: C.bg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gray }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
            <ShoppingBag size={48} color={C.grayLt} />
            <p style={{ fontSize: 15, color: C.gray, margin: 0, textAlign: 'center' }}>Səbətiniz boşdur</p>
            <button
              onClick={onGoToProducts}
              style={{ padding: '12px 28px', background: C.orange, color: C.white, border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: FONT }}
            >
              Məhsullara bax
            </button>
          </div>
        )}

        {items.length > 0 && !isCheckingOut && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {items.map((item) => (
                <div key={item.cartId} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {item.images?.[0] && (
                      <img
                        src={toWebP(item.images[0], 128)}
                        alt={item.productName}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}`, flexShrink: 0 }}
                        loading="lazy"
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.black, marginBottom: 3 }}>{item.productName}</div>
                      <div style={{ fontSize: 12, color: C.gray, marginBottom: 6 }}>
                        {[item.modelName, item.colorName].filter(Boolean).join(' · ')}
                      </div>
                      {item.customText && (() => {
                        const f = FONT_STYLES.find(fs => fs.id === item.printFontId);
                        return (
                          <div style={{ fontSize: 11, color: C.blue, background: '#EFF6FF', borderRadius: 6, padding: '4px 8px', display: 'inline-block', marginBottom: 6 }}>
                            <span style={{ fontFamily: f?.family, fontStyle: f?.italic ? 'italic' : 'normal', fontSize: 13 }}>
                              {item.customText}
                            </span>
                            {f && <span style={{ opacity: 0.7 }}> · {f.label}</span>}
                          </div>
                        );
                      })()}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' as const, gap: 8 }}>
                        {(() => {
                          const product = products?.find((p) => p.id === item.productId);
                          const maxQty = getMaxQuantityForItem(item, product);
                          const atMin = item.quantity <= 1;
                          const atMax = item.quantity >= maxQty;
                          return (
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity?.(item.cartId, item.quantity - 1)}
                                disabled={atMin}
                                aria-label="Sayı azalt"
                                style={{
                                  width: 28, height: 28, borderRadius: '6px 0 0 6px',
                                  border: `1px solid ${C.border}`, background: C.bg,
                                  cursor: atMin ? 'default' : 'pointer', opacity: atMin ? 0.4 : 1,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Minus size={11} />
                              </button>
                              <input
                                type="number"
                                inputMode="numeric"
                                value={item.quantity}
                                min={1}
                                max={maxQty}
                                aria-label={`${item.productName} sayı`}
                                onChange={(event) => {
                                  const raw = parseInt(event.target.value, 10);
                                  if (Number.isNaN(raw)) return;
                                  onUpdateQuantity?.(item.cartId, Math.min(maxQty, Math.max(1, raw)));
                                }}
                                onBlur={(event) => {
                                  if (!event.target.value) onUpdateQuantity?.(item.cartId, 1);
                                }}
                                style={{
                                  width: 38, height: 28, border: `1px solid ${C.border}`,
                                  borderLeft: 'none', borderRight: 'none',
                                  textAlign: 'center', fontSize: 13, fontWeight: 700,
                                  background: C.white, color: C.black, fontFamily: FONT, outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity?.(item.cartId, item.quantity + 1)}
                                disabled={atMax}
                                aria-label="Sayı artır"
                                style={{
                                  width: 28, height: 28, borderRadius: '0 6px 6px 0',
                                  border: `1px solid ${C.border}`, background: C.bg,
                                  cursor: atMax ? 'default' : 'pointer', opacity: atMax ? 0.4 : 1,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                              >
                                <Plus size={11} />
                              </button>
                              {maxQty <= 10 && (
                                <span style={{ fontSize: 11, color: C.grayLt, marginLeft: 8 }}>maks. {maxQty}</span>
                              )}
                            </div>
                          );
                        })()}
                        <span style={{ fontSize: 15, fontWeight: 800, color: C.black }}>{money(getItemSubtotal(item))}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
                    <button
                      onClick={() => onEdit(item)}
                      style={{ flex: 1, padding: 9, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, color: C.gray, fontSize: 12, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                    >
                      <Edit3 size={13} /> Düzəlt
                    </button>
                    <button
                      onClick={() => onRemove(item.cartId)}
                      style={{ flex: 1, padding: 9, borderRadius: 8, background: '#FFF5F5', border: '1px solid #FFC9C9', color: C.red, fontSize: 12, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                    >
                      <Trash2 size={13} /> Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '14px 20px 28px', background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 14, color: C.gray }}>{items.length} məhsul</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.black }}>{money(baseTotal)}</span>
              </div>
              <button
                onClick={() => {
                  setIsCheckingOut(true);
                  // GA4 begin_checkout
                  if (typeof (window as any).trackEvent !== 'undefined') {
                    (window as any).trackEvent('begin_checkout', {
                      currency: 'AZN',
                      value: grandTotal,
                      items: items.map(item => ({
                        item_id: item.productId,
                        item_name: item.productName,
                        price: item.discountPrice ?? item.price,
                        quantity: item.quantity,
                      })),
                    });
                  }
                  // Meta Pixel InitiateCheckout
                  if (typeof (window as any).fbq !== 'undefined') {
                    (window as any).fbq('track', 'InitiateCheckout', {
                      value: grandTotal,
                      currency: 'AZN',
                      num_items: items.length,
                    });
                  }
                }}
                style={{ width: '100%', padding: 15, borderRadius: 8, border: 'none', background: C.orange, color: C.white, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: FONT, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                Sifarişi tamamla <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}

        {items.length > 0 && isCheckingOut && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px' }}>
              <Section>
                <Label>Çatdırılma üsulu</Label>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {([
                    { id: 'kuryer' as const, label: 'Kuryer', icon: '🛵', note: 'Bakı və ətrafı' },
                    { id: 'metro' as const,  label: 'Metro',  icon: '🚇', note: 'İstənilən stansiya' },
                    { id: 'post' as const,   label: 'Poçt',   icon: '📮', note: 'Bütün Azərbaycan' },
                  ] as const).map((opt) => {
                    const active = delivery === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setDelivery(opt.id)}
                        style={{
                          flex: 1, padding: '10px 6px', borderRadius: 10,
                          border: active ? 'none' : `1px solid ${C.border}`,
                          cursor: 'pointer', fontFamily: FONT,
                          background: active ? C.orange : C.white,
                          color: active ? C.white : C.black,
                        }}
                      >
                        <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 5 }}>{opt.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.label}</div>
                        <div style={{ fontSize: 10, marginTop: 2, opacity: active ? 0.85 : 0.45 }}>{opt.note}</div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span>✓</span>
                  <span>Ödənişsiz çatdırılma — ünvandan asılı olmayaraq</span>
                </div>
              </Section>

              {delivery !== 'metro' && (
                <Section>
                  {delivery === 'kuryer' && (
                    <p style={{ fontSize: 12, color: C.grayLt, margin: '0 0 12px', lineHeight: 1.55 }}>
                      🛵 Bakı, Abşeron və Sumqayıt ərazisinə çatdırılır. Tamamilə ödənişsizdir.
                    </p>
                  )}
                  {delivery === 'post' && (
                    <p style={{ fontSize: 12, color: C.grayLt, margin: '0 0 12px', lineHeight: 1.55 }}>
                      📮 Azərpoçt vasitəsilə Azərbaycanın istənilən bölgəsinə. Ödənişsiz.
                    </p>
                  )}
                  <Label>{delivery === 'post' ? 'Şəhər və ünvan' : 'Çatdırılma ünvanı'}</Label>
                  <Input
                    value={address}
                    aria-label="Çatdırılma ünvanı"
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={delivery === 'post' ? 'Şəhər, poçt indeksi, ünvan' : 'Məhəllə, küçə, bina nömrəsi'}
                    autoComplete="street-address"
                    style={{ marginBottom: 10 }}
                  />
                  <Label>Çatdırılma günü</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
                    <Select value={kurDay} onChange={setKurDay} options={DAYS_LIST} placeholder="Gün" />
                    <Select value={kurMonth} onChange={setKurMonth} options={MONTHS_AZ} placeholder="Ay" />
                    <Select value={kurYear} onChange={setKurYear} options={ORDER_YEARS} placeholder="İl" />
                  </div>
                  {kurDay && kurMonth && kurYear && !deliveryDateValid && (
                    <p style={{ fontSize: 12, color: C.red, margin: '8px 0 0' }}>
                      Ən erkən çatdırılma tarixi: {minDateDisplay}
                    </p>
                  )}
                  {!kurDay && !kurMonth && (
                    <p style={{ fontSize: 12, color: C.grayLt, margin: '8px 0 0' }}>
                      Ən erkən tarix: {minDateDisplay}
                    </p>
                  )}
                </Section>
              )}

              {delivery === 'metro' && (
                <Section>
                  <Label>Metro stansiyası</Label>
                  <select
                    value={metro}
                    aria-label="Metro stansiyası seçin"
                    onChange={(event) => {
                      setMetro(event.target.value);
                      setMetroDay('');
                      setMetroTime('');
                    }}
                    style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 10, fontFamily: FONT }}
                  >
                    <option value="">Metro seçin</option>
                    {stations.map((station) => (
                      <option key={station.name} value={station.name}>{station.name}</option>
                    ))}
                  </select>

                  <Label>Gün</Label>
                  <select
                    value={metroDay}
                    aria-label="Çatdırılma günü seçin"
                    onChange={(event) => {
                      setMetroDay(event.target.value);
                      setMetroTime('');
                    }}
                    style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 10, fontFamily: FONT }}
                  >
                    <option value="">Gün seçin</option>
                    {metroDays.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <Label>Saat</Label>
                  <select
                    value={metroTime}
                    aria-label="Çatdırılma saatı seçin"
                    onChange={(event) => setMetroTime(event.target.value)}
                    style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontFamily: FONT }}
                  >
                    <option value="">Saat seçin</option>
                    {metroTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </Section>
              )}

              <Section>
                <Label>Əlaqə məlumatları</Label>
                <Input value={custName} aria-label="Adınız" onChange={(event) => setCustName(event.target.value)} placeholder="Adınız" autoComplete="name" style={{ marginBottom: 10 }} />
                <Input value={phone} aria-label="Telefon nömrəsi" onChange={(event) => setPhone(event.target.value)} placeholder="Telefon (+994 50 xxx xx xx)" type="tel" autoComplete="tel" style={{ marginBottom: 10 }} />
                <Label>Doğum tarixi</Label>
                <p style={{ margin: '0 0 8px', fontSize: 11, color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>Doğum günündə sürpriz hədiyyə göndərə bilək :) </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
                  <Select value={bdDay} onChange={setBdDay} options={DAYS_LIST} placeholder="Gün" />
                  <Select value={bdMonth} onChange={setBdMonth} options={MONTHS_AZ} placeholder="Ay" />
                  <Select value={bdYear} onChange={setBdYear} options={BIRTH_YEARS} placeholder="İl" />
                </div>
              </Section>

              <Section>
                <Label>Sifariş xülasəsi</Label>
                {items.map((item) => (
                  <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: C.gray }}>{item.productName} ×{item.quantity}</span>
                    <span style={{ color: C.grayLt, textDecoration: hasAnyDiscount ? 'line-through' : 'none' }}>
                      {money(item.price * item.quantity + (item.boxPrice ?? 0))}
                    </span>
                  </div>
                ))}

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 8 }}>
                  {/* İlkin qiymət */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: C.gray }}>İlkin qiymət</span>
                    <span style={{ color: hasAnyDiscount ? C.grayLt : C.black, textDecoration: hasAnyDiscount ? 'line-through' : 'none' }}>
                      {money(originalTotal)}
                    </span>
                  </div>

                  {/* Satış endirimi */}
                  {totalSaleDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: C.green }}>
                      <span>− Satış endirimi</span>
                      <span>−{money(totalSaleDiscount)}</span>
                    </div>
                  )}

                  {/* Toplu endirim */}
                  {totalBulkDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: C.green }}>
                      <span>− Toplu endirim</span>
                      <span>−{money(totalBulkDiscount)}</span>
                    </div>
                  )}

                  {/* Müştəri endirimi */}
                  {totalCustomerDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: C.green }}>
                      <span>− {customerTypeLabel || 'Müştəri endirimi'}</span>
                      <span>−{money(totalCustomerDiscount)}</span>
                    </div>
                  )}

                  {/* Kupon endirimi */}
                  {totalCouponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: C.green }}>
                      <span>− Kupon{couponCodeLabel ? ` (${couponCodeLabel})` : ''}</span>
                      <span>−{money(totalCouponDiscount)}</span>
                    </div>
                  )}

                  {deliveryFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                      <span style={{ color: C.gray }}>Çatdırılma</span>
                      <span>{money(deliveryFee)}</span>
                    </div>
                  )}

                  {/* Yekun məbləğ */}
                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>Yekun məbləğ</span>
                      <strong style={{ fontSize: 16, color: hasAnyDiscount ? C.green : C.black }}>{money(grandTotal)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: C.orange }}>
                      <span>Beh (50%)</span>
                      <strong>{money(deposit)}</strong>
                    </div>
                  </div>
                </div>
              </Section>

              </div>

            <div style={{ padding: '14px 20px 28px', background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              {!checkoutValid && (
                <p style={{ fontSize: 12, color: C.grayLt, textAlign: 'center', margin: '0 0 10px' }}>
                  Bütün məcburi xanaları doldurun
                </p>
              )}
              <button
                disabled={!checkoutValid || isSubmitting}
                onClick={handleWhatsApp}
                style={{
                  width: '100%',
                  padding: 15,
                  borderRadius: 8,
                  border: 'none',
                  background: checkoutValid && !isSubmitting ? '#25D366' : C.bg,
                  color: checkoutValid && !isSubmitting ? C.white : C.grayLt,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: checkoutValid && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontFamily: FONT,
                }}
              >
                WhatsApp ilə göndər
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;