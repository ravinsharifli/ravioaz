import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Edit3, User, Truck, Clock, Zap, Info, ShoppingCart, MapPin } from 'lucide-react';
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
          
          {/* Kapat düyməsi */}
          <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-orange-500 hover:text-white transition-all outline-none">
            <X className="h-5 w-5" />
          </button>

          {/* ŞƏKİL - mobilda tam ekran hündürlüyündə */}
          <div className="md:w-1/2 relative bg-gray-100 flex flex-col md:h-auto flex-shrink-0 md:border-r border-gray-100">
            
            {/* Əsas şəkil */}
            <div className="relative overflow-hidden" style={{height: 'min(70vw, 420px)'}}>
              {images[currentImgIndex] ? (
                <img
                  src={images[currentImgIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">Şəkil yoxdur</div>
              )}

              {/* Endirim nişanı */}
              {discountPrice && (
                <div className="absolute top-4 left-4 bg-[#FF8C00] text-white font-black px-3 py-1.5 rounded-full text-sm shadow-lg">
                  -{discountPercent}% ENDİRİM
                </div>
              )}

              {/* Ox düymələri */}
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Şəkil nömrəsi */}
              {images.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-black px-2 py-1 rounded-full">
                  {currentImgIndex + 1}/{images.length}
                </div>
              )}
            </div>

            {/* Thumbnail-lər */}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 bg-white overflow-x-auto" style={{scrollbarWidth:'none'}}>
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImgIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${currentImgIndex === idx ? 'border-[#FF8C00] scale-105' : 'border-transparent opacity-50'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* MƏLUMATLAR */}
          <div className="md:w-1/2 flex flex-col overflow-y-auto bg-white md:rounded-r-[3rem]">
            <div className="p-5 md:p-10 space-y-5">

              {/* Ad və qiymət */}
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

              {/* İlk sifariş */}
              <section className="p-4 bg-gray-50 border border-gray-100 rounded-[1.5rem] space-y-3">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-tight italic">Bu sizin ilk və ya ikinci sifarişinizdir?</h4>
                <div className="flex gap-3">
                  <button onClick={() => setIsFirstOrSecondOrder(true)} className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all ${isFirstOrSecondOrder === true ? 'bg-[#FF8C00] text-white shadow-lg' : 'bg-white text-[#1A1A1A] border border-gray-200'}`}>BƏLİ</button>
                  <button onClick={() => setIsFirstOrSecondOrder(false)} className={`flex-1 py-2.5 rounded-2xl text-xs font-black transition-all ${isFirstOrSecondOrder === false ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-white text-[#1A1A1A] border border-gray-200'}`}>XEYR</button>
                </div>
              </section>

              {/* Yazı */}
              <section className="space-y-2 p-4 border border-orange-100 rounded-[1.5rem]">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                  <Edit3 className="h-3 w-3 text-[#FF8C00]" /> Məhsul üzərinə yazı
                </h4>
                <textarea value={customText} onChange={(e) => setCustomText(e.target.value)} placeholder="Yazılacaq mətni daxil edin..." className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm min-h-[60px] outline-none text-[#1A1A1A] font-bold placeholder:text-gray-300 focus:border-orange-200 transition-all" />
              </section>

              {/* Əlaqə */}
              <section className="space-y-3">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                  <User className="h-3 w-3 text-[#FF8C00]" /> Əlaqə Məlumatları
                </h4>
                <input type="text" placeholder="Adınız" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                <input type="tel" placeholder="Mobil Nömrəniz" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
                <input type="text" placeholder="Doğum Tarixi (12.05.1998)" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 focus:border-orange-200 rounded-xl outline-none font-bold text-sm placeholder:text-gray-300" />
              </section>

              {/* Çatdırılma */}
              <section className="space-y-3 pt-3 border-t border-gray-100">
                <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                  <Truck className="h-3 w-3 text-[#FF8C00]" /> Çatdırılma
                </h4>
                <div className="space-y-2">
                  {[
                    { type: 'standard', icon: <Truck className="h-4 w-4 text-[#FF8C00]" />, label: 'Standart', sub: '3 iş günü', price: 'PULSUZ', priceClass: 'text-green-600' },
                    { type: 'urgent', icon: <Clock className="h-4 w-4 text-[#FF8C00]" />, label: 'Təcili', sub: '2 iş günü', price: '+5.49 AZN', priceClass: 'text-[#FF8C00]' },
                    { type: 'express', icon: <Zap className="h-4 w-4 text-[#FF8C00]" />, label: 'Sürətli', sub: '24 saat', price: '+9.99 AZN', priceClass: 'text-[#FF8C00]' },
                  ].map(({ type, icon, label, sub, price, priceClass }) => (
                    <button key={type} onClick={() => setDeliveryType(type as any)} className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${deliveryType === type ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-100 bg-white'}`}>
                      <div className="flex items-center gap-3">{icon}<div className="text-left"><p className="text-sm font-black text-[#1A1A1A]">{label}</p><p className="text-[10px] font-bold text-gray-500">{sub}</p></div></div>
                      <span className={`text-xs font-black ${priceClass}`}>{price}</span>
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-[#FF8C00]" /> Ünvan
                  </h4>
                  <textarea placeholder="Tam ünvan və kuryer üçün qeydlər..." value={deliveryDetails} onChange={(e) => setDeliveryDetails(e.target.value)} className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm min-h-[90px] focus:border-orange-200 transition-all placeholder:text-gray-300" />
                </div>
              </section>

              {/* Hədiyyə + Yekun */}
              <div className="sticky bottom-0 bg-white pt-4 pb-3 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Hədiyyəlik bağlama?</span>
                  <div className="flex gap-2">
                    <button onClick={() => setIsGift(false)} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${isGift === false ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-[#1A1A1A]'}`}>XEYR</button>
                    <button onClick={() => setIsGift(true)} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all ${isGift === true ? 'bg-[#FF8C00] text-white' : 'bg-gray-100 text-[#1A1A1A]'}`}>BƏLİ</button>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] p-5 rounded-[2rem] flex items-center justify-between text-white shadow-2xl">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      YEKUN {getLoyaltyDiscount() > 0 && <span className="text-green-400">(-{getLoyaltyDiscount().toFixed(2)} AZN)</span>}
                    </span>
                    <span className="text-2xl font-black text-[#FF8C00]">{calculateTotal().toFixed(2)} AZN</span>
                  </div>
                  <button onClick={handleAddToCartClick} disabled={!isFormValid} className="bg-[#FF8C00] text-white px-6 py-4 rounded-full font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:pointer-events-none">
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