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

    // ── QUTU NÖVLƏRİ ─────────────────────────────────────────────
    {
      name: 'boxes',
      title: '📦 Qutu Növləri',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id',       title: 'ID (unikal)',              type: 'string',  validation: (Rule) => Rule.required() },
            { name: 'name',     title: 'Ad (müştəriyə görünür)',   type: 'string',  validation: (Rule) => Rule.required() },
            { name: 'desc',     title: 'Qısa açıqlama',            type: 'string'  },
            { name: 'price',    title: 'Qiymət (₼) — 0 = pulsuz', type: 'number',  initialValue: 0, validation: (Rule) => Rule.required().min(0) },
            { name: 'image',    title: '📸 Qutu şəkli',            type: 'image',   options: { hotspot: true } },
            { name: 'isActive', title: 'Aktiv?',                   type: 'boolean', initialValue: true },
          ],
          preview: {
            select: { title: 'name', subtitle: 'price', isActive: 'isActive', media: 'image' },
            prepare({ title, subtitle, isActive, media }) {
              return {
                title:    `${isActive ? '✅' : '❌'} ${title || 'Qutu'}`,
                subtitle: subtitle === 0 ? 'Pulsuz' : `+${subtitle} ₼`,
                media,
              };
            },
          },
        },
      ],
    },

  ],
};