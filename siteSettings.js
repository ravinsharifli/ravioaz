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
      description: 'Müştəri yalnız siz aktiv etdiyiniz stansiya, gün və saatlardan seçə bilər.',
      fields: [
        {
          name: 'stations',
          title: 'Metro Stansiyaları (aktiv olanlar)',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Yalnız bu stansiyalar müştəriyə görünəcək. Məs: 28 May, Nərimanov',
        },
        {
          name: 'days',
          title: 'Mövcud günlər',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Məs: Çərşənbə axşamı, Cümə axşamı',
        },
        {
          name: 'times',
          title: 'Mövcud saatlar',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Məs: 14:00, 15:00, 16:00',
        },
      ],
    },

    // ── QUTU NÖVLƏRİ ──────────────────────────────────────────────
    {
      name: 'boxes',
      title: '📦 Qutu Növləri',
      type: 'array',
      description: 'Müştərinin seçə biləcəyi qutu növlərini buradan idarə edin. Şəkil əlavə edin ki müştəri görüb seçsin.',
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