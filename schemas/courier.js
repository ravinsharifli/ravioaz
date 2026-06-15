// ═══════════════════════════════════════════════════════════════
//  RAVIO — KURYER SXEMİ
//  schemas/courier.js
//
//  2 kuryer var hələki:
//  1. Fara kuryer xidməti — WhatsApp ilə idarə olunur
//  2. Columba.az — API vasitəsilə sifariş yaradılır
// ═══════════════════════════════════════════════════════════════

export default {
  name: 'courierProvider',
  title: 'Kuryer',
  type: 'document',

  fields: [
    {
      name: 'name',
      title: '🚚 Kuryer Adı',
      type: 'string',
      description: 'Məs: Fara Kuryer Xidməti, Columba.az',
      validation: Rule => Rule.required(),
    },
    {
      name: 'phone',
      title: '📞 WhatsApp / Telefon',
      type: 'string',
      description: 'Beynəlxalq format: +994558077322',
    },
    {
      name: 'type',
      title: '🔗 Əlaqə Növü',
      type: 'string',
      description: 'WhatsApp = mesaj göndərilir | API = Columba kimi avtomatik sifariş yaradılır',
      options: {
        list: [
          { title: '💬 WhatsApp (manual mesaj)',   value: 'whatsapp' },
          { title: '🤖 API (Columba.az — avtomatik)', value: 'api' },
        ],
        layout: 'radio',
      },
      initialValue: 'whatsapp',
      validation: Rule => Rule.required(),
    },

    // ── Columba API sahələri — yalnız type="api" seçiləndə görünür ──
    {
      name: 'apiEndpoint',
      title: '🌐 API Endpoint URL',
      type: 'string',
      description: 'Columba üçün: https://columba.az/sifarisci',
      hidden: ({ document }) => document?.type !== 'api',
    },
    {
      name: 'apiToken',
      title: '🔑 API Token',
      type: 'string',
      description: 'Make.com scenariosuna göndəriləcək. Columba API tokenini bura yaz.',
      hidden: ({ document }) => document?.type !== 'api',
    },

    {
      name: 'note',
      title: '📝 Qeyd (yalnız sənin üçün)',
      type: 'text',
      description: 'Məs: Həftəsonu işləmir, minimum çəki 0.5kq',
    },
    {
      name: 'isActive',
      title: '✅ Aktiv?',
      type: 'boolean',
      description: 'Söndürsən — sifariş göndərərkən bu kuryer siyahıda görünmür',
      initialValue: true,
    },
  ],

  preview: {
    select: {
      title:    'name',
      type:     'type',
      phone:    'phone',
      isActive: 'isActive',
    },
    prepare({ title, type, phone, isActive }) {
      const typeLabel = type === 'api' ? '🤖 API' : '💬 WhatsApp'
      return {
        title:    `${isActive ? '✅' : '❌'} ${title || 'Kuryer'}`,
        subtitle: `${typeLabel} · ${phone || ''}`,
      }
    },
  },
}