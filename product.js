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
      name: 'image',
      title: 'Şəkil',
      type: 'image',
      options: {
        hotspot: true,
      },
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
      media: 'image',
      isPremium: 'isPremium',
    },
    prepare({ title, price, discountPrice, media, isPremium }) {
      const discount = discountPrice && price ? Math.round(((price - discountPrice) / price) * 100) : 0;
      const priceText = discountPrice 
        ? `${discountPrice} AZN (${discount}% endirim)` 
        : `${price} AZN`;
      
      return {
        title: title,
        subtitle: `${priceText} ${isPremium ? '⭐ Premium' : ''}`,
        media: media,
      }
    },
  },
}