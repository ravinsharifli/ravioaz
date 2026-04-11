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

    // ── METRO QRAFIKI ──────────────────────────────────────────────
    {
      name: 'metroSchedule',
      title: '🚇 Metro Qrafiki (müştəri buradan seçəcək)',
      type: 'object',
      description: 'Müştəri yalnız siz aktiv etdiyiniz stansiya, gün və saatlardan seçə bilər.',
      fields: [
        {
          name: 'stations',
          title: 'Metro Stansiyaları',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Məs: 28 May, Nərimanov, Həzi Aslanov',
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
          description: 'Məs: 14:00, 15:00, 16:00, 17:00, 18:00',
        },
      ],
    },

    // ── QUTU NÖVLƏRİ ──────────────────────────────────────────────
    {
      name: 'boxes',
      title: '📦 Qutu Növləri (müştəri seçəcək)',
      type: 'array',
      description: 'İstədiyiniz qədər qutu əlavə edə bilərsiniz.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'id',
              title: 'ID (unikal, dəyişdirməyin)',
              type: 'string',
              description: 'Məs: simple, premium, gift — sistem üçün unikal olmalıdır',
            },
            {
              name: 'name',
              title: 'Ad (müştəriyə görünür)',
              type: 'string',
              description: 'Məs: Sadə qutu, Premium qutu',
            },
            {
              name: 'desc',
              title: 'Açıqlama',
              type: 'string',
              description: 'Məs: Standart qablaşdırma',
            },
            {
              name: 'price',
              title: 'Qiymət (₼) — 0 = pulsuz',
              type: 'number',
              initialValue: 0,
            },
            {
              name: 'isActive',
              title: 'Aktiv?',
              type: 'boolean',
              initialValue: true,
            },
          ],
          preview: {
            select: { title: 'name', subtitle: 'price', isActive: 'isActive' },
            prepare({ title, subtitle, isActive }) {
              return {
                title: `${isActive ? '✅' : '❌'} ${title || 'Qutu'}`,
                subtitle: subtitle === 0 ? 'Pulsuz' : `+${subtitle} ₼`,
              };
            },
          },
        },
      ],
    },
  ],
};