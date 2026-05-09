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
      name: 'logo',
      title: '🖼 Loqo',
      type: 'image',
      options: { hotspot: true },
    },
    // ── HERO BANNER ŞƏKLİ ────────────────────────────────────────
    {
      name: 'heroImage',
      title: '🖼 Hero Banner Şəkli',
      type: 'image',
      description: 'Ana səhifə hero bölməsinin sağ tərəfində görünəcək şəkil. Məhsul şəkli, hədiyyə fotosu — nə istəsən.',
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


    // Admin paneldən istənilən kodu əlavə et, növünü və məbləğini təyin et.
    {
      name: 'coupons',
      title: '🎟 Endirim Kodları',
      type: 'array',
      description:
        'Hər endirim kodu üçün BİR sətir əlavə et. ' +
        'Kodu müştəriyə WhatsApp/İnstagram ilə yolla. ' +
        'İstifadə limitini sıfırlamaq üçün kodu sil və yenidən əlavə et.',
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
              description: 'Məs: TOPLU50, YENI10, RAVIO2025 — böyük hərflər tövsiyə edilir',
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
                'Sabit növ seçilsə: neçə manat (məs: 10 → 10₼ endirim). ' +
                'Faiz növü seçilsə: neçə faiz (məs: 15 → 15% endirim).',
              validation: Rule => Rule.required().min(1),
            },
            {
              name: 'minOrderAmount',
              title: '🛒 Minimum sifariş məbləği (₼)',
              type: 'number',
              description:
                'Bu kupon yalnız neçə manatdan yuxarı sifarişlərə tətbiq edilsin? ' +
                '0 qoysan — məbləğ limiti olmur.',
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
              description: 'Məs: Toplu sifariş üçün, Dostuna göndərildi, Kampaniya kodu',
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

  ],
};