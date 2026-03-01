export default {
  name: 'product',
  title: 'Məhsul',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Məhsulun Adı',
      type: 'string',
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


    // 🎨 RƏNG VARİANTLARI
    {
      name: 'colorVariants',
      title: '🎨 Rəng Variantları (şəkil + qiymət + stok)',
      type: 'array',
      description: 'Hər rəng üçün şəkil, qiymət və stok daxil edin. Maksimum 5.',
      validation: Rule => Rule.max(5),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'colorName',
              title: 'Rəng adı',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'image',
              title: 'Şəkil (bu rəng üçün)',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'price',
              title: 'Əsas qiymət (AZN) — üzərindən xətt çəkilir',
              type: 'number',
              validation: Rule => Rule.required().min(0),
            },
            {
              name: 'discountPrice',
              title: 'Endirimli qiymət (AZN) — böyük göstərilir',
              type: 'number',
              description: 'Boş buraxsanız endirim olmayacaq.',
            },
            {
              name: 'stock',
              title: 'Stok sayı (0 = bitib)',
              type: 'number',
              validation: Rule => Rule.min(0).integer().required(),
              initialValue: 0
            }
          ],
          preview: {
            select: {
              title: 'colorName',
              stock: 'stock',
              price: 'price',
              discountPrice: 'discountPrice',
              media: 'image'
            },
            prepare({ title, stock, price, discountPrice, media }) {
              const stockBadge = stock === 0 ? '❌ Bitib' : stock < 20 ? `⚠️ ${stock} əd` : `✅ ${stock} əd`;
              const priceText = discountPrice ? `${discountPrice} AZN` : price ? `${price} AZN` : '';
              return {
                title: title,
                subtitle: `${priceText} | ${stockBadge}`,
                media: media
              }
            }
          }
        }
      ]
    },

    {
      name: 'isPremium',
      title: 'Premium məhsuldur?',
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
      media: 'colorVariants.0.image',
      isPremium: 'isPremium',
      colorVariants: 'colorVariants',
    },
    prepare({ title, media, isPremium, colorVariants }) {
      const variants = colorVariants || [];
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const stockBadge = totalStock === 0 ? '❌ BİTİB' : totalStock < 10 ? `⚠️ ${totalStock} əd` : `✅ ${totalStock} əd`;
      const minPrice = variants.length > 0
        ? Math.min(...variants.map(v => v.discountPrice || v.price || 0))
        : 0;
      return {
        title: title,
        subtitle: `${minPrice} AZN-dən ${isPremium ? '⭐ Premium' : ''} | ${stockBadge}`,
        media: media,
      }
    },
  },
}