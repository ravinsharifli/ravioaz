export default {
  name: 'product',
  title: 'Məhsul',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Məhsulun Adı',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'slug',
      title: '🔗 URL (slug)',
      type: 'slug',
      description: 'Məhsulun saytdakı linki. "Generate" düyməsinə bas — avtomatik yaranır.',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: input =>
          input
            .toLowerCase()
            .replace(/ə/g, 'e')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ğ/g, 'g')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 96),
      },
      validation: Rule => Rule.required(),
    },
    {
      name: 'category',
      title: 'Kateqoriya',
      type: 'reference',
      to: [{type: 'category'}],
    },
    {
      name: 'description',
      title: 'Məhsul haqqında',
      type: 'text',
    },

    // 📦 QUTU SEÇİMİ
    {
      name: 'allowBoxSelection',
      title: '📦 Qutu seçimi aktiv olsun?',
      type: 'boolean',
      description: 'AÇIN — bijuteriya, qolbaq, təsbeh kimi məhsullar üçün. BAĞLAYIN — qutu seçimi lazım olmayan məhsullar üçün.',
      initialValue: true,
    },
    {
      name: 'customBoxOptions',
      title: '📦 Bu məhsula özəl qutu seçimləri',
      type: 'array',
      description: 'Boş buraxsanız — Sayt Tənzimləmələrindəki ümumi qutular göstərilir. Doldursanız — yalnız buradakı qutular göstərilir.',
      hidden: ({ document }) => document?.allowBoxSelection === false,
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'id',
              title: 'ID (unikal, məs: simple, orta, premium)',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'name',
              title: 'Qutu adı (müştəriyə görünür)',
              type: 'string',
              description: 'Məs: Sadə qutu, Gümüş qutu, Premium qutu',
              validation: Rule => Rule.required(),
            },
            {
              name: 'desc',
              title: 'Qısa açıqlama',
              type: 'string',
              description: 'Məs: Standart qablaşdırma, Lent + köpük yastıq',
            },
            {
              name: 'price',
              title: 'Qiymət (₼) — 0 = pulsuz',
              type: 'number',
              initialValue: 0,
              validation: Rule => Rule.required().min(0),
            },
            {
              name: 'image',
              title: '📸 Qutu şəkli',
              type: 'image',
              options: { hotspot: true },
              description: 'Müştəri bu şəkli görüb seçim edəcək',
            },
            {
              name: 'isActive',
              title: 'Aktiv?',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'price',
              isActive: 'isActive',
              media: 'image',
            },
            prepare({ title, subtitle, isActive, media }) {
              return {
                title: `${isActive ? '✅' : '❌'} ${title || 'Qutu'}`,
                subtitle: subtitle === 0 ? 'Pulsuz' : `+${subtitle} ₼`,
                media,
              };
            },
          },
        },
      ],
    },

    // 🎨 VARİANTLAR
    {
      name: 'variants',
      title: '🎨 Variantlar (Model + Rəng + Şəkillər)',
      type: 'array',
      description: 'Hər variant üçün model, rəng, 1-3 şəkil, qiymət və stok daxil edin.',
      validation: Rule => Rule.min(1).max(10).required(),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'modelName',
              title: 'Model adı (məcburi deyil)',
              type: 'string',
            },
            {
              name: 'colorName',
              title: 'Rəng adı (məcburi deyil)',
              type: 'string',
            },
            {
              name: 'images',
              title: '📸 Şəkillər (1-3 ədəd)',
              type: 'array',
              validation: Rule => Rule.min(1).max(3).required(),
              of: [{ type: 'image', options: { hotspot: true } }],
            },
            {
              name: 'price',
              title: 'Əsas qiymət (AZN)',
              type: 'number',
              validation: Rule => Rule.required().min(0),
            },
            {
              name: 'discountPrice',
              title: 'Endirimli qiymət (AZN) - məcburi deyil',
              type: 'number',
            },
            {
              name: 'stock',
              title: 'Stok sayı',
              type: 'number',
              validation: Rule => Rule.min(0).integer().required(),
              initialValue: 0
            }
          ],
          preview: {
            select: {
              modelName: 'modelName',
              colorName: 'colorName',
              stock: 'stock',
              price: 'price',
              discountPrice: 'discountPrice',
              media: 'images.0'
            },
            prepare({ modelName, colorName, stock, price, discountPrice, media }) {
              const model = modelName || '-';
              const color = colorName || '-';
              const stockBadge = stock === 0 ? '❌ Bitib' : stock < 20 ? `⚠️ ${stock} əd` : `✅ ${stock} əd`;
              const priceText = discountPrice ? `${discountPrice} AZN` : `${price} AZN`;
              return {
                title: `${model} | ${color}`,
                subtitle: `${priceText} | ${stockBadge}`,
                media
              }
            }
          }
        }
      ]
    },

    // ⭐ ƏN ÇOX SATILANLAR
    {
      name: 'isBestSeller',
      title: '⭐ Ən çox satılan?',
      type: 'boolean',
      description: 'Açın — \"Ən çox satılanlar\" bölməsində görünsün.',
      initialValue: false,
    },
    {
      name: 'bestSellerOrder',
      title: 'Ən çox satılan sırası (1, 2, 3...)',
      type: 'number',
      description: 'Kiçik rəqəm — əvvəldə görünür.',
      hidden: ({ document }) => !document?.isBestSeller,
    },
    {
      name: 'orderCount',
      title: '📦 Ümumi sifariş sayı (avtomatik artır)',
      type: 'number',
      description: 'Hər sifarişdə avtomatik artır. Çox olduqda \"Ən çox satılan\"a düşür.',
      initialValue: 0,
      readOnly: false,
    },

    // 💰 KƏMİYYƏT ENDİRİMİ
    {
      name: 'hasBulkDiscount',
      title: '💰 Kəmiyyətə görə endirim var?',
      type: 'boolean',
      description: 'Açın — say artdıqca endirim tətbiq olunur.',
      initialValue: false,
    },
    {
      name: 'bulkDiscountNote',
      title: 'Endirim bildirişi (qırmızı yazı ilə göstərilir)',
      type: 'string',
      description: 'Məs: \"2+ sifariş etdikdə xüsusi endirim əldə et!\"',
      hidden: ({ document }) => !document?.hasBulkDiscount,
    },
    {
      name: 'bulkTiers',
      title: 'Kəmiyyət pillələri',
      type: 'array',
      description: 'Hər pillə üçün minimum say və endirim məbləği (AZN) yazın.',
      hidden: ({ document }) => !document?.hasBulkDiscount,
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'minQty',
              title: 'Minimum say (məs: 1, 11, 21)',
              type: 'number',
              validation: Rule => Rule.required().min(1).integer(),
            },
            {
              name: 'maxQty',
              title: 'Maksimum say (məs: 10, 20 — sonsuz üçün boş burax)',
              type: 'number',
              description: 'Boş buraxsanız \"və daha çox\" mənasını verir.',
            },
            {
              name: 'discountAmount',
              title: 'Endirim məbləği (AZN) — hər ədədə',
              type: 'number',
              description: 'Məs: 2 yazsan — hər ədəddən 2 AZN endirim.',
              validation: Rule => Rule.required().min(0),
            },
            {
              name: 'label',
              title: 'Göstəriləcək mətn (məs: \"1-10 ədəd\")',
              type: 'string',
            },
          ],
          preview: {
            select: {
              minQty: 'minQty',
              maxQty: 'maxQty',
              discountAmount: 'discountAmount',
              label: 'label',
            },
            prepare({ minQty, maxQty, discountAmount, label }) {
              const range = maxQty ? `${minQty}-${maxQty} ədəd` : `${minQty}+ ədəd`;
              return {
                title: label || range,
                subtitle: `Hər ədəddən -${discountAmount} AZN endirim`,
              }
            }
          }
        }
      ],
    },

    // 🎟 MƏHSULA ÖZƏL ENDİRİM KODLARI
    {
      name: 'coupons',
      title: '🎟 Bu məhsula özəl endirim kodları',
      type: 'array',
      description:
        'Bu məhsul üçün xüsusi endirim kodları. Hər kod yalnız bu məhsulda işləyəcək. ' +
        'Kodu müştəriyə WhatsApp/İnstagram ilə yolla.',
      of: [
        {
          type: 'object',
          name: 'coupon',
          title: 'Kupon',
          fields: [
            {
              name: 'code',
              title: '🔑 Kupon kodu',
              type: 'string',
              description: 'Məs: RAVIO10, HEDIYYE5 — böyük hərflər tövsiyə edilir',
              validation: Rule => Rule.required(),
            },
            {
              name: 'discountType',
              title: '📐 Endirim növü',
              type: 'string',
              options: {
                list: [
                  { title: '💰 Sabit məbləğ (₼)', value: 'fixed' },
                  { title: '📊 Faiz (%)',           value: 'percent' },
                ],
                layout: 'radio',
              },
              initialValue: 'fixed',
              validation: Rule => Rule.required(),
            },
            {
              name: 'discountValue',
              title: '💵 Endirim miqdarı',
              type: 'number',
              description:
                'Sabit növ seçilsə: neçə manat (məs: 5 → 5₼ endirim). ' +
                'Faiz növü seçilsə: neçə faiz (məs: 10 → 10% endirim).',
              validation: Rule => Rule.required().min(1),
            },
            {
              name: 'minOrderAmount',
              title: '🛒 Minimum sifariş məbləği (₼)',
              type: 'number',
              description: '0 qoysan — məbləğ limiti olmur.',
              initialValue: 0,
            },
            {
              name: 'isActive',
              title: '✅ Aktiv?',
              type: 'boolean',
              initialValue: true,
              description: 'Söndürsən — müştəri bu kodu istifadə edə bilməz',
            },
            {
              name: 'description',
              title: '📝 Qeyd (yalnız sənin üçün)',
              type: 'string',
              description: 'Məs: 5 manat endirim kodu, Dostuna göndərildi',
            },
          ],
          preview: {
            select: {
              code:          'code',
              discountType:  'discountType',
              discountValue: 'discountValue',
              isActive:      'isActive',
              minOrder:      'minOrderAmount',
            },
            prepare({ code, discountType, discountValue, isActive, minOrder }) {
              const amount =
                discountType === 'percent'
                  ? `${discountValue}% endirim`
                  : `${discountValue}₼ endirim`;
              const minStr = minOrder > 0 ? ` · Min: ${minOrder}₼` : '';
              return {
                title:    `${isActive ? '✅' : '❌'} ${code || 'Kod'}`,
                subtitle: `${amount}${minStr}`,
              };
            },
          },
        },
      ],
    },

    // ⭐ MÜŞTƏRİ RƏYLƏRİ (bu məhsula aid)
    {
      name: 'reviews',
      title: '⭐ Müştəri rəyləri',
      type: 'array',
      description: 'Bu məhsulu almış müştərilərin real rəyləri. Boş buraxsanız — saytda rəy bölməsi görünməz.',
      of: [
        {
          type: 'object',
          name: 'review',
          title: 'Rəy',
          fields: [
            {
              name: 'name',
              title: '👤 Müştəri adı',
              type: 'string',
              description: 'Məsələn: Aytən M.',
              validation: Rule => Rule.required(),
            },
            {
              name: 'rating',
              title: '⭐ Reytinq',
              type: 'number',
              initialValue: 5,
              options: {
                list: [
                  { title: '⭐⭐⭐⭐⭐ — 5 (Əla)', value: 5 },
                  { title: '⭐⭐⭐⭐ — 4 (Yaxşı)', value: 4 },
                  { title: '⭐⭐⭐ — 3 (Orta)', value: 3 },
                  { title: '⭐⭐ — 2', value: 2 },
                  { title: '⭐ — 1', value: 1 },
                ],
                layout: 'radio',
              },
              validation: Rule => Rule.required(),
            },
            {
              name: 'text',
              title: '💬 Rəy mətni',
              type: 'text',
              rows: 3,
              validation: Rule => Rule.required().min(5).max(500),
            },
            {
              name: 'date',
              title: '📅 Tarix',
              type: 'string',
              description: 'Məsələn: May 2026',
              validation: Rule => Rule.required(),
            },
            {
              name: 'photo',
              title: '📷 Real məhsul şəkli (istəyə bağlı)',
              type: 'image',
              description: 'Müştərinin aldığı məhsulun fotoşəkli.',
              options: { hotspot: true },
            },
            {
              name: 'isActive',
              title: '✅ Saytda göstərilsin?',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'text',
              media: 'photo',
              rating: 'rating',
              isActive: 'isActive',
            },
            prepare({ title, subtitle, media, rating, isActive }) {
              const stars = '⭐'.repeat(rating || 5);
              return {
                title: `${isActive ? '✅' : '❌'} ${title} ${stars}`,
                subtitle: (subtitle || '').slice(0, 60),
                media,
              };
            },
          },
        },
      ],
    },

    // PREMIUM
    {
      name: 'isPremium',
      title: '💎 Premium məhsuldur?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'premiumOrder',
      title: 'Premium sırası',
      type: 'number',
      hidden: ({ document }) => !document?.isPremium,
    },
    {
      name: 'premiumSize',
      title: 'Premium ölçüsü',
      type: 'string',
      options: {
        list: [
          { title: 'Böyük (Sol 50%)', value: 'large' },
          { title: 'Kiçik (Sağ üst 25%)', value: 'small-top' },
          { title: 'Kiçik (Sağ alt 25%)', value: 'small-bottom' },
        ],
      },
      hidden: ({ document }) => !document?.isPremium,
      initialValue: 'large',
    },
  ],
  preview: {
    select: {
      title: 'name',
      isPremium: 'isPremium',
      isBestSeller: 'isBestSeller',
      hasBulkDiscount: 'hasBulkDiscount',
      allowBoxSelection: 'allowBoxSelection',
      variants: 'variants',
    },
    prepare(selection) {
      const { title, isPremium, isBestSeller, hasBulkDiscount, allowBoxSelection, variants } = selection;
      const variantList = variants && Array.isArray(variants) ? variants : [];
      const totalStock = variantList.reduce((sum, v) => sum + (v?.stock || 0), 0);
      const badges = [
        isPremium ? '💎' : '',
        isBestSeller ? '⭐' : '',
        hasBulkDiscount ? '💰' : '',
        allowBoxSelection === false ? '🚫📦' : '📦',
      ].filter(Boolean).join(' ');
      return {
        title: `${badges ? badges + ' ' : ''}${title || 'Məhsul'}`,
        subtitle: `Ümumi stok: ${totalStock} əd`,
      }
    },
  },
}