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

    // 🎨 VARİANTLAR (Model + Rəng + Şəkillər + Qiymət)
    {
      name: 'variants',
      title: '🎨 Variantlar (Model + Rəng + Şəkillər)',
      type: 'array',
      description: 'Hər variant üçün model, rəng, 1-3 şəkil, qiymət və stok daxil edin. Maksimum 10 variant.',
      validation: Rule => Rule.min(1).max(10).required(),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'modelName',
              title: 'Model adı (məcburi deyil)',
              type: 'string',
              description: 'Məs: Suni dəri, Original dəri, Rezin qolbaqlı. Boş buraxsanız "-" göstəriləcək.',
            },
            {
              name: 'colorName',
              title: 'Rəng adı (məcburi deyil)',
              type: 'string',
              description: 'Məs: Qara, Qızılı, Gümüşü. Boş buraxsanız "-" göstəriləcək.',
            },
            {
              name: 'images',
              title: '📸 Şəkillər (1-3 ədəd)',
              type: 'array',
              description: 'Bu variant üçün minimum 1, maksimum 3 şəkil yükləyin.',
              validation: Rule => Rule.min(1).max(3).required(),
              of: [
                {
                  type: 'image',
                  options: { hotspot: true },
                }
              ],
            },
            {
              name: 'price',
              title: 'Əsas qiymət (AZN)',
              type: 'number',
              description: 'Üzərindən xətt çəkiləcək qiymət. Məcburi.',
              validation: Rule => Rule.required().min(0),
            },
            {
              name: 'discountPrice',
              title: 'Endirimli qiymət (AZN) - məcburi deyil',
              type: 'number',
              description: 'Böyük göstəriləcək qiymət. Boş buraxsanız endirim olmayacaq.',
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
      variants: 'variants',
    },
    prepare(selection) {
      const { title, isPremium, variants } = selection;
      
      const variantList = variants && Array.isArray(variants) ? variants : [];
      const totalStock = variantList.reduce((sum, v) => sum + (v && v.stock ? v.stock : 0), 0);
      
      const variantSummary = variantList.map(v => {
        if (!v) return null;
        const model = v.modelName || '-';
        const color = v.colorName || '-';
        const stock = v.stock || 0;
        const stockText = stock === 0 ? 'Bitib' : `${stock} əd`;
        return `${model}|${color}: ${stockText}`;
      }).filter(Boolean);
      
      const subtitle = variantSummary.length > 0 
        ? `${isPremium ? '⭐ ' : ''}${variantSummary.join(' • ')}`
        : `${isPremium ? '⭐ ' : ''}Variant əlavə edilməyib`;
      
      return {
        title: title || 'Məhsul',
        subtitle: subtitle,
      }
    },
  },
}