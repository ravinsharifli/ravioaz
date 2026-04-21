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

const Sec: React.FC<{ children: React.ReactNode; highlight?: boolean; last?: boolean }> = ({ children, highlight, last }) => (
  <div style={{
    background: C.white,
    border: `1.5px solid ${highlight ? C.blue : C.border}`,
    borderRadius: 12, padding: '14px 16px',
    marginBottom: last ? 0 : 12,
  }}>{children}</div>
);

interface BoxOption { id: string; name: string; desc: string; price: number; imageUrl?: string | null; }

interface ProductModalProps {
  product: Product;
  initialData?: CartItem;
  metroSchedule: { stations: string[]; days: string[]; times: string[] };
  boxes: BoxOption[];
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCategory: (category: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({
  product, initialData, boxes, onClose, onAddToCart,
}) => {
  const variants = product.variants || [];

  const allImages = variants.flatMap((v, vIdx) =>
    (v.images || []).map((url) => ({
      url,
      vIdx,
      label: [v.modelName, v.colorName].filter(Boolean).join(' · ') || `Variant ${vIdx + 1}`,
    }))
  );

  const [imgIdx,      setImgIdx]      = useState(() => {
    if (initialData?.variantIndex) {
      const fi = allImages.findIndex(img => img.vIdx === initialData.variantIndex);
      return fi >= 0 ? fi : 0;
    }
    return 0;
  });
  const [variantIdx,  setVariantIdx]  = useState(initialData?.variantIndex ?? 0);
  const [qty,         setQty]         = useState(initialData?.quantity ?? 1);
  const [printText,   setPrintText]   = useState(initialData?.customText ?? '');
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [boxId,       setBoxId]       = useState(initialData?.boxType ?? boxes[0]?.id ?? 'simple');

  const variant  = variants[variantIdx] || variants[0];
  if (!variant) return null;

  const totalImgs  = allImages.length;
  const origPrice  = variant.price;
  const salePrice  = variant.discountPrice;
  const baseUnit   = salePrice ?? origPrice;
  const isOnSale   = !!(salePrice && salePrice < origPrice);
  const salePct    = isOnSale ? Math.round(((origPrice - baseUnit) / origPrice) * 100) : 0;

  const activeTier    = product.hasBulkDiscount && product.bulkTiers ? getActiveTier(product.bulkTiers, qty) : null;
  const bulkOff       = activeTier?.discountAmount ?? 0;
  const effectiveUnit = Math.max(0, baseUnit - bulkOff);
  const bulkDiscTotal = bulkOff * qty;

  const showBox = product.allowBoxSelection !== false;
  const box    = showBox ? (boxes.find(b => b.id === boxId) ?? boxes[0]) : null;
  const boxFee = showBox ? (box?.price ?? 0) : 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('Maks. 5 MB'); return; }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = ev => setUploadedImg(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    const subtotal = effectiveUnit * qty + boxFee;
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
      customerName:         '',
      phone:                '',
      birthDate:            '',
      isGift: showBox && boxId !== 'simple',
      isFirstOrSecondOrder: false,
      customerType:         'new',
      deliveryType:         'standard',
      deliveryDetails:      '',
      bulkDiscountAmount:   bulkDiscTotal,
      boxType:              boxId,
      boxPrice:             boxFee,
      hasQrCode:            !!uploadedImg,
      lazerPrice:           0,
      deliveryMethod:       'metro' as any,
      finalTotal:           subtotal,
      behAmount:            Math.ceil(subtotal * 0.5),
    };
    onAddToCart(item);
    onClose();
  };

  const prevImg = () => setImgIdx(i => (i - 1 + totalImgs) % totalImgs);
  const nextImg = () => setImgIdx(i => (i + 1) % totalImgs);
  const currentImgVariant = allImages[imgIdx];

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
        background: C.bg, width: '100%', maxWidth: 560, margin: '0 auto',
        maxHeight: 'min(94dvh, 94vh)',
        borderRadius: '16px 16px 0 0',
        display: 'flex', flexDirection: 'column' as const, overflow: 'hidden',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.12)',
      }}>

        {/* Header */}
        <div style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.black, lineHeight: 1.3 }}>{product.name}</h2>
              {product.category && <span style={{ fontSize: 11, color: C.grayLt, fontWeight: 500, marginTop: 3, display: 'block' }}>{product.category}</span>}
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: '50%', background: C.bg, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.gray, flexShrink: 0,
            }}><X size={16} /></button>
          </div>
        </div>

        {/* Scroll area */}
        <div style={{ flex: 1, overflowY: 'auto' as const, padding: '16px 20px 8px', WebkitOverflowScrolling: 'touch' as any }}>

          {/* Şəkil qalereyası — responsive height */}
          {totalImgs > 0 && (
            <div style={{
              position: 'relative', background: C.white,
              borderRadius: 12, overflow: 'hidden',
              marginBottom: 16,
              height: 'clamp(200px, 40vw, 280px)',
              border: `1px solid ${C.border}`,
            }}>
              <img
                src={allImages[imgIdx]?.url}
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

              {currentImgVariant?.label && (
                <div style={{
                  position: 'absolute', bottom: 36, left: 10,
                  background: 'rgba(0,0,0,0.55)', color: C.white,
                  fontSize: 10, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 100,
                }}>{currentImgVariant.label}</div>
              )}

              {totalImgs > 1 && (
                <>
                  <button onClick={prevImg} style={{
                    position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.border}`,
                    borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 2,
                  }}><ChevronLeft size={18} color={C.black} /></button>

                  <button onClick={nextImg} style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.border}`,
                    borderRadius: '50%', width: 36, height: 36, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 2,
                  }}><ChevronRight size={18} color={C.black} /></button>

                  <div style={{
                    position: 'absolute', bottom: 10, left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex', gap: 5,
                  }}>
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => { setImgIdx(i); setVariantIdx(img.vIdx); }} style={{
                        width: i === imgIdx ? 20 : 6, height: 6,
                        borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer',
                        background: i === imgIdx ? C.orange : img.vIdx === variantIdx ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.15)',
                        transition: 'all 0.2s',
                      }} />
                    ))}
                  </div>

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

          {/* Qiymət */}
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

          {/* Variantlar */}
          {variants.length > 1 && (
            <Sec>
              <Label>Model / Rəng</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                {variants.map((v, i) => {
                  const oos = v.stock === 0;
                  const sel = variantIdx === i;
                  const lbl = [v.modelName, v.colorName].filter(Boolean).join(' · ') || `Variant ${i + 1}`;
                  return (
                    <div key={i} onClick={() => {
                      if (!oos) {
                        setVariantIdx(i);
                        const firstIdx = allImages.findIndex(img => img.vIdx === i);
                        setImgIdx(firstIdx >= 0 ? firstIdx : 0);
                      }
                    }}
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

          {/* Say */}
          <Sec>
            <Label>Say</Label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{
                  width: 40, height: 40, borderRadius: '8px 0 0 8px',
                  border: `1px solid ${C.border}`, background: C.bg,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Minus size={14} /></button>
                <div style={{
                  width: 52, height: 40, border: `1px solid ${C.border}`,
                  borderLeft: 'none', borderRight: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 700, background: C.white, color: C.black,
                }}>{qty}</div>
                <button onClick={() => setQty(q => q + 1)} style={{
                  width: 40, height: 40, borderRadius: '0 8px 8px 0',
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

          {/* Xüsusi yazı */}
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
                color: C.black, fontFamily: FONT,
                outline: 'none', boxSizing: 'border-box' as const,
                resize: 'vertical' as const, minHeight: 80,
                fontSize: 16,
              } as React.CSSProperties}
              onFocus={e => e.currentTarget.style.borderColor = C.blue}
              onBlur={e => e.currentTarget.style.borderColor = C.border}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 5 }}>
              <span style={{ fontSize: 11, color: C.grayLt }}>{printText.length}/300</span>
            </div>
          </Sec>

          {/* Şəkil yüklə */}
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
              }}>
                <Upload size={20} color={C.grayLt} />
                <span style={{ fontSize: 13, color: C.gray }}>Şəkil seçmək üçün bura basın</span>
                <span style={{ fontSize: 11, color: C.grayLt }}>JPG, PNG, WEBP · Maks. 5 MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />
              </label>
            )}
            {uploadError && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{uploadError}</p>}
          </Sec>

          {/* Qablaşdırma */}
          {(boxes.length > 0 && product.allowBoxSelection !== false) && (
            <Sec last>
              <Label>Qablaşdırma</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
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
                      <div style={{ aspectRatio: '1/1', background: '#F5F2EC', overflow: 'hidden' }}>
                        {b.imageUrl ? (
                          <img src={b.imageUrl} alt={b.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                            📦
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '7px 8px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: sel ? C.black : C.gray, marginBottom: 2 }}>{b.name}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: sel ? C.orange : b.price > 0 ? C.orange : C.green }}>
                          {b.price === 0 ? 'Pulsuz' : `+${b.price.toFixed(2)} ₼`}
                        </div>
                      </div>
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

          <div style={{ height: 8 }} />
        </div>

        {/* Footer — həmişə aşağıda görünür */}
        <div style={{
          padding: '14px 20px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))',
          background: C.white,
          borderTop: `1px solid ${C.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: C.gray }}>
              {qty} ədəd{boxFee > 0 ? ` + ${box?.name}` : ''}
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: C.black }}>
              {(effectiveUnit * qty + boxFee).toFixed(2)} ₼
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            style={{
              width: '100%', padding: '15px', borderRadius: 10, border: 'none',
              background: C.orange, color: C.white,
              fontSize: 16, fontWeight: 700,
              cursor: 'pointer', fontFamily: FONT,
              boxShadow: '0 4px 16px rgba(255,106,0,0.25)',
              transition: 'background 0.15s',
              minHeight: 52,
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#E55E00'}
            onMouseLeave={e => e.currentTarget.style.background = C.orange}
          >
            🛒 Səbətə əlavə et
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;