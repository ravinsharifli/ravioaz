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
      description: 'AÇIN — bijuteriya, qolbaq, giftbox kimi məhsullar üçün. BAĞLAYIN — hoodie, köynək, libas kimi məhsullar üçün qutu seçimi görünməsin.',
      initialValue: true,
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
      description: 'Açın — "Ən çox satılanlar" bölməsində görünsün.',
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
      description: 'Hər sifarişdə avtomatik artır. Çox olduqda "Ən çox satılan"a düşür.',
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
      description: 'Məs: "2+ sifariş etdikdə xüsusi endirim əldə et!"',
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
              description: 'Boş buraxsanız "və daha çox" mənasını verir.',
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
              title: 'Göstəriləcək mətn (məs: "1-10 ədəd")',
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