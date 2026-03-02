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
      isPremium: 'isPremium',
      colorVariants: 'colorVariants',
    },
    prepare(selection) {
      const { title, isPremium, colorVariants } = selection;
      
      const variants = colorVariants && Array.isArray(colorVariants) ? colorVariants : [];
      
      // Hər rəng üçün ad və stok
      const colorStocks = variants.map(v => {
        if (!v || !v.colorName) return null;
        const stock = v.stock || 0;
        const stockText = stock === 0 ? 'Bitib' : `${stock} əd`;
        return `${v.colorName}: ${stockText}`;
      }).filter(Boolean);
      
      const subtitle = colorStocks.length > 0 
        ? `${isPremium ? '⭐ ' : ''}${colorStocks.join(' | ')}`
        : `${isPremium ? '⭐ ' : ''}Rəng əlavə edilməyib`;
      
      return {
        title: title || 'Məhsul',
        subtitle: subtitle,
      }
    },
  },
}