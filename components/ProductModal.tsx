import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Edit3, User, Truck, Clock, Zap, Info, ShoppingCart, MapPin, Gift, Sparkles, AlertCircle, Palette, FileText } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductModalProps {
  product: Product;
  initialData?: CartItem;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCategory: (category: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, initialData, onClose, onAddToCart }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState<string[]>(initialData?.selectedColors || []);
  const [specialRequest, setSpecialRequest] = useState(initialData?.specialRequest || '');
  const [customText, setCustomText] = useState(initialData?.customText || '');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [isGift, setIsGift] = useState<boolean | null>(initialData?.isGift !== undefined ? initialData.isGift : null);
  const [customerType, setCustomerType] = useState<'new' | 'loyal' | null>(
    initialData?.isFirstOrSecondOrder === true ? 'new' : initialData?.isFirstOrSecondOrder === false ? null : null
  );
  const [showCustomerTypeError, setShowCustomerTypeError] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'urgent' | 'express'>(initialData?.deliveryType || 'standard');
  const [deliveryDetails, setDeliveryDetails] = useState(initialData?.deliveryDetails || '');

  const images = (product.images || []).filter(Boolean);
  const totalImages = images.length || 1;
  const nextImg = () => setCurrentImgIndex((p) => (p + 1) % totalImages);
  const prevImg = () => setCurrentImgIndex((p) => (p - 1 + totalImages) % totalImages);

  const discountPrice = (product as any).discountPrice;
  const basePrice = discountPrice || product.price;
  const discountPercent = discountPrice ? Math.round(((product.price - discountPrice) / product.price) * 100) : 0;

  const colorVariants = product.colorVariants || [];
  const hasColors = colorVariants.length > 0;
  const totalStock = colorVariants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const getDeliveryPrice = () => deliveryType === 'urgent' ? 5.49 : deliveryType === 'express' ? 9.99 : 0;
  const getLoyaltyDiscount = () => customerType !== null ? basePrice * 0.1 : 0;
  const calculateTotal = () => basePrice - getLoyaltyDiscount() + getDeliveryPrice();

  const handleAddToCartClick = () => {
    if (customerType === null) {
      setShowCustomerTypeError(true);
      document.getElementById('customer-type-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    onAddToCart({
      ...product,
      cartId: initialData?.cartId || Math.random().toString(36).substr(2, 9),
      quantity: initialData?.quantity || 1,
      selectedColors,
      specialRequest,
      customText,
      customerName,
      phone,
      birthDate,
      isGift: isGift!,
      isFirstOrSecondOrder: customerType === 'new',
      deliveryType,
      deliveryDetails,
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
            <div className="relative overflow-hidden" style={{height: 'min(75vw, 440px)'}}>
              {images[currentImgIndex] ? (
                <img src={images[currentImgIndex]} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-bold">Şəkil yoxdur</div>
              )}
              {discountPrice && (
                <div className="absolute top-4 left-4 bg-[#FF8C00] text-white font-black px-3 py-1.5 rounded-full text-sm shadow-lg">
                  -{discountPercent}% ENDİRİM
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute top-4 right-4 bg-red-500 text-white font-black px-3 py-1.5 rounded-full text-sm shadow-lg">
                  STOKDA YOXDUR
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all outline-none"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all outline-none"><ChevronRight className="h-5 w-5" /></button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-black px-2 py-1 rounded-full">{currentImgIndex + 1}/{images.length}</div>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 p-3 bg-white border-t border-gray-100 overflow-x-auto" style={{scrollbarWidth:'none'}}>
                {images.map((img, idx) => (
                  <button key={idx} onClick={() => setCurrentImgIndex(idx)} className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all outline-none ${currentImgIndex === idx ? 'border-[#FF8C00] scale-105' : 'border-transparent opacity-50'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MƏLUMAT */}
          <div className="md:w-1/2 flex flex-col overflow-y-auto bg-white md:rounded-r-[3rem]">
            <div className="p-5 md:p-7 space-y-4">

              {/* 1️⃣ AD + QİYMƏT */}
              <div>
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{product.name}</h2>
                <div className="flex items-baseline gap-3 flex-wrap mt-2">
                  {discountPrice ? (
                    <>
                      <span className="text-2xl font-black text-[#FF8C00]">{discountPrice.toFixed(2)} AZN</span>
                      <span className="text-base font-bold text-gray-400 line-through">{product.price.toFixed(2)} AZN</span>
                      <span className="bg-orange-100 text-[#FF8C00] text-xs font-black px-2 py-1 rounded-full">{discountPercent}% endirim</span>
                    </>
                  ) : (
                    <span className="text-2xl font-black text-[#FF8C00]">{product.price.toFixed(2)} AZN</span>
                  )}
                </div>
              </div>

              {/* 2️⃣ MƏHSUL HAQQINDA */}
              {(product as any).description && (
                <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Info className="h-3 w-3" /> Məhsul haqqında
                  </p>
                  <p className="text-xs font-bold text-[#1A1A1A] leading-relaxed">{(product as any).description}</p>
                </div>
              )}

              {/* 3️⃣ 50% ÖN ÖDƏNİŞ */}
              <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-2xl flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-amber-900 leading-relaxed">
                  <span className="font-black">Özəl hazırlanmış məhsul!</span> 50% ödəniş kart hesabına ödənilməlidir. <span className="font-black">Çünki özəl hazırlanan məhsullar ləğv edilə bilməz.</span>
                </p>
              </div>

              {/* 4️⃣ RƏNG SEÇİMİ + HƏDİYYƏ YAN-YANA */}
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                {hasColors && (
                  <div>
                    <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Palette className="h-3 w-3 text-[#FF8C00]" /> Rəng seçimi (birdən çox seçə bilərsiniz)
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {colorVariants.map((variant) => {
                        const isChecked = selectedColors.includes(variant.colorName);
                        const isColorOutOfStock = variant.stock === 0;
                        return (
                          <button
                            key={variant.colorName}
                            onClick={() => { if (!isColorOutOfStock) toggleColor(variant.colorName); }}
                            disabled={isColorOutOfStock}
                            className={`flex items-center justify-between p-2.5 rounded-xl border-2 transition-all ${
                              isColorOutOfStock
                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed'
                                : isChecked
                                ? 'border-[#FF8C00] bg-orange-50'
                                : 'border-gray-200 bg-white hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isChecked ? 'bg-[#FF8C00] border-[#FF8C00]' : 'border-gray-300'
                              }`}>
                                {isChecked && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-xs font-black ${isColorOutOfStock ? 'text-gray-300 line-through' : 'text-[#1A1A1A]'}`}>
                                {variant.colorName}
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              isColorOutOfStock ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {isColorOutOfStock ? 'Bitib' : `${variant.stock} stokda var: əd`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* HƏDİYYƏ BAĞLAMA */}
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

              {/* 5️⃣ ÇATDIRILMA */}
              <div className="space-y-2">
                <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                  <Truck className="h-3 w-3 text-[#FF8C00]" /> Çatdırılma Seçimi
                </p>
                <button onClick={() => setDeliveryType('standard')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${deliveryType === 'standard' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Standart — 3 Gün</p>
                      <p className="text-[9px] font-bold text-gray-400">Hazırlanır → Paketlənir → Çatdırılır</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-green-600">PULSUZ</span>
                </button>
                <button onClick={() => setDeliveryType('urgent')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${deliveryType === 'urgent' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Təcili — 2 Gün</p>
                      <p className="text-[9px] font-bold text-gray-400">Sürətləndirilmiş hazırlıq</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF8C00]">+5.49 AZN</span>
                </button>
                <button onClick={() => setDeliveryType('express')}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${deliveryType === 'express' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Ekspress — 24 Saat</p>
                      <p className="text-[9px] font-bold text-gray-400">Prioritet hazırlıq</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF8C00]">+9.99 AZN</span>
                </button>
              </div>

              {/* 6️⃣ ENDİRİM - yalnız seçildikdə altında mesaj */}
              <section
                id="customer-type-section"
                className={`p-3 rounded-2xl space-y-2.5 border-2 transition-all ${showCustomerTypeError && customerType === null ? 'border-red-400 bg-red-50' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'}`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#FF8C00]" />
                  <h4 className="text-xs font-black text-[#1A1A1A]">Sizə özəl 10% endirim</h4>
                </div>
                <div className="flex gap-2.5">
                  <label onClick={() => { setCustomerType('new'); setShowCustomerTypeError(false); }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 cursor-pointer transition-all ${customerType === 'new' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${customerType === 'new' ? 'border-[#FF8C00]' : 'border-gray-300'}`}>
                      {customerType === 'new' && <div className="w-2 h-2 rounded-full bg-[#FF8C00]" />}
                    </div>
                    <p className="text-[11px] font-black text-[#1A1A1A] text-center">Yeni müştəri</p>
                  </label>
                  <label onClick={() => { setCustomerType('loyal'); setShowCustomerTypeError(false); }}
                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 cursor-pointer transition-all ${customerType === 'loyal' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${customerType === 'loyal' ? 'border-[#FF8C00]' : 'border-gray-300'}`}>
                      {customerType === 'loyal' && <div className="w-2 h-2 rounded-full bg-[#FF8C00]" />}
                    </div>
                    <p className="text-[11px] font-black text-[#1A1A1A] text-center">Daimi müştəri</p>
                  </label>
                </div>
                {/* Endirim mesajı yalnız seçildikdə */}
                {customerType && (
                  <p className="text-[10px] font-black text-[#FF8C00] text-center">
                    {customerType === 'new' ? '10% endirim 🎉' : '10% endirim ❤️'}
                  </p>
                )}
                {showCustomerTypeError && customerType === null && (
                  <p className="text-[10px] font-black text-red-500 text-center">⚠️ Zəhmət olmasa seçin</p>
                )}
              </section>

              {/* ════ FORM ════ */}
              <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-3">

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <Edit3 className="h-3 w-3 text-[#FF8C00]" /> Məhsul üzərinə yazı
                  </p>
                  <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Yazılacaq mətni daxil edin..." className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm min-h-[50px] outline-none font-bold placeholder:text-gray-300 focus:border-orange-200 transition-all resize-none" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="h-3 w-3 text-[#FF8C00]" /> Əlavə Qeyd
                  </p>
                  <textarea value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} placeholder="" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm min-h-[60px] outline-none font-bold placeholder:text-gray-300 focus:border-orange-200 transition-all resize-none" />
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <User className="h-3 w-3 text-[#FF8C00]" /> Müştəri Məlumatları
                  </p>
                  <input type="text" placeholder="Adınız" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                  <input type="tel" placeholder="Mobil Nömrəniz" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                  <input type="text" placeholder="Doğum Tarixi (12.05.1998)" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                  <p className="text-[10px] text-[#FF8C00] font-bold flex items-center gap-1 px-1">
                    🎂 Doğum günündə yaşınız qədər endirim! <span className="text-gray-400 font-medium">(Məs: 25 yaş - 25%)</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-[#FF8C00]" /> Çatdırılma Ünvanı
                  </p>
                  <textarea placeholder="Tam ünvanınızı daxil edin..." value={deliveryDetails} onChange={(e) => setDeliveryDetails(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm min-h-[70px] focus:border-orange-200 transition-all placeholder:text-gray-300 resize-none" />
                </div>

              </div>

              {/* YEKUN */}
              <div className="sticky bottom-0 bg-white pt-3 pb-2 border-t border-gray-100 space-y-3">
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-amber-800">
                    Sifarişin <span className="font-black">50%-i</span> kart-karta ön ödəniş tələb olunur.
                  </p>
                </div>

                <div className="bg-[#1A1A1A] p-5 rounded-[2rem] flex items-center justify-between text-white shadow-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      YEKUN {getLoyaltyDiscount() > 0 && <span className="text-green-400">(-{getLoyaltyDiscount().toFixed(2)} AZN)</span>}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#FF8C00]">{calculateTotal().toFixed(2)} AZN</span>
                      {(discountPrice || getLoyaltyDiscount() > 0) && (
                        <span className="text-xs font-bold text-gray-500 line-through">{product.price.toFixed(2)} AZN</span>
                      )}
                    </div>
                    <span className="text-[9px] text-amber-400 font-bold mt-0.5">Ön ödəniş: {(calculateTotal() * 0.5).toFixed(2)} AZN</span>
                  </div>
                  <button
                    onClick={handleAddToCartClick}
                    disabled={!isFormValid || isOutOfStock}
                    className="bg-[#FF8C00] text-white px-6 py-4 rounded-full font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:pointer-events-none outline-none"
                  >
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