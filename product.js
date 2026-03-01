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
      name: 'price',
      title: 'Əsas qiymət (AZN)',
      type: 'number',
      description: 'Köhnə qiymət - üzərindən xətt çəkiləcək',
    },
    {
      name: 'discountPrice',
      title: 'Endirimli qiymət (AZN)',
      type: 'number',
      description: 'Yeni qiymət - böyük göstəriləcək. Boş buraxsanız endirim olmayacaq.',
    },
    {
      name: 'description',
      title: 'Məhsul haqqında',
      type: 'text',
    },
    {
      name: 'images',
      title: '🖼 Şəkillər (minimum 1, maksimum 5)',
      type: 'array',
      description: 'Minimum 1, maksimum 5 şəkil yükləyin. İlk şəkil əsas şəkil olacaq.',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        }
      ],
      validation: Rule => Rule.min(1).max(5),
    },
    
    // 🎨 RƏNG VƏ STOK İDARƏSİ
    {
      name: 'colorVariants',
      title: '🎨 Rəng Variantları və Stok',
      type: 'array',
      description: 'Hər rəng üçün ayrıca stok sayını qeyd edin. Məsələn: Qızılı - 15 əd, Gümüşü - 8 əd',
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
              name: 'stock',
              title: 'Stok sayı',
              type: 'number',
              description: '0 yazın bitibsə.',
              validation: Rule => Rule.min(0).integer().required(),
              initialValue: 0
            }
          ],
          preview: {
            select: {
              title: 'colorName',
              stock: 'stock'
            },
            prepare({title, stock}) {
              const stockBadge = stock === 0 ? '❌ Bitib' : stock < 5 ? `⚠️ ${stock} əd` : `✅ ${stock} əd`;
              return {
                title: title,
                subtitle: stockBadge
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
      description: 'Əsas səhifədə Premium bölməsində göstərilsin?',
      initialValue: false,
    },
    {
      name: 'premiumOrder',
      title: 'Premium sırası',
      type: 'number',
      description: 'Premium bölməsində göstərilmə sırası (1=böyük, 2-3=kiçik)',
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
      price: 'price',
      discountPrice: 'discountPrice',
      media: 'images.0',
      isPremium: 'isPremium',
      colorVariants: 'colorVariants',
    },
    prepare({ title, price, discountPrice, media, isPremium, colorVariants }) {
      const discount = discountPrice && price ? Math.round(((price - discountPrice) / price) * 100) : 0;
      const priceText = discountPrice 
        ? `${discountPrice} AZN (${discount}% endirim)` 
        : `${price} AZN`;
      
      const totalStock = colorVariants ? colorVariants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0;
      const stockBadge = totalStock === 0 ? '❌ BİTİB' : totalStock < 10 ? `⚠️ ${totalStock} əd` : `✅ ${totalStock} əd`;
      
      return {
        title: title,
        subtitle: `${priceText} ${isPremium ? '⭐ Premium' : ''} | ${stockBadge}`,
        media: media,
      }
    },
  },
}