function generateTimeSlots() {
  const slots = [];
  for (let h = 6; h < 22; h++) {
    ['00', '15', '30', '45'].forEach(m => {
      slots.push(`${String(h).padStart(2, '0')}:${m}`);
    });
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

const ALL_DAYS = [
  { title: 'Bazar ertəsi',    value: 'Bazar ertəsi' },
  { title: 'Çərşənbə axşamı', value: 'Çərşənbə axşamı' },
  { title: 'Çərşənbə',        value: 'Çərşənbə' },
  { title: 'Cümə axşamı',     value: 'Cümə axşamı' },
  { title: 'Cümə',            value: 'Cümə' },
  { title: 'Şənbə',           value: 'Şənbə' },
  { title: 'Bazar',           value: 'Bazar' },
];

export default {
  name: 'siteSettings',
  title: 'Sayt Tənzimləmələri',
  type: 'document',
  __experimental_actions: ['update', 'publish'],

  fields: [

    {
      name: 'bulkDiscountPerUnit',
      title: '💰 2+ ədəddə hər ədədə endirim (₼)',
      type: 'number',
      description: 'Sayt boyu bütün məhsullar üçün eyni qayda: müştəri 2 və daha çox ədəd sifariş etdikdə hər ədəddən bu qədər ₼ avtomatik endirim olunur. Dəyişmək üçün kodu toxunmağa ehtiyac yoxdur — birbaşa buradan dəyiş.',
      initialValue: 1,
      validation: Rule => Rule.required().min(0),
    },

    {
      name: 'logo',
      title: '🖼 Loqo',
      type: 'image',
      options: { hotspot: true },
    },
    // ── METRO QRAFİKİ ─────────────────────────────────────────────
    {
      name: 'metroSchedule',
      title: '🚇 Metro Çatdırılma Qrafiki',
      type: 'array',
      description: '➕ Hər stansiya üçün BİR entry. Stansiya adını yaz, sonra aktiv günləri seç.',
      of: [
        {
          type: 'object',
          name: 'station',
          title: 'Stansiya',
          fields: [

            {
              name: 'name',
              title: '🚇 Stansiya adı',
              type: 'string',
              description: 'Məs: Neftçilər, 28 May, Nərimanov',
              validation: Rule => Rule.required(),
            },

            {
              name: 'isActive',
              title: '✅ Stansiya aktiv?',
              type: 'boolean',
              initialValue: true,
              description: 'Söndür = bu stansiyaya heç bir çatdırılma olmaz',
            },

            // ── GÜNLƏR + SAATLAR ──────────────────────────────────
            {
              name: 'daySchedules',
              title: '📅 Günlər və saatlar',
              type: 'array',
              description:
                '➕ Aktiv olan hər gün üçün sətir əlavə et. ' +
                'Əgər bütün gün boşdursa toggle-u yandır — saatları işarələməyə ehtiyac yoxdur. ' +
                'Əgər yalnız bəzi saatlar boşdursa toggle söndür, o saatları işarələ.',
              of: [
                {
                  type: 'object',
                  name: 'daySchedule',
                  title: 'Gün',
                  fields: [

                    // Günü seç
                    {
                      name: 'day',
                      title: '📆 Gün',
                      type: 'string',
                      options: {
                        list: ALL_DAYS,
                        layout: 'radio',
                        direction: 'horizontal',
                      },
                      validation: Rule => Rule.required(),
                    },

                    // Bütün gün boşdur toggle
                    {
                      name: 'allDayOpen',
                      title: '🟢 Bütün gün boşdur (bütün saatlar avtomatik açıq)',
                      type: 'boolean',
                      initialValue: true,
                      description:
                        'ON = bütün saatlar boşdur, müştəri istənilən saatı seçə bilər. ' +
                        'OFF = aşağıda yalnız boş saatları işarələ.',
                    },

                    // Seçilmiş boş saatlar (yalnız allDayOpen = false olduqda)
                    {
                      name: 'timeSlots',
                      title: '🕐 Boş saatlar (yalnız bəzi saatlar boşdursa işarələ)',
                      type: 'array',
                      description:
                        '⬆ Yuxarıda "Bütün gün boşdur" OFF olduqda istifadə et. ' +
                        'İşarəli = boş (müştəri seçə bilər). İşarəsiz = dolu.',
                      hidden: ({ parent }) => parent?.allDayOpen === true,
                      of: [{ type: 'string' }],
                      options: {
                        list: TIME_SLOTS.map(t => ({ title: t, value: t })),
                        layout: 'grid',
                      },
                    },

                  ],

                  preview: {
                    select: {
                      day:        'day',
                      allDayOpen: 'allDayOpen',
                      slots:      'timeSlots',
                    },
                    prepare({ day, allDayOpen, slots }) {
                      if (allDayOpen) {
                        return {
                          title:    day || 'Gün seçilməyib',
                          subtitle: '🟢 Bütün gün boşdur',
                        };
                      }
                      const count = slots?.length ?? 0;
                      const first = slots?.[0] ?? '';
                      const last  = slots?.[slots.length - 1] ?? '';
                      return {
                        title:    day || 'Gün seçilməyib',
                        subtitle: count > 0
                          ? `🕐 ${count} saat boş  (${first} – ${last})`
                          : '⚠️ Heç bir saat seçilməyib',
                      };
                    },
                  },
                },
              ],
            },

          ],

          preview: {
            select: {
              title:    'name',
              isActive: 'isActive',
              days:     'daySchedules',
            },
            prepare({ title, isActive, days }) {
              const count = days?.length ?? 0;
              return {
                title:    `${isActive ? '🚇' : '🚫'} ${title || 'Stansiya'}`,
                subtitle: isActive
                  ? `${count} gün konfiqurasiya edilib`
                  : 'Deaktiv',
              };
            },
          },
        },
      ],
    },


    // ── REAL İŞLƏR KARUSELİ ──────────────────────────────────────────────────
    // Hər gün/həftə hazırladığın məhsulun şəklini buraya yüklə.
    // Saytda hero karusel kimi görünür. Sanity-dən idarə olunur.
    {
      name: 'reelPosts',
      title: '📸 Real İşlər — Hazır Məhsul Karuselı',
      type: 'array',
      description:
        'Hər yeni məhsul hazırladıqda BİR sətir əlavə et. ' +
        'Şəkli yüklə, başlıq yaz, publish et — saytda dərhal görünür. ' +
        'Köhnə postları arxivlədə bilərsiniz (deaktiv et).',
      of: [
        {
          type: 'object',
          name: 'reelPost',
          title: 'Məhsul postu',
          fields: [
            {
              name: 'image',
              title: '📷 Şəkil (Canva/telefon şəkli)',
              type: 'image',
              options: { hotspot: true },
              description: 'İnstagram/TikTok üçün hazırladığın eyni şəkli bura yüklə.',
              validation: Rule => Rule.required(),
            },
            {
              name: 'label',
              title: '🏷 Etiket (sol üst künc)',
              type: 'string',
              description: 'Məs: ✨ Yeni · 🔥 Populyar · ❤️ Sevgi Hədiyyəsi',
              initialValue: '✨ Yeni iş',
            },
            {
              name: 'title',
              title: '📝 Başlıq',
              type: 'string',
              description: 'Məs: Personalizə edilmiş qolbaq',
              validation: Rule => Rule.required(),
            },
            {
              name: 'subtitle',
              title: '💬 Alt başlıq / qısa mətn',
              type: 'string',
              description: 'Məs: Lazer yazılı, hədiyyəlik qablaşdırma ilə',
            },
            {
              name: 'ctaText',
              title: '🔘 Düymə mətni',
              type: 'string',
              description: 'Məs: Sifariş et →',
              initialValue: 'Sifariş et →',
            },
            {
              name: 'product',
              title: '🔗 Bağlı məhsul (klik etdikdə açılsın)',
              type: 'reference',
              to: [{ type: 'product' }],
              description: 'Bu şəklə klik etdikdə hansı məhsul açılsın? Seç.',
            },
            {
              name: 'isActive',
              title: '✅ Aktiv (saytda görünsün)?',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: {
              title:    'title',
              subtitle: 'subtitle',
              media:    'image',
              isActive: 'isActive',
            },
            prepare({ title, subtitle, media, isActive }) {
              return {
                title:    `${isActive ? '✅' : '❌'} ${title || 'Başlıq yoxdur'}`,
                subtitle: subtitle || '',
                media,
              };
            },
          },
        },
      ],
    },

    // ── KAMPANİYA BANNERİ (Ana səhifə) ────────────────────────────────────────
    // Black Friday, 8 Mart, 8 Noyabr kimi kampaniya dönəmlərində ana səhifənin
    // "Məhsullarımız" başlığının yerinə çıxan banner. "Aktiv" söndürüləndə heç
    // nə dəyişmir — adi başlıq öz yerində qalır, sıfır risk.
    {
      name: 'campaignBanner',
      title: '📢 Kampaniya Banneri (Ana səhifə)',
      type: 'object',
      description:
        'Kampaniya dövründə (Black Friday, 8 Mart və s.) ana səhifədə "Məhsullarımız" ' +
        'başlığının yerinə çıxan banner. "Aktiv" söndürüləndə köhnə adi başlıq görünməyə davam edir.',
      fields: [
        {
          name: 'isActive',
          title: '✅ Aktiv (saytda göstər)?',
          type: 'boolean',
          initialValue: false,
          description: 'Kampaniya bitəndə söndür — məlumatı silməyə ehtiyac yoxdur, növbəti dəfə yenə aça bilərsən.',
        },
        {
          name: 'image',
          title: '🖼 Şəkil',
          type: 'image',
          options: { hotspot: true },
        },
        {
          name: 'title',
          title: '📝 Başlıq',
          type: 'string',
          description: 'Məs: Black Friday — bütün məhsullarda endirim',
        },
        {
          name: 'subtitle',
          title: '💬 Alt mətn',
          type: 'string',
          description: 'Məs: 24 Noyabra qədər',
        },
        {
          name: 'ctaText',
          title: '🔘 Düymə mətni',
          type: 'string',
          initialValue: 'İndi bax →',
        },
        {
          name: 'linkedProduct',
          title: '🔗 Bağlı məhsul (boş buraxsan → bütün məhsullar açılır)',
          type: 'reference',
          to: [{ type: 'product' }],
          description:
            'Kampaniya konkret bir məhsula aiddirsə seç — düymə həmin məhsula aparacaq. ' +
            'Ümumi kampaniyadırsa (məs. Black Friday, endirim hamıya aiddir) boş burax — düymə bütün məhsullara aparacaq.',
        },
      ],
      preview: {
        select: { title: 'title', isActive: 'isActive', media: 'image' },
        prepare({ title, isActive, media }) {
          return {
            title: `${isActive ? '✅' : '❌'} ${title || 'Başlıq yoxdur'}`,
            subtitle: isActive ? 'Saytda aktivdir' : 'Deaktiv',
            media,
          };
        },
      },
    },

    // ── SEÇİLMİŞ MƏHSUL KARTI (Ana səhifə) ────────────────────────────────────
    // Kampaniya bannerinin yanında görünən tək məhsul vurğusu (məs. premium/bahalı
    // bir hədiyyə). Şəkil, ad və qiymət avtomatik seçdiyin məhsuldan götürülür.
    {
      name: 'featuredProduct',
      title: '⭐ Seçilmiş Məhsul Kartı (Ana səhifə)',
      type: 'object',
      description:
        'Ana səhifədə kampaniya bannerinin yanında görünən tək məhsul kartı. ' +
        'Klik edəndə seçdiyin məhsulun səhifəsi açılır. İstədiyin vaxt hansı məhsul olduğunu dəyişə bilərsən.',
      fields: [
        {
          name: 'isActive',
          title: '✅ Aktiv (saytda göstər)?',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'product',
          title: '🔗 Məhsul',
          type: 'reference',
          to: [{ type: 'product' }],
          description: 'Şəkil, ad və qiymət avtomatik bu məhsuldan götürülür — ayrıca yükləməyə ehtiyac yoxdur.',
        },
        {
          name: 'badgeText',
          title: '🏷 Etiket (kartın üstündə, ixtiyari)',
          type: 'string',
          description: 'Məs: Premium seçim · Ən çox satılan',
        },
      ],
      preview: {
        select: { title: 'product.name', isActive: 'isActive' },
        prepare({ title, isActive }) {
          return {
            title: `${isActive ? '✅' : '❌'} ${title || 'Məhsul seçilməyib'}`,
            subtitle: isActive ? 'Saytda aktivdir' : 'Deaktiv',
          };
        },
      },
    },

  ],
};