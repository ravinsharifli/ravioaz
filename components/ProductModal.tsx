import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Minus, Plus } from 'lucide-react';
import { Product, CartItem, BulkTier } from '../types';

// ─── Konfiqurasiya ───────────────────────────────────────────────────
const METROS = ['28 May','Həzi Aslanov','Nərimanov','İçərişəhər','Memar Əcəmi','Elmlər Akademiyası','Xalqlar Dostluğu'];
const DAYS   = ['Çərşənbə axşamı','Cümə axşamı'];
const TIMES  = ['14:00','15:00','16:00','17:00','18:00','19:00'];
const BOXES  = [
  { id: 'simple',  name: 'Sadə qutu',    price: 0,  desc: 'Standart qablaşdırma' },
  { id: 'premium', name: 'Orta qutu',    price: 10, desc: 'Lent + köpük yastıq' },
  { id: 'gift',    name: 'Premium qutu', price: 17, desc: 'Bağlama + qeyd kartı + yazı' },
];
const DISCOUNT_NEW   = 10;
const DISCOUNT_LOYAL = 20;
const IMAGE_MAX_MB   = 5;

// ─── Design tokens ────────────────────────────────────────────────────
const C = {
  bg:       '#F5F2EC',   // krem fon
  white:    '#FFFFFF',
  black:    '#111111',
  gray:     '#666666',
  grayLt:   '#AAAAAA',
  border:   '#E5E1DB',
  borderDk: '#CCCCCC',
  orange:   '#FF6A00',
  orangeBg: '#FFF3EC',
  orangeBd: '#FFD4B8',
  green:    '#16A34A',
  greenBg:  '#F0FDF4',
  red:      '#DC2626',
};

const FONT = "'Inter', -apple-system, sans-serif";

// ─── Helpers ─────────────────────────────────────────────────────────
function getActiveTier(tiers: BulkTier[], qty: number): BulkTier | null {
  if (!tiers?.length) return null;
  return [...tiers]
    .sort((a, b) => b.minQty - a.minQty)
    .find(t => qty >= t.minQty && (!t.maxQty || qty <= t.maxQty)) || null;
}

// ─── Mini components ─────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <p style={{
    fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: C.gray, margin: '0 0 10px',
    fontFamily: FONT, display: 'flex', alignItems: 'center', gap: 4,
  }}>
    {children}
    {required && <span style={{ color: C.orange }}>*</span>}
  </p>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={{
    width: '100%', background: C.white,
    border: `1px solid ${C.border}`,
    borderRadius: 8, padding: '11px 14px',
    color: C.black, fontSize: 14,
    fontFamily: FONT, outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
    ...props.style,
  }}
    onFocus={e => { e.currentTarget.style.borderColor = C.orange; }}
    onBlur={e => { e.currentTarget.style.borderColor = C.border; }}
  />
);

const SummaryRow: React.FC<{ l: string; r: string; accent?: boolean; bold?: boolean }> = ({ l, r, accent, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <span style={{ fontSize: 13, color: C.gray, fontFamily: FONT }}>{l}</span>
    <span style={{
      fontSize: 13, fontWeight: bold ? 700 : 500,
      color: accent ? C.orange : C.black,
      fontFamily: FONT,
    }}>{r}</span>
  </div>
);

// ─── Ana komponent ────────────────────────────────────────────────────
interface ProductModalProps {
  product: Product;
  initialData?: CartItem;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCategory: (category: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, initialData, onClose, onAddToCart }) => {
  const variants = product.variants || [];

  const [step,         setStep]         = useState(1);
  const [imgIdx,       setImgIdx]       = useState(0);
  const [variantIdx,   setVariantIdx]   = useState(initialData?.variantIndex ?? 0);
  const [qty,          setQty]          = useState(initialData?.quantity ?? 1);
  const [printText,    setPrintText]    = useState(initialData?.customText ?? '');
  const [uploadedImg,  setUploadedImg]  = useState<string | null>(null);
  const [uploadError,  setUploadError]  = useState('');
  const [boxId,        setBoxId]        = useState(initialData?.boxType ?? 'simple');
  const [delivery,     setDelivery]     = useState<'metro' | 'kuryer'>(initialData?.deliveryMethod ?? 'metro');
  const [metro,        setMetro]        = useState(initialData?.metroStation ?? METROS[0]);
  const [day,          setDay]          = useState(initialData?.metroDay ?? DAYS[0]);
  const [time,         setTime]         = useState(initialData?.metroTime ?? TIMES[0]);
  const [address,      setAddress]      = useState('');
  const [custName,     setCustName]     = useState(initialData?.customerName ?? '');
  const [birthDate,    setBirthDate]    = useState(initialData?.birthDate ?? '');
  const [phone,        setPhone]        = useState(initialData?.phone ?? '');
  const [customerType, setCustomerType] = useState<'new' | 'loyal' | null>(initialData?.customerType ?? null);

  const variant    = variants[variantIdx] || variants[0];
  if (!variant) return null;

  const images     = variant.images || [];
  const totalImgs  = images.length;
  const origPrice  = variant.price;
  const salePrice  = variant.discountPrice;
  const baseUnit   = salePrice ?? origPrice;
  const isOnSale   = !!(salePrice && salePrice < origPrice);
  const discountPct = isOnSale ? Math.round(((origPrice - baseUnit) / origPrice) * 100) : 0;

  const activeTier    = product.hasBulkDiscount && product.bulkTiers ? getActiveTier(product.bulkTiers, qty) : null;
  const bulkOff       = activeTier?.discountAmount ?? 0;
  const effectiveUnit = Math.max(0, baseUnit - bulkOff);
  const bulkDiscTotal = bulkOff * qty;
  const printFee      = printText.trim() ? 5 * qty : 0;
  const uploadFee     = uploadedImg ? 3 : 0;
  const box           = BOXES.find(b => b.id === boxId) ?? BOXES[0];
  const boxFee        = box.price;
  const deliveryFee   = delivery === 'kuryer' ? 4.99 : 0;
  const subtotal      = effectiveUnit * qty + printFee + uploadFee + boxFee + deliveryFee;
  const discountRate  = customerType === 'loyal' ? DISCOUNT_LOYAL : customerType === 'new' ? DISCOUNT_NEW : 0;
  const customerDisc  = customerType ? Math.round(subtotal * discountRate / 100 * 100) / 100 : 0;
  const finalTotal    = subtotal - customerDisc;
  const beh           = Math.ceil(finalTotal * 0.5);

  const step2Valid = custName.trim().length > 0 && phone.trim().length > 0 &&
    customerType !== null && (delivery === 'metro' || address.trim().length > 0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) { setUploadError(`Maks. ${IMAGE_MAX_MB} MB`); return; }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = ev => setUploadedImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!step2Valid) return;
    const deliveryDetails = delivery === 'metro' ? `🚇 ${metro} · ${day} · ${time}` : address;
    const item: CartItem = {
      cartId:               initialData?.cartId || Math.random().toString(36).substr(2, 9),
      productId:            product.id,
      productName:          product.name,
      variantIndex:         variantIdx,
      modelName:            variant.modelName || '—',
      colorName:            variant.colorName || '—',
      images:               variant.images || [],
      price:                origPrice,
      discountPrice:        variant.discountPrice,
      quantity:             qty,
      customText:           printText,
      specialRequest:       uploadedImg ? 'Şəkil əlavə edilib' : '',
      customerName:         custName,
      phone, birthDate,
      isGift:               boxId === 'gift',
      isFirstOrSecondOrder: customerType === 'new',
      customerType:         customerType ?? 'new',
      deliveryType:         delivery === 'metro' ? 'standard' : 'urgent',
      deliveryDetails,
      bulkDiscountAmount:   bulkDiscTotal,
      boxType:              boxId,
      boxPrice:             boxFee,
      hasQrCode:            !!uploadedImg,
      lazerPrice:           printFee,
      deliveryMethod:       delivery,
      metroStation:         delivery === 'metro' ? metro : undefined,
      metroDay:             delivery === 'metro' ? day : undefined,
      metroTime:            delivery === 'metro' ? time : undefined,
      finalTotal, behAmount: beh,
    };
    onAddToCart(item);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'flex-end',
        fontFamily: FONT,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.bg,
        width: '100%', maxWidth: 560,
        margin: '0 auto',
        maxHeight: '94vh',
        borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column' as const,
        overflow: 'hidden',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.12)',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: C.white,
          borderBottom: `1px solid ${C.border}`,
          padding: '16px 20px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.black, lineHeight: 1.3 }}>
                {product.name}
              </h2>
              {product.category && (
                <span style={{ fontSize: 11, color: C.grayLt, fontWeight: 500, marginTop: 3, display: 'block' }}>
                  {product.category}
                </span>
              )}
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: C.bg, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.gray, flexShrink: 0, marginLeft: 12,
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.border}
              onMouseLeave={e => e.currentTarget.style.background = C.bg}
            >
              <X size={16} />
            </button>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[{ n: 1, label: 'Məhsul' }, { n: 2, label: 'Çatdırılma' }].map(({ n, label }, i) => (
              <React.Fragment key={n}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: n === step ? C.orange : n < step ? C.black : C.bg,
                    border: `1.5px solid ${n === step ? C.orange : n < step ? C.black : C.border}`,
                    color: n <= step ? C.white : C.gray,
                    fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}>
                    {n < step ? '✓' : n}
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: n === step ? 600 : 400,
                    color: n === step ? C.black : C.grayLt,
                  }}>{label}</span>
                </div>
                {i === 0 && (
                  <div style={{ flex: 1, height: 1, background: step > 1 ? C.black : C.border, maxWidth: 40 }} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Scroll content ── */}
        <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px 120px' }}>

          {/* ═══ STEP 1 ═══ */}
          {step === 1 && (
            <>
              {/* Product image */}
              {totalImgs > 0 && (
                <div style={{
                  position: 'relative',
                  background: C.white,
                  borderRadius: 12,
                  overflow: 'hidden',
                  marginBottom: 16,
                  height: 260,
                  border: `1px solid ${C.border}`,
                }}>
                  <img
                    src={images[imgIdx]}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x260/F5F2EC/AAAAAA?text=Şəkil+yoxdur'; }}
                  />

                  {/* Discount badge */}
                  {isOnSale && (
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      background: C.orange, color: C.white,
                      fontSize: 11, fontWeight: 800,
                      padding: '4px 10px', borderRadius: 6,
                    }}>−{discountPct}%</div>
                  )}

                  {/* Image nav */}
                  {totalImgs > 1 && (
                    <>
                      {[
                        { dir: 'prev', icon: <ChevronLeft size={16} />, side: 'left' as const },
                        { dir: 'next', icon: <ChevronRight size={16} />, side: 'right' as const },
                      ].map(btn => (
                        <button key={btn.dir}
                          onClick={() => setImgIdx(i => btn.dir === 'prev' ? (i - 1 + totalImgs) % totalImgs : (i + 1) % totalImgs)}
                          style={{
                            position: 'absolute', [btn.side]: 10, top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.92)',
                            border: `1px solid ${C.border}`,
                            borderRadius: '50%', width: 32, height: 32,
                            cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}
                        >{btn.icon}</button>
                      ))}
                      <div style={{
                        position: 'absolute', bottom: 10, left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: 5,
                      }}>
                        {images.map((_, i) => (
                          <div key={i} onClick={() => setImgIdx(i)} style={{
                            width: i === imgIdx ? 20 : 6, height: 6,
                            borderRadius: 3, cursor: 'pointer',
                            background: i === imgIdx ? C.orange : 'rgba(0,0,0,0.2)',
                            transition: 'all 0.2s',
                          }} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Price block */}
              <div style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '14px 16px',
                marginBottom: 12,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  {isOnSale && (
                    <span style={{ fontSize: 12, color: C.grayLt, textDecoration: 'line-through', display: 'block', marginBottom: 2 }}>
                      {origPrice} ₼
                    </span>
                  )}
                  <span style={{ fontSize: 26, fontWeight: 800, color: isOnSale ? C.orange : C.black, letterSpacing: '-0.5px' }}>
                    {baseUnit} ₼
                  </span>
                  {product.description && (
                    <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gray, lineHeight: 1.6 }}>
                      {product.description}
                    </p>
                  )}
                </div>
                {isOnSale && (
                  <div style={{
                    background: C.orange, color: C.white,
                    borderRadius: 8, padding: '6px 12px',
                    fontSize: 13, fontWeight: 800, flexShrink: 0,
                  }}>
                    −{discountPct}%
                  </div>
                )}
              </div>

              {/* Variant selector */}
              {variants.length > 1 && (
                <div style={{
                  background: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '14px 16px', marginBottom: 12,
                }}>
                  <Label>Model / Rəng seçin</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                    {variants.map((v, i) => {
                      const oos  = v.stock === 0;
                      const sel  = variantIdx === i;
                      const lbl  = [v.modelName, v.colorName].filter(Boolean).join(' · ') || `Variant ${i + 1}`;
                      const vPrc = v.discountPrice ?? v.price;
                      return (
                        <div key={i}
                          onClick={() => { if (!oos) { setVariantIdx(i); setImgIdx(0); } }}
                          style={{
                            padding: '9px 14px', borderRadius: 8,
                            cursor: oos ? 'not-allowed' : 'pointer',
                            background: sel ? C.black : C.bg,
                            color: sel ? C.white : oos ? C.grayLt : C.black,
                            border: `1.5px solid ${sel ? C.black : C.border}`,
                            opacity: oos ? 0.5 : 1,
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400 }}>{lbl}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: sel ? 'rgba(255,255,255,0.7)' : C.orange }}>
                            {vPrc} ₼{oos ? ' · Bitib' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '14px 16px', marginBottom: 12,
              }}>
                <Label>Say</Label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                      width: 36, height: 36, borderRadius: '8px 0 0 8px',
                      border: `1px solid ${C.border}`, background: C.bg,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: C.black,
                    }}><Minus size={14} /></button>
                    <div style={{
                      width: 52, height: 36,
                      border: `1px solid ${C.border}`, borderLeft: 'none', borderRight: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, color: C.black, background: C.white,
                    }}>{qty}</div>
                    <button onClick={() => setQty(q => q + 1)} style={{
                      width: 36, height: 36, borderRadius: '0 8px 8px 0',
                      border: `1px solid ${C.border}`, background: C.bg,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: C.black,
                    }}><Plus size={14} /></button>
                  </div>

                  <div style={{ textAlign: 'right' as const }}>
                    {qty > 1 && (
                      <div style={{ fontSize: 12, color: C.grayLt, marginBottom: 2 }}>
                        {effectiveUnit.toFixed(2)} ₼ / ədəd
                      </div>
                    )}
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.black, letterSpacing: '-0.5px' }}>
                      {(effectiveUnit * qty).toFixed(2)} ₼
                    </div>
                  </div>
                </div>

                {/* Bulk tiers */}
                {product.hasBulkDiscount && product.bulkTiers && product.bulkTiers.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 8 }}>
                      {product.bulkTiers.map((tier, i) => {
                        const isActive = qty >= tier.minQty && (!tier.maxQty || qty <= tier.maxQty);
                        const lbl = tier.label || (tier.maxQty ? `${tier.minQty}–${tier.maxQty}` : `${tier.minQty}+`);
                        const discPrc = Math.max(0, baseUnit - tier.discountAmount);
                        return (
                          <div key={i} onClick={() => setQty(tier.minQty)} style={{
                            padding: '5px 12px', borderRadius: 100,
                            fontSize: 11, cursor: 'pointer', fontWeight: 600,
                            background: isActive ? C.orange : C.bg,
                            color: isActive ? C.white : C.gray,
                            border: `1px solid ${isActive ? C.orange : C.border}`,
                            transition: 'all 0.15s',
                          }}>
                            {lbl} → {discPrc.toFixed(0)} ₼/ədəd
                          </div>
                        );
                      })}
                    </div>
                    {bulkDiscTotal > 0 && (
                      <div style={{
                        background: C.greenBg, border: `1px solid #BBF7D0`,
                        borderRadius: 8, padding: '8px 12px',
                        fontSize: 12, color: C.green, fontWeight: 500,
                      }}>
                        ✓ {qty} ədədə görə <strong>{bulkDiscTotal.toFixed(2)} ₼</strong> qənaət etdiniz
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Custom text */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '14px 16px', marginBottom: 12,
              }}>
                <Label>Üzərinə yazı <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, color: C.grayLt, fontSize: 10 }}>— isteğe görə</span></Label>
                <Input
                  value={printText}
                  onChange={e => setPrintText(e.target.value)}
                  placeholder="Məs: Sevirəm ❤  ·  20.05.2025  ·  Adın"
                  maxLength={40}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span style={{ fontSize: 11, color: printText.trim() ? C.orange : C.grayLt, fontWeight: printText.trim() ? 600 : 400 }}>
                    {printText.trim() ? `+${printFee} ₼ (5 ₼/ədəd)` : 'Boş qoysanız yazı olmayacaq'}
                  </span>
                  <span style={{ fontSize: 11, color: C.grayLt }}>{printText.length}/40</span>
                </div>
              </div>

              {/* Image upload */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '14px 16px', marginBottom: 12,
              }}>
                <Label>Şəkil əlavə et <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, color: C.grayLt, fontSize: 10 }}>— isteğe görə</span></Label>

                <div style={{
                  background: C.orangeBg, border: `1px solid ${C.orangeBd}`,
                  borderRadius: 8, padding: '10px 13px', marginBottom: 12,
                  fontSize: 12, color: '#7A3A00', lineHeight: 1.65,
                }}>
                  <strong style={{ display: 'block', marginBottom: 4, color: C.black }}>Bu şəkil nə üçündür?</strong>
                  Portret, eskiz, logo və ya QR kod üçün şəkil göndərin — məhsula çap ediləcək.
                  <span style={{ display: 'block', marginTop: 4, fontWeight: 700, color: C.orange }}>
                    +3 ₼ · Maks. {IMAGE_MAX_MB} MB
                  </span>
                </div>

                {uploadedImg ? (
                  <div style={{ position: 'relative' }}>
                    <img src={uploadedImg} alt="Yüklənmiş"
                      style={{ width: '100%', height: 160, objectFit: 'contain', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }}
                    />
                    <button onClick={() => setUploadedImg(null)} style={{
                      position: 'absolute', top: 8, right: 8,
                      background: 'rgba(0,0,0,0.55)', border: 'none',
                      borderRadius: '50%', width: 28, height: 28,
                      color: C.white, cursor: 'pointer', fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><X size={14} /></button>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: C.green, fontWeight: 600 }}>✓ Şəkil əlavə edildi · +3 ₼</p>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', flexDirection: 'column' as const,
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '20px', border: `1.5px dashed ${C.border}`,
                    borderRadius: 10, cursor: 'pointer', background: C.bg,
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLLabelElement).style.borderColor = C.orange}
                    onMouseLeave={e => (e.currentTarget as HTMLLabelElement).style.borderColor = C.border}
                  >
                    <Upload size={20} color={C.grayLt} />
                    <span style={{ fontSize: 13, color: C.gray }}>Şəkil seçmək üçün bura basın</span>
                    <span style={{ fontSize: 11, color: C.grayLt }}>JPG, PNG, WEBP · Maks. {IMAGE_MAX_MB} MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                )}
                {uploadError && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{uploadError}</p>}
              </div>

              {/* Box selection */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '14px 16px',
              }}>
                <Label>Qablaşdırma</Label>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {BOXES.map(b => (
                    <div key={b.id} onClick={() => setBoxId(b.id)} style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '12px 14px',
                      borderRadius: 8, cursor: 'pointer',
                      background: boxId === b.id ? C.black : C.bg,
                      border: `1.5px solid ${boxId === b.id ? C.black : C.border}`,
                      transition: 'all 0.15s',
                    }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: boxId === b.id ? C.white : C.black }}>{b.name}</div>
                        <div style={{ fontSize: 11, marginTop: 2, color: boxId === b.id ? 'rgba(255,255,255,0.55)' : C.grayLt }}>{b.desc}</div>
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: boxId === b.id ? C.orange : b.price > 0 ? C.orange : C.grayLt, flexShrink: 0 }}>
                        {b.price === 0 ? 'Pulsuz' : `+${b.price} ₼`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ STEP 2 ═══ */}
          {step === 2 && (
            <>
              {/* Delivery method */}
              <div style={{ marginBottom: 16 }}>
                <Label>Çatdırılma üsulu</Label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { id: 'metro' as const, icon: '🚇', label: 'Metro görüşü', sub: 'Pulsuz' },
                    { id: 'kuryer' as const, icon: '🛵', label: 'Kuryer', sub: '+4.99 ₼' },
                  ].map(d => (
                    <div key={d.id} onClick={() => setDelivery(d.id)} style={{
                      flex: 1, background: delivery === d.id ? C.black : C.white,
                      border: `1.5px solid ${delivery === d.id ? C.black : C.border}`,
                      borderRadius: 10, padding: '14px 12px',
                      textAlign: 'center' as const, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{d.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: delivery === d.id ? C.white : C.black }}>{d.label}</div>
                      <div style={{ fontSize: 11, marginTop: 3, color: delivery === d.id ? 'rgba(255,255,255,0.55)' : C.grayLt }}>{d.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metro details */}
              {delivery === 'metro' && (
                <>
                  <div style={{
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 12, padding: '14px 16px', marginBottom: 12,
                  }}>
                    <Label>Metro stansiyası</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                      {METROS.map(m => (
                        <div key={m} onClick={() => setMetro(m)} style={{
                          padding: '7px 13px', borderRadius: 100, fontSize: 12,
                          cursor: 'pointer', fontWeight: metro === m ? 600 : 400,
                          background: metro === m ? C.black : C.bg,
                          color: metro === m ? C.white : C.gray,
                          border: `1px solid ${metro === m ? C.black : C.border}`,
                          transition: 'all 0.15s',
                        }}>{m}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    {[
                      { lbl: 'Gün', val: day, set: setDay, opts: DAYS },
                      { lbl: 'Saat', val: time, set: setTime, opts: TIMES },
                    ].map(f => (
                      <div key={f.lbl} style={{
                        flex: 1, background: C.white,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: '12px 14px',
                      }}>
                        <Label>{f.lbl}</Label>
                        <select value={f.val} onChange={e => f.set(e.target.value)} style={{
                          width: '100%', background: C.bg,
                          border: `1px solid ${C.border}`,
                          borderRadius: 8, padding: '10px 10px',
                          color: C.black, fontSize: 13,
                          outline: 'none', fontFamily: FONT,
                          cursor: 'pointer',
                        }}>
                          {f.opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Kuryer address */}
              {delivery === 'kuryer' && (
                <div style={{
                  background: C.white, border: `1px solid ${C.border}`,
                  borderRadius: 12, padding: '14px 16px', marginBottom: 12,
                }}>
                  <Label required>Çatdırılma ünvanı</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Məhəllə, küçə, bina nömrəsi" />
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: C.grayLt }}>Nümunə: Masazır, Qurtuluş küç. 93, 4-cü mərtəbə</p>
                </div>
              )}

              {/* Contact info */}
              <div style={{
                background: C.white,
                border: `1.5px solid ${C.orange}`,
                borderRadius: 12, padding: '14px 16px', marginBottom: 12,
              }}>
                <Label required>Əlaqə məlumatları</Label>
                <div style={{
                  background: C.orangeBg, border: `1px solid ${C.orangeBd}`,
                  borderRadius: 8, padding: '9px 12px', marginBottom: 12,
                  fontSize: 12, color: '#7A3A00',
                }}>
                  ⚠️ Aşağıdakı məlumatlar <strong>mütləq</strong> doldurulmalıdır.
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  <Input value={custName} onChange={e => setCustName(e.target.value)} placeholder="Ad Soyad *" />
                  <Input value={birthDate} onChange={e => setBirthDate(e.target.value)} placeholder="Doğum tarixi * (məs: 15.03.2000)" />
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Telefon * (+994 50 xxx xx xx)" type="tel" />
                </div>
              </div>

              {/* Customer type */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '14px 16px', marginBottom: 14,
              }}>
                <Label required>Müştəri növü</Label>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {[
                    { id: 'new' as const, label: 'Yeni müştəriyəm', sub: 'İlk sifarişim', pct: DISCOUNT_NEW },
                    { id: 'loyal' as const, label: 'Daimi müştəriyəm', sub: 'Əvvəl sifariş vermişəm', pct: DISCOUNT_LOYAL },
                  ].map(opt => {
                    const sel = customerType === opt.id;
                    const discAmt = Math.round(subtotal * opt.pct / 100 * 100) / 100;
                    return (
                      <div key={opt.id} onClick={() => setCustomerType(opt.id)} style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', padding: '12px 14px',
                        borderRadius: 10, cursor: 'pointer',
                        background: sel ? C.bg : C.white,
                        border: `1.5px solid ${sel ? C.orange : C.border}`,
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%',
                            border: `2px solid ${sel ? C.orange : C.border}`,
                            background: sel ? C.orange : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.white }} />}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: C.black }}>{opt.label}</div>
                            <div style={{ fontSize: 11, color: C.grayLt, marginTop: 1 }}>{opt.sub}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: C.orange }}>−{discAmt.toFixed(2)} ₼</div>
                          <div style={{ fontSize: 10, color: C.grayLt }}>{opt.pct}% endirim</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order summary */}
              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '16px',
              }}>
                <Label>Sifariş xülasəsi</Label>
                <SummaryRow l={`${product.name} × ${qty}`} r={`${(effectiveUnit * qty).toFixed(2)} ₼`} />
                {isOnSale && <SummaryRow l="Kampaniya endirimi" r={`−${((origPrice - baseUnit) * qty).toFixed(2)} ₼`} accent />}
                {bulkDiscTotal > 0 && <SummaryRow l="Say endirimi" r={`−${bulkDiscTotal.toFixed(2)} ₼`} accent />}
                {printFee > 0 && <SummaryRow l="Lazer yazı" r={`+${printFee} ₼`} />}
                {uploadFee > 0 && <SummaryRow l="Şəkil əlavəsi" r={`+${uploadFee} ₼`} />}
                {boxFee > 0 && <SummaryRow l={box.name} r={`+${boxFee} ₼`} />}
                {deliveryFee > 0 && <SummaryRow l="Kuryer çatdırılma" r={`+${deliveryFee} ₼`} />}
                {customerDisc > 0 && <SummaryRow l={`Müştəri endirimi (${discountRate}%)`} r={`−${customerDisc.toFixed(2)} ₼`} accent />}

                <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0 12px' }} />
                <SummaryRow l="Ümumi məbləğ" r={`${finalTotal.toFixed(2)} ₼`} bold />

                {/* Deposit card */}
                <div style={{
                  background: C.orangeBg,
                  border: `1px solid ${C.orangeBd}`,
                  borderRadius: 10, padding: '14px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.orange }}>İndi ödəniləcək (50% beh)</div>
                    <div style={{ fontSize: 11, color: C.gray, marginTop: 4 }}>
                      Qalan {(finalTotal - beh).toFixed(2)} ₼ məhsul alınarkən
                    </div>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.orange, letterSpacing: '-1px' }}>
                    {beh} ₼
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div style={{
          padding: '14px 20px 28px',
          background: C.white,
          borderTop: `1px solid ${C.border}`,
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{
              flex: 1, padding: '14px', borderRadius: 10,
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.gray, fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: FONT,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.black}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >← Geri</button>
          )}
          <button
            disabled={step === 2 && !step2Valid}
            onClick={() => { if (step === 1) setStep(2); else handleSubmit(); }}
            style={{
              flex: step === 2 ? 3 : 1,
              padding: '14px', borderRadius: 10, border: 'none',
              background: step === 2 && !step2Valid ? C.bg : C.orange,
              color: step === 2 && !step2Valid ? C.grayLt : C.white,
              fontSize: 15, fontWeight: 700, cursor: step === 2 && !step2Valid ? 'not-allowed' : 'pointer',
              fontFamily: FONT, letterSpacing: 0.3,
              transition: 'background 0.15s, transform 0.1s',
              boxShadow: step === 2 && !step2Valid ? 'none' : '0 4px 16px rgba(255,106,0,0.25)',
            }}
            onMouseEnter={e => { if (!(step === 2 && !step2Valid)) e.currentTarget.style.background = '#E55E00'; }}
            onMouseLeave={e => { if (!(step === 2 && !step2Valid)) e.currentTarget.style.background = C.orange; }}
          >
            {step === 1 ? 'Davam et →' : '🛒 Sifarişi tamamla'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;