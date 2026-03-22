import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Edit3, User, Truck, Clock, Zap, Info, ShoppingCart, MapPin, Gift, Sparkles, AlertCircle, FileText, Package } from 'lucide-react';
import { Product, CartItem, BulkTier } from '../types';

interface ProductModalProps {
  product: Product;
  initialData?: CartItem;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCategory: (category: string) => void;
}

const getBulkTier = (tiers: BulkTier[], qty: number): BulkTier | null => {
  if (!tiers || tiers.length === 0) return null;
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty);
  return sorted.find(t => qty >= t.minQty && (!t.maxQty || qty <= t.maxQty)) || null;
};

const ProductModal: React.FC<ProductModalProps> = ({ product, initialData, onClose, onAddToCart }) => {
  const variants = product.variants || [];

  const cheapestIndex = variants.reduce((minIdx, v, idx, arr) => {
    const vPrice = v.discountPrice ?? v.price;
    const minPrice = arr[minIdx].discountPrice ?? arr[minIdx].price;
    return vPrice < minPrice ? idx : minIdx;
  }, 0);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(initialData?.variantIndex ?? cheapestIndex);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [quantityInput, setQuantityInput] = useState(String(initialData?.quantity || 1));
  const [showQuantityBox, setShowQuantityBox] = useState(false);
  const [specialRequest, setSpecialRequest] = useState(initialData?.specialRequest || '');
  const [customText, setCustomText] = useState(initialData?.customText || '');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [isGift, setIsGift] = useState<boolean | null>(initialData?.isGift !== undefined ? initialData.isGift : null);
  const [customerType, setCustomerType] = useState<'new' | 'loyal' | null>(
    initialData?.customerType ?? null
  );
  const [showCustomerTypeError, setShowCustomerTypeError] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'urgent' | 'express'>(initialData?.deliveryType || 'standard');
  const [deliveryDetails, setDeliveryDetails] = useState(initialData?.deliveryDetails || '');

  const selectedVariant = variants[selectedVariantIndex] || variants[0];
  if (!selectedVariant) return null;

  const allImages = variants.flatMap(v => v.images || []).filter(Boolean);
  const selectedImages = selectedVariant.images || [];
  const otherImages = allImages.filter(img => !selectedImages.includes(img));
  const images = [...selectedImages, ...otherImages];
  const totalImages = images.length;

  const nextImg = () => setCurrentImgIndex(p => (p + 1) % totalImages);
  const prevImg = () => setCurrentImgIndex(p => (p - 1 + totalImages) % totalImages);

  const handleVariantSelect = (idx: number) => {
    setSelectedVariantIndex(idx);
    setCurrentImgIndex(0);
  };

  const price = selectedVariant.price;
  const discountPrice = selectedVariant.discountPrice;
  const basePrice = discountPrice || price;
  const showDiscount = !!(discountPrice && discountPrice < price);
  const discountPercent = showDiscount ? Math.round(((price - discountPrice!) / price) * 100) : 0;
  const isOutOfStock = selectedVariant.stock === 0;

  // Endirim hesablamaları (manatla)
  const getDeliveryPrice = () => deliveryType === 'urgent' ? 5.49 : deliveryType === 'express' ? 9.99 : 0;

  // Müştəri endirimi: yeni=10%, daimi=20%
  const getCustomerDiscount = () => {
    if (customerType === 'new') return Number((basePrice * quantity * 0.10).toFixed(2));
    if (customerType === 'loyal') return Number((basePrice * quantity * 0.20).toFixed(2));
    return 0;
  };

  // Kəmiyyət endirimi (AZN)
  const activeTier = product.hasBulkDiscount && product.bulkTiers
    ? getBulkTier(product.bulkTiers, quantity)
    : null;
  const getBulkDiscountAmount = () => activeTier ? activeTier.discountAmount * quantity : 0;

  const subtotal = basePrice * quantity;
  const customerDiscount = getCustomerDiscount();
  const bulkDiscount = getBulkDiscountAmount();
  const totalDiscount = customerDiscount + bulkDiscount;
  const deliveryPrice = getDeliveryPrice();
  const finalTotal = subtotal - totalDiscount + deliveryPrice;

  const handleQuantityChange = (val: string) => {
    setQuantityInput(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1) setQuantity(num);
  };

  const handleAddToCartClick = () => {
    if (customerType === null) {
      setShowCustomerTypeError(true);
      document.getElementById('customer-type-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onAddToCart({
      cartId: initialData?.cartId || Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      variantIndex: selectedVariantIndex,
      modelName: selectedVariant.modelName || '-',
      colorName: selectedVariant.colorName || '-',
      images: selectedVariant.images || [],
      price,
      discountPrice,
      quantity,
      specialRequest,
      customText,
      customerName,
      phone,
      birthDate,
      isGift: isGift!,
      isFirstOrSecondOrder: customerType === 'new',
      customerType: customerType!,
      deliveryType,
      deliveryDetails,
      bulkDiscountAmount: bulkDiscount,
    });
  };

  const isFormValid = customerName && phone && birthDate && isGift !== null && deliveryDetails;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center sm:items-center sm:p-4">
        <div className="bg-white w-full sm:max-w-5xl sm:rounded-[3rem] relative flex flex-col md:flex-row md:max-h-[95vh]">

          <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-all outline-none">
            <X className="h-5 w-5" />
          </button>

          {/* ŞƏKİL */}
          <div className="md:w-1/2 relative bg-gray-100 flex flex-col flex-shrink-0 md:border-r border-gray-100 md:rounded-l-[3rem] overflow-hidden">
            <div className="relative overflow-hidden aspect-square md:aspect-auto md:h-[440px]">
              {images[currentImgIndex] ? (
                <>
                  <img src={images[currentImgIndex]} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50 pointer-events-none" />
                  <img src={images[currentImgIndex]} alt={product.name} className="relative z-10 w-full h-full object-contain transition-all duration-300" />
                </>
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-bold">Şəkil yoxdur</div>
              )}
              {showDiscount && (
                <div className="absolute top-4 left-4 z-20 bg-[#FF8C00] text-white font-black px-3 py-1.5 rounded-full text-sm shadow-lg">
                  -{discountPercent}% ENDİRİM
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute top-4 right-12 z-20 bg-red-500 text-white font-black px-3 py-1.5 rounded-full text-sm shadow-lg">
                  STOKDA YOXDUR
                </div>
              )}
              {totalImages > 1 && (
                <>
                  <button onClick={prevImg} type="button" className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all outline-none">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImg} type="button" className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all outline-none">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 z-20 bg-black/50 text-white text-xs font-black px-2 py-1 rounded-full">
                    {currentImgIndex + 1}/{totalImages}
                  </div>
                </>
              )}
            </div>
            {totalImages > 1 && (
              <div className="flex gap-2 p-3 bg-white border-t border-gray-100 overflow-x-auto" style={{scrollbarWidth:'none'}}>
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setCurrentImgIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all outline-none ${currentImgIndex === idx ? 'border-[#FF8C00] scale-105' : 'border-transparent opacity-50'}`}>
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MƏLUMAT */}
          <div className="md:w-1/2 flex flex-col overflow-y-auto bg-white md:rounded-r-[3rem]">
            <div className="p-5 md:p-7 space-y-4">

              {/* AD + QİYMƏT */}
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{product.name}</h2>
                <div className="flex items-baseline gap-3 flex-wrap mt-2">
                  {showDiscount ? (
                    <>
                      <span className="text-2xl font-black text-[#FF8C00]">{discountPrice!.toFixed(2)} AZN</span>
                      <span className="text-base font-bold text-gray-400 line-through">{price.toFixed(2)} AZN</span>
                      <span className="bg-orange-100 text-[#FF8C00] text-xs font-black px-2 py-1 rounded-full">{discountPercent}% endirim</span>
                    </>
                  ) : (
                    <span className="text-2xl font-black text-[#FF8C00]">{price.toFixed(2)} AZN</span>
                  )}
                </div>

                {/* KƏMİYYƏT ENDİRİMİ BİLDİRİŞİ */}
                {product.hasBulkDiscount && product.bulkDiscountNote && (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="text-[10px] text-red-500 font-black">{product.bulkDiscountNote}</p>
                    <button
                      onClick={() => setShowQuantityBox(v => !v)}
                      className="w-4 h-4 border-2 border-red-400 rounded flex items-center justify-center hover:bg-red-50 transition-colors flex-shrink-0"
                      title="Say daxil et"
                    >
                      {showQuantityBox && <div className="w-2 h-2 bg-red-500 rounded-sm" />}
                    </button>
                  </div>
                )}
              </div>

              {/* SAY XANASI */}
              {(showQuantityBox || !product.hasBulkDiscount) && (
                <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-2">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-[#FF8C00] flex-shrink-0" />
                    <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Sifariş sayı</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => { const n = Math.max(1, quantity - 1); setQuantity(n); setQuantityInput(String(n)); }}
                      className="w-8 h-8 bg-white border-2 border-gray-200 rounded-xl font-black text-lg hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all outline-none flex items-center justify-center">−</button>
                    <input
                      type="number" min="1"
                      value={quantityInput}
                      onChange={e => handleQuantityChange(e.target.value)}
                      className="w-16 text-center font-black text-lg border-2 border-gray-200 rounded-xl py-1 outline-none focus:border-[#FF8C00]"
                    />
                    <button onClick={() => { const n = quantity + 1; setQuantity(n); setQuantityInput(String(n)); }}
                      className="w-8 h-8 bg-white border-2 border-gray-200 rounded-xl font-black text-lg hover:border-[#FF8C00] hover:text-[#FF8C00] transition-all outline-none flex items-center justify-center">+</button>
                    <span className="text-xs font-bold text-gray-400">ədəd</span>
                  </div>

                  {/* AKTİV PİLLƏ */}
                  {product.hasBulkDiscount && product.bulkTiers && product.bulkTiers.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-gray-200">
                      {[...product.bulkTiers].sort((a,b) => a.minQty - b.minQty).map((tier, i) => {
                        const isActive = quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty);
                        const range = tier.maxQty ? `${tier.minQty}-${tier.maxQty} ədəd` : `${tier.minQty}+ ədəd`;
                        return (
                          <div key={i} className={`flex items-center justify-between px-2 py-1 rounded-lg transition-all ${isActive ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-gray-100 opacity-50'}`}>
                            <span className="text-[10px] font-black text-gray-600">{tier.label || range}</span>
                            <span className={`text-[10px] font-black ${isActive ? 'text-[#FF8C00]' : 'text-gray-400'}`}>
                              hər ədəddən -{tier.discountAmount} AZN
                            </span>
                            {isActive && <span className="text-[9px] font-black text-green-600 bg-green-100 px-1 rounded">AKTİV ✓</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MƏHSUL HAQQINDA */}
              {product.description && (
                <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Məhsul haqqında
                  </p>
                  <p className="text-xs font-bold text-[#1A1A1A] leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* VARİANT SEÇİMİ */}
              {variants.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Variant seçin</p>
                  <div className="flex flex-col gap-2">
                    {variants.map((variant, idx) => {
                      const vPrice = variant.discountPrice || variant.price;
                      const vHasDiscount = !!(variant.discountPrice && variant.discountPrice < variant.price);
                      const isSelected = idx === selectedVariantIndex;
                      const isVarOutOfStock = variant.stock === 0;
                      return (
                        <button key={idx}
                          onClick={() => { if (!isVarOutOfStock) handleVariantSelect(idx); }}
                          disabled={isVarOutOfStock}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isVarOutOfStock ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60' : isSelected ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'}`}>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-[#FF8C00] border-[#FF8C00]' : 'border-gray-300'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            {variant.modelName && <p className="text-xs font-black text-[#1A1A1A] truncate">{variant.modelName}</p>}
                            {variant.colorName && <p className="text-[10px] font-bold text-gray-400 truncate">{variant.colorName}</p>}
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-sm font-black text-[#FF8C00]">{vPrice.toFixed(2)} ₼</span>
                            {vHasDiscount && <span className="text-[9px] text-gray-400 line-through">{variant.price.toFixed(2)} ₼</span>}
                            {isVarOutOfStock ? <span className="text-[9px] font-bold text-red-500">Bitib</span>
                              : variant.stock < 20 ? <span className="text-[9px] font-bold text-amber-500">{variant.stock} əd</span> : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* HƏDİYYƏ */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-[#FF8C00]" />
                      <span className="text-[11px] font-black text-[#1A1A1A]">Hədiyyəlik bağlama?</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setIsGift(false)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all outline-none ${isGift === false ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] border border-gray-200'}`}>XEYR</button>
                      <button onClick={() => setIsGift(true)} className={`px-4 py-1.5 rounded-xl text-[10px] font-black transition-all outline-none ${isGift === true ? 'bg-[#FF8C00] text-white' : 'bg-white text-[#1A1A1A] border border-gray-200'}`}>BƏLİ</button>
                    </div>
                  </div>
                </div>
              )}

              {/* ÇATDIRILMA */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                  <Truck className="h-3 w-3 text-[#FF8C00]" /> Çatdırılma Seçimi
                </p>
                {[
                  { type: 'standard', icon: <Truck className="h-4 w-4 text-[#FF8C00]" />, title: 'Standart — 3 Gün', sub: 'Hazırlanma → Paketlənmə → Çatdırılma', price: 'PULSUZ', priceClass: 'text-green-600' },
                  { type: 'urgent', icon: <Clock className="h-4 w-4 text-[#FF8C00]" />, title: 'Təcili — 2 Gün', sub: 'Sürətləndirilmiş hazırlıq', price: '+5.49 AZN', priceClass: 'text-[#FF8C00]' },
                  { type: 'express', icon: <Zap className="h-4 w-4 text-[#FF8C00]" />, title: 'Ekspress — 24 Saat', sub: 'Prioritet hazırlıq', price: '+9.99 AZN', priceClass: 'text-[#FF8C00]' },
                ].map(d => (
                  <button key={d.type} onClick={() => setDeliveryType(d.type as any)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${deliveryType === d.type ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-center gap-2">
                      {d.icon}
                      <div className="text-left">
                        <p className="text-sm font-black text-[#1A1A1A]">{d.title}</p>
                        <p className="text-[9px] font-bold text-gray-400">{d.sub}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black ${d.priceClass}`}>{d.price}</span>
                  </button>
                ))}
              </div>

              {/* MÜŞTƏRİ TİPİ */}
              <section id="customer-type-section"
                className={`p-3 rounded-2xl border-2 transition-all ${showCustomerTypeError && customerType === null ? 'border-red-400 bg-red-50' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'}`}>
                <div className="mb-2">
                  <p className="text-xs font-black text-[#1A1A1A] flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-[#FF8C00]" />
                    Siz kimsiniz? <span className="text-red-500">*</span>
                    <span className="text-[10px] font-bold text-gray-400">(məcburi)</span>
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setCustomerType('new'); setShowCustomerTypeError(false); }}
                    className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all outline-none border ${customerType === 'new' ? 'bg-[#FF8C00] text-white border-[#FF8C00]' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
                    Yeni müştəri (-10%)
                  </button>
                  <button onClick={() => { setCustomerType('loyal'); setShowCustomerTypeError(false); }}
                    className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-black transition-all outline-none border ${customerType === 'loyal' ? 'bg-[#FF8C00] text-white border-[#FF8C00]' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'}`}>
                    Daimi müştəri (-20%)
                  </button>
                </div>
                {showCustomerTypeError && customerType === null && (
                  <p className="text-[10px] font-black text-red-500 mt-1.5">⚠️ Zəhmət olmasa seçin — bu sahə məcburidir!</p>
                )}
              </section>

              {/* FORM */}
              <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <Edit3 className="h-3 w-3 text-[#FF8C00]" /> Məhsul üzərinə yazı
                  </p>
                  <textarea value={customText} onChange={e => setCustomText(e.target.value)} placeholder="Yazılacaq mətni daxil edin..." className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm min-h-[50px] outline-none font-bold placeholder:text-gray-300 focus:border-orange-200 transition-all resize-none" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-[#FF8C00]" /> Əlavə Qeyd
                  </p>
                  <textarea value={specialRequest} onChange={e => setSpecialRequest(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm min-h-[60px] outline-none font-bold placeholder:text-gray-300 focus:border-orange-200 transition-all resize-none" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <User className="h-3 w-3 text-[#FF8C00]" /> Müştəri Məlumatları
                  </p>
                  <input type="text" placeholder="Adınız *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                  <input type="tel" placeholder="Mobil Nömrəniz *" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                  <input type="text" placeholder="Doğum Tarixi (12.05.1998) *" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                  <p className="text-[10px] text-[#FF8C00] font-bold flex items-center gap-1 px-1">🎂 Doğum günündə yaşınız qədər endirim!</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#FF8C00]" /> Çatdırılma Ünvanı *
                  </p>
                  <textarea placeholder="Tam ünvanınızı daxil edin..." value={deliveryDetails} onChange={e => setDeliveryDetails(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm min-h-[70px] focus:border-orange-200 transition-all placeholder:text-gray-300 resize-none" />
                </div>
              </div>

              {/* ENDİRİM XÜLASƏSİ */}
              {(customerDiscount > 0 || bulkDiscount > 0) && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-3 space-y-1">
                  <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">🎉 Qazandığınız endirimlər</p>
                  {showDiscount && (
                    <div className="flex justify-between text-[10px] font-bold text-gray-600">
                      <span>Kampaniya endirimi</span>
                      <span className="text-green-600 font-black">-{((price - basePrice) * quantity).toFixed(2)} AZN</span>
                    </div>
                  )}
                  {customerDiscount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-gray-600">
                      <span>{customerType === 'loyal' ? 'Daimi müştəri endirimi (20%)' : 'Yeni müştəri endirimi (10%)'}</span>
                      <span className="text-green-600 font-black">-{customerDiscount.toFixed(2)} AZN</span>
                    </div>
                  )}
                  {bulkDiscount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-gray-600">
                      <span>Kəmiyyət endirimi ({quantity} ədəd)</span>
                      <span className="text-green-600 font-black">-{bulkDiscount.toFixed(2)} AZN</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-black text-green-700 pt-1 border-t border-green-200">
                    <span>Cəmi endirim</span>
                    <span>-{totalDiscount.toFixed(2)} AZN</span>
                  </div>
                </div>
              )}

              {/* YEKUN */}
              <div className="sticky bottom-0 bg-white pt-3 pb-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-amber-800">
                    <span className="font-black">Özəl hazırlanmış məhsul!</span> 50% ödəniş kart hesabına ödənilməlidir.
                  </p>
                </div>
                <div className="bg-[#1A1A1A] p-5 rounded-[2rem] flex items-center justify-between text-white shadow-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      YEKUN {quantity > 1 && <span className="text-gray-500">({quantity} ədəd)</span>}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#FF8C00]">{finalTotal.toFixed(2)} AZN</span>
                      {totalDiscount > 0 && <span className="text-xs font-bold text-gray-500 line-through">{(subtotal + deliveryPrice).toFixed(2)} AZN</span>}
                    </div>
                    <span className="text-[9px] text-amber-400 font-bold mt-0.5">Ön ödəniş: {(finalTotal * 0.5).toFixed(2)} AZN</span>
                  </div>
                  <button onClick={handleAddToCartClick} disabled={!isFormValid || isOutOfStock}
                    className="bg-[#FF8C00] text-white px-6 py-4 rounded-full font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:pointer-events-none outline-none">
                    <ShoppingCart className="h-5 w-5" />
                    <span>{isOutOfStock ? 'BİTİB' : initialData ? 'YENİLƏ' : 'SƏBƏTƏ'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;