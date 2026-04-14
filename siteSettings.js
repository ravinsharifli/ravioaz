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
      description: 'Hər stansiya üçün ayrıca gün və saat təyin edin. Müştəri yalnız sizin daxil etdiyiniz variantları görəcək.',
      fields: [
        {
          name: 'stations',
          title: 'Metro Stansiyaları',
          type: 'array',
          description: 'Hər stansiyaya öz çatdırılma günlərini və saatlarını əlavə edin.',
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
                  description: 'Məs: 28 May, Nərimanov, Həzi Aslanov',
                  validation: Rule => Rule.required(),
                },
                {
                  name: 'schedule',
                  title: 'Çatdırılma cədvəli',
                  type: 'array',
                  description: 'Bu stansiya üçün hansı günlər və saatlar mövcuddur.',
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
                          description: 'Məs: Bazar ertəsi, Çərşənbə, Cümə axşamı',
                          validation: Rule => Rule.required(),
                        },
                        {
                          name: 'times',
                          title: 'Saatlar',
                          type: 'array',
                          of: [{ type: 'string' }],
                          description: 'Məs: 14:00, 15:30, 17:00',
                          validation: Rule => Rule.required().min(1),
                        },
                      ],
                      preview: {
                        select: { title: 'day', times: 'times' },
                        prepare({ title, times }) {
                          return {
                            title: title || 'Gün',
                            subtitle: times?.join(', ') || '',
                          };
                        },
                      },
                    },
                  ],
                },
              ],
              preview: {
                select: { title: 'name', schedule: 'schedule' },
                prepare({ title, schedule }) {
                  const count = schedule?.length ?? 0;
                  return {
                    title: `🚇 ${title || 'Stansiya'}`,
                    subtitle: `${count} gün cədvəli`,
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
              description: 'Məs: simple, premium, gift',
              validation: Rule => Rule.required(),
            },
            {
              name: 'name',
              title: 'Ad (müştəriyə görünür)',
              type: 'string',
              description: 'Məs: Sadə qutu, Premium qutu',
              validation: Rule => Rule.required(),
            },
            {
              name: 'desc',
              title: 'Qısa açıqlama',
              type: 'string',
              description: 'Məs: Standart qablaşdırma',
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
              description: 'Deaktiv etsəniz müştəriyə görünməz',
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