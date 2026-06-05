import React, { useState, useEffect } from 'react';
import { F } from '../tokens';
import { ChevronLeft, ChevronRight, Upload, Minus, Plus, Check, Tag, X, ArrowLeft } from 'lucide-react';
import { Product, CartItem, BulkTier, Coupon } from '../types';
import ProductReviews from './ProductReviews';

function toWebP(url: string, width: number = 800): string {
  if (!url || !url.includes('cdn.sanity.io')) return url;
  try {
    const u = new URL(url);
    u.searchParams.set('w', String(width));
    u.searchParams.set('fm', 'webp');
    u.searchParams.set('q', '85');
    u.searchParams.set('fit', 'max');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return url;
  }
}

const FONT = F.sans;

const C = {
  bg:       'var(--clr-bg)',
  white:    'var(--clr-white)',
  black:    'var(--clr-black)',
  gray:     'var(--clr-text-sec)',
  grayLt:   'var(--clr-text-muted)',
  border:   '#E5E1DB',
  orange:   'var(--clr-primary)',
  orangeBg: '#FFF3EC',
  orangeBd: '#FFD4B8',
  green:    '#16A34A',
  greenBg:  '#F0FDF4',
  blue:     '#2563EB',
  blueBg:   '#EFF6FF',
  blueBd:   '#BFDBFE',
  red:      '#DC2626',
};

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

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

interface BoxOption { id: string; name: string; desc?: string; price: number; imageUrl?: string | null; isActive?: boolean; }

interface ProductPageProps {
  product: Product;
  initialData?: CartItem;
  boxes: BoxOption[];
  coupons?: Coupon[];
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({
  product, initialData, boxes, coupons = [], onBack, onAddToCart,
}) => {

  const variants = product.variants || [];

  const allImages = variants.flatMap((v, vIdx) =>
    (v.images || []).map((url) => ({
      url,
      vIdx,
      label: [v.modelName, v.colorName].filter(Boolean).join(' · ') || `Variant ${vIdx + 1}`,
    }))
  );

  const [imgIdx,     setImgIdx]    = useState(() => {
    if (initialData?.variantIndex) {
      const fi = allImages.findIndex(img => img.vIdx === initialData.variantIndex);
      return fi >= 0 ? fi : 0;
    }
    return 0;
  });
  const [variantIdx, setVariantIdx] = useState(initialData?.variantIndex ?? 0);
  const [qty,        setQty]        = useState(initialData?.quantity ?? 1);
  const [printText,  setPrintText]  = useState(initialData?.customText ?? '');

  const [uploadedImgUrl,     setUploadedImgUrl]     = useState<string | null>(null);
  const [uploadedImgPreview, setUploadedImgPreview] = useState<string | null>(null);
  const [uploadLoading,      setUploadLoading]      = useState(false);
  const [uploadError,        setUploadError]        = useState('');
  const [addedToCart,        setAddedToCart]        = useState(false);

  // ── Endirim seçimləri ──────────────────────────────────────────
  const [customerType,  setCustomerType]  = useState<'new' | 'loyal' | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponInput,   setCouponInput]   = useState('');
  const [couponError,   setCouponError]   = useState('');
  const [couponFocused, setCouponFocused] = useState(false);

  const effectiveBoxes: BoxOption[] = (product as any).customBoxOptions?.length > 0
    ? (product as any).customBoxOptions
    : boxes;
  const [boxId, setBoxId] = useState<string>(
    initialData?.boxType ?? effectiveBoxes[0]?.id ?? 'simple'
  );

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
  const box    = showBox ? (effectiveBoxes.find((b: BoxOption) => b.id === boxId) ?? effectiveBoxes[0]) : null;
  const boxFee = showBox ? (box?.price ?? 0) : 0;

  // ── Endirim hesablamaları ──────────────────────────────────────
  const hasCouponAvailable = coupons.some(c => c.isActive);
  const discRate     = customerType === 'loyal' ? 20 : customerType === 'new' ? 10 : 0;
  const productSub   = effectiveUnit * qty + boxFee;
  const customerDisc = customerType ? Math.round(productSub * discRate / 100 * 100) / 100 : 0;
  const couponBase   = productSub - customerDisc;
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discountType === 'percent'
      ? Math.round(couponBase * appliedCoupon.discountValue / 100 * 100) / 100
      : Math.min(appliedCoupon.discountValue, couponBase)
    : 0;
  const finalPrice = Math.max(0, couponBase - couponDiscount);

  const handleApplyCoupon = () => {
    const trimmed = couponInput.trim().toUpperCase();
    if (!trimmed) { setCouponError('Kupon kodu daxil edin'); return; }
    const found = coupons.find(c => c.code.toUpperCase() === trimmed && c.isActive);
    if (!found) { setCouponError('Bu kupon kodu tapılmadı və ya deaktivdir'); return; }
    setCouponError('');
    setAppliedCoupon(found);
    setCouponInput('');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setUploadError('Şəkil 5 MB-dan böyük olmamalıdır'); return; }
    setUploadError('');
    setUploadLoading(true);
    const localPreview = URL.createObjectURL(file);
    setUploadedImgPreview(localPreview);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = ev => { const result = ev.target?.result as string; resolve(result.split(',')[1]); };
        reader.onerror = () => reject(new Error('Fayl oxunmadı'));
        reader.readAsDataURL(file);
      });
      const formData = new FormData();
      formData.append('image', base64);
      formData.append('expiration', '604800');
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Yükləmə xətası');
      const data = await response.json();
      if (data.success) { setUploadedImgUrl(data.data.url); setUploadLoading(false); }
      else throw new Error('Şəkil yüklənmədi');
    } catch {
      setUploadedImgPreview(null); setUploadedImgUrl(null);
      setUploadLoading(false); setUploadError('Şəkil yüklənmədi, yenidən cəhd edin');
    }
  };

  const handleRemoveImage = () => { setUploadedImgUrl(null); setUploadedImgPreview(null); setUploadError(''); };

  const handleAddToCart = () => {
    if (uploadLoading) return;
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
      specialRequest:       uploadedImgUrl ? `Müştəri şəkli: ${uploadedImgUrl}` : '',
      customerName:         '',
      phone:                '',
      birthDate:            '',
      isGift: showBox && boxId !== 'simple',
      isFirstOrSecondOrder: false,
      customerType:         customerType,
      deliveryType:         'standard',
      deliveryDetails:      '',
      bulkDiscountAmount:   bulkDiscTotal,
      boxType:              boxId,
      boxPrice:             boxFee,
      couponCode:           appliedCoupon?.code,
      couponDiscount:       couponDiscount > 0 ? couponDiscount : undefined,
      hasQrCode:            !!uploadedImgUrl,
      lazerPrice:           0,
      deliveryMethod:       'kuryer' as any,
      finalTotal:           finalPrice,
      behAmount:            Math.ceil(finalPrice * 0.5),
    };
    onAddToCart(item);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const prevImg = () => setImgIdx(i => (i - 1 + totalImgs) % totalImgs);
  const nextImg = () => setImgIdx(i => (i + 1) % totalImgs);
  const currentImgVariant = allImages[imgIdx];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT }}>
      <style>{`
        .ravio-page-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: flex-start;
        }
        .ravio-img-col { position: sticky; top: 100px; }
        .ravio-detail-col { min-width: 0; }
        @media (max-width: 900px) {
          .ravio-page-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .ravio-img-col { position: static !important; }
        }
        .ravio-thumb-strip {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .ravio-thumb-btn {
          border: none;
          padding: 0;
          cursor: pointer;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        @keyframes ravio-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(16px,3vw,32px) clamp(16px,3vw,24px) 80px' }}>

        {/* Breadcrumb / Geri düyməsi */}
        <button
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: C.gray, fontSize: 13, fontWeight: 600, fontFamily: FONT,
            padding: '8px 0', marginBottom: 24,
          }}
        >
          <ArrowLeft size={16} />
          Bütün məhsullara qayıt
        </button>

        <div className="ravio-page-grid">

          {/* ── Sol: Şəkil qalereyası ── */}
          <div className="ravio-img-col">
            {totalImgs > 0 ? (
              <>
                {/* Əsas şəkil */}
                <div style={{
                  position: 'relative', background: C.white,
                  borderRadius: 16, overflow: 'hidden',
                  border: `1px solid ${C.border}`,
                  aspectRatio: '1/1',
                }}>
                  <img
                    src={toWebP(allImages[imgIdx]?.url ?? '', 900)}
                    alt={product.name}
                    loading="eager"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/F5F2EC/AAAAAA?text=Şəkil+yoxdur'; }}
                  />

                  {isOnSale && (
                    <div style={{
                      position: 'absolute', top: 16, left: 16,
                      background: C.orange, color: C.white,
                      fontSize: 13, fontWeight: 800, padding: '5px 12px', borderRadius: 8,
                    }}>−{salePct}%</div>
                  )}

                  {currentImgVariant?.label && (
                    <div style={{
                      position: 'absolute', bottom: 48, left: 12,
                      background: 'rgba(0,0,0,0.55)', color: C.white,
                      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                    }}>{currentImgVariant.label}</div>
                  )}

                  {totalImgs > 1 && (
                    <>
                      <button onClick={prevImg} aria-label="Əvvəlki şəkil" style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.border}`,
                        borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2,
                      }}><ChevronLeft size={20} color={C.black} /></button>

                      <button onClick={nextImg} aria-label="Növbəti şəkil" style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.95)', border: `1px solid ${C.border}`,
                        borderRadius: '50%', width: 40, height: 40, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2,
                      }}><ChevronRight size={20} color={C.black} /></button>

                      <div style={{
                        position: 'absolute', bottom: 14, right: 14,
                        background: 'rgba(0,0,0,0.45)', color: C.white,
                        fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100,
                      }}>{imgIdx + 1} / {totalImgs}</div>
                    </>
                  )}
                </div>

                {/* Kiçik thumbnail-lər */}
                {totalImgs > 1 && (
                  <div className="ravio-thumb-strip">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        className="ravio-thumb-btn"
                        onClick={() => { setImgIdx(i); setVariantIdx(img.vIdx); }}
                        aria-label={`${i + 1}-ci şəkil`}
                        style={{
                          width: 64, height: 64,
                          border: `2px solid ${i === imgIdx ? C.orange : C.border}`,
                          opacity: i === imgIdx ? 1 : 0.65,
                        }}
                      >
                        <img
                          src={toWebP(img.url, 128)}
                          alt={img.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                background: C.white, borderRadius: 16, border: `1px solid ${C.border}`,
                aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.grayLt, fontSize: 14,
              }}>Şəkil yoxdur</div>
            )}
          </div>

          {/* ── Sağ: Məhsul detalları ── */}
          <div className="ravio-detail-col">

            {/* Başlıq */}
            <div style={{ marginBottom: 20 }}>
              {product.category && (
                <span style={{ fontSize: 11, color: C.grayLt, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 }}>
                  {product.category}
                </span>
              )}
              <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(22px,3vw,30px)', fontWeight: 800, color: C.black, lineHeight: 1.25, letterSpacing: '-0.3px' }}>
                {product.name}
              </h1>
            </div>

            {/* Qiymət */}
            <Sec>
              <div>
                {isOnSale && (
                  <span style={{ fontSize: 14, color: C.grayLt, textDecoration: 'line-through', display: 'block', marginBottom: 2 }}>
                    {origPrice.toFixed(2)} ₼
                  </span>
                )}
                <span style={{ fontSize: 32, fontWeight: 800, color: isOnSale ? C.orange : C.black, letterSpacing: '-1px' }}>
                  {baseUnit.toFixed(2)} ₼
                </span>
                {product.description && (
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: C.gray, lineHeight: 1.65 }}>{product.description}</p>
                )}
              </div>
            </Sec>

            {/* Müştəri növü */}
            <Sec>
              <Label>Müştəri növü</Label>
              <div style={{ display: 'flex', gap: 8 }}>
                {([
                  { id: 'new'   as const, label: 'Yeni müştəri',  sub: 'İlk sifarişimdir' },
                  { id: 'loyal' as const, label: 'Daimi müştəri', sub: 'Əvvəl sifariş vermişəm' },
                ] as const).map(opt => {
                  const sel = customerType === opt.id;
                  return (
                    <div key={opt.id} onClick={() => setCustomerType(sel ? null : opt.id)} style={{
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
                        <div style={{ fontSize: 10, color: sel ? C.blue : C.grayLt, marginTop: 1 }}>{opt.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {customerType && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: C.blueBg, border: `1px solid ${C.blueBd}`, borderRadius: 8, fontSize: 12, color: C.blue, fontWeight: 600 }}>
                  ✓ {discRate}% endirim tətbiq ediləcək — {customerDisc.toFixed(2)} ₼ qənaət
                </div>
              )}
            </Sec>

            {/* Endirim kodu — yalnız Sanity-dən aktiv kupon varsa göstər */}
            {hasCouponAvailable && (
              <Sec>
                <Label>🎟 Endirim kodu</Label>
                {appliedCoupon ? (
                  <div style={{
                    background: C.greenBg, border: `1.5px solid #BBF7D0`,
                    borderRadius: 10, padding: '12px 14px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Check size={16} color={C.green} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{appliedCoupon.code}</div>
                        <div style={{ fontSize: 11, color: '#166534', marginTop: 1 }}>
                          −{couponDiscount.toFixed(2)} ₼ endirim tətbiq edildi
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setAppliedCoupon(null)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: C.gray, padding: 4, display: 'flex', alignItems: 'center',
                    }}><X size={16} /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ flex: 1, position: 'relative' as const }}>
                        <Tag size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: C.grayLt, pointerEvents: 'none' }} />
                        <input
                          value={couponInput}
                          onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(''); }}
                          onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                          placeholder="Kupon kodunu daxil edin"
                          onFocus={() => setCouponFocused(true)}
                          onBlur={() => setCouponFocused(false)}
                          style={{
                            width: '100%', background: C.white,
                            border: `1px solid ${couponError ? C.red : couponFocused ? C.blue : C.border}`,
                            borderRadius: 8, padding: '11px 12px 11px 34px',
                            color: C.black, fontSize: 13, fontFamily: FONT,
                            outline: 'none', boxSizing: 'border-box' as const,
                            letterSpacing: 1, transition: 'border-color 0.15s',
                          }}
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        style={{
                          padding: '0 16px', background: C.black, color: C.white,
                          border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                          cursor: 'pointer', fontFamily: FONT, whiteSpace: 'nowrap' as const, flexShrink: 0,
                        }}
                      >Tətbiq et</button>
                    </div>
                    {couponError && (
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: C.red }}>{couponError}</p>
                    )}
                  </>
                )}
              </Sec>
            )}

            {/* Variantlar */}
            {variants.length > 1 && (
              <Sec>
                <Label>Model / Rəng</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
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
                          padding: '8px 10px', borderRadius: 8, cursor: oos ? 'not-allowed' : 'pointer',
                          background: sel ? C.black : C.white,
                          color: sel ? C.white : oos ? C.grayLt : C.black,
                          border: `1.5px solid ${sel ? C.black : C.border}`,
                          opacity: oos ? 0.45 : 1, transition: 'all 0.15s',
                          display: 'flex', flexDirection: 'column' as const, gap: 2,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: sel ? 600 : 500, lineHeight: 1.3 }}>{lbl}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: sel ? 'rgba(255,255,255,0.65)' : oos ? C.grayLt : C.orange }}>
                          {(v.discountPrice ?? v.price).toFixed(2)} ₼
                          {oos && <span style={{ fontSize: 10, fontWeight: 500 }}> · Bitib</span>}
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
                    width: 44, height: 44, borderRadius: '8px 0 0 8px',
                    border: `1px solid ${C.border}`, background: C.bg,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Minus size={15} /></button>
                  <div style={{
                    width: 56, height: 44, border: `1px solid ${C.border}`,
                    borderLeft: 'none', borderRight: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, background: C.white, color: C.black,
                  }}>{qty}</div>
                  <button onClick={() => setQty(q => q + 1)} style={{
                    width: 44, height: 44, borderRadius: '0 8px 8px 0',
                    border: `1px solid ${C.border}`, background: C.bg,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Plus size={15} /></button>
                </div>
                <div style={{ textAlign: 'right' as const }}>
                  {qty > 1 && <div style={{ fontSize: 12, color: C.grayLt, marginBottom: 2 }}>{effectiveUnit.toFixed(2)} ₼ / ədəd</div>}
                  <div style={{ fontSize: 26, fontWeight: 800, color: C.black, letterSpacing: '-0.5px' }}>
                    {(effectiveUnit * qty).toFixed(2)} ₼
                  </div>
                </div>
              </div>

              {product.hasBulkDiscount && product.bulkTiers && product.bulkTiers.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 8 }}>
                    {product.bulkTiers.map((tier, i) => {
                      const isActive = qty >= tier.minQty && (!tier.maxQty || qty <= tier.maxQty);
                      const lbl = tier.label || (tier.maxQty ? `${tier.minQty}–${tier.maxQty} ədəd` : `${tier.minQty}+ ədəd`);
                      const disc = Math.max(0, baseUnit - tier.discountAmount);
                      return (
                        <div key={i} onClick={() => setQty(tier.minQty)} style={{
                          padding: '5px 12px', borderRadius: 100, fontSize: 11, cursor: 'pointer', fontWeight: 600,
                          background: isActive ? C.orange : C.bg, color: isActive ? C.white : C.gray,
                          border: `1px solid ${isActive ? C.orange : C.border}`, transition: 'all 0.15s',
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
                  borderRadius: 8, padding: '11px 14px', color: C.black, fontFamily: FONT,
                  outline: 'none', boxSizing: 'border-box' as const,
                  resize: 'vertical' as const, minHeight: 80, fontSize: 16,
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
              <Label>
                Şəkil əlavə et{' '}
                <span style={{ fontWeight: 400, textTransform: 'none' as const, letterSpacing: 0, color: C.grayLt, fontSize: 10 }}>
                  — ödənişsiz
                </span>
              </Label>
              <div style={{ background: C.blueBg, border: `1px solid ${C.blueBd}`, borderRadius: 8, padding: '10px 13px', marginBottom: 12, fontSize: 12, color: '#1E40AF', lineHeight: 1.65 }}>
                Portret, eskiz, logo və ya QR kod üçün şəkil göndərin — məhsula çap ediləcək.
              </div>

              {!uploadedImgPreview && !uploadLoading && (
                <label style={{
                  display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '20px', border: `1.5px dashed ${C.border}`, borderRadius: 10, cursor: 'pointer', background: C.bg,
                }}>
                  <Upload size={20} color={C.grayLt} />
                  <span style={{ fontSize: 13, color: C.gray }}>Şəkil seçmək üçün bura basın</span>
                  <span style={{ fontSize: 11, color: C.grayLt }}>JPG, PNG, WEBP · Maks. 5 MB</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              )}

              {uploadLoading && (
                <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center', gap: 12, padding: '24px', border: `1.5px dashed ${C.blueBd}`, borderRadius: 10, background: C.blueBg }}>
                  {uploadedImgPreview && (
                    <img src={uploadedImgPreview} alt="Önizləmə" style={{ width: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8, opacity: 0.6 }} />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: 'ravio-spin 0.8s linear infinite' }}>
                      <circle cx="9" cy="9" r="7" fill="none" stroke={C.blueBd} strokeWidth="2.5" />
                      <path d="M9 2 A7 7 0 0 1 16 9" fill="none" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: C.blue, fontWeight: 600 }}>Şəkil yüklənir...</span>
                  </div>
                </div>
              )}

              {uploadedImgPreview && !uploadLoading && uploadedImgUrl && (
                <div style={{ position: 'relative' }}>
                  <img src={uploadedImgPreview} alt="Yüklənmiş" style={{ width: '100%', height: 160, objectFit: 'contain', borderRadius: 8, background: C.bg, border: `1px solid ${C.green}` }} />
                  <button onClick={handleRemoveImage} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 28, height: 28, color: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '8px 12px', background: C.greenBg, border: '1px solid #BBF7D0', borderRadius: 8 }}>
                    <Check size={14} color={C.green} strokeWidth={2.5} />
                    <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Şəkil hazırdır — sifariş ilə birlikdə göndəriləcək</span>
                  </div>
                </div>
              )}

              {uploadError && <p style={{ fontSize: 12, color: C.red, margin: '6px 0 0' }}>{uploadError}</p>}
            </Sec>

            {/* Qablaşdırma */}
            {effectiveBoxes.length > 0 && product.allowBoxSelection !== false && (
              <Sec last>
                <Label>Qablaşdırma</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
                  {effectiveBoxes.map((b: BoxOption) => {
                    const sel = boxId === b.id;
                    return (
                      <div key={b.id} onClick={() => setBoxId(b.id)} style={{
                        position: 'relative', cursor: 'pointer',
                        border: `2px solid ${sel ? C.black : C.border}`,
                        borderRadius: 10, overflow: 'hidden', transition: 'all 0.15s',
                        background: sel ? '#F8F8F8' : C.white,
                      }}>
                        <div style={{ aspectRatio: '1/1', background: C.bg, overflow: 'hidden' }}>
                          {b.imageUrl ? (
                            <img src={toWebP(b.imageUrl, 200)} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>
                          )}
                        </div>
                        <div style={{ padding: '7px 8px' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: sel ? C.black : C.gray, marginBottom: 2 }}>{b.name}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: sel ? C.orange : b.price > 0 ? C.orange : C.green }}>
                            {b.price === 0 ? 'Pulsuz' : `+${b.price.toFixed(2)} ₼`}
                          </div>
                        </div>
                        {sel && (
                          <div style={{ position: 'absolute', top: 6, right: 6, background: C.black, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Check size={12} color={C.white} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {box?.desc && <p style={{ margin: '10px 0 0', fontSize: 12, color: C.grayLt }}>{box.desc}</p>}
              </Sec>
            )}

            {/* Səbətə əlavə et — sticky footer on mobile, inline on desktop */}
            <div style={{
              marginTop: 20,
              position: 'sticky' as const,
              bottom: 0,
              background: C.bg,
              padding: '12px 0 max(16px, env(safe-area-inset-bottom, 16px))',
              borderTop: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: C.gray }}>
                  {qty} ədəd{boxFee > 0 ? ` + ${box?.name}` : ''}
                </span>
                {(customerDisc > 0 || couponDiscount > 0) ? (
                  <div style={{ textAlign: 'right' as const }}>
                    <span style={{ fontSize: 13, color: C.grayLt, textDecoration: 'line-through', display: 'block' }}>
                      {productSub.toFixed(2)} ₼
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.green }}>
                      {finalPrice.toFixed(2)} ₼
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.black }}>
                    {productSub.toFixed(2)} ₼
                  </span>
                )}
              </div>
              {(customerDisc > 0 || couponDiscount > 0) && (
                <div style={{ fontSize: 11, color: C.green, fontWeight: 600, textAlign: 'right' as const, marginBottom: 8 }}>
                  {customerDisc > 0 && `−${customerDisc.toFixed(2)} ₼ müştəri endirimi`}
                  {customerDisc > 0 && couponDiscount > 0 && ' · '}
                  {couponDiscount > 0 && `−${couponDiscount.toFixed(2)} ₼ kupon`}
                </div>
              )}
              <button
                onClick={handleAddToCart}
                disabled={uploadLoading}
                style={{
                  width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                  background: addedToCart ? C.green : uploadLoading ? C.grayLt : C.orange,
                  color: C.white, fontSize: 16, fontWeight: 700,
                  cursor: uploadLoading ? 'not-allowed' : 'pointer',
                  fontFamily: FONT,
                  boxShadow: (uploadLoading || addedToCart) ? 'none' : '0 4px 16px rgba(255,106,0,0.28)',
                  transition: 'background 0.2s',
                  minHeight: 54,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {addedToCart
                  ? <><Check size={18} /> Səbətə əlavə edildi!</>
                  : uploadLoading
                    ? '⏳ Şəkil yüklənir...'
                    : '🛒 Səbətə əlavə et'}
              </button>
            </div>

          </div>{/* /detail col */}
        </div>{/* /grid */}
      </div>

      {product.reviews && product.reviews.length > 0 && (
        <ProductReviews reviews={product.reviews} />
      )}
    </div>
  );
};

export default ProductPage;