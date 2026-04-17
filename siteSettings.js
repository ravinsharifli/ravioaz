// Saatlar: 06:00-dan 22:00-a qədər, 15 dəqiqəlik interval
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

const DAYS = [
  'Bazar ertəsi',
  'Çərşənbə axşamı',
  'Çərşənbə',
  'Cümə axşamı',
  'Cümə',
  'Şənbə',
  'Bazar',
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

    // ── METRO QRAFİKİ ──────────────────────────────────────────────
    {
      name: 'metroSchedule',
      title: '🚇 Metro Qrafiki',
      type: 'object',
      description: 'Stansiya əlavə et → günləri və saatları yandır/söndür.',
      fields: [
        {
          name: 'stations',
          title: 'Metro Stansiyaları',
          type: 'array',
          of: [
            {
              type: 'object',
              name: 'stationEntry',
              title: 'Stansiya',
              fields: [
                {
                  name: 'name',
                  title: 'Stansiya adı',
                  type: 'string',
                  description: 'Məs: Neftçilər, 28 May, Nərimanov',
                  validation: Rule => Rule.required(),
                },

                // ── GÜNLƏR ──
                {
                  name: 'days',
                  title: '📅 Günlər',
                  type: 'array',
                  description: 'Bu stansiya üçün aktiv günlər',
                  of: [
                    {
                      type: 'object',
                      name: 'dayEntry',
                      title: 'Gün',
                      fields: [
                        {
                          name: 'day',
                          title: 'Gün',
                          type: 'string',
                          options: {
                            list: DAYS.map(d => ({ title: d, value: d })),
                            layout: 'radio',
                          },
                          validation: Rule => Rule.required(),
                        },
                        {
                          name: 'isActive',
                          title: 'Bu gün aktivdir?',
                          type: 'boolean',
                          initialValue: true,
                          description: 'Söndürsən müştəri bu günü seçə bilməz',
                        },

                        // ── SAATLAR ──
                        {
                          name: 'timeSlots',
                          title: '🕐 Saatlar',
                          type: 'array',
                          description: 'Boş olan saatları aktivləşdir. Dolu olanları söndür.',
                          of: [
                            {
                              type: 'object',
                              name: 'timeSlot',
                              fields: [
                                {
                                  name: 'time',
                                  title: 'Saat',
                                  type: 'string',
                                  options: {
                                    list: TIME_SLOTS.map(t => ({ title: t, value: t })),
                                  },
                                  validation: Rule => Rule.required(),
                                },
                                {
                                  name: 'isAvailable',
                                  title: 'Boşdur?',
                                  type: 'boolean',
                                  initialValue: true,
                                  description: '✅ Boş  |  ❌ Dolu (söndür)',
                                },
                              ],
                              preview: {
                                select: {
                                  title: 'time',
                                  isAvailable: 'isAvailable',
                                },
                                prepare({ title, isAvailable }) {
                                  return {
                                    title: `${isAvailable ? '✅' : '❌'} ${title}`,
                                  };
                                },
                              },
                            },
                          ],
                        },
                      ],
                      preview: {
                        select: {
                          title: 'day',
                          isActive: 'isActive',
                          timeSlots: 'timeSlots',
                        },
                        prepare({ title, isActive, timeSlots }) {
                          const total = timeSlots?.length ?? 0;
                          const active = timeSlots?.filter(t => t.isAvailable)?.length ?? 0;
                          return {
                            title: `${isActive ? '📅' : '🚫'} ${title || 'Gün'}`,
                            subtitle: isActive ? `${active}/${total} saat boş` : 'Bağlıdır',
                          };
                        },
                      },
                    },
                  ],
                },
              ],
              preview: {
                select: { title: 'name', days: 'days' },
                prepare({ title, days }) {
                  const activeDays = days?.filter(d => d.isActive)?.length ?? 0;
                  const total = days?.length ?? 0;
                  return {
                    title: `🚇 ${title || 'Stansiya'}`,
                    subtitle: `${activeDays}/${total} gün aktiv`,
                  };
                },
              },
            },
          ],
        },
      ],
    },

    // ── QUTU NÖVLƏRİ ──────────────────────────────────────────────
    {
      name: 'boxes',
      title: '📦 Qutu Növləri',
      type: 'array',
      description: 'Müştərinin seçə biləcəyi qutu növlərini buradan idarə edin.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'id',
              title: 'ID (unikal, dəyişdirməyin)',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'name',
              title: 'Ad (müştəriyə görünür)',
              type: 'string',
              validation: Rule => Rule.required(),
            },
            {
              name: 'desc',
              title: 'Qısa açıqlama',
              type: 'string',
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
  ],
};