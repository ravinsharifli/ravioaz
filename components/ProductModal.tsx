
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, Star, ChevronLeft, ChevronRight, Edit3, User, Truck, Clock, Zap, Gift, Info, ShieldCheck, NotebookPen, ShoppingCart, MapPin } from 'lucide-react';
import { Product, CartItem } from '../types';

interface ProductModalProps {
  product: Product;
  initialData?: CartItem;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  onOpenCategory: (category: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, initialData, onClose, onAddToCart, onOpenCategory }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  
  // Form State
  const [customText, setCustomText] = useState(initialData?.customText || '');
  const [customerName, setCustomerName] = useState(initialData?.customerName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [isGift, setIsGift] = useState<boolean | null>(initialData?.isGift !== undefined ? initialData.isGift : null);
  const [isFirstOrSecondOrder, setIsFirstOrSecondOrder] = useState<boolean | null>(initialData?.isFirstOrSecondOrder !== undefined ? initialData.isFirstOrSecondOrder : null);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'urgent' | 'express'>(initialData?.deliveryType || 'standard');
  const [deliveryDetails, setDeliveryDetails] = useState(initialData?.deliveryDetails || '');

  const nextImg = () => setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
  const prevImg = () => setCurrentImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);

  const getDeliveryPrice = () => {
    if (deliveryType === 'urgent') return 5.49;
    if (deliveryType === 'express') return 9.99;
    return 0;
  };

  const getDiscountAmount = () => {
    return isFirstOrSecondOrder ? product.price * 0.1 : 0;
  };

  const calculateTotal = () => {
    const discountedPrice = product.price - getDiscountAmount();
    return discountedPrice + getDeliveryPrice();
  };

  const handleAddToCartClick = () => {
    const cartItem: CartItem = {
      ...product,
      cartId: initialData?.cartId || Math.random().toString(36).substr(2, 9),
      quantity: initialData?.quantity || 1,
      customText,
      customerName,
      phone,
      birthDate,
      isGift: isGift!,
      isFirstOrSecondOrder: isFirstOrSecondOrder!,
      deliveryType,
      deliveryDetails
    };
    onAddToCart(cartItem);
  };

  const isFormValid = customerName && phone && birthDate && isGift !== null && isFirstOrSecondOrder !== null && deliveryDetails;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[95vh]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-50 bg-gray-100 p-2 rounded-full hover:bg-orange-500 hover:text-white transition-all shadow-sm outline-none"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="md:w-1/2 relative bg-gray-50 flex flex-col h-full overflow-hidden border-r border-gray-100">
          <div className="flex-grow relative overflow-hidden group">
            <img 
              src={product.images[currentImgIndex]} 
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {product.images.length > 1 && (
              <>
                <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100"><ChevronLeft className="h-5 w-5" /></button>
                <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full transition-all opacity-0 group-hover:opacity-100"><ChevronRight className="h-5 w-5" /></button>
              </>
            )}
          </div>
          <div className="p-4 flex gap-2 justify-center bg-white border-t border-gray-100 overflow-x-auto shrink-0">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setCurrentImgIndex(idx)} className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${currentImgIndex === idx ? 'border-[#FF8C00] scale-105' : 'border-transparent opacity-60'}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="md:w-1/2 flex flex-col overflow-y-auto bg-white">
          <div className="p-8 md:p-12 space-y-8">
            <section className="space-y-4">
              <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">{product.name}</h2>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <h4 className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest mb-1 flex items-center gap-1">
                   <Info className="h-3 w-3 text-orange-600" /> Məhsul haqqında
                </h4>
                <p className="text-xs font-bold text-[#1A1A1A] leading-relaxed">
                  Bu premium məhsul sizin fərdi istəklərinizə uyğun hazırlanacaq.
                </p>
              </div>
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-black text-[#FF8C00]">{calculateTotal().toFixed(2)} AZN</span>
                {isFirstOrSecondOrder && (
                  <span className="text-lg font-bold text-gray-400 line-through">{product.price.toFixed(2)} AZN</span>
                )}
              </div>
            </section>

            {/* Loyalty Question */}
            <section className="p-6 bg-gray-50 border border-gray-100 rounded-[2.5rem] space-y-4 shadow-sm">
               <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-tight italic">Bu sizin ilk və ya ikinci sifarişinizdir?</h4>
               <div className="flex gap-3">
                  <button onClick={() => setIsFirstOrSecondOrder(true)} className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${isFirstOrSecondOrder === true ? 'bg-[#FF8C00] text-white shadow-lg' : 'bg-white text-[#1A1A1A] border border-gray-200 hover:border-orange-200'}`}>BƏLİ</button>
                  <button onClick={() => setIsFirstOrSecondOrder(false)} className={`flex-1 py-3 rounded-2xl text-xs font-black transition-all ${isFirstOrSecondOrder === false ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-white text-[#1A1A1A] border border-gray-200 hover:border-orange-200'}`}>XEYR</button>
               </div>
            </section>

            {/* Custom Text Area */}
            <section className="space-y-3 p-6 border border-orange-100 bg-white rounded-[2.5rem] shadow-sm">
              <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center space-x-2">
                <Edit3 className="h-4 w-4 text-[#FF8C00]" /> <span>Məhsul üzərinə yazı</span>
              </h4>
              <textarea 
                value={customText} 
                onChange={(e) => setCustomText(e.target.value)} 
                placeholder="Yazılacaq mətni daxil edin..." 
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm min-h-[80px] outline-none text-[#1A1A1A] font-bold placeholder:text-gray-300 focus:bg-white focus:border-orange-200 transition-all" 
              />
            </section>

            {/* Contact Information */}
            <section className="space-y-4">
              <h4 className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest flex items-center space-x-2">
                <User className="h-4 w-4 text-[#FF8C00]" /> <span>Əlaqə Məlumatları</span>
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <input type="text" placeholder="Adınız" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 focus:border-orange-200 focus:bg-white rounded-2xl outline-none font-bold text-sm text-[#1A1A1A] placeholder:text-gray-300" />
                <input type="tel" placeholder="Mobil Nömrəniz" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 focus:border-orange-200 focus:bg-white rounded-2xl outline-none font-bold text-sm text-[#1A1A1A] placeholder:text-gray-300" />
                <input type="text" placeholder="Doğum Tarixi (Məsələn: 12.05.1998)" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border border-gray-100 focus:border-orange-200 focus:bg-white rounded-2xl outline-none font-bold text-sm text-[#1A1A1A] placeholder:text-gray-300" />
              </div>
            </section>

            {/* Delivery Choices */}
            <section className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                <Truck className="h-4 w-4 text-[#FF8C00]" /> Çatdırılma Seçimi
              </h4>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setDeliveryType('standard')} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${deliveryType === 'standard' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-50 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Standart</p>
                      <p className="text-[10px] font-bold text-gray-500">3 iş günü ərzində</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-green-600">PULSUZ</span>
                </button>
                <button onClick={() => setDeliveryType('urgent')} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${deliveryType === 'urgent' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-50 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Təcili</p>
                      <p className="text-[10px] font-bold text-gray-500">2 iş günü ərzində</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF8C00]">+5.49 AZN</span>
                </button>
                <button onClick={() => setDeliveryType('express')} className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${deliveryType === 'express' ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-50 bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <Zap className="h-4 w-4 text-[#FF8C00]" />
                    <div className="text-left">
                      <p className="text-sm font-black text-[#1A1A1A]">Sürətli</p>
                      <p className="text-[10px] font-bold text-gray-500">24 saat ərzində</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#FF8C00]">+9.99 AZN</span>
                </button>
              </div>
              <div className="space-y-3">
                <h4 className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FF8C00]" /> Kuryer üçün məlumatlar
                </h4>
                <textarea 
                  placeholder="Tam ünvan və kuryer üçün əlavə qeydləriniz..." 
                  value={deliveryDetails} 
                  onChange={(e) => setDeliveryDetails(e.target.value)} 
                  className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] outline-none font-bold text-sm text-[#1A1A1A] min-h-[120px] focus:bg-white focus:border-orange-200 transition-all placeholder:text-gray-300" 
                />
              </div>
            </section>

            {/* Gift Toggle & Final CTA */}
            <div className="sticky bottom-0 bg-white pt-6 pb-4 border-t border-gray-50 space-y-6">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">Hədiyyəlik bağlama olsun?</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsGift(false)} 
                    className={`px-8 py-2.5 rounded-xl text-[11px] font-black transition-all ${isGift === false ? 'bg-[#1A1A1A] text-white shadow-lg' : 'bg-gray-100 text-[#1A1A1A] hover:bg-gray-200'}`}
                  >
                    XEYR
                  </button>
                  <button 
                    onClick={() => setIsGift(true)} 
                    className={`px-8 py-2.5 rounded-xl text-[11px] font-black transition-all ${isGift === true ? 'bg-[#FF8C00] text-white shadow-lg' : 'bg-gray-100 text-[#1A1A1A] hover:bg-gray-200'}`}
                  >
                    BƏLİ
                  </button>
                </div>
              </div>

              <div className="bg-[#1A1A1A] p-7 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                      YEKUN MƏBLƏĞ {getDiscountAmount() > 0 && <span className="text-green-400 text-[9px]">(-{getDiscountAmount().toFixed(2)} AZN Endirim)</span>}
                    </span>
                    <span className="text-3xl font-black text-[#FF8C00]">{calculateTotal().toFixed(2)} AZN</span>
                 </div>
                 <button 
                  onClick={handleAddToCartClick}
                  disabled={!isFormValid}
                  className="bg-[#FF8C00] text-white px-10 py-5 rounded-full font-black text-sm flex items-center space-x-3 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30 disabled:grayscale disabled:pointer-events-none"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{initialData ? 'SİFARİŞİ YENİLƏ' : 'SƏBƏTƏ ƏLAVƏ ET'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
