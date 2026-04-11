import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Upload, Minus, Plus, Check } from 'lucide-react';
import { Product, CartItem, BulkTier } from '../types';

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

function getActiveTier(tiers: BulkTier[], qty: number): BulkTier | null {
  if (!tiers?.length) return null;
  return [...tiers]
    .sort((a, b) => b.minQty - a.minQty)
    .find(t => qty >= t.minQty && (!t.maxQty || qty <= t.maxQty)) || null;
}

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' as const, color: C.gray, margin: '0 0 10px', fontFamily: FONT }}>
    {children}
  </p>
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

const SRow: React.FC<{ l: string; r: string; accent?: boolean; bold?: boolean }> = ({ l, r, accent, bold }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <span style={{ fontSize: 13, color: C.gray, fontFamily: FONT }}>{l}</span>
    <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: accent ? C.green : C.black, fontFamily: FONT }}>{r}</span>
  </div>
);

const Sec: React.FC<{ children: React.ReactNode; highlight?: boolean }> = ({ children, highlight }) => (
  <div style={{
    background: C.white,
    border: `1.5px solid ${highlight ? C.blue : C.border}`,
    borderRadius: 12, padding: '14px 16px', marginBottom: 12,
  }}>{children}</div>
);

interface BoxOption { id: string; name: string; desc: string; price: number; imageUrl?: string | null; }
interface MetroSchedule { stations: string[]; days: string[]; times: string[]; }

interface ProductModalProps {
  product: Product;
  initialData?: CartItem;
  metroSchedule: MetroSchedule;
  boxes: BoxOption[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCategory: (category: string) => void;
}

const DISCOUNT_NEW   = 10;
const DISCOUNT_LOYAL = 20;
const IMAGE_MAX_MB   = 5;

const ProductModal: React.FC<ProductModalProps> = ({
  product, initialData, metroSchedule, boxes, onClose, onAddToCart,
}) => {
  const variants = product.variants || [];

  const [step,         setStep]         = useState(1);
  const [imgIdx,       setImgIdx]       = useState(0);
  const [variantIdx,   setVariantIdx]   = useState(initialData?.variantIndex ?? 0);
  const [qty,          setQty]          = useState(initialData?.quantity ?? 1);
  const [printText,    setPrintText]    = useState(initialData?.customText ?? '');
  const [uploadedImg,  setUploadedImg]  = useState<string | null>(null);
  const [uploadError,  setUploadError]  = useState('');
  const [boxId,        setBoxId]        = useState(initialData?.boxType ?? boxes[0]?.id ?? 'simple');
  const [delivery,     setDelivery]     = useState<'metro' | 'kuryer' | 'post'>('metro');
  const [metro,        setMetro]        = useState(metroSchedule.stations[0] ?? '');
  const [day,          setDay]          = useState(metroSchedule.days[0] ?? '');
  const [time,         setTime]         = useState(metroSchedule.times[0] ?? '');
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
  const salePct    = isOnSale ? Math.round(((origPrice - baseUnit) / origPrice) * 100) : 0;

  const activeTier    = product.hasBulkDiscount && product.bulkTiers ? getActiveTier(product.bulkTiers, qty) : null;
  const bulkOff       = activeTier?.discountAmount ?? 0;
  const effectiveUnit = Math.max(0, baseUnit - bulkOff);
  const bulkDiscTotal = bulkOff * qty;

  const box         = boxes.find(b => b.id === boxId) ?? boxes[0];
  const boxFee      = box?.price ?? 0;
  const deliveryFee = delivery === 'kuryer' ? 4.99 : delivery === 'post' ? 4.99 : 0;

  const subtotal     = effectiveUnit * qty + boxFee + deliveryFee;
  const discountRate = customerType === 'loyal' ? DISCOUNT_LOYAL : customerType === 'new' ? DISCOUNT_NEW : 0;
  const customerDisc = customerType ? Math.round(subtotal * discountRate / 100 * 100) / 100 : 0;
  const finalTotal   = subtotal - customerDisc;
  const beh          = Math.ceil(finalTotal * 0.5);

  const step2Valid = custName.trim().length > 0 && phone.trim().length > 0 &&
    customerType !== null &&
    (delivery === 'metro' || address.trim().length > 0);

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
    const deliveryDetails = delivery === 'metro'
      ? `🚇 ${metro} · ${day} · ${time}`
      : delivery === 'post' ? `📮 Poçt · ${address}` : `🛵 Kuryer · ${address}`;

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
      isGift:               boxId !== 'simple',
      isFirstOrSecondOrder: customerType === 'new',
      customerType:         customerType ?? 'new',
      deliveryType:         delivery === 'metro' ? 'standard' : 'urgent',
      deliveryDetails,
      bulkDiscountAmount:   bulkDiscTotal,
      boxType:              boxId,
      boxPrice:             boxFee,
      hasQrCode:            !!uploadedImg,
      lazerPrice:           0,
      deliveryMethod:       delivery as any,
      metroStation:         delivery === 'metro' ? metro : undefined,
      metroDay:             delivery === 'metro' ? day : undefined,
      metroTime:            delivery === 'metro' ? time : undefined,
      finalTotal, behAmount: beh,
    };
    onAddToCart(item);
    onClose();
  };

  const prevImg = () => setImgIdx(i => (i - 1 + totalImgs) % totalImgs);
  const nextImg = () => setImgIdx(i => (i + 1) % totalImgs);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', fontFamily: FONT }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.bg, width: '100%', maxWidth: 560, margin: '0 auto',
        maxHeight: '94vh', borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.12)',
      }}>

        {/* Header */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.black, lineHeight: 1.3 }}>{product.name}</h2>
              {product.category && <span style={{ fontSize: 11, color: C.grayLt, fontWeight: 500, marginTop: 3, display: 'block' }}>{product.category}</span>}
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%', background: C.bg, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.gray, flexShrink: 0, marginLeft: 12,
            }}><X size={16} /></button>
          </div>

          {/* Steps */}
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
                  }}>{n < step ? '✓' : n}</div>
                  <span style={{ fontSize: 12, fontWeight: n === step ? 600 : 400, color: n === step ? C.black : C.grayLt }}>{label}</span>
                </div>
                {i === 0 && <div style={{ flex: 1, height: 1, background: step > 1 ? C.black : C.border, maxWidth: 40 }} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Scroll area */}
        <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px 120px' }}>

          {/* ═══ STEP 1 ═══ */}
          {step === 1 && (
            <>
              {/* Image with nav buttons */}
              {totalImgs > 0 && (
                <div style={{
                  position: 'relative', background: C.white,
                  borderRadius: 12, overflow: 'hidden',
                  marginBottom: 16, height: 280,
                  border: `1px solid ${C.border}`,
                }}>
                  <img
                    src={images[imgIdx]}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x280/F5F2EC/AAAAAA?text=Şəkil+yoxdur'; }}
                  />

                  {isOnSale && (
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      background: C.orange, color: C.white,
                      fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 6,
                    }}>−{salePct}%</div>
                  )}

                  {/* Nav arrows — always visible if multiple */}
                  {totalImgs > 1 && (
                    <>
                      <button
                        onClick={prevImg}
                        style={{
                          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.border}`,
                          borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          zIndex: 2,
                        }}
                      ><ChevronLeft size={18} color={C.black} /></button>

                      <button
                        onClick={nextImg}
                        style={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.border}`,
                          borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          zIndex: 2,
                        }}
                      ><ChevronRight size={18} color={C.black} /></button>

                      {/* Dots */}
                      <div style={{
                        position: 'absolute', bottom: 10, left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: 5,
                      }}>
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setImgIdx(i)} style={{
                            width: i === imgIdx ? 20 : 6, height: 6,
                            borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer',
                            background: i === imgIdx ? C.orange : 'rgba(0,0,0,0.2)',
                            transition: 'all 0.2s',
                          }} />
                        ))}
                      </div>

                      {/* Counter */}
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'rgba(0,0,0,0.45)', color: C.white,
                        fontSize: 11, fontWeight: 600,
                        padding: '3px 10px', borderRadius: 100,
                      }}>{imgIdx + 1} / {totalImgs}</div>
                    </>
                  )}
                </div>
              )}

              {/* Price */}
              <Sec>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {isOnSale && (
                      <span style={{ fontSize: 12, color: C.grayLt, textDecoration: 'line-through', display: 'block', marginBottom: 2 }}>
                        {origPrice.toFixed(2)} ₼
                      </span>
                    )}
                    <span style={{ fontSize: 26, fontWeight: 800, color: isOnSale ? C.orange : C.black, letterSpacing: '-0.5px' }}>
                      {baseUnit.toFixed(2)} ₼
                    </span>
                    {product.description && (
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: C.gray, lineHeight: 1.6 }}>{product.description}</p>
                    )}
                  </div>
                </div>
              </Sec>

              {/* Variants */}
              {variants.length > 1 && (
                <Sec>
                  <Label>Model / Rəng</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                    {variants.map((v, i) => {
                      const oos = v.stock === 0;
                      const sel = variantIdx === i;
                      const lbl = [v.modelName, v.colorName].filter(Boolean).join(' · ') || `Variant ${i + 1}`;
                      return (
                        <div key={i} onClick={() => { if (!oos) { setVariantIdx(i); setImgIdx(0); } }}
                          style={{
                            padding: '9px 14px', borderRadius: 8, cursor: oos ? 'not-allowed' : 'pointer',
                            background: sel ? C.black : C.bg,
                            color: sel ? C.white : oos ? C.grayLt : C.black,
                            border: `1.5px solid ${sel ? C.black : C.border}`,
                            opacity: oos ? 0.5 : 1, transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400 }}>{lbl}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, marginTop: 2, color: sel ? 'rgba(255,255,255,0.7)' : C.orange }}>
                            {(v.discountPrice ?? v.price).toFixed(2)} ₼{oos ? ' · Bitib' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Sec>
              )}

              {/* Quantity */}
              <Sec>
                <Label>Say</Label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                      width: 36, height: 36, borderRadius: '8px 0 0 8px',
                      border: `1px solid ${C.border}`, background: C.bg,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Minus size={14} /></button>
                    <div style={{
                      width: 52, height: 36, border: `1px solid ${C.border}`,
                      borderLeft: 'none', borderRight: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, fontWeight: 700, background: C.white, color: C.black,
                    }}>{qty}</div>
                    <button onClick={() => setQty(q => q + 1)} style={{
                      width: 36, height: 36, borderRadius: '0 8px 8px 0',
                      border: `1px solid ${C.border}`, background: C.bg,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><Plus size={14} /></button>
                  </div>
                  <div style={{ textAlign: 'right' as const }}>
                    {qty > 1 && <div style={{ fontSize: 12, color: C.grayLt, marginBottom: 2 }}>{effectiveUnit.toFixed(2)} ₼ / ədəd</div>}
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
                        const lbl      = tier.label || (tier.maxQty ? `${tier.minQty}–${tier.maxQty} ədəd` : `${tier.minQty}+ ədəd`);
                        const disc     = Math.max(0, baseUnit - tier.discountAmount);
                        return (
                          <div key={i} onClick={() => setQty(tier.minQty)} style={{
                            padding: '5px 12px', borderRadius: 100, fontSize: 11, cursor: 'pointer', fontWeight: 600,
                            background: isActive ? C.orange : C.bg,
                            color: isActive ? C.white : C.gray,
                            border: `1px solid ${isActive ? C.orange : C.border}`,
                            transition: 'all 0.15s',
                          }}>
                            {lbl} → {disc.toFixed(2)} ₼/ədəd
                          </div>
                        );
                      })}
                    </div>
                    {bulkDiscTotal > 0 && (
                      <div style={{ background: C.greenBg, border: '1px solid #BBF7D0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: C.green, fontWeight: 500 }}>
                        ✓ Say endirimi: <strong>{bulkDiscTotal.toFixed(2)} ₼</strong> qənaət
                      </div>
                    )}
                  </div>
                )}
              </Sec>

              {/* Custom text */}
              <Sec>
                <Label>Məhsul üzərinə yazı / Əlavə qeyd</Label>
                <textarea
                  value={printText}
                  onChange={e => setPrintText(e.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="Məhsul üzərinə yazı və ya sifarişlə əlaqəli qeydinizi yazın..."
                  style={{
                    width: '100%', background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: '11px 14px',
                    color: C.black, fontSize: 14, fontFamily: FONT,
                    outline: 'none', boxSizing: 'border-box' as const,
                    resize: 'vertical' as const, minHeight: 80,
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = C.blue}
                  onBlur={e => e.currentTarget.style.borderColor = C.border}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: C.grayLt }}>{printText.length}/300</span>
                </div>
              </Sec>

              {/* Image upload */}
              <Sec>
                <Label>Şəkil əlavə et <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, color: C.grayLt, fontSize: 10 }}>— ödənişsiz</span></Label>
                <div style={{ background: C.blueBg, border: `1px solid ${C.blueBd}`, borderRadius: 8, padding: '10px 13px', marginBottom: 12, fontSize: 12, color: '#1E40AF', lineHeight: 1.65 }}>
                  Portret, eskiz, logo və ya QR kod üçün şəkil göndərin — məhsula çap ediləcək.
                </div>
                {uploadedImg ? (
                  <div style={{ position: 'relative' }}>
                    <img src={uploadedImg} alt="Yüklənmiş" style={{ width: '100%', height: 160, objectFit: 'contain', borderRadius: 8, background: C.bg, border: `1px solid ${C.border}` }} />
                    <button onClick={() => setUploadedImg(null)} style={{
                      position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)',
                      border: 'none', borderRadius: '50%', width: 28, height: 28,
                      color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}><X size={14} /></button>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: C.green, fontWeight: 600 }}>✓ Şəkil əlavə edildi</p>
                  </div>
                ) : (
                  <label style={{
                    display: 'flex', flexDirection: 'column' as const,
                    alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '20px', border: `1.5px dashed ${C.border}`,
                    borderRadius: 10, cursor: 'pointer', background: C.bg,
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLLabelElement).style.borderColor = C.blue}
                    onMouseLeave={e => (e.currentTarget as HTMLLabelElement).style.borderColor = C.border}
                  >
                    <Upload size={20} color={C.grayLt} />
                    <span style={{ fontSize: 13, color: C.gray }}>Şəkil seçmək üçün bura basın</span>
                    <span style={{ fontSize: 11, color: C.grayLt }}>JPG, PNG, WEBP · Maks. {IMAGE_MAX_MB} MB</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                )}
                {uploadError && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{uploadError}</p>}
              </Sec>

              {/* Box selection with images */}
              {boxes.length > 0 && (
                <Sec>
                  <Label>Qablaşdırma</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
                    {boxes.map(b => {
                      const sel = boxId === b.id;
                      return (
                        <div key={b.id} onClick={() => setBoxId(b.id)} style={{
                          position: 'relative', cursor: 'pointer',
                          border: `2px solid ${sel ? C.black : C.border}`,
                          borderRadius: 10, overflow: 'hidden',
                          transition: 'all 0.15s',
                          background: sel ? '#F8F8F8' : C.white,
                        }}>
                          {/* Box image or placeholder */}
                          <div style={{ aspectRatio: '1/1', background: '#F5F2EC', overflow: 'hidden' }}>
                            {b.imageUrl ? (
                              <img src={b.imageUrl} alt={b.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            ) : (
                              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                                📦
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div style={{ padding: '8px 10px' }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: sel ? C.black : C.gray, marginBottom: 2 }}>{b.name}</div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: sel ? C.orange : b.price > 0 ? C.orange : C.green }}>
                              {b.price === 0 ? 'Pulsuz' : `+${b.price.toFixed(2)} ₼`}
                            </div>
                          </div>

                          {/* Selected check */}
                          {sel && (
                            <div style={{
                              position: 'absolute', top: 6, right: 6,
                              background: C.black, borderRadius: '50%',
                              width: 20, height: 20,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Check size={12} color={C.white} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {box?.desc && (
                    <p style={{ margin: '10px 0 0', fontSize: 12, color: C.grayLt }}>{box.desc}</p>
                  )}
                </Sec>
              )}
            </>
          )}

          {/* ═══ STEP 2 ═══ */}
          {step === 2 && (
            <>
              {/* Delivery */}
              <div style={{ marginBottom: 16 }}>
                <Label>Çatdırılma üsulu</Label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { id: 'metro'  as const, icon: '🚇', label: 'Metro',  sub: 'Ödənişsiz' },
                    { id: 'kuryer' as const, icon: '🛵', label: 'Kuryer', sub: '+4.99 ₼' },
                    { id: 'post'   as const, icon: '📮', label: 'Poçt',   sub: '+4.99 ₼' },
                  ].map(d => (
                    <div key={d.id} onClick={() => setDelivery(d.id)} style={{
                      flex: 1, background: delivery === d.id ? C.black : C.white,
                      border: `1.5px solid ${delivery === d.id ? C.black : C.border}`,
                      borderRadius: 10, padding: '14px 10px',
                      textAlign: 'center' as const, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{d.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: delivery === d.id ? C.white : C.black }}>{d.label}</div>
                      <div style={{ fontSize: 11, marginTop: 3, color: delivery === d.id ? 'rgba(255,255,255,0.55)' : C.grayLt }}>{d.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metro schedule from Sanity */}
              {delivery === 'metro' && (
                <>
                  {metroSchedule.stations.length > 0 ? (
                    <Sec>
                      <Label>Metro stansiyası</Label>
                      <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 7 }}>
                        {metroSchedule.stations.map(m => (
                          <div key={m} onClick={() => setMetro(m)} style={{
                            padding: '7px 13px', borderRadius: 100, fontSize: 12, cursor: 'pointer',
                            fontWeight: metro === m ? 600 : 400,
                            background: metro === m ? C.black : C.bg,
                            color: metro === m ? C.white : C.gray,
                            border: `1px solid ${metro === m ? C.black : C.border}`,
                            transition: 'all 0.15s',
                          }}>{m}</div>
                        ))}
                      </div>
                    </Sec>
                  ) : (
                    <Sec>
                      <p style={{ margin: 0, fontSize: 13, color: C.grayLt }}>
                        Metro stansiyaları Sanity-dən əlavə ediləcək
                      </p>
                    </Sec>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    {[
                      { lbl: 'Gün',  val: day,  set: setDay,  opts: metroSchedule.days },
                      { lbl: 'Saat', val: time, set: setTime, opts: metroSchedule.times },
                    ].map(f => (
                      <div key={f.lbl} style={{
                        flex: 1, background: C.white, border: `1px solid ${C.border}`,
                        borderRadius: 12, padding: '12px 14px',
                      }}>
                        <Label>{f.lbl}</Label>
                        {f.opts.length > 0 ? (
                          <select
                            value={f.val}
                            onChange={e => f.set(e.target.value)}
                            style={{
                              width: '100%', background: C.bg, border: `1px solid ${C.border}`,
                              borderRadius: 8, padding: '10px',
                              color: C.black, fontSize: 13,
                              outline: 'none', fontFamily: FONT, cursor: 'pointer',
                            }}
                          >
                            {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <p style={{ margin: 0, fontSize: 12, color: C.grayLt }}>Sanity-dən əlavə edin</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Address for kuryer/post */}
              {(delivery === 'kuryer' || delivery === 'post') && (
                <Sec>
                  <Label>Çatdırılma ünvanı</Label>
                  <Inp
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder={delivery === 'post' ? 'Şəhər, poçt indeksi, ünvan' : 'Məhəllə, küçə, bina nömrəsi'}
                  />
                  <p style={{ margin: '6px 0 0', fontSize: 11, color: C.grayLt }}>
                    {delivery === 'post'
                      ? 'Nümunə: Bakı, AZ1000, Əliağa Vahid küç. 12'
                      : 'Nümunə: Masazır, Qurtuluş küç. 93, 4-cü mərtəbə'}
                  </p>
                </Sec>
              )}

              {/* Contact — "Ad" only (no Soyad) */}
              <Sec highlight>
                <Label>Əlaqə məlumatları</Label>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 10 }}>
                  <Inp
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    placeholder="Ad"
                  />
                  <Inp
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    placeholder="Doğum tarixi (məs: 15.03.2000)"
                  />
                  <Inp
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Telefon (+994 50 xxx xx xx)"
                    type="tel"
                  />
                </div>
              </Sec>

              {/* Customer type — no % shown */}
              <Sec>
                <Label>Müştəri növü</Label>
                <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
                  {[
                    { id: 'new'   as const, label: 'Yeni müştəriyəm',  sub: 'İlk sifarişim' },
                    { id: 'loyal' as const, label: 'Daimi müştəriyəm', sub: 'Əvvəl sifariş vermişəm' },
                  ].map(opt => {
                    const sel = customerType === opt.id;
                    return (
                      <div key={opt.id} onClick={() => setCustomerType(opt.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        background: sel ? C.bg : C.white,
                        border: `1.5px solid ${sel ? C.blue : C.border}`,
                        transition: 'all 0.15s',
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%',
                          border: `2px solid ${sel ? C.blue : C.border}`,
                          background: sel ? C.blue : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {sel && <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.white }} />}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: sel ? 600 : 400, color: C.black }}>{opt.label}</div>
                          <div style={{ fontSize: 11, color: C.grayLt, marginTop: 1 }}>{opt.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Sec>

              {/* Summary — labelled discounts */}
              <Sec>
                <Label>Sifariş xülasəsi</Label>
                <SRow l={`${product.name} × ${qty}`} r={`${(effectiveUnit * qty).toFixed(2)} ₼`} />
                {isOnSale && (
                  <SRow l="Kampaniya endirimi" r={`−${((origPrice - baseUnit) * qty).toFixed(2)} ₼`} accent />
                )}
                {bulkDiscTotal > 0 && (
                  <SRow l={`Say endirimi (${qty} ədəd)`} r={`−${bulkDiscTotal.toFixed(2)} ₼`} accent />
                )}
                {boxFee > 0 && <SRow l={box?.name ?? ''} r={`+${boxFee.toFixed(2)} ₼`} />}
                {deliveryFee > 0 && (
                  <SRow l={delivery === 'kuryer' ? 'Kuryer' : 'Poçt'} r={`+${deliveryFee.toFixed(2)} ₼`} />
                )}
                {customerDisc > 0 && (
                  <SRow
                    l={customerType === 'loyal' ? 'Daimi müştəri endirimi' : 'Yeni müştəri endirimi'}
                    r={`−${customerDisc.toFixed(2)} ₼`}
                    accent
                  />
                )}

                <div style={{ borderTop: `1px solid ${C.border}`, margin: '10px 0 12px' }} />
                <SRow l="Ümumi məbləğ" r={`${finalTotal.toFixed(2)} ₼`} bold />

                {/* Deposit */}
                <div style={{
                  background: C.orangeBg, border: `1px solid ${C.orangeBd}`,
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
                    {beh.toFixed(2)} ₼
                  </div>
                </div>
              </Sec>
            </>
          )}
        </div>

        {/* Footer buttons */}
        <div style={{
          padding: '14px 20px 28px', background: C.white,
          borderTop: `1px solid ${C.border}`,
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          {step === 2 && (
            <button onClick={() => setStep(1)} style={{
              flex: 1, padding: '14px', borderRadius: 10,
              background: C.bg, border: `1px solid ${C.border}`,
              color: C.gray, fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: FONT, transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.black}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
            >← Geri</button>
          )}
          <button
            disabled={step === 2 && !step2Valid}
            onClick={() => { if (step === 1) setStep(2); else handleSubmit(); }}
            style={{
              flex: step === 2 ? 3 : 1, padding: '14px', borderRadius: 10, border: 'none',
              background: step === 2 && !step2Valid ? C.bg : C.orange,
              color: step === 2 && !step2Valid ? C.grayLt : C.white,
              fontSize: 15, fontWeight: 700,
              cursor: step === 2 && !step2Valid ? 'not-allowed' : 'pointer',
              fontFamily: FONT,
              boxShadow: step === 2 && !step2Valid ? 'none' : '0 4px 16px rgba(255,106,0,0.25)',
              transition: 'background 0.15s',
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