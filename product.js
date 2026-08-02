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

    // ⭐ MÜŞTƏRİ RƏYLƏRİ
    {
      name: 'reviews',
      title: '⭐ Müştəri rəyləri',
      type: 'array',
      description:
        'Bu məhsulu almış müştərilərin real rəyləri. Boş buraxsanız — saytda rəy bölməsi görünməz.',
      of: [{ type: 'productReview' }],
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
              name: 'colorSwatch',
              title: '🎨 Rəng nümunəsi (saytda dairə kimi görünür)',
              description: 'Bu rəngin saytda dairə şəklində görünəcək tonu. Naxışlı/qarışıq rənglər üçün ən yaxın tonu seçin (məs. naxışlı qızılı Zippo üçün qızılı ton).',
              type: 'color',
              options: { disableAlpha: true },
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
              name: 'costPrice',
              title: '🔒 Alış qiyməti (₼) — DAXİLİ, saytda görünmür',
              type: 'number',
              description: 'YALNIZ CEO/idarəetmə üçün. Bu sahə frontend kodunda istifadə olunmur və müştəriyə göstərilmir — yalnız qiymət hesablaması üçündür.',
              validation: Rule => Rule.min(0),
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
              colorSwatch: 'colorSwatch',
              stock: 'stock',
              price: 'price',
              discountPrice: 'discountPrice',
              costPrice: 'costPrice',
              media: 'images.0'
            },
            prepare({ modelName, colorName, colorSwatch, stock, price, discountPrice, costPrice, media }) {
              const model = modelName || '-';
              const swatchHex = colorSwatch?.hex;
              const color = colorName ? `${swatchHex ? '●' : ''} ${colorName}`.trim() : '-';
              const stockBadge = stock === 0 ? '❌ Bitib' : stock < 20 ? `⚠️ ${stock} əd` : `✅ ${stock} əd`;
              const priceText = discountPrice ? `${discountPrice} AZN` : `${price} AZN`;
              const effectivePrice = discountPrice || price;
              const marginBadge = (costPrice != null && effectivePrice != null)
                ? ` | 🔒 Qazanc: ${(effectivePrice - costPrice).toFixed(2)}₼`
                : '';
              return {
                title: `${model} | ${color}`,
                subtitle: `${priceText} | ${stockBadge}${marginBadge}`,
                media
              }
            }
          }
        }
      ]
    },

    // 💰 KƏMİYYƏT ENDİRİMİ (2-10 ədəd arası, sabit aralıq)
    {
      name: 'hasBulkDiscount',
      title: '💰 2-10 ədəd arası endirim aktivdirmi?',
      type: 'boolean',
      description: 'Açın — müştəri 2-10 ədəd sifariş etdikdə hər ədəddən aşağıdakı məbləğ endirim olunur.',
      initialValue: false,
    },
    {
      name: 'bulkDiscountAmount',
      title: 'Hər ədədə endirim məbləği (₼)',
      type: 'number',
      description: 'Məs: 1 yazsan — 2-10 ədəd sifarişdə hər ədəddən 1₼ endirim olunur. (10+ üçün kupon kodundan istifadə edin.)',
      hidden: ({ document }) => !document?.hasBulkDiscount,
      validation: Rule => Rule.min(0),
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

    // 🔑 AVTOMATLAŞDIRMA ÜÇÜN DAXİLİ AÇAR (Google Drive qovluq adı)
    // Make.com ssenarisi eyni qovluqdan gələn yeni rəng/model şəkillərini
    // yeni məhsul yaratmaq əvəzinə bu məhsula variant kimi əlavə edir.
    {
      name: 'sourceKey',
      title: '🔑 Mənbə açarı (Drive qovluq adı) — toxunma',
      type: 'string',
      description: 'Avtomatik doldurulur. Bu sahəni əl ilə dəyişməyin — Make.com bunu istifadə edərək eyni məhsulun rəng/model variantlarını tanıyır.',
      readOnly: true,
    },
  ],
  preview: {
    select: {
      title: 'name',
      hasBulkDiscount: 'hasBulkDiscount',
      allowBoxSelection: 'allowBoxSelection',
      variants: 'variants',
    },
    prepare(selection) {
      const { title, hasBulkDiscount, allowBoxSelection, variants } = selection;
      const variantList = variants && Array.isArray(variants) ? variants : [];
      const totalStock = variantList.reduce((sum, v) => sum + (v?.stock || 0), 0);
      const badges = [
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