import product from './product'

const category = {
  name: 'category',
  title: 'Kateqoriya',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Kateqoriya Adı',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'description',
      title: 'Açıqlama',
      type: 'text',
    },
  ],
}

const promoBanner = {
  name: 'promoBanner',
  title: 'Kampaniya Baneri',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Başlıq',
      type: 'string',
      description: 'Məsələn: BLACK FRIDAY',
    },
    {
      name: 'subtitle',
      title: 'Alt başlıq',
      type: 'string',
      description: 'Məsələn: Bütün məhsullarda 50% ENDİRİM',
    },
    {
      name: 'badge',
      title: 'Nişan',
      type: 'string',
      description: 'Məsələn: MƏHDUD ZAMAN',
    },
    {
      name: 'buttonText',
      title: 'Düymə mətni',
      type: 'string',
      description: 'Məsələn: İndi kəşf et',
    },
    {
      name: 'backgroundColor',
      title: 'Arxa fon rəngi',
      type: 'string',
      description: 'Hex kod: #1A1A1A və ya #FF8C00',
    },
    {
      name: 'textColor',
      title: 'Mətn rəngi',
      type: 'string',
      description: 'Hex kod: #FFFFFF və ya #000000',
    },
    {
      name: 'accentColor',
      title: 'Vurğu rəngi',
      type: 'string',
      description: 'Başlıq üçün rəng - Hex kod: #FF8C00',
    },
    {
      name: 'isActive',
      title: 'Aktiv?',
      type: 'boolean',
      description: 'Baner göstərilsin?',
      initialValue: true,
    },
    {
      name: 'order',
      title: 'Sıra',
      type: 'number',
      description: 'Baner göstərilmə sırası (1, 2, 3...)',
      validation: Rule => Rule.required().min(1),
    },
    {
      name: 'size',
      title: 'Ölçü',
      type: 'string',
      options: {
        list: [
          { title: 'Böyük (Tam genişlik)', value: 'large' },
          { title: 'Orta (Yarı genişlik - sol)', value: 'medium-left' },
          { title: 'Orta (Yarı genişlik - sağ)', value: 'medium-right' },
          { title: 'Kiçik (1/4 genişlik)', value: 'small' },
        ],
      },
      initialValue: 'large',
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, isActive }) {
      return {
        title: title,
        subtitle: `${subtitle} ${isActive ? '✅ Aktiv' : '❌ Deaktiv'}`,
      }
    },
  },
}

export const schemaTypes = [category, product, promoBanner]