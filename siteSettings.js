// ─────────────────────────────────────────────
//  RAVIO – Sayt Tənzimləmələri
//  Metro Qrafiki: Hər günün öz saatları
// ─────────────────────────────────────────────

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

    // ── LOQO ────────────────────────────────────────────────────────
    {
      name: 'logo',
      title: '🖼 Loqo',
      type: 'image',
      options: { hotspot: true },
    },

    // ── METRO QRAFİKİ ────────────────────────────────────────────────
    {
      name: 'metroSchedule',
      title: '🚇 Metro Çatdırılma Qrafiki',
      type: 'array',
      description: '➕ Hər stansiya üçün bir entry. Hər günün öz saatlarını ayrıca təyin et.',
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
              validation: Rule => Rule.required().error('Stansiya adı mütləqdir'),
            },

            {
              name: 'isActive',
              title: '✅ Bu stansiya aktiv?',
              type: 'boolean',
              description: 'Söndürsən bu stansiyaya ümumiyyətlə çatdırılma olmaz.',
              initialValue: true,
            },

            // ── HƏR GÜNÜN ÖZ SAATLARI ──────────────────────────────
            {
              name: 'daySchedules',
              title: '📅 Günlər və saatlar',
              type: 'array',
              description: '➕ Hər aktiv gün üçün bir sətir əlavə et, o günə aid saatları seç.',
              of: [
                {
                  type: 'object',
                  name: 'daySchedule',
                  title: 'Gün cədvəli',
                  fields: [
                    {
                      name: 'day',
                      title: '📆 Gün',
                      type: 'string',
                      options: {
                        list: DAYS,
                        layout: 'radio',
                        direction: 'horizontal',
                      },
                      validation: Rule => Rule.required(),
                    },
                    {
                      name: 'timeSlots',
                      title: '🕐 Bu günün boş saatları',
                      type: 'array',
                      description: 'İşarəli = çatdırılma var (boş saat)',
                      of: [{ type: 'string' }],
                      options: {
                        list: TIME_SLOTS.map(t => ({ title: t, value: t })),
                        layout: 'grid',
                      },
                    },
                  ],
                  preview: {
                    select: { day: 'day', slots: 'timeSlots' },
                    prepare({ day, slots }) {
                      const count = slots?.length ?? 0;
                      const first = slots?.[0] ?? '';
                      const last  = slots?.[slots.length - 1] ?? '';
                      return {
                        title:    day || 'Gün seçilməyib',
                        subtitle: count > 0
                          ? `${count} saat  (${first} – ${last})`
                          : 'Saat yoxdur',
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
                  : 'Deaktiv — çatdırılma yoxdur',
              };
            },
          },
        },
      ],
    },

    // ── QUTU NÖVLƏRİ ────────────────────────────────────────────────
    {
      name: 'boxes',
      title: '📦 Qutu Növləri',
      type: 'array',
      description: 'Müştərinin seçə biləcəyi qutu növlərini buradan idarə edin.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id',    title: 'ID (unikal)',        type: 'string',  validation: Rule => Rule.required() },
            { name: 'name',  title: 'Ad (müştəriyə görünür)', type: 'string', validation: Rule => Rule.required() },
            { name: 'desc',  title: 'Qısa açıqlama',     type: 'string' },
            { name: 'price', title: 'Qiymət (₼) — 0 = pulsuz', type: 'number', initialValue: 0, validation: Rule => Rule.required().min(0) },
            { name: 'image', title: '📸 Qutu şəkli',     type: 'image', options: { hotspot: true } },
            { name: 'isActive', title: 'Aktiv?',         type: 'boolean', initialValue: true },
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