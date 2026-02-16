import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Edit3, User, Truck, Clock, Zap, Info, ShoppingCart, MapPin, Gift, Star } from 'lucide-react';
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
  const [customText, setCustomText] = useState(initialData?.customText || '');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [isGift, setIsGift] = useState<boolean | null>(initialData?.isGift !== undefined ? initialData.isGift : null);
  const [isFirstOrSecondOrder, setIsFirstOrSecondOrder] = useState<boolean | null>(initialData?.isFirstOrSecondOrder !== undefined ? initialData.isFirstOrSecondOrder : null);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'urgent' | 'express'>(initialData?.deliveryType || 'standard');
  const [deliveryDetails, setDeliveryDetails] = useState(initialData?.deliveryDetails || '');

  const images = (product.images || []).filter(Boolean);
  const total = images.length || 1;
  const nextImg = () => setCurrentImgIndex((p) => (p + 1) % total);
  const prevImg = () => setCurrentImgIndex((p) => (p - 1 + total) % total);

  const discountPrice = (product as any).discountPrice;
  const basePrice = discountPrice || product.price;
  const discountPercent = discountPrice ? Math.round(((product.price - discountPrice) / product.price) * 100) : 0;
  const getDeliveryPrice = () => deliveryType === 'urgent' ? 5.49 : deliveryType === 'express' ? 9.99 : 0;
  const getLoyaltyDiscount = () => isFirstOrSecondOrder ? basePrice * 0.1 : 0;
  const calculateTotal = () => basePrice - getLoyaltyDiscount() + getDeliveryPrice();

  const handleAddToCartClick = () => {
    onAddToCart({
      ...product,
      cartId: initialData?.cartId || Math.random().toString(36).substr(2, 9),
      quantity: initialData?.quantity || 1,
      customText, customerName, phone, birthDate,
      isGift: isGift!, isFirstOrSecondOrder: isFirstOrSecondOrder!,
      deliveryType, deliveryDetails
    });
  };

  const isFormValid = customerName && phone && birthDate && isGift !== null && isFirstOrSecondOrder !== null && deliveryDetails;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center sm:items-center sm:p-4">
        <div className="bg-white w-full sm:max-w-5xl sm:rounded-[3rem] relative flex flex-col md:flex-row md:max-h-[95vh]">

          {/* Bağla düyməsi */}
          <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-all outline-none">
            <X className="h-5 w-5" />
          </button>

          {/* ŞƏKİL HISSƏSI */}
          <div className="md:w-1/2 relative bg-gray-100 flex flex-col flex-shrink-0 md:border-r border-gray-100 md:rounded-l-[3rem] overflow-hidden">
            <div className="relative overflow-hidden" style={{height: 'min(75vw, 440px)'}}>
              {images[currentImgIndex] ? (
                <img src={images[currentImgIndex]} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm font-bold">Şəkil yoxdur</div>
              )}
              {discountPrice && (
                <div className="absolute top-4 left-4 bg-[#FF8C00] text-white font-black px-3 py-1.5 rounded-full text-sm shadow-lg">
                  -{discountPercent}% ENDİRİM
                </div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all outline-none">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all outline-none">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-black px-2 py-1 rounded-full">
                    {currentImgIndex + 1}/{images.length}
                  </div>
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

          {/* MƏLUMAT HISSƏSI */}
          <div className="md:w-1/2 flex flex-col overflow-y-auto bg-white md:rounded-r-[3rem]">
            <div className="p-5 md:p-8 space-y-5">

              {/* Ad, açıqlama, qiymət */}
              <section className="space-y-3">
                <h2 className="text-2xl font-black text-[#1A1A1A] tracking-tight">{product.name}</h2>
                {(product as any).description && (
                  <div className="bg-orange-50 p-3 rounded-2xl border border-orange-100">
                    <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Info className="h-3 w-3 text-orange-600" /> Məhsul haqqında
                    </h4>
                    <p className="text-xs font-bold text-[#1A1A1A] leading-relaxed">{(product as any).description}</p>
                  </div>
                )}
                <div className="flex items-baseline gap-3 flex-wrap">
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
              </section>

              {/* 🎁 İLK/İKİNCİ SİFARİŞ - özəl endirim */}
              <section className="p-4 rounded-[1.5rem] space-y-3 border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                <div className="flex items-start gap-3">
                  <div className="bg-[#FF8C00] p-2 rounded-xl flex-shrink-0">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#1A1A1A]">Bu sizin ilk və ya ikinci sifarişinizdir?</h4>
                    <p className="text-xs text-[#FF8C00] font-bold mt-0.5">
                      Yeni müştərilərimizə və daimi müştərilərimizin ikinci sifarişinə xüsusi olaraq <span className="font-black underline">10% endirim</span> hədiyyə edirik! 🎉
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsFirstOrSecondOrder(true)}
                    className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${isFirstOrSecondOrder === true ? 'bg-[#FF8C00] text-white shadow-lg shadow-orange-200' : 'bg-white text-[#1A1A1A] border-2 border-orange-200'}`}
                  >
                    BƏLİ ✓ (10% ENDİRİM)
                  </button>
                  <button
                    onClick={() => setIsFirstOrSecondOrder(false)}
                    className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${isFirstOrSecondOrder === false ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-white text-[#1A1A1A] border-2 border-gray-200'}`}
                  >
                    XEYR
                  </button>
                </div>
              </section>

              {/* Yazı */}
              <section className="space-y-2 p-4 border border-orange-100 rounded-[1.5rem]">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                  <Edit3 className="h-3 w-3 text-[#FF8C00]" /> Məhsul üzərinə yazı
                </h4>
                <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Yazılacaq mətni daxil edin..." className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm min-h-[60px] outline-none text-[#1A1A1A] font-bold placeholder:text-gray-300 focus:border-orange-200 transition-all" />
              </section>

              {/* Əlaqə məlumatları */}
              <section className="space-y-3">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                  <User className="h-3 w-3 text-[#FF8C00]" /> Əlaqə Məlumatları
                </h4>
                <input type="text" placeholder="Adınız" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                <input type="tel" placeholder="Mobil Nömrəniz" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />

                {/* 🎂 DOĞUM GÜNÜ - izahat ilə */}
                <div className="space-y-1">
                  <input type="text" placeholder="Doğum Tarixi (12.05.1998)" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                  <div className="flex items-start gap-2 px-1 pt-1">
                    <span className="text-base flex-shrink-0">🎂</span>
                    <p className="text-[11px] text-[#FF8C00] font-bold leading-relaxed">
                      Doğum günündə yaşınız qədər endirim qazanırsınız! <span className="text-gray-400 font-medium">(Məs: 25 yaşında 25% endirim)</span>
                    </p>
                  </div>
                </div>
              </section>

              {/* 🚚 ÇATDIRILMA - addım izahatı ilə */}
              <section className="space-y-3 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                  <Truck className="h-3 w-3 text-[#FF8C00]" /> Çatdırılma Seçimi
                </h4>

                {/* Standart çatdırılma - addımlarla izahat */}
                <button
                  onClick={() => setDeliveryType('standard')}
                  className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${deliveryType === 'standard' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Truck className="h-4 w-4 text-[#FF8C00]" />
                      <p className="text-sm font-black text-[#1A1A1A]">Standart — 3 Gün</p>
                    </div>
                    <span className="text-xs font-black text-green-600">PULSUZ</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 pl-7">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                      <span className="bg-[#FF8C00] text-white rounded-full w-4 h-4 flex items-center justify-center font-black text-[9px] flex-shrink-0">1</span>
                      Hazırlanır
                    </div>
                    <span className="text-gray-300 font-black">→</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                      <span className="bg-[#FF8C00] text-white rounded-full w-4 h-4 flex items-center justify-center font-black text-[9px] flex-shrink-0">2</span>
                      Paketlənir
                    </div>
                    <span className="text-gray-300 font-black">→</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
                      <span className="bg-[#FF8C00] text-white rounded-full w-4 h-4 flex items-center justify-center font-black text-[9px] flex-shrink-0">3</span>
                      Çatdırılır
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDeliveryType('urgent')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${deliveryType === 'urgent' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Təcili — 2 Gün</p>
                      <p className="text-[10px] font-bold text-gray-500">Sürətləndirilmiş hazırlıq və çatdırılma</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF8C00]">+5.49 AZN</span>
                </button>

                <button
                  onClick={() => setDeliveryType('express')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${deliveryType === 'express' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Ekspress — 24 Saat</p>
                      <p className="text-[10px] font-bold text-gray-500">Prioritet hazırlıq, eyni gün kuryer</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF8C00]">+9.99 AZN</span>
                </button>

                {/* Ünvan */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-[#FF8C00]" /> Çatdırılma Ünvanı
                  </h4>
                  <textarea placeholder="Tam ünvan və kuryer üçün əlavə qeydlər..." value={deliveryDetails} onChange={(e) => setDeliveryDetails(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm min-h-[90px] focus:border-orange-200 transition-all placeholder:text-gray-300" />
                </div>
              </section>

              {/* Hədiyyə + Yekun məbləğ */}
              <div className="sticky bottom-0 bg-white pt-4 pb-3 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-[#FF8C00]" />
                    <span className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest">Hədiyyəlik bağlama?</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsGift(false)} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all outline-none ${isGift === false ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-[#1A1A1A]'}`}>XEYR</button>
                    <button onClick={() => setIsGift(true)} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all outline-none ${isGift === true ? 'bg-[#FF8C00] text-white' : 'bg-gray-100 text-[#1A1A1A]'}`}>BƏLİ</button>
                  </div>
                </div>

                <div className="bg-[#1A1A1A] p-5 rounded-[2rem] flex items-center justify-between text-white shadow-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      YEKUN {getLoyaltyDiscount() > 0 && <span className="text-green-400 ml-1">(-{getLoyaltyDiscount().toFixed(2)} AZN)</span>}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-[#FF8C00]">{calculateTotal().toFixed(2)} AZN</span>
                      {(discountPrice || getLoyaltyDiscount() > 0) && (
                        <span className="text-xs font-bold text-gray-500 line-through">{product.price.toFixed(2)} AZN</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCartClick}
                    disabled={!isFormValid}
                    className="bg-[#FF8C00] text-white px-6 py-4 rounded-full font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:pointer-events-none outline-none"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span>{initialData ? 'YENİLƏ' : 'SƏBƏTƏ'}</span>
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