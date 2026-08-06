import React, { useState, useEffect } from 'react';
import { F } from '../tokens';
import { ChevronLeft, ChevronRight, Upload, Minus, Plus, Check, Tag, X, ArrowLeft } from 'lucide-react';
import { Product, CartItem, Coupon } from '../types';
import ProductReviews from './ProductReviews';
import ZoomableImage from './ZoomableImage.tsx';
import { toWebP, toSrcSet } from '../lib/image';
import { BULK_DISCOUNT_PER_UNIT, getColorHex } from '../constants/defaults';

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

// Rəngin açıq/tünd olduğunu hesablayır ki, üzərindəki tik işarəsi (✓) həmişə oxunaqlı olsun
function isLightColor(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length !== 6 && h.length !== 3) return true;
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 165;
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
  bulkDiscountPerUnit?: number;
  onBack: () => void;
  onAddToCart: (item: CartItem) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({
  product, initialData, boxes, coupons = [], bulkDiscountPerUnit = BULK_DISCOUNT_PER_UNIT, onBack, onAddToCart,
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
  const [bulkNoticeDismissed, setBulkNoticeDismissed] = useState(false);

  const effectiveBoxes: BoxOption[] = (product as any).customBoxOptions?.length > 0
    ? (product as any).customBoxOptions
    : boxes;
  const [boxId, setBoxId] = useState<string>(
    initialData?.boxType ?? effectiveBoxes[0]?.id ?? 'simple'
  );

  // view_item — məhsul səhifəsi açıldıqda GA4 + Meta-ya göndər
  // NOT: Bu useEffect mütləq conditional return-dan ƏVVƏL gəlməlidir (React Hooks qaydası)
  useEffect(() => {
    const v = variants[0];
    if (!v) return;
    if (typeof (window as any).trackEvent !== 'undefined') {
      (window as any).trackEvent('view_item', {
        currency: 'AZN',
        value: v.discountPrice ?? v.price,
        items: [{ item_id: product.id, item_name: product.name, price: v.discountPrice ?? v.price }],
      });
    }
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', 'ViewContent', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: v.discountPrice ?? v.price,
        currency: 'AZN',
      });
    }
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const variant  = variants[variantIdx] || variants[0];
  if (!variant) return null;

  // ── Model / Rəng seçimi üçün unikal siyahılar ──────────────────
  // Əgər bütün variantlarda modelName eynidir (yaxud boşdur) -> model seçimi göstərilmir, sadəcə rəng dairələri.
  // Əgər fərqli modellər varsa -> əvvəl model (kiçik yazı düymələri), sonra seçilmiş modelin rəngləri (dairə).
  const uniqueModels = Array.from(
    new Set(variants.map(v => (v.modelName || '').trim()).filter(Boolean))
  );
  const hasMultipleModels = uniqueModels.length > 1;

  const currentModel = hasMultipleModels ? (variant.modelName || '').trim() : null;

  // Seçilmiş modelə uyğun rəng variantları (model yoxdursa bütün variantlar)
  const colorVariants = hasMultipleModels
    ? variants.map((v, i) => ({ v, i })).filter(({ v }) => (v.modelName || '').trim() === currentModel)
    : variants.map((v, i) => ({ v, i }));

  const hasMultipleColors = colorVariants.length > 1
    && colorVariants.some(({ v }) => (v.colorName || '').trim());

  function selectVariant(i: number) {
    const v = variants[i];
    if (v.inStock === false) return;
    setVariantIdx(i);
    const firstIdx = allImages.findIndex(img => img.vIdx === i);
    setImgIdx(firstIdx >= 0 ? firstIdx : 0);
  }

  function selectModel(modelName: string) {
    // Bu modelin ilk mövcud (stokda olan, ya da ilk) variantına keç
    const candidates = variants.map((v, i) => ({ v, i })).filter(({ v }) => (v.modelName || '').trim() === modelName);
    const available = candidates.find(({ v }) => v.inStock !== false);
    const target = available || candidates[0];
    if (target) selectVariant(target.i);
  }

  const totalImgs  = allImages.length;
  const origPrice  = variant.price;
  const salePrice  = variant.discountPrice;
  const baseUnit   = salePrice ?? origPrice;
  const isOnSale   = !!(salePrice && salePrice < origPrice);
  const salePct    = isOnSale ? Math.round(((origPrice - baseUnit) / origPrice) * 100) : 0;

  const bulkOff       = qty >= 2 ? bulkDiscountPerUnit : 0;
  const effectiveUnit = Math.max(0, baseUnit - bulkOff);
  const bulkDiscTotal = bulkOff * qty;
  const showBulkNotice = qty >= 10 && !bulkNoticeDismissed;

  const showBox = product.allowBoxSelection !== false;
  const box    = showBox ? (effectiveBoxes.find((b: BoxOption) => b.id === boxId) ?? effectiveBoxes[0]) : null;
  const boxFee = showBox ? (box?.price ?? 0) : 0;

  // ── Endirim hesablamaları ──────────────────────────────────────
  const hasCouponAvailable = coupons.length > 0;
  const discRate     = customerType === 'loyal' ? 20 : customerType === 'new' ? 10 : 0;
  const productSub   = effectiveUnit * qty + boxFee;
  const customerDisc = customerType ? Math.round(productSub * discRate / 100 * 100) / 100 : 0;
  const couponBase   = productSub - customerDisc;
  const couponDiscount = appliedCoupon
    ? Math.min(appliedCoupon.discountValue, couponBase)
    : 0;
  const finalPrice = Math.max(0, couponBase - couponDiscount);

  // Sticky bar üçün: say × (kampaniyasız əsl qiymət) + qutu — xətli göstərmək üçün
  const origSub = origPrice * qty + boxFee;
  const hasAnyDiscount = isOnSale || bulkOff > 0 || customerDisc > 0 || couponDiscount > 0;

  const handleApplyCoupon = () => {
    const trimmed = couponInput.trim().toUpperCase();
    if (!trimmed) { setCouponError('Kupon kodu daxil edin'); return; }
    const found = coupons.find(c => c.code.toUpperCase() === trimmed);
    if (!found) { setCouponError('Bu kupon kodu tapılmadı'); return; }
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
      customerType:         customerType,
      deliveryType:         'standard',
      deliveryDetails:      '',
      bulkDiscountAmount:   bulkDiscTotal,
      boxType:              boxId,
      boxPrice:             boxFee,
      couponCode:           appliedCoupon?.code,
      couponDiscount:       couponDiscount > 0 ? couponDiscount : undefined,
      customerDiscount:     customerDisc > 0 ? customerDisc : undefined,
      hasQrCode:            !!uploadedImgUrl,
      deliveryMethod:       'kuryer' as any,
      finalTotal:           finalPrice,
      behAmount:            Math.ceil(finalPrice * 0.5),
    };
    onAddToCart(item);

    // GA4 add_to_cart
    if (typeof (window as any).trackEvent !== 'undefined') {
      (window as any).trackEvent('add_to_cart', {
        currency: 'AZN',
        value: finalPrice,
        items: [{ item_id: product.id, item_name: product.name, price: effectiveUnit, quantity: qty }],
      });
    }
    // Meta Pixel AddToCart
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [product.id],
        content_name: product.name,
        content_type: 'product',
        value: finalPrice,
        currency: 'AZN',
      });
    }

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
                <div
                  style={{
                    position: 'relative', background: C.white,
                    borderRadius: 16, overflow: 'hidden',
                    border: `1px solid ${C.border}`,
                    aspectRatio: '1/1',
                  }}>
                  <ZoomableImage
                    src={toWebP(allImages[imgIdx]?.url ?? '', 720, 80)}
                    srcSet={toSrcSet(allImages[imgIdx]?.url ?? '', [240, 480, 720], 80)}
                    sizes="(max-width: 640px) 90vw, (max-width: 1280px) 50vw, 640px"
                    zoomSrc={toWebP(allImages[imgIdx]?.url ?? '', 1400, 85)}
                    alt={product.name}
                    loading="eager"
                    fetchPriority="high"
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

            {product.description && (
              <Sec>
                <p style={{ margin: 0, fontSize: 13, color: C.gray, lineHeight: 1.65 }}>{product.description}</p>
              </Sec>
            )}

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
                    <div
                      key={opt.id}
                      onClick={() => setCustomerType(sel ? null : opt.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCustomerType(sel ? null : opt.id); } }}
                      role="button"
                      tabIndex={0}
                      aria-pressed={sel}
                      style={{
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
                    <button onClick={() => setAppliedCoupon(null)} aria-label="Kuponu sil" style={{
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
                          aria-label="Kupon kodu"
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

            {/* Model + Rəng seçimi — tək, yığcam blokda (bellita.net tərzi) */}
            {(hasMultipleModels || hasMultipleColors) && (
              <Sec>
                {hasMultipleModels && (
                  <div style={{ marginBottom: hasMultipleColors ? 14 : 0 }}>
                    <Label>Model</Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
                      {uniqueModels.map((m) => {
                        const sel = currentModel === m;
                        const modelOos = variants
                          .filter(v => (v.modelName || '').trim() === m)
                          .every(v => v.inStock === false);
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => !modelOos && selectModel(m)}
                            disabled={modelOos}
                            style={{
                              padding: '7px 14px', borderRadius: 20, cursor: modelOos ? 'not-allowed' : 'pointer',
                              background: sel ? C.black : C.white,
                              color: sel ? C.white : modelOos ? C.grayLt : C.black,
                              border: `1.5px solid ${sel ? C.black : C.border}`,
                              opacity: modelOos ? 0.45 : 1, transition: 'all 0.15s',
                              fontSize: 13, fontWeight: sel ? 600 : 500, fontFamily: FONT,
                            }}
                          >
                            {m}{modelOos && ' · Bitib'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {hasMultipleColors && (
                  <div>
                    <Label>Rəng: <span style={{ color: C.black, textTransform: 'none' as const, letterSpacing: 0, fontWeight: 600 }}>{variant.colorName || ''}</span></Label>
                    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
                      {colorVariants.map(({ v, i }) => {
                        const oos = v.inStock === false;
                        const sel = variantIdx === i;
                        const swatch = getColorHex(v.colorName);
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => !oos && selectVariant(i)}
                            disabled={oos}
                            aria-label={v.colorName || `Rəng ${i + 1}`}
                            aria-pressed={sel}
                            title={v.colorName || ''}
                            style={{
                              width: 24, height: 24, borderRadius: '50%', padding: 0,
                              cursor: oos ? 'not-allowed' : 'pointer',
                              background: swatch,
                              border: `1px solid ${C.border}`,
                              opacity: oos ? 0.35 : 1,
                              position: 'relative' as const,
                              transition: 'box-shadow 0.15s',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: sel ? `0 0 0 2px ${C.white}, 0 0 0 3px ${C.black}` : 'none',
                            }}
                          >
                            {sel && !oos && (
                              <Check
                                size={11}
                                strokeWidth={3.5}
                                color={isLightColor(swatch) ? C.black : C.white}
                              />
                            )}
                            {oos && (
                              <span style={{
                                position: 'absolute' as const, inset: 0, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                              }}>
                                <span style={{ width: '120%', height: 1.5, background: C.red, transform: 'rotate(45deg)' }} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Sec>
            )}

            {/* Say */}
            <Sec>
              <Label>Say</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Sayı azalt" style={{
                    width: 32, height: 32, borderRadius: '6px 0 0 6px',
                    border: `1px solid ${C.border}`, background: C.bg,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><Minus size={12} /></button>
                  <div style={{
                    width: 40, height: 32, border: `1px solid ${C.border}`,
                    borderLeft: 'none', borderRight: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, background: C.white, color: C.black,
                  }}>{qty}</div>
                  {/* maxQty: sadə tavan (99) — stok say ilə yox, on/off açarı ilə izlənir
                      (bax: lib/cartPricing.ts-dəki eyni məntiq, səbətdəki input üçün) */}
                  <button
                    onClick={() => setQty(q => Math.min(99, q + 1))}
                    disabled={qty >= 99}
                    aria-label="Sayı artır"
                    style={{
                      width: 32, height: 32, borderRadius: '0 6px 6px 0',
                      border: `1px solid ${C.border}`, background: C.bg,
                      cursor: qty >= 99 ? 'default' : 'pointer',
                      opacity: qty >= 99 ? 0.4 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  ><Plus size={12} /></button>
                </div>

                {(() => {
                  const amount = BULK_DISCOUNT_PER_UNIT;
                  const isActive = qty >= 2;
                  const disc = Math.max(0, baseUnit - amount);
                  return (
                    <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? C.green : C.grayLt }}>
                      2+ əd → {disc.toFixed(2)} ₼/əd
                    </span>
                  );
                })()}
              </div>

              {showBulkNotice && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 10,
                  padding: '10px 12px', background: C.orangeBg, border: `1px solid ${C.orangeBd}`,
                  borderRadius: 8,
                }}>
                  <span style={{ fontSize: 12, color: '#7C2D12', lineHeight: 1.5, flex: 1 }}>
                    10+ ədəd toplu sifarişdir — əlavə endirimdən yararlanmaq üçün bizimlə əlaqə saxlayın:{' '}
                    <a href="tel:0519831483" style={{ color: C.orange, fontWeight: 700, textDecoration: 'none' }}>
                      051 983 14 83
                    </a>
                  </span>
                  <button
                    onClick={() => setBulkNoticeDismissed(true)}
                    aria-label="Bildirişi bağla"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#7C2D12', flexShrink: 0, display: 'flex', padding: 2,
                    }}
                  >
                    <X size={14} />
                  </button>
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
                      <div
                        key={b.id}
                        onClick={() => setBoxId(b.id)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setBoxId(b.id); } }}
                        role="button"
                        tabIndex={0}
                        aria-pressed={sel}
                        style={{
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
                  {qty} əd{boxFee > 0 ? ` + ${box?.name}` : ''}
                </span>
                {hasAnyDiscount ? (
                  <div style={{ textAlign: 'right' as const }}>
                    <span style={{ fontSize: 13, color: C.grayLt, textDecoration: 'line-through', display: 'block' }}>
                      {origSub.toFixed(2)} ₼
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.green }}>
                      {finalPrice.toFixed(2)} ₼
                    </span>
                  </div>
                ) : (
                  <span style={{ fontSize: 18, fontWeight: 800, color: C.black }}>
                    {finalPrice.toFixed(2)} ₼
                  </span>
                )}
              </div>
              {(bulkDiscTotal > 0 || customerDisc > 0 || couponDiscount > 0) && (
                <div style={{ fontSize: 11, color: C.green, fontWeight: 600, textAlign: 'right' as const, marginBottom: 8 }}>
                  {bulkDiscTotal > 0 && `✓ Say endirimi: ${bulkDiscTotal.toFixed(2)} ₼ qənaət`}
                  {bulkDiscTotal > 0 && (customerDisc > 0 || couponDiscount > 0) && ' · '}
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