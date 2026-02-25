import React from 'react';
import { X, Trash2, ShoppingBag, MessageCircle, ArrowRight, MapPin, Edit3, Gift } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (cartId: string) => void;
  onEdit: (item: CartItem) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onEdit }) => {
  const total = items.reduce((sum, item) => {
    const discountPrice = (item as any).discountPrice;
    const basePrice = discountPrice || item.price;
    const loyaltyDiscount = item.isFirstOrSecondOrder ? basePrice * 0.1 : 0;
    const deliveryPrice = item.deliveryType === 'urgent' ? 5.49 : item.deliveryType === 'express' ? 9.99 : 0;
    return sum + (basePrice - loyaltyDiscount + deliveryPrice) * item.quantity;
  }, 0);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = '994519831483';
    const itemsText = items.map((item, idx) => {
      const discountPrice = (item as any).discountPrice;
      const basePrice = discountPrice || item.price;
      const loyaltyDiscount = item.isFirstOrSecondOrder ? basePrice * 0.1 : 0;
      const deliveryPrice = item.deliveryType === 'urgent' ? 5.49 : item.deliveryType === 'express' ? 9.99 : 0;
      const finalPrice = basePrice - loyaltyDiscount + deliveryPrice;
      
      const productImageUrl = item.images && item.images[0] ? item.images[0] : '';
      
      let priceBreakdown = `- Qiymət: ${basePrice.toFixed(2)} AZN\n`;
      
      if (discountPrice && discountPrice < item.price) {
        const sanityDiscountPercent = Math.round(((item.price - discountPrice) / item.price) * 100);
        priceBreakdown += `  (Kampaniya endirimi: -${sanityDiscountPercent}%)\n`;
      }
      
      if (loyaltyDiscount > 0) {
        priceBreakdown += `  (Müştəri endirimi: -${loyaltyDiscount.toFixed(2)} AZN)\n`;
      }
      
      if (deliveryPrice > 0) {
        priceBreakdown += `  (Çatdırılma: +${deliveryPrice.toFixed(2)} AZN)\n`;
      }
      
      priceBreakdown += `  *Son qiymət: ${finalPrice.toFixed(2)} AZN*\n`;
      
      return `━━━━━━━━━━━━━━━━\n` +
             `*📦 MƏHSUL ${idx + 1}:*\n` +
             `- Ad: ${item.name}\n` +
             `🖼 Şəkil: ${productImageUrl}\n\n` +
             `👤 *MÜŞTƏRİ MƏLUMATLARI:*\n` +
             `- Ad: ${item.customerName}\n` +
             `- Telefon: ${item.phone}\n` +
             `- Doğum tarixi: ${item.birthDate}\n\n` +
             `✏️ *SİFARİŞ DETALLARI:*\n` +
             `- Yazı: ${item.customText || 'Yoxdur'}\n` +
             `- Ünvan: ${item.deliveryDetails || 'Qeyd edilməyib'}\n` +
             `- Çatdırılma: ${item.deliveryType === 'standard' ? 'Standart (3 gün) 🚚' : item.deliveryType === 'urgent' ? 'Təcili (2 gün) ⚡' : 'Ekspress (24 saat) 🔥'}\n` +
             `- Hədiyyə bağlama: ${item.isGift ? 'Bəli 🎁' : 'Xeyr'}\n\n` +
             `💰 *QİYMƏT:*\n` +
             priceBreakdown;
    }).join('\n\n');

    const message = encodeURIComponent(
      `*🎁 YENİ SİFARİŞ - RAVIO.AZ*\n\n` +
      `${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `*💵 YEKUN CƏM:* ${total.toFixed(2)} AZN\n\n` +
      `✅ Sifarişi təsdiqləmək üçün geri dönüş gözləyirəm! 🙏`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl transition-transform duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-[#FF8C00]" />
              <h2 className="text-2xl font-black tracking-tight">Səbətim</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="bg-orange-50 p-6 rounded-full">
                  <ShoppingBag className="h-12 w-12 text-[#FF8C00] opacity-20" />
                </div>
                <p className="text-gray-400 font-bold italic text-lg">Səbətiniz boşdur.</p>
                <button onClick={onClose} className="text-[#FF8C00] font-black underline underline-offset-4">Məhsullara bax</button>
              </div>
            ) : (
              items.map((item) => {
                const discountPrice = (item as any).discountPrice;
                const basePrice = discountPrice || item.price;
                const loyaltyDiscount = item.isFirstOrSecondOrder ? basePrice * 0.1 : 0;
                const deliveryPrice = item.deliveryType === 'urgent' ? 5.49 : item.deliveryType === 'express' ? 9.99 : 0;
                const finalPrice = basePrice - loyaltyDiscount + deliveryPrice;
                const hasSanityDiscount = discountPrice && discountPrice < item.price;
                const sanityDiscountPercent = hasSanityDiscount ? Math.round(((item.price - discountPrice) / item.price) * 100) : 0;

                return (
                  <div key={item.cartId} className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 space-y-4 group">
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-grow flex flex-col justify-center">
                        <h3 className="font-black text-sm text-gray-800 line-clamp-1">{item.name}</h3>
                        <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                          <span className="text-[#FF8C00] font-black text-base">{basePrice.toFixed(2)} AZN</span>
                          {hasSanityDiscount && (
                            <>
                              <span className="text-xs font-bold text-gray-400 line-through">{item.price.toFixed(2)} AZN</span>
                              <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded">-{sanityDiscountPercent}%</span>
                            </>
                          )}
                          {item.isGift && <Gift className="h-3 w-3 text-red-500" />}
                        </div>
                        {loyaltyDiscount > 0 && (
                          <div className="mt-1">
                            <span className="text-[9px] font-black text-[#FF8C00] bg-orange-50 px-2 py-0.5 rounded-full">
                              Müştəri endirimi: -{loyaltyDiscount.toFixed(2)} AZN
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => onRemove(item.cartId)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => onEdit(item)}
                          className="p-2 text-gray-300 hover:text-[#FF8C00] hover:bg-orange-50 rounded-xl transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200/50 space-y-2">
                      <div className="flex items-start gap-2 text-[10px] text-gray-500">
                        <MapPin className="h-3 w-3 text-[#FF8C00] shrink-0 mt-0.5" />
                        <p className="line-clamp-1 font-bold italic">{item.deliveryDetails || 'Ünvan qeyd edilməyib'}</p>
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                        <span>{item.deliveryType === 'standard' ? 'Standart' : item.deliveryType === 'urgent' ? 'Təcili' : 'Ekspress'}</span>
                        <span className="text-gray-800">Yazı: {item.customText ? 'Bəli' : 'Xeyr'}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="p-8 bg-gray-50 border-t border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Yekun Cəm</span>
                <span className="text-3xl font-black text-[#1A1A1A]">{total.toFixed(2)} AZN</span>
              </div>
              <button 
                onClick={handleWhatsAppCheckout}
                className="w-full bg-[#1A1A1A] text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 hover:bg-[#FF8C00] transition-all shadow-xl group"
              >
                <span>WhatsApp ilə Tamamla</span>
                <MessageCircle className="h-5 w-5" />
                <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;