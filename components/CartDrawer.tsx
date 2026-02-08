
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
    const discount = item.isFirstOrSecondOrder ? item.price * 0.1 : 0;
    const deliveryPrice = item.deliveryType === 'urgent' ? 5.49 : item.deliveryType === 'express' ? 9.99 : 0;
    return sum + (item.price - discount + deliveryPrice) * item.quantity;
  }, 0);

  const handleWhatsAppCheckout = () => {
    const phoneNumber = '994519831483';
    const itemsText = items.map((item, idx) => {
      const discount = item.isFirstOrSecondOrder ? item.price * 0.1 : 0;
      const deliveryPrice = item.deliveryType === 'urgent' ? 5.49 : item.deliveryType === 'express' ? 9.99 : 0;
      const finalPrice = item.price - discount + deliveryPrice;
      
      return `*MƏHSUL ${idx + 1}:*\n` +
             `- Ad: ${item.name}\n` +
             `- Yazı: ${item.customText || 'Yoxdur'}\n` +
             `- Ünvan: ${item.deliveryDetails || 'Qeyd edilməyib'}\n` +
             `- Çatdırılma: ${item.deliveryType.toUpperCase()}\n` +
             `- Hədiyyə: ${item.isGift ? 'Hə' : 'Yox'}\n` +
             `- Qiymət: ${finalPrice.toFixed(2)} AZN\n`;
    }).join('\n');

    const message = encodeURIComponent(
      `*SƏBƏT SİFARİŞİ - RAVIO*\n\n` +
      `${itemsText}\n` +
      `*YEKUN CƏMİ:* ${total.toFixed(2)} AZN\n\n` +
      `Sifarişi təsdiqləmək üçün geri dönüş gözləyirəm.`
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
              items.map((item) => (
                <div key={item.cartId} className="bg-gray-50 rounded-[2rem] p-5 border border-gray-100 space-y-4 group">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm">
                      <img src={item.images[0]} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-grow flex flex-col justify-center">
                      <h3 className="font-black text-sm text-gray-800 line-clamp-1">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[#FF8C00] font-black text-base">{item.price.toFixed(2)} AZN</span>
                        {/* Removed non-existent 'title' prop from Gift component to fix TS error */}
                        {item.isGift && <Gift className="h-3 w-3 text-red-500" />}
                      </div>
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
                  
                  {/* Individual Address/Customization Summary */}
                  <div className="pt-3 border-t border-gray-200/50 space-y-2">
                    <div className="flex items-start gap-2 text-[10px] text-gray-500">
                      <MapPin className="h-3 w-3 text-[#FF8C00] shrink-0 mt-0.5" />
                      <p className="line-clamp-1 font-bold italic">{item.deliveryDetails || 'Ünvan qeyd edilməyib'}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-gray-400">
                      <span>{item.deliveryType} çatdırılma</span>
                      <span className="text-gray-800">Yazı: {item.customText ? 'Bəli' : 'Yox'}</span>
                    </div>
                  </div>
                </div>
              ))
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
