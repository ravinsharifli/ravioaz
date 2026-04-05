import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, CartItem, BulkTier } from '../types';

// ── Props ─────────────────────────────────────────────────────────
interface ProductModalProps {
  product: Product;
  initialData?: CartItem;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCategory: (category: string) => void;
}

// ── Sabit məlumatlar ──────────────────────────────────────────────
const METROS = [
  '28 May', 'Həzi Aslanov', 'Nərimanov',
  'İçərişəhər', 'Memar Əcəmi', 'Elmlər Akademiyası', 'Xalqlar Dostluğu',
];
const DAYS = [
  'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə',
  'Cümə axşamı', 'Cümə', 'Şənbə', 'Bazar',
];
const TIMES = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00',
];
const BOXES = [
  { id: 'none',    name: 'Qutu yoxdur',   price: 0,  desc: 'Sadəcə məhsul' },
  { id: 'simple',  name: 'Sadə Qutu',     price: 0,  desc: 'Standart qablaşdırma' },
  { id: 'premium', name: 'Premium Qutu',  price: 8,  desc: 'Lent + köpük yastıq' },
  { id: 'gift',    name: 'Hədiyyə Qutu',  price: 15, desc: 'Tam hazır, bəzəkli' },
];
const COUPONS: Record<string, { percent: number; label: string }> = {
  'XOSGELDIN': { percent: 10, label: 'Xoş gəldin endirimi — 10%' },
  'DAIMI20':   { percent: 20, label: 'Daimi müştəri endirimi — 20%' },
};

// ── Rəng palitrası ────────────────────────────────────────────────
const T = {
  bg:          '#f7f5f2',
  card:        '#ffffff',
  border:      '#e8e4df',
  text:        '#1e1a16',
  sub:         '#8a8078',
  gold:        '#b8965a',
  goldBg:      '#faf4eb',
  goldBorder:  '#e0c99a',
  accent:      '#2d2926',
  tag:         '#f0ebe3',
  tagText:     '#7a6a55',
  green:       '#4a7c59',
  greenBg:     '#eef5f0',
  greenBorder: '#b4d4be',
  red:         '#c05050',
};

// ── Köməkçi: aktiv bulk tier tapır ───────────────────────────────
function getActiveTier(tiers: BulkTier[], qty: number): BulkTier | null {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  return sorted.find(t => qty >= t.minQty && (!t.maxQty || qty <= t.maxQty)) || null;
}

// ── Köməkçi komponentlər ──────────────────────────────────────────
const Lbl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{
    fontSize: 10, letterSpacing: 2.5,
    textTransform: 'uppercase', color: T.sub,
    margin: '0 0 10px', fontFamily: 'Georgia, serif',
  }}>{children}</p>
);

const Inp: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={{
      width: '100%', background: T.bg,
      border: `1.5px solid ${T.border}`,
      borderRadius: 10, padding: '12px 14px',
      color: T.text, fontSize: 14, outline: 'none',
      boxSizing: 'border-box', fontFamily: 'Georgia, serif',
      ...props.style,
    }}
  />
);

const SRow: React.FC<{
  l: string; r: string; accent?: boolean; bold?: boolean;
}> = ({ l, r, accent, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
    <span style={{ fontSize: 13, color: T.sub }}>{l}</span>
    <span style={{
      fontSize: 13,
      fontWeight: bold ? 700 : 400,
      color: accent ? T.gold : T.text,
    }}>{r}</span>
  </div>
);

// ── Əsas komponent ────────────────────────────────────────────────
const ProductModal: React.FC<ProductModalProps> = ({
  product, initialData, onClose, onAddToCart,
}) => {
  const variants = product.variants || [];

  // ── State ───────────────────────────────────────────────────────
  const [step,         setStep]         = useState(1);
  const [imgIdx,       setImgIdx]       = useState(0);
  const [variantIdx,   setVariantIdx]   = useState(initialData?.variantIndex ?? 0);
  const [qty,          setQty]          = useState(initialData?.quantity ?? 1);
  const [lazerText,    setLazerText]    = useState(initialData?.customText ?? '');
  const [hasQr,        setHasQr]        = useState(initialData?.hasQrCode ?? false);
  const [boxId,        setBoxId]        = useState(initialData?.boxType ?? 'simple');
  const [delivery,     setDelivery]     = useState<'metro' | 'kuryer'>(
    initialData?.deliveryMethod ?? 'metro'
  );
  const [metro,        setMetro]        = useState(initialData?.metroStation ?? '28 May');
  const [day,          setDay]          = useState(initialData?.metroDay ?? 'Şənbə');
  const [time,         setTime]         = useState(initialData?.metroTime ?? '14:00');
  const [address,      setAddress]      = useState(
    initialData?.deliveryMethod === 'kuryer' ? (initialData?.deliveryDetails ?? '') : ''
  );
  const [custName,     setCustName]     = useState(initialData?.customerName ?? '');
  const [phone,        setPhone]        = useState(initialData?.phone ?? '');
  const [couponInput,  setCouponInput]  = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string; percent: number; label: string;
  } | null>(null);
  const [couponError,  setCouponError]  = useState('');

  // ── Cari variant ─────────────────────────────────────────────────
  const variant = variants[variantIdx] || variants[0];
  if (!variant) return null;

  const images     = variant.images || [];
  const totalImgs  = images.length;
  const origPrice  = variant.price;
  const salePrice  = variant.discountPrice;
  const baseUnit   = salePrice ?? origPrice;
  const isOnSale   = !!(salePrice && salePrice < origPrice);

  // ── Qiymət hesablaması ───────────────────────────────────────────
  const activeTier       = product.hasBulkDiscount && product.bulkTiers
    ? getActiveTier(product.bulkTiers, qty) : null;
  const bulkOff          = (activeTier?.discountAmount ?? 0);
  const effectiveUnit    = Math.max(0, baseUnit - bulkOff);
  const bulkDiscountTotal = bulkOff * qty;

  const lazerFee     = lazerText.trim() ? 5 * qty : 0;
  const qrFee        = hasQr ? 3 : 0;
  const box          = BOXES.find(b => b.id === boxId)!;
  const boxFee       = box.price;
  const deliveryFee  = delivery === 'kuryer' ? 10 : 0;

  const subtotalBefore =
    effectiveUnit * qty + lazerFee + qrFee + boxFee + deliveryFee;

  const couponDiscount = appliedCoupon
    ? Math.round(subtotalBefore * appliedCoupon.percent / 100) : 0;

  const finalTotal = subtotalBefore - couponDiscount;
  const beh        = Math.ceil(finalTotal * 0.5);

  // ── Validasiya ────────────────────────────────────────────────────
  const step2Valid =
    custName.trim().length > 0 &&
    phone.trim().length > 0 &&
    (delivery === 'metro' || address.trim().length > 0);

  // ── Kupon tətbiq ─────────────────────────────────────────────────
  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon({ ...COUPONS[code], code });
      setCouponError('');
    } else {
      setAppliedCoupon(null);
      setCouponError('Bu kod tapılmadı. Yenidən yoxlayın.');
    }
  };

  // ── Səbətə əlavə et ───────────────────────────────────────────────
  const handleAddToCart = () => {
    if (!step2Valid) return;

    const deliveryDetails = delivery === 'metro'
      ? `🚇 ${metro} metrosu · ${day} · ${time}`
      : address;

    const item: CartItem = {
      cartId:              initialData?.cartId || Math.random().toString(36).substr(2, 9),
      productId:           product.id,
      productName:         product.name,
      variantIndex:        variantIdx,
      modelName:           variant.modelName || '—',
      colorName:           variant.colorName || '—',
      images:              variant.images || [],
      price:               origPrice,
      discountPrice:       variant.discountPrice,
      quantity:            qty,
      customText:          lazerText,
      specialRequest:      '',
      customerName:        custName,
      phone:               phone,
      birthDate:           '',
      isGift:              boxId === 'gift',
      isFirstOrSecondOrder: appliedCoupon?.code === 'XOSGELDIN',
      customerType:        appliedCoupon?.code === 'DAIMI20' ? 'loyal'
                         : appliedCoupon?.code === 'XOSGELDIN' ? 'new' : null,
      deliveryType:        delivery === 'metro' ? 'standard' : 'urgent',
      deliveryDetails,
      bulkDiscountAmount:  bulkDiscountTotal,
      // Yeni sahələr
      boxType:             boxId,
      boxPrice:            boxFee,
      couponCode:          appliedCoupon?.code,
      couponDiscount,
      hasQrCode:           hasQr,
      lazerPrice:          lazerFee,
      deliveryMethod:      delivery,
      metroStation:        delivery === 'metro' ? metro : undefined,
      metroDay:            delivery === 'metro' ? day : undefined,
      metroTime:           delivery === 'metro' ? time : undefined,
      finalTotal,
      behAmount:           beh,
    };

    onAddToCart(item);
    onClose();
  };

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end',
        fontFamily: 'Georgia, serif',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.bg, width: '100%', maxHeight: '93vh',
        borderRadius: '20px 20px 0 0',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* ── Başlıq ── */}
        <div style={{
          background: T.card, borderBottom: `1px solid ${T.border}`,
          padding: '14px 16px', flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', marginBottom: 12,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: T.text }}>
                {product.name}
              </div>
              {product.category && (
                <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                  {product.category}
                </div>
              )}
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: T.tag, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.sub, flexShrink: 0,
            }}>
              <X size={16} />
            </button>
          </div>

          {/* Addım göstəricisi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[{ n: 1, label: 'Məhsul' }, { n: 2, label: 'Çatdırılma' }].map(
              ({ n, label }, i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: n === step ? T.accent : n < step ? T.gold : T.tag,
                      color: n <= step ? '#fff' : T.sub,
                      fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {n < step ? '✓' : n}
                    </div>
                    <span style={{
                      fontSize: 11,
                      color: n === step ? T.text : T.sub,
                      fontWeight: n === step ? 600 : 400,
                    }}>
                      {label}
                    </span>
                  </div>
                  {i === 0 && (
                    <div style={{
                      width: 24, height: 1.5,
                      background: step > 1 ? T.gold : T.border,
                      borderRadius: 2, transition: 'background 0.3s',
                    }} />
                  )}
                </div>
              )
            )}
          </div>
        </div>

        {/* ── Sürüşdürülə bilən kontent ── */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '16px 16px 100px',
        }}>

          {/* ═══ ADDIM 1 ═══ */}
          {step === 1 && (
            <>
              {/* Şəkillər */}
              {totalImgs > 0 && (
                <div style={{
                  position: 'relative', background: T.card,
                  borderRadius: 16, overflow: 'hidden',
                  marginBottom: 14,
                  aspectRatio: '4/3',
                }}>
                  <img
                    src={images[imgIdx]}
                    alt={product.name}
                    style={{
                      width: '100%', height: '100%',
                      objectFit: 'cover', display: 'block',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://placehold.co/400x300/f0ebe3/8a8078?text=Şəkil';
                    }}
                  />
                  {totalImgs > 1 && (
                    <>
                      <button
                        onClick={() => setImgIdx(i => (i - 1 + totalImgs) % totalImgs)}
                        style={{
                          position: 'absolute', left: 8, top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.88)',
                          border: 'none', borderRadius: '50%',
                          width: 34, height: 34, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        onClick={() => setImgIdx(i => (i + 1) % totalImgs)}
                        style={{
                          position: 'absolute', right: 8, top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.88)',
                          border: 'none', borderRadius: '50%',
                          width: 34, height: 34, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                      {/* Nöqtə naviqasiyası */}
                      <div style={{
                        position: 'absolute', bottom: 10, left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: 5,
                      }}>
                        {images.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => setImgIdx(i)}
                            style={{
                              width: i === imgIdx ? 18 : 6, height: 6,
                              borderRadius: 3, cursor: 'pointer',
                              background: i === imgIdx
                                ? T.gold : 'rgba(255,255,255,0.7)',
                              transition: 'all 0.2s',
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {isOnSale && (
                    <div style={{
                      position: 'absolute', top: 10, left: 10,
                      background: '#e05050', color: '#fff',
                      padding: '3px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      ENDİRİM
                    </div>
                  )}
                </div>
              )}

              {/* Variant seçimi */}
              {variants.length > 1 && (
                <div style={{
                  background: T.card, border: `1.5px solid ${T.border}`,
                  borderRadius: 14, padding: 14, marginBottom: 12,
                }}>
                  <Lbl>Model / Rəng seçin</Lbl>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {variants.map((v, i) => {
                      const outOfStock = v.stock === 0;
                      const selected   = variantIdx === i;
                      const vPrice     = v.discountPrice ?? v.price;
                      const label      = [v.modelName, v.colorName]
                        .filter(Boolean).join(' · ') || `Variant ${i + 1}`;
                      return (
                        <div
                          key={i}
                          onClick={() => {
                            if (!outOfStock) { setVariantIdx(i); setImgIdx(0); }
                          }}
                          style={{
                            padding: '8px 14px', borderRadius: 10, fontSize: 12,
                            cursor: outOfStock ? 'not-allowed' : 'pointer',
                            background: selected ? T.accent : T.tag,
                            color:      selected ? '#fff' : outOfStock ? T.sub : T.text,
                            border: `1.5px solid ${selected ? T.accent : T.border}`,
                            opacity: outOfStock ? 0.5 : 1,
                          }}
                        >
                          <div style={{ fontWeight: selected ? 600 : 400 }}>{label}</div>
                          <div style={{
                            fontSize: 11, marginTop: 2, fontWeight: 700,
                            color: selected ? 'rgba(255,255,255,0.8)' : T.gold,
                          }}>
                            {vPrice} ₼{outOfStock ? ' · Bitib' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Qiymət kartı */}
              <div style={{
                background: T.goldBg, border: `1.5px solid ${T.goldBorder}`,
                borderRadius: 14, padding: '12px 16px', marginBottom: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  {isOnSale && (
                    <div style={{
                      fontSize: 12, color: T.sub,
                      textDecoration: 'line-through',
                    }}>
                      {origPrice} ₼
                    </div>
                  )}
                  <div style={{ fontSize: 24, fontWeight: 700, color: T.gold }}>
                    {baseUnit} ₼
                  </div>
                  {product.description && (
                    <div style={{
                      fontSize: 12, color: T.sub,
                      marginTop: 4, lineHeight: 1.6,
                    }}>
                      {product.description}
                    </div>
                  )}
                </div>
                {isOnSale && (
                  <div style={{
                    background: '#e05050', color: '#fff',
                    borderRadius: 20, padding: '4px 12px',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    -{Math.round(((origPrice - baseUnit) / origPrice) * 100)}%
                  </div>
                )}
              </div>

              {/* Say + Bulk endirimlər */}
              <div style={{
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 14, padding: 14, marginBottom: 12,
              }}>
                <Lbl>Say seçin</Lbl>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: 12, marginBottom: 12,
                }}>
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: T.tag, border: `1.5px solid ${T.border}`,
                      color: T.text, fontSize: 20, cursor: 'pointer',
                      fontWeight: 700, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <span style={{
                    fontSize: 22, fontWeight: 700, minWidth: 30,
                    textAlign: 'center', color: T.text,
                  }}>{qty}</span>
                  <button
                    onClick={() => setQty(q => q + 1)}
                    style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: T.tag, border: `1.5px solid ${T.border}`,
                      color: T.text, fontSize: 20, cursor: 'pointer',
                      fontWeight: 700, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.gold }}>
                      {(effectiveUnit * qty).toFixed(2)} ₼
                    </div>
                    {qty > 1 && (
                      <div style={{ fontSize: 11, color: T.sub }}>
                        {effectiveUnit} ₼ × {qty}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bulk tier düymələri */}
                {product.hasBulkDiscount && product.bulkTiers &&
                  product.bulkTiers.length > 0 && (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                      {product.bulkTiers.map((tier, i) => {
                        const isActive = qty >= tier.minQty &&
                          (!tier.maxQty || qty <= tier.maxQty);
                        const rangeLabel = tier.label
                          || (tier.maxQty
                            ? `${tier.minQty}–${tier.maxQty} ədəd`
                            : `${tier.minQty}+ ədəd`);
                        return (
                          <div
                            key={i}
                            onClick={() => setQty(tier.minQty)}
                            style={{
                              padding: '5px 12px', borderRadius: 20,
                              fontSize: 11, cursor: 'pointer',
                              background: isActive ? T.accent : T.tag,
                              color:      isActive ? '#fff' : T.tagText,
                              border: `1px solid ${isActive ? T.accent : T.border}`,
                              fontWeight: isActive ? 600 : 400,
                            }}
                          >
                            {rangeLabel} · -{tier.discountAmount} ₼
                          </div>
                        );
                      })}
                    </div>
                    {bulkDiscountTotal > 0 && (
                      <div style={{
                        background: T.greenBg, border: `1px solid ${T.greenBorder}`,
                        borderRadius: 10, padding: '8px 12px',
                        fontSize: 12, color: T.green,
                      }}>
                        🎉 {qty} ədədə görə{' '}
                        <strong>{bulkDiscountTotal.toFixed(2)} ₼</strong> qənaət etdiniz
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Lazer yazı */}
              <div style={{
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 14, padding: 14, marginBottom: 12,
              }}>
                <Lbl>✍️ Lazer yazı · istəyə görə</Lbl>
                <Inp
                  value={lazerText}
                  onChange={e => setLazerText(e.target.value)}
                  placeholder="Məs: Sevirəm ❤  ·  20.05.2025  ·  Adın"
                  maxLength={40}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginTop: 6,
                }}>
                  <span style={{ fontSize: 11, color: T.sub }}>
                    {lazerText.trim()
                      ? `+${lazerFee} ₼ (hər ədəd 5 ₼)`
                      : 'Boş qoysanız yazı olmayacaq'}
                  </span>
                  <span style={{ fontSize: 11, color: T.sub }}>
                    {lazerText.length}/40
                  </span>
                </div>
              </div>

              {/* QR Kod */}
              <div
                onClick={() => setHasQr(v => !v)}
                style={{
                  background: hasQr ? T.goldBg : T.card,
                  border: `1.5px solid ${hasQr ? T.goldBorder : T.border}`,
                  borderRadius: 14, padding: 14, marginBottom: 12,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', gap: 12,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                  background: hasQr ? T.gold : 'transparent',
                  border: hasQr ? 'none' : `2px solid ${T.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#fff', fontWeight: 700,
                }}>
                  {hasQr ? '✓' : ''}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: T.text }}>
                    QR Kod əlavə et
                  </div>
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                    Link, mesaj, foto — +3 ₼
                  </div>
                </div>
                {hasQr && (
                  <div style={{ marginLeft: 'auto', fontSize: 13, color: T.gold, fontWeight: 600 }}>
                    +3 ₼
                  </div>
                )}
              </div>

              {/* Qutu seçimi */}
              <div style={{
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 14, padding: 14,
              }}>
                <Lbl>📦 Qablaşdırma</Lbl>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {BOXES.map(b => (
                    <div
                      key={b.id}
                      onClick={() => setBoxId(b.id)}
                      style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', padding: '11px 13px',
                        borderRadius: 10, cursor: 'pointer',
                        background: boxId === b.id ? T.goldBg : T.bg,
                        border: `1.5px solid ${boxId === b.id ? T.goldBorder : T.border}`,
                        transition: 'all 0.15s',
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: 13, color: T.text,
                          fontWeight: boxId === b.id ? 600 : 400,
                        }}>
                          {b.name}
                        </div>
                        <div style={{ fontSize: 11, color: T.sub, marginTop: 1 }}>
                          {b.desc}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: b.price > 0 ? T.gold : T.sub,
                      }}>
                        {b.price === 0 ? 'Pulsuz' : `+${b.price} ₼`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ ADDIM 2 ═══ */}
          {step === 2 && (
            <>
              {/* Çatdırılma üsulu */}
              <Lbl>Çatdırılma üsulu</Lbl>
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                {[
                  { id: 'metro'  as const, icon: '🚇', label: 'Metro görüşü', sub: 'Pulsuz' },
                  { id: 'kuryer' as const, icon: '🛵', label: 'Kuryer',        sub: '+10 ₼'  },
                ].map(d => (
                  <div
                    key={d.id}
                    onClick={() => setDelivery(d.id)}
                    style={{
                      flex: 1,
                      background: delivery === d.id ? T.accent : T.card,
                      border: `2px solid ${delivery === d.id ? T.accent : T.border}`,
                      borderRadius: 14, padding: '14px 10px',
                      textAlign: 'center', cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{d.icon}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: delivery === d.id ? '#fff' : T.text,
                    }}>{d.label}</div>
                    <div style={{
                      fontSize: 11, marginTop: 3,
                      color: delivery === d.id ? 'rgba(255,255,255,0.65)' : T.sub,
                    }}>{d.sub}</div>
                  </div>
                ))}
              </div>

              {/* Metro detalları */}
              {delivery === 'metro' && (
                <>
                  <div style={{
                    background: T.card, border: `1.5px solid ${T.border}`,
                    borderRadius: 14, padding: 14, marginBottom: 12,
                  }}>
                    <Lbl>Metro stansiyası</Lbl>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {METROS.map(m => (
                        <div
                          key={m}
                          onClick={() => setMetro(m)}
                          style={{
                            padding: '7px 13px', borderRadius: 20,
                            fontSize: 12, cursor: 'pointer',
                            background: metro === m ? T.accent : T.tag,
                            color:      metro === m ? '#fff' : T.tagText,
                            border: `1px solid ${metro === m ? T.accent : T.border}`,
                            fontWeight: metro === m ? 600 : 400,
                          }}
                        >{m}</div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    {[
                      { lbl: 'Gün',  val: day,  set: setDay,  opts: DAYS  },
                      { lbl: 'Saat', val: time, set: setTime, opts: TIMES },
                    ].map(f => (
                      <div key={f.lbl} style={{
                        flex: 1, background: T.card,
                        border: `1.5px solid ${T.border}`,
                        borderRadius: 14, padding: 12,
                      }}>
                        <Lbl>{f.lbl}</Lbl>
                        <select
                          value={f.val}
                          onChange={e => f.set(e.target.value)}
                          style={{
                            width: '100%', background: T.bg,
                            border: `1.5px solid ${T.border}`,
                            borderRadius: 8, padding: '9px 10px',
                            color: T.text, fontSize: 12,
                            outline: 'none', fontFamily: 'Georgia, serif',
                          }}
                        >
                          {f.opts.map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Kuryer ünvanı */}
              {delivery === 'kuryer' && (
                <div style={{
                  background: T.card, border: `1.5px solid ${T.border}`,
                  borderRadius: 14, padding: 14, marginBottom: 12,
                }}>
                  <Lbl>📍 Çatdırılma ünvanı</Lbl>
                  <Inp
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Məhəllə, küçə, bina nömrəsi"
                  />
                  <div style={{ fontSize: 11, color: T.sub, marginTop: 6 }}>
                    Nümunə: Masazır, Qurtuluş küç. 93, 4-cü mərtəbə
                  </div>
                </div>
              )}

              {/* Əlaqə məlumatları */}
              <div style={{
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 14, padding: 14, marginBottom: 12,
              }}>
                <Lbl>👤 Əlaqə məlumatları</Lbl>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Inp
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    placeholder="Adınız"
                  />
                  <Inp
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+994 50 xxx xx xx"
                    type="tel"
                  />
                </div>
              </div>

              {/* Kupon kodu */}
              <div style={{
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 14, padding: 14, marginBottom: 14,
              }}>
                <Lbl>🏷 Endirim kodu</Lbl>
                {appliedCoupon ? (
                  <div style={{
                    background: T.greenBg, border: `1px solid ${T.greenBorder}`,
                    borderRadius: 10, padding: '11px 13px',
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: T.green, fontWeight: 600 }}>
                        ✓ {appliedCoupon.label}
                      </div>
                      <div style={{ fontSize: 11, color: T.sub, marginTop: 2 }}>
                        {appliedCoupon.code} · −{couponDiscount} ₼ qənaət
                      </div>
                    </div>
                    <button
                      onClick={() => { setAppliedCoupon(null); setCouponInput(''); }}
                      style={{
                        background: 'transparent', border: 'none',
                        color: T.sub, fontSize: 20, cursor: 'pointer', lineHeight: 1,
                      }}
                    >×</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Inp
                        value={couponInput}
                        onChange={e => {
                          setCouponInput(e.target.value);
                          setCouponError('');
                        }}
                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        placeholder="Kodu daxil edin"
                        style={{ textTransform: 'uppercase', letterSpacing: 1 }}
                      />
                      <button
                        onClick={applyCoupon}
                        style={{
                          background: T.accent, border: 'none',
                          borderRadius: 10, padding: '0 16px',
                          color: '#fff', fontWeight: 600, fontSize: 13,
                          cursor: 'pointer', fontFamily: 'Georgia, serif',
                          flexShrink: 0,
                        }}
                      >Tətbiq</button>
                    </div>
                    {couponError && (
                      <p style={{ fontSize: 12, color: T.red, marginTop: 6 }}>
                        {couponError}
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: T.sub, marginTop: 6 }}>
                      Endirim kodunuz varsa yazın — avtomatik tətbiq edilir
                    </p>
                  </>
                )}
              </div>

              {/* Xülasə */}
              <div style={{
                background: T.card, border: `1.5px solid ${T.border}`,
                borderRadius: 16, padding: 16,
              }}>
                <Lbl>Sifarişin xülasəsi</Lbl>
                <SRow
                  l={`${product.name} × ${qty}`}
                  r={`${(baseUnit * qty).toFixed(2)} ₼`}
                />
                {isOnSale && (
                  <SRow
                    l="Kampaniya endirimi"
                    r={`−${((origPrice - baseUnit) * qty).toFixed(2)} ₼`}
                    accent
                  />
                )}
                {bulkDiscountTotal > 0 && (
                  <SRow
                    l="Say endirimi"
                    r={`−${bulkDiscountTotal.toFixed(2)} ₼`}
                    accent
                  />
                )}
                {lazerFee > 0 && (
                  <SRow l="Lazer yazı" r={`+${lazerFee} ₼`} />
                )}
                {qrFee > 0 && (
                  <SRow l="QR Kod" r={`+${qrFee} ₼`} />
                )}
                {boxFee > 0 && (
                  <SRow l={box.name} r={`+${boxFee} ₼`} />
                )}
                {deliveryFee > 0 && (
                  <SRow l="Kuryer çatdırılması" r={`+${deliveryFee} ₼`} />
                )}
                {couponDiscount > 0 && (
                  <SRow
                    l={`Kupon endirimi (${appliedCoupon?.percent}%)`}
                    r={`−${couponDiscount} ₼`}
                    accent
                  />
                )}
                <div style={{
                  borderTop: `1.5px dashed ${T.border}`, margin: '10px 0',
                }} />
                <SRow l="Ümumi məbləğ" r={`${finalTotal.toFixed(2)} ₼`} bold />

                {/* Beh kartı */}
                <div style={{
                  background: T.goldBg, border: `1.5px solid ${T.goldBorder}`,
                  borderRadius: 12, padding: '13px 15px', marginTop: 10,
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: T.gold, fontWeight: 600 }}>
                        İndi ödəniləcək (50% beh)
                      </div>
                      <div style={{ fontSize: 11, color: T.sub, marginTop: 3 }}>
                        Qalan {(finalTotal - beh).toFixed(2)} ₼ məhsul alınarkən
                      </div>
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: T.gold }}>
                      {beh} ₼
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Aşağı düymələr ── */}
        <div style={{
          padding: '12px 16px 24px',
          background: T.bg,
          borderTop: `1px solid ${T.border}`,
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              style={{
                flex: 1, padding: 14, borderRadius: 12,
                background: T.card, border: `1.5px solid ${T.border}`,
                color: T.sub, fontSize: 15, cursor: 'pointer',
                fontFamily: 'Georgia, serif',
              }}
            >← Geri</button>
          )}
          <button
            disabled={step === 2 && !step2Valid}
            onClick={() => {
              if (step === 1) setStep(2);
              else handleAddToCart();
            }}
            style={{
              flex: 3, padding: 14, borderRadius: 12,
              border: 'none',
              background: (step === 2 && !step2Valid) ? T.tag : T.accent,
              color:      (step === 2 && !step2Valid) ? T.sub : '#fff',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'Georgia, serif', letterSpacing: 0.5,
              transition: 'all 0.2s',
            }}
          >
            {step === 1 ? 'Davam et →' : '🛒 Səbətə əlavə et'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;