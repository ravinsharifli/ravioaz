import React from 'react';
import {
  X, Trash2, ShoppingBag, MessageCircle,
  ArrowRight, MapPin, Edit3, Gift,
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (cartId: string) => void;
  onEdit: (item: CartItem) => void;
  onGoToProducts?: () => void;
}

// ── Hər sifarişin yekun qiymətini hesabla ────────────────────────
// Yeni forma ilə gələn sifarişlərdə finalTotal artıq hazırdır.
// Köhnə sifarişlər üçün ehtiyat hesablama işləyir.
function getItemFinalPrice(item: CartItem): number {
  if (item.finalTotal !== undefined) return item.finalTotal;
  // Ehtiyat: köhnə hesablama üsulu
  const basePrice      = item.discountPrice ?? item.price;
  const loyaltyDisc    = item.customerType === 'loyal'
    ? basePrice * 0.20
    : item.isFirstOrSecondOrder ? basePrice * 0.10 : 0;
  const deliveryPrice  = item.deliveryType === 'urgent' ? 10
    : item.deliveryType === 'express' ? 9.99 : 0;
  return (basePrice - loyaltyDisc + deliveryPrice) * item.quantity;
}

function getItemBeh(item: CartItem): number {
  if (item.behAmount !== undefined) return item.behAmount;
  return Math.ceil(getItemFinalPrice(item) * 0.5);
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, items, onRemove, onEdit, onGoToProducts,
}) => {
  // Yekun cəm
  const grandTotal = items.reduce(
    (sum, item) => sum + getItemFinalPrice(item), 0
  );
  const grandBeh = items.reduce(
    (sum, item) => sum + getItemBeh(item), 0
  );

  // ── WhatsApp mesajı ────────────────────────────────────────────
  const handleWhatsAppCheckout = () => {
    const phoneNumber = '994519831483';

    const itemsText = items.map((item, idx) => {
      const finalPrice = getItemFinalPrice(item);
      const beh        = getItemBeh(item);
      const baseUnit   = item.discountPrice ?? item.price;
      const imgUrl     = item.images?.[0] ?? '';

      // Qiymət sətirləri
      let priceLines = `- Vahid qiymət: ${baseUnit.toFixed(2)} ₼\n`;
      priceLines += `- Say: ${item.quantity} ədəd\n`;

      if (item.discountPrice && item.discountPrice < item.price) {
        const pct = Math.round(((item.price - item.discountPrice) / item.price) * 100);
        priceLines += `  ↳ Kampaniya endirimi: -%${pct}\n`;
      }
      if ((item.bulkDiscountAmount ?? 0) > 0) {
        priceLines += `  ↳ Say endirimi: -${item.bulkDiscountAmount!.toFixed(2)} ₼\n`;
      }
      if ((item.lazerPrice ?? 0) > 0) {
        priceLines += `  ↳ Lazer yazı: +${item.lazerPrice!.toFixed(2)} ₼\n`;
      }
      if (item.hasQrCode) {
        priceLines += `  ↳ QR Kod: +3 ₼\n`;
      }
      if ((item.boxPrice ?? 0) > 0) {
        priceLines += `  ↳ ${item.boxType === 'gift' ? 'Hədiyyə Qutu' : 'Premium Qutu'}: +${item.boxPrice!.toFixed(2)} ₼\n`;
      }
      if (item.deliveryMethod === 'kuryer') {
        priceLines += `  ↳ Kuryer çatdırılması: +10 ₼\n`;
      }
      if ((item.couponDiscount ?? 0) > 0) {
        priceLines += `  ↳ Kupon (${item.couponCode}): -${item.couponDiscount!.toFixed(2)} ₼\n`;
      }
      priceLines += `  *Son qiymət: ${finalPrice.toFixed(2)} ₼*\n`;
      priceLines += `  💳 *Ön ödəniş (50%): ${beh.toFixed(2)} ₼* (kart-karta)\n`;

      // Çatdırılma mətni
      const deliveryText = item.deliveryMethod === 'metro'
        ? `🚇 Metro: ${item.metroStation} · ${item.metroDay} · ${item.metroTime}`
        : item.deliveryMethod === 'kuryer'
        ? `🛵 Kuryer: ${item.deliveryDetails}`
        : item.deliveryDetails || 'Qeyd edilməyib';

      return (
        `━━━━━━━━━━━━━━━━\n` +
        `*📦 MƏHSUL ${idx + 1}:*\n` +
        `- Ad: ${item.productName}\n` +
        `- Model: ${item.modelName}\n` +
        `- Rəng: ${item.colorName}\n` +
        (imgUrl ? `🖼 Şəkil: ${imgUrl}\n` : '') +
        `\n👤 *MÜŞTƏRİ:*\n` +
        `- Ad: ${item.customerName}\n` +
        `- Telefon: ${item.phone}\n` +
        `\n✏️ *SİFARİŞ DETALLARI:*\n` +
        `- Lazer yazı: ${item.customText || 'Yoxdur'}\n` +
        `- QR Kod: ${item.hasQrCode ? 'Bəli ✓' : 'Xeyr'}\n` +
        `- Qablaşdırma: ${
          item.boxType === 'gift'    ? 'Hədiyyə Qutu 🎁' :
          item.boxType === 'premium' ? 'Premium Qutu ◈'  :
          item.boxType === 'simple'  ? 'Sadə Qutu'        :
          'Qutu yoxdur'
        }\n` +
        `\n🚚 *ÇATDIRILMA:*\n` +
        `- ${deliveryText}\n` +
        `\n💰 *QİYMƏT:*\n` +
        priceLines +
        `\n⚠️ *QEYD:* Bu məhsul özəl hazırlanır və geri qaytarılmır!`
      );
    }).join('\n\n');

    const message = encodeURIComponent(
      `*🎁 YENİ SİFARİŞ — RAVIO.AZ*\n\n` +
      `${itemsText}\n\n` +
      `━━━━━━━━━━━━━━━━\n` +
      `*💵 YEKUN CƏM:* ${grandTotal.toFixed(2)} ₼\n` +
      `*💳 YEKUN BEH (50%):* ${grandBeh.toFixed(2)} ₼ (kart-karta)\n\n` +
      `✅ Sifarişi təsdiqləmək üçün geri dönüş gözləyirəm! 🙏`
    );

    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleGoToProducts = () => {
    onClose();
    if (onGoToProducts) onGoToProducts();
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* Qaranlıq fon */}
      <div
        className={`fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sürüşən panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-[200] shadow-2xl transition-transform duration-500 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">

          {/* Başlıq */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-6 w-6 text-[#b8965a]" />
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Səbətim
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Məhsul siyahısı */}
          <div className="flex-grow overflow-y-auto p-5 space-y-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="bg-amber-50 p-6 rounded-full">
                  <ShoppingBag className="h-12 w-12 text-[#b8965a] opacity-25" />
                </div>
                <p className="text-gray-400 font-semibold italic text-lg"
                   style={{ fontFamily: 'Georgia, serif' }}>
                  Səbətiniz boşdur.
                </p>
                <button
                  onClick={handleGoToProducts}
                  className="px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow"
                  style={{
                    background: '#2d2926', color: '#fff',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  Məhsullara bax →
                </button>
              </div>
            ) : (
              items.map((item) => {
                const finalPrice  = getItemFinalPrice(item);
                const beh         = getItemBeh(item);
                const baseUnit    = item.discountPrice ?? item.price;
                const hasDiscount = item.discountPrice && item.discountPrice < item.price;
                const discPct     = hasDiscount
                  ? Math.round(((item.price - item.discountPrice!) / item.price) * 100) : 0;

                const deliveryLine = item.deliveryMethod === 'metro'
                  ? `🚇 ${item.metroStation} · ${item.metroDay} · ${item.metroTime}`
                  : item.deliveryDetails || 'Ünvan qeyd edilməyib';

                return (
                  <div
                    key={item.cartId}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3"
                  >
                    {/* Üst hissə: şəkil + məlumat + sil/düzəlt */}
                    <div className="flex gap-4">
                      <div className="w-16 h-20 bg-white rounded-xl overflow-hidden shrink-0 shadow-sm">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            className="w-full h-full object-cover"
                            alt={item.productName}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                            ?
                          </div>
                        )}
                      </div>

                      <div className="flex-grow flex flex-col justify-center">
                        <h3 className="font-bold text-sm text-gray-800 line-clamp-1">
                          {item.productName}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {[item.modelName, item.colorName].filter(s => s && s !== '—').join(' · ')}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                          <span className="font-bold text-base" style={{ color: '#b8965a' }}>
                            {baseUnit.toFixed(2)} ₼
                          </span>
                          {hasDiscount && (
                            <>
                              <span className="text-xs text-gray-400 line-through">
                                {item.price.toFixed(2)} ₼
                              </span>
                              <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                -{discPct}%
                              </span>
                            </>
                          )}
                          {item.isGift && <Gift className="h-3 w-3 text-amber-500" />}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Say: {item.quantity} ədəd
                        </p>
                      </div>

                      {/* Sil / Düzəlt düymələri */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => onRemove(item.cartId)}
                          className="p-2 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(item)}
                          className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Alt detallar */}
                    <div className="pt-2 border-t border-gray-100 space-y-1.5">
                      {/* Lazer yazı */}
                      {item.customText && (
                        <div className="flex items-center gap-2 text-[10px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5">
                          <span>✍️</span>
                          <span className="italic">{item.customText}</span>
                        </div>
                      )}
                      {/* QR Kod */}
                      {item.hasQrCode && (
                        <div className="text-[10px] text-gray-500">
                          QR Kod: <span className="text-green-600 font-bold">Bəli ✓</span>
                        </div>
                      )}
                      {/* Çatdırılma */}
                      <div className="flex items-start gap-2 text-[10px] text-gray-500">
                        <MapPin className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                        <p className="line-clamp-1 italic">{deliveryLine}</p>
                      </div>
                      {/* Beh */}
                      <div className="flex items-center justify-between bg-amber-50 rounded-lg px-2 py-1.5">
                        <span className="text-[10px] font-bold text-amber-700">
                          💳 Ön ödəniş (50%):
                        </span>
                        <span className="text-[11px] font-black text-amber-700">
                          {beh.toFixed(2)} ₼
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Yekun + WhatsApp düyməsi */}
          {items.length > 0 && (
            <div className="p-5 bg-gray-50 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                  Yekun Cəm
                </span>
                <span
                  className="text-2xl font-black"
                  style={{ color: '#1e1a16', fontFamily: 'Georgia, serif' }}
                >
                  {grandTotal.toFixed(2)} ₼
                </span>
              </div>
              <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <span className="text-xs font-bold text-amber-800">
                  💳 Ön ödəniş (50%) — kart-karta
                </span>
                <span className="text-base font-black text-amber-700">
                  {grandBeh.toFixed(2)} ₼
                </span>
              </div>
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg group"
                style={{
                  background: '#2d2926', color: '#ffffff',
                  fontFamily: 'Georgia, serif', fontSize: 15,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#b8965a';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#2d2926';
                }}
              >
                <span>WhatsApp ilə Tamamla</span>
                <MessageCircle className="h-5 w-5" />
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;