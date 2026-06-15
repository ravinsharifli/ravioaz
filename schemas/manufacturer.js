// ═══════════════════════════════════════════════════════════════
//  RAVIO — İSTEHSALÇI SXEMİ
//  schemas/manufacturer.js
// ═══════════════════════════════════════════════════════════════

export default {
  name: 'manufacturer',
  title: 'İstehsalçı',
  type: 'document',

  fields: [
    {
      name: 'name',
      title: '👤 Ad Soyad',
      type: 'string',
      description: 'Məs: Fuad, Coşqun Əcəmi',
      validation: Rule => Rule.required(),
    },
    {
      name: 'phone',
      title: '📞 WhatsApp Nömrəsi',
      type: 'string',
      description: 'Beynəlxalq format: +994501234567',
      validation: Rule => Rule.required(),
    },
    {
      name: 'specialty',
      title: '🔧 İxtisas',
      type: 'string',
      description: 'Məs: Lipa / Nömrə, Lazer yazı, Qaşlama',
      options: {
        list: [
          { title: 'Lipa / Nömrə yazı', value: 'lipa' },
          { title: 'Lazer gravür',       value: 'laser' },
          { title: 'Qaşlama / Montaj',   value: 'assembly' },
          { title: 'Digər',              value: 'other' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'note',
      title: '📝 Qeyd (yalnız sənin üçün)',
      type: 'text',
      description: 'Məs: Cümə axşamı işləmir, yalnız həftəiçi',
    },
    {
      name: 'isActive',
      title: '✅ Aktiv?',
      type: 'boolean',
      description: 'Söndürsən — sifariş göndərərkən bu istehsalçı siyahıda görünmür',
      initialValue: true,
    },
  ],

  preview: {
    select: {
      title:     'name',
      subtitle:  'specialty',
      phone:     'phone',
      isActive:  'isActive',
    },
    prepare({ title, subtitle, phone, isActive }) {
      const specialtyMap = {
        lipa:     'Lipa / Nömrə yazı',
        laser:    'Lazer gravür',
        assembly: 'Qaşlama / Montaj',
        other:    'Digər',
      }
      return {
        title:    `${isActive ? '✅' : '❌'} ${title || 'İstehsalçı'}`,
        subtitle: `${specialtyMap[subtitle] || subtitle || ''} · ${phone || ''}`,
      }
    },
  },
}