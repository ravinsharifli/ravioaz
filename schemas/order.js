// schemas/order.js — sifariş QEYDLƏRİ (api/order.js yaradır).
//
// DİQQƏT — məxfilik: bu dataset "public"-dir, ona görə burada müştərinin adı, telefonu, ünvanı,
// doğum tarixi və şəkilləri SAXLANMIR (onlar yalnız WhatsApp mesajındadır). Yalnız sifarişin
// faktları var: məhsul, say, məbləğ, çatdırılma növü, mənbə (UTM). Telefon yalnız bərpa
// edilə bilməyən HMAC hash kimi saxlanır ("daimi müştəri" iddiasını yoxlamaq üçün).
//
// Sənədi siz yalnız 2 sahədə dəyişirsiniz: "Status" və "Daxili qeyd". Qalanı avtomatikdir.

const STATUSES = [
  { title: '🆕 Yeni (WhatsApp-a göndərildi, hələ təsdiqlənməyib)', value: 'new' },
  { title: '💳 Beh ödənildi', value: 'deposit_paid' },
  { title: '🛠 İstehsalda', value: 'in_production' },
  { title: '🚚 Çatdırılmada', value: 'shipped' },
  { title: '✅ Çatdırıldı', value: 'delivered' },
  { title: '❌ Ləğv edildi', value: 'cancelled' },
]

const auto = (description) => ({ readOnly: true, description })

export default {
  name: 'order',
  title: '🧾 Sifarişlər',
  type: 'document',
  fields: [
    {
      name: 'status',
      title: '📌 Status',
      type: 'string',
      options: { list: STATUSES, layout: 'dropdown' },
      initialValue: 'new',
      description: 'Sifarişin vəziyyətini siz yeniləyirsiniz. "Yeni" sifarişlər hələ təsdiqlənməyib — saxta/boş sorğu ola bilər.',
    },
    { name: 'internalNote', title: '📝 Daxili qeyd', type: 'text', rows: 3, description: 'Yalnız sizin üçün (saytda görünmür).' },

    { name: 'orderNumber', title: 'Sifariş nömrəsi', type: 'string', ...auto('WhatsApp mesajındakı başlıqla eyni vaxtı göstərir (RV-GGGGAAGG-SSDDSS).') },
    { name: 'createdAt', title: 'Yaranma vaxtı', type: 'datetime', ...auto('') },
    { name: 'serverTotal', title: 'Məbləğ (server hesabı, ₼)', type: 'number', ...auto('Sanity-dəki real qiymətlərlə yenidən hesablanıb.') },
    { name: 'clientTotal', title: 'Məbləğ (müştəriyə göstərilən, ₼)', type: 'number', ...auto('Brauzerin göndərdiyi məbləğ.') },
    {
      name: 'totalsMismatch',
      title: '⚠️ Məbləğ uyğunsuzluğu',
      type: 'boolean',
      ...auto('BƏLİ olarsa: server hesabı müştəriyə göstərilənlə üst-üstə düşmür və ya yanlış kupon/məhsul var. WhatsApp-da qiyməti yoxlayın.'),
    },
    { name: 'issues', title: 'Uyğunsuzluq səbəbləri', type: 'array', of: [{ type: 'string' }], ...auto('Məs: coupon-not-valid, line-total-differs, product-not-found') },
    { name: 'itemsCount', title: 'Məhsul növü sayı', type: 'number', ...auto('') },
    { name: 'unitsCount', title: 'Ümumi ədəd', type: 'number', ...auto('') },
    { name: 'deliveryMethod', title: 'Çatdırılma növü', type: 'string', ...auto('kuryer / metro / post') },
    { name: 'deliveryDate', title: 'Çatdırılma tarixi', type: 'string', ...auto('') },
    { name: 'customerTypeClaimed', title: 'Müştəri növü (özü seçib)', type: 'string', ...auto('new = Yeni müştəri (−10%), loyal = Daimi müştəri (−20%). Müştəri özü seçir, yoxlanılmır.') },
    {
      name: 'loyalNoHistory',
      title: '🔎 "Daimi" seçib, amma qeyd yoxdur',
      type: 'boolean',
      ...auto('BƏLİ: "Daimi müştəri" seçilib, lakin bu nömrədən əvvəl qeydə alınmış sifariş yoxdur. Sistem yenidir — köhnə sifarişlər burada yoxdur, ona görə hələlik yalnız məlumat xarakteri daşıyır.'),
    },
    { name: 'previousOrders', title: 'Bu nömrədən əvvəlki sifariş sayı', type: 'number', ...auto('') },
    { name: 'couponCodes', title: 'İstifadə olunan kuponlar', type: 'array', of: [{ type: 'string' }], ...auto('') },
    { name: 'lang', title: 'Sayt dili', type: 'string', ...auto('az / en') },
    {
      name: 'utm',
      title: 'Mənbə (UTM)',
      type: 'object',
      readOnly: true,
      fields: [
        { name: 'source', type: 'string', title: 'source' },
        { name: 'medium', type: 'string', title: 'medium' },
        { name: 'campaign', type: 'string', title: 'campaign' },
        { name: 'content', type: 'string', title: 'content' },
        { name: 'term', type: 'string', title: 'term' },
      ],
    },
    {
      name: 'items',
      title: 'Məhsullar',
      type: 'array',
      readOnly: true,
      of: [
        {
          type: 'object',
          name: 'orderItem',
          fields: [
            { name: 'productName', type: 'string', title: 'Məhsul' },
            { name: 'variantLabel', type: 'string', title: 'Model / rəng' },
            { name: 'quantity', type: 'number', title: 'Say' },
            { name: 'boxName', type: 'string', title: 'Qutu' },
            { name: 'couponCode', type: 'string', title: 'Kupon' },
            { name: 'customerType', type: 'string', title: 'Müştəri növü' },
            { name: 'hasCustomText', type: 'boolean', title: 'Yazı var' },
            { name: 'hasPhoto', type: 'boolean', title: 'Şəkil var' },
            { name: 'serverTotal', type: 'number', title: 'Server məbləği' },
            { name: 'clientTotal', type: 'number', title: 'Müştəri məbləği' },
            { name: 'productId', type: 'string', title: 'Məhsul ID' },
            { name: 'issues', type: 'array', of: [{ type: 'string' }], title: 'Uyğunsuzluqlar' },
          ],
          preview: {
            select: { title: 'productName', subtitle: 'variantLabel', qty: 'quantity' },
            prepare: ({ title, subtitle, qty }) => ({ title: `${title || '?'} × ${qty ?? 1}`, subtitle }),
          },
        },
      ],
    },
    { name: 'phoneHash', title: 'Telefon hash-i', type: 'string', ...auto('Telefon nömrəsinin bərpa edilə bilməyən izi (şəxsi məlumat deyil).') },
  ],
  orderings: [
    { title: 'Ən yeni əvvəl', name: 'newest', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'orderNumber', total: 'serverTotal', status: 'status', mismatch: 'totalsMismatch' },
    prepare: ({ title, total, status, mismatch }) => ({
      title: `${mismatch ? '⚠️ ' : ''}${title || 'Sifariş'}`,
      subtitle: `${total ?? '?'} ₼ · ${(STATUSES.find((s) => s.value === status) || {}).title || status || ''}`,
    }),
  },
}
