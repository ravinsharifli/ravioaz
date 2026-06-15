// ═══════════════════════════════════════════════════════════════
//  RAVIO — SİFARİŞ SXEMİ
//  schemas/order.js
//
//  Bu sxem Sanity Studio-da hər sifarişin görünüşünü təyin edir.
//  Sifariş saytdan gəldikdə bütün bu sahələr doldurulur.
// ═══════════════════════════════════════════════════════════════

export default {
  name: 'order',
  title: 'Sifariş',
  type: 'document',

  // ── STATUSa görə rəng (Studio-da vizual göstərici) ──────────
  __experimental_omnisearch_visibility: true,

  fields: [

    // ╔══════════════════════════════════════════════════════════╗
    //  1. SİFARİŞ İDENTİFİKATORU
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'orderNumber',
      title: '🔢 Sifariş №',
      type: 'string',
      description: 'Avtomatik yaranır. Məs: RV-20240615-001',
      readOnly: true,
    },
    {
      name: 'status',
      title: '📊 Status',
      type: 'string',
      options: {
        list: [
          { title: '🟡 Gözləmədə',         value: 'pending' },
          { title: '🔨 İstehsaldadır',      value: 'manufacturing' },
          { title: '✅ Hazırdır',           value: 'ready' },
          { title: '🚚 Yoldadır',           value: 'in_transit' },
          { title: '🟢 Çatdırıldı',        value: 'delivered' },
          { title: '❌ Ləğv edildi',        value: 'cancelled' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    },
    {
      name: 'createdAt',
      title: '📅 Sifariş tarixi',
      type: 'datetime',
      readOnly: true,
    },

    // ╔══════════════════════════════════════════════════════════╗
    //  2. MÜŞTƏRİ MƏLUMATLARı
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'customer',
      title: '👤 Müştəri',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Ad Soyad',
          type: 'string',
        },
        {
          name: 'phone',
          title: 'Telefon (WhatsApp)',
          type: 'string',
        },
      ],
    },

    // ╔══════════════════════════════════════════════════════════╗
    //  3. MƏHSUL SİYAHISI
    //     İstehsalçıya yalnız bu bölmə göndərilir.
    //     Qiymət məlumatları göndərilmir.
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'items',
      title: '📦 Sifariş edilən məhsullar',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'productName',
              title: 'Məhsul adı',
              type: 'string',
            },
            {
              name: 'modelName',
              title: 'Model',
              type: 'string',
            },
            {
              name: 'colorName',
              title: 'Rəng',
              type: 'string',
            },
            {
              name: 'quantity',
              title: 'Say',
              type: 'number',
              initialValue: 1,
            },
            {
              name: 'unitPrice',
              title: 'Vahid qiymət (₼)',
              type: 'number',
            },
            {
              name: 'customText',
              title: '✏️ Yazı / Qravür mətni',
              type: 'string',
              description: 'Müştərinin yazdırmaq istədiyi mətn',
            },
            {
              name: 'specialRequest',
              title: '📝 Xüsusi istək',
              type: 'text',
            },
            // Qutu seçimi
            {
              name: 'boxName',
              title: '📦 Qutu növü',
              type: 'string',
            },
            {
              name: 'boxPrice',
              title: '📦 Qutu qiyməti (₼)',
              type: 'number',
              initialValue: 0,
            },
          ],
          preview: {
            select: {
              productName: 'productName',
              modelName:   'modelName',
              colorName:   'colorName',
              quantity:    'quantity',
              customText:  'customText',
            },
            prepare({ productName, modelName, colorName, quantity, customText }) {
              const variant = [modelName, colorName].filter(Boolean).join(' / ')
              const text    = customText ? ` · "${customText}"` : ''
              return {
                title:    `${quantity}x ${productName || 'Məhsul'}`,
                subtitle: `${variant}${text}`,
              }
            },
          },
        },
      ],
    },

    // ╔══════════════════════════════════════════════════════════╗
    //  4. ÇATDIRıLMA MƏLUMATLARı
    //     Kuryerə yalnız bu bölmə göndərilir.
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'delivery',
      title: '🚚 Çatdırılma',
      type: 'object',
      fields: [
        {
          name: 'type',
          title: 'Çatdırılma növü',
          type: 'string',
          options: {
            list: [
              { title: '🚇 Metro ilə',   value: 'metro' },
              { title: '🏠 Ünvana',      value: 'address' },
            ],
            layout: 'radio',
          },
        },
        {
          name: 'metro',
          title: 'Metro stansiyası',
          type: 'string',
          hidden: ({ parent }) => parent?.type !== 'metro',
        },
        {
          name: 'address',
          title: 'Ünvan',
          type: 'text',
          hidden: ({ parent }) => parent?.type !== 'address',
        },
        {
          name: 'date',
          title: 'Çatdırılma tarixi',
          type: 'string',
          description: 'Məs: 15 İyun 2025 (Bazar ertəsi)',
        },
        {
          name: 'time',
          title: 'Saat',
          type: 'string',
          description: 'Məs: 14:00 - 16:00',
        },
      ],
    },

    // ╔══════════════════════════════════════════════════════════╗
    //  5. MALİYYƏ MƏLUMATLARı — YALNIZ SƏNİN ÜÇÜN
    //     İstehsalçıya və kuryerə bu bölmə göndərilmir.
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'financial',
      title: '💰 Maliyyə (kommersiya sirri)',
      type: 'object',
      description: '⚠️ Bu məlumatlar heç kimə göndərilmir — yalnız sən görürsən.',
      fields: [
        {
          name: 'subtotal',
          title: 'Araşdırma (məhsul) cəmi (₼)',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'discountAmount',
          title: 'Endirim məbləği (₼)',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'couponCode',
          title: 'Kupon kodu',
          type: 'string',
        },
        {
          name: 'couponDiscount',
          title: 'Kupon endirimi (₼)',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'deliveryFee',
          title: 'Çatdırılma haqqı (₼)',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'total',
          title: '💳 Ümumi məbləğ (₼)',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'deposit',
          title: '✅ Ödənilmiş (₼)',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'remaining',
          title: '⏳ Qalan məbləğ (₼)',
          type: 'number',
          initialValue: 0,
        },
        {
          name: 'paymentMethod',
          title: 'Ödəniş üsulu',
          type: 'string',
          options: {
            list: [
              { title: 'Kart-karta',         value: 'card' },
              { title: 'Nağd (kuryer zamanı)', value: 'cash' },
              { title: 'PayRiff',             value: 'payriff' },
            ],
          },
        },
      ],
    },

    // ╔══════════════════════════════════════════════════════════╗
    //  6. İŞ TƏRƏFDAŞLARI
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'manufacturer',
      title: '🔧 İstehsalçı',
      type: 'reference',
      to: [{ type: 'manufacturer' }],
      description: 'Sifarişi kim hazırlayacaq? Seçdikdən sonra "İstehsalçıya Göndər" düyməsi aktiv olur.',
    },
    {
      name: 'courierProvider',
      title: '🚚 Kuryer',
      type: 'reference',
      to: [{ type: 'courierProvider' }],
      description: 'Sifarişi kim çatdıracaq? Seçdikdən sonra "Kuryerə Göndər" düyməsi aktiv olur.',
    },

    // ╔══════════════════════════════════════════════════════════╗
    //  7. ZAMAN DAMĞALARI (avtomatik doldurulur)
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'sentToManufacturerAt',
      title: '📤 İstehsalçıya göndərilmə tarixi',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'readyAt',
      title: '✅ Hazır olma tarixi',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'sentToCourierAt',
      title: '🚚 Kuryerə göndərilmə tarixi',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'deliveredAt',
      title: '🟢 Çatdırılma tarixi',
      type: 'datetime',
      readOnly: true,
    },

    // ╔══════════════════════════════════════════════════════════╗
    //  8. QEYDLƏR
    // ╚══════════════════════════════════════════════════════════╝
    {
      name: 'ownerNotes',
      title: '📝 Sahibkar qeydi',
      type: 'text',
      description: 'Öz özünə qeyd. İstehsalçıya göndəriləcək (xüsusi istək kimi).',
      placeholder: 'Məs: Bu müştərini xüsusi qutuda göndər, tələsik istehsal lazımdır...',
    },
  ],

  // ── STUDIO-DA GÖRÜNÜŞ ─────────────────────────────────────
  preview: {
    select: {
      orderNumber:  'orderNumber',
      status:       'status',
      customerName: 'customer.name',
      total:        'financial.total',
      createdAt:    'createdAt',
    },
    prepare({ orderNumber, status, customerName, total, createdAt }) {
      const statusMap = {
        pending:       '🟡 Gözləmədə',
        manufacturing: '🔨 İstehsaldadır',
        ready:         '✅ Hazırdır',
        in_transit:    '🚚 Yoldadır',
        delivered:     '🟢 Çatdırıldı',
        cancelled:     '❌ Ləğv edildi',
      }
      const date = createdAt
        ? new Date(createdAt).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short' })
        : ''
      return {
        title:    `${statusMap[status] || status} · ${orderNumber || 'Yeni sifariş'}`,
        subtitle: `${customerName || 'Müştəri'} · ${total ? total + ' ₼' : ''} · ${date}`,
      }
    },
  },

  // ── SIRALAMA (Studio-da ən yeni əvvəldə) ──────────────────
  orderings: [
    {
      title: 'Tarixə görə (yeni əvvəl)',
      name:  'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Statusa görə',
      name:  'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
}