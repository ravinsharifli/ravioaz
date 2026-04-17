// ─────────────────────────────────────────────
//  RAVIO – Sayt Tənzimləmələri
//  Metro Qrafiki: checkbox sistemi
//  ✅ işarə = BOŞ (çatdırılma var)
//  boş    = DOLU (çatdırılma yoxdur)
// ─────────────────────────────────────────────

// 06:00 → 21:45 arası, 15 dəqiqəlik interval (64 slot)
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
  { title: 'Bazar ertəsi',       value: 'bazar_ertesi' },
  { title: 'Çərşənbə axşamı',    value: 'cersenbe_axsami' },
  { title: 'Çərşənbə',           value: 'cersenbe' },
  { title: 'Cümə axşamı',        value: 'cume_axsami' },
  { title: 'Cümə',               value: 'cume' },
  { title: 'Şənbə',              value: 'senbe' },
  { title: 'Bazar',              value: 'bazar' },
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
      description: '➕ Yeni stansiya əlavə et → adını yaz → boş günləri və saatları işarələ.',
      of: [
        {
          type: 'object',
          name: 'station',
          title: 'Stansiya',

          fields: [

            // Stansiya adı
            {
              name: 'name',
              title: '🚇 Stansiya adı',
              type: 'string',
              description: 'Məs: Neftçilər, 28 May, Nərimanov, İçərişəhər',
              validation: Rule => Rule.required().error('Stansiya adı mütləqdir'),
            },

            // Aktiv/Deaktiv (bütün stansiya)
            {
              name: 'isActive',
              title: '✅ Bu stansiya aktiv?',
              type: 'boolean',
              description: 'Söndürsən bu stansiyaya ümumiyyətlə çatdırılma olmaz.',
              initialValue: true,
            },

            // ── GÜNLƏR (checkbox) ──────────────────────────────────
            {
              name: 'availableDays',
              title: '📅 Boş günlər — işarəli = çatdırılma var',
              type: 'array',
              description: '✅ işarə qoy = həmin gün BOŞdur, çatdırılma edə bilərsən. İşarəni götür = həmin gün DOLU, çatdırılma yoxdur.',
              of: [{ type: 'string' }],
              options: {
                list: DAYS,
                layout: 'grid',
              },
            },

            // ── SAATLAR (checkbox) ─────────────────────────────────
            {
              name: 'availableTimeSlots',
              title: '🕐 Boş saatlar — işarəli = çatdırılma var',
              type: 'array',
              description: '✅ işarə qoy = həmin saat BOŞdur. İşarəni götür = həmin saat DOLU.',
              of: [{ type: 'string' }],
              options: {
                list: TIME_SLOTS.map(t => ({ title: t, value: t })),
                layout: 'grid',
              },
            },

          ],

          // Sanity siyahısında önizləmə
          preview: {
            select: {
              title: 'name',
              isActive: 'isActive',
              days: 'availableDays',
              slots: 'availableTimeSlots',
            },
            prepare({ title, isActive, days, slots }) {
              const dayCount  = days?.length  ?? 0;
              const slotCount = slots?.length ?? 0;
              return {
                title:    `${isActive ? '🚇' : '🚫'} ${title || 'Stansiya'}`,
                subtitle: isActive
                  ? `${dayCount} gün boş  |  ${slotCount} saat boş`
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
              title:    'name',
              subtitle: 'price',
              isActive: 'isActive',
              media:    'image',
            },
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