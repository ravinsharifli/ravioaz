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

    // 🎨 VARİANTLAR
    {
      name: 'variants',
      title: '🎨 Variantlar (Model + Rəng + Şəkillər)',
      type: 'array',
      description: 'Hər variant üçün model, rəng, 1-3 şəkil, qiymət və stok (aç/bağla) daxil edin.',
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
              title: '🎨 Rəng',
              description: 'Siyahıdan seç — dairə rəngi özü avtomatik təyin olunur, ayrıca hex seçməyə ehtiyac yoxdur. Siyahıda olmayan rəng lazımdırsa mənə yaz, siyahıya əlavə edim.',
              type: 'string',
              options: {
                list: [
                  { title: 'Qara', value: 'Qara' },
                  { title: 'Ağ', value: 'Ağ' },
                  { title: 'Gümüşü', value: 'Gümüşü' },
                  { title: 'Qızılı', value: 'Qızılı' },
                  { title: 'Qırmızı', value: 'Qırmızı' },
                  { title: 'Mavi', value: 'Mavi' },
                  { title: 'Sarı', value: 'Sarı' },
                  { title: 'Çəhrayı', value: 'Çəhrayı' },
                  { title: 'Bənövşəyi', value: 'Bənövşəyi' },
                  { title: 'Yaşıl', value: 'Yaşıl' },
                  { title: 'Göy (Milyoner)', value: 'Göy (Milyoner)' },
                  { title: 'Qara - Qızılı', value: 'Qara - Qızılı' },
                  { title: 'Ağ - Qızılı', value: 'Ağ - Qızılı' },
                  { title: 'Ağ - Qara', value: 'Ağ - Qara' },
                  { title: 'Qızılı - Qəhvəyi', value: 'Qızılı - Qəhvəyi' },
                ],
              },
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
              name: 'inStock',
              title: 'Stokda var?',
              type: 'boolean',
              description: 'Söndürsən — bu variant saytda "Bitib" kimi görünür və sifariş edilə bilməz.',
              initialValue: true,
            }
          ],
          preview: {
            select: {
              modelName: 'modelName',
              colorName: 'colorName',
              inStock: 'inStock',
              price: 'price',
              discountPrice: 'discountPrice',
              costPrice: 'costPrice',
              media: 'images.0'
            },
            prepare({ modelName, colorName, inStock, price, discountPrice, costPrice, media }) {
              const model = modelName || '-';
              const color = colorName ? `● ${colorName}` : '-';
              const stockBadge = inStock === false ? '❌ Bitib' : '✅ Stokda';
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

    // 🎟 MƏHSULA ÖZƏL ENDİRİM KODU (istəyəndə aç, məcburi deyil)
    {
      name: 'hasCoupons',
      title: '🎟 Bu məhsulda endirim kodu olsun?',
      type: 'boolean',
      initialValue: false,
      description: 'Açsan aşağıda kod və məbləğ yaza bilərsən. Söndürsən — kupon sahəsi tamam gizlənir.',
    },
    {
      name: 'coupons',
      title: '🎟 Endirim kodları',
      type: 'array',
      hidden: ({ parent }) => !parent?.hasCoupons,
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
              description: 'Məs: RAVIO10 — böyük hərflər tövsiyə edilir',
              validation: Rule => Rule.required(),
            },
            {
              name: 'discountValue',
              title: '💵 Endirim məbləği (₼)',
              type: 'number',
              description: 'Neçə manat endirim ediləcək.',
              validation: Rule => Rule.required().min(1),
            },
          ],
          preview: {
            select: { code: 'code', discountValue: 'discountValue' },
            prepare({ code, discountValue }) {
              return {
                title: code || 'Kod',
                subtitle: `${discountValue ?? 0}₼ endirim`,
              };
            },
          },
        },
      ],
    },

    // 📦 QUTU SEÇİMLƏRİ — hər məhsul üçün ayrıca (boyunbağı qutusu ≠ üzük qutusu)
    {
      name: 'allowBoxSelection',
      title: '📦 Fərqli qutu seçimi aktivdir?',
      type: 'boolean',
      initialValue: false,
      fieldset: 'boxOptions',
      description: 'Aşağıda bu məhsula ən azı 1 qutu əlavə etsən, saytda "Əlavə ödənişlə fərqli qutu istəyirsiz?" sualı avtomatik görünəcək. Qutu siyahısı boşdursa, bu aç/bağla nə olursa olsun sualı görünmür.',
    },
    {
      name: 'customBoxOptions',
      title: '📦 Qutu variantları',
      type: 'array',
      fieldset: 'boxOptions',
      of: [
        {
          type: 'object',
          name: 'boxOption',
          title: 'Qutu',
          fields: [
            {
              name: 'id',
              title: 'ID (məcburi deyil, boş saxlaya bilərsən)',
              type: 'string',
            },
            {
              name: 'name',
              title: 'Ad',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'desc',
              title: 'Qısa açıqlama (məcburi deyil)',
              type: 'string',
            },
            {
              name: 'price',
              title: 'Əlavə qiymət (₼) — 0 yazsan "Pulsuz" görünür',
              type: 'number',
              validation: Rule => Rule.required().min(0),
            },
            {
              name: 'image',
              title: 'Qutunun şəkli',
              type: 'image',
              options: { hotspot: true },
            },
            {
              name: 'isActive',
              title: 'Saytda göstər?',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: { title: 'name', price: 'price', media: 'image', isActive: 'isActive' },
            prepare({ title, price, media, isActive }) {
              return {
                title: title || 'Qutu',
                subtitle: `${price ?? 0} ₼${isActive === false ? ' · ❌ Deaktiv' : ''}`,
                media,
              };
            },
          },
        },
      ],
    },

    // 💬 MÜŞTƏRİ RƏYLƏRİ (məhsul səhifəsində göstərilir)
    {
      name: 'reviews',
      title: '💬 Rəylər',
      type: 'array',
      fieldset: 'reviewsField',
      of: [
        {
          type: 'object',
          name: 'review',
          title: 'Rəy',
          fields: [
            {
              name: 'name',
              title: 'Müştərinin adı',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'rating',
              title: 'Reytinq (1-5)',
              type: 'number',
              validation: Rule => Rule.min(1).max(5),
            },
            {
              name: 'text',
              title: 'Rəy mətni',
              type: 'text',
              validation: Rule => Rule.required(),
            },
            {
              name: 'date',
              title: 'Tarix (məcburi deyil, sərbəst mətn)',
              type: 'string',
            },
            {
              name: 'photo',
              title: 'Müştəri şəkli (məcburi deyil)',
              type: 'image',
            },
            {
              name: 'isActive',
              title: 'Saytda göstər?',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: { title: 'name', rating: 'rating', text: 'text', media: 'photo' },
            prepare({ title, rating, text, media }) {
              return {
                title: `${title || 'Müştəri'} ${rating ? `(${rating}★)` : ''}`,
                subtitle: text,
                media,
              };
            },
          },
        },
      ],
    },

    // 🔑 AVTOMATLAŞDIRMA ÜÇÜN DAXİLİ AÇAR (Google Drive qovluq adı)
    {
      name: 'sourceKey',
      title: 'Mənbə açarı (Drive qovluq adı)',
      type: 'string',
      description: 'Avtomatik doldurulur. Bu sahəni əl ilə dəyişməyin — Make.com bunu istifadə edərək eyni məhsulun rəng/model variantlarını tanıyır.',
      readOnly: true,
      fieldset: 'technical',
    },
  ],

  fieldsets: [
    {
      name: 'boxOptions',
      title: '📦 Qutu Seçimləri',
      description: 'Yalnız bu məhsula uyğun qutuları əlavə et (boyunbağı qutusu üzük qutusu ilə eyni olmaya bilər). Boş saxlasan, saytda heç bir qutu sualı göstərilmir.',
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'reviewsField',
      title: '💬 Rəylər',
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'technical',
      title: '⚙️ Texniki (toxunma)',
      options: { collapsible: true, collapsed: true },
    },
  ],
  preview: {
    select: {
      title: 'name',
      variants: 'variants',
    },
    prepare(selection) {
      const { title, variants } = selection;
      const variantList = variants && Array.isArray(variants) ? variants : [];
      const inStockCount = variantList.filter(v => v?.inStock !== false).length;
      const subtitle = variantList.length
        ? (inStockCount === 0 ? '❌ Hamısı bitib' : `✅ ${inStockCount}/${variantList.length} variant stokda`)
        : 'Variant yoxdur';
      return {
        title: title || 'Məhsul',
        subtitle,
      }
    },
  },
}