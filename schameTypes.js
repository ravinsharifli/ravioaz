import product from './product'
import siteSettings from './siteSettings'
import customerReview from './customerReview'
import order from './order'

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
      name: 'size',
      title: '📐 Baner Ölçüsü',
      type: 'string',
      description: 'Banerin saytda görünəcək ölçüsünü seçin',
      options: {
        list: [
          { title: '🟥 Kvadrat (1:1) — 500x500px', value: 'square' },
          { title: '▬ Geniş-İncə (4:1) — 1200x300px', value: 'wide-thin' },
          { title: '▬ Geniş-Orta (3:1) — 1200x400px', value: 'wide-medium' },
          { title: '▬ Geniş-Qalın (2:1) — 1200x600px', value: 'wide-thick' },
          { title: '▮ Şaquli-Kiçik (2:3) — 400x600px', value: 'tall-small' },
          { title: '▮ Şaquli-Böyük (1:2) — 400x800px', value: 'tall-large' },
        ],
        layout: 'radio',
      },
      initialValue: 'wide-medium',
    },
    {
      name: 'image',
      title: '🖼 Baner Şəkli',
      type: 'image',
      description: 'İstənilən şəkil yükləyə bilərsiniz - Canva, Google, telefon şəkli.',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'badge',
      title: '🏷 Nişan mətni',
      type: 'string',
      description: 'Məsələn: MƏHDUD ZAMAN, YENİ, XÜSUSI TEKLİF',
    },
    {
      name: 'title',
      title: '✏️ Başlıq',
      type: 'string',
      description: 'Məsələn: BLACK FRIDAY, YAZ ENDİRİMİ, 8 MART',
    },
    {
      name: 'subtitle',
      title: '📝 Alt başlıq',
      type: 'string',
      description: 'Məsələn: Bütün məhsullarda 50% ENDİRİM',
    },
    {
      name: 'titleColor',
      title: '🎨 Başlıq rəngi',
      type: 'string',
      description: 'Hex kod: #FF8C00 (narıncı), #FFFFFF (ağ), #1A1A1A (qara)',
      initialValue: '#FF8C00',
    },
    {
      name: 'backgroundColor',
      title: '🎨 Arxa fon rəngi (şəkil yoxdursa)',
      type: 'string',
      description: 'Hex kod: #1A1A1A (qara), #FF8C00 (narıncı).',
      initialValue: '#1A1A1A',
    },
    {
      name: 'buttonText',
      title: '🔘 Düymə mətni',
      type: 'string',
      description: 'Məsələn: Sifariş et, Dəstək ol, İndi kəşf et',
    },
    {
      name: 'buttonCategory',
      title: '📂 Düymə kateqoriyası',
      type: 'string',
      description: 'Düyməyə basdıqda hansı kateqoriya açılsın? Sanity-dəki kateqoriya adını dəqiq yazın.',
    },
    {
      name: 'isActive',
      title: '✅ Aktiv?',
      type: 'boolean',
      description: 'Baner saytda göstərilsin?',
      initialValue: true,
    },
    {
      name: 'order',
      title: '🔢 Sıra',
      type: 'number',
      description: 'Göstərilmə sırası (1 = birinci)',
      validation: Rule => Rule.required().min(1),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      isActive: 'isActive',
      size: 'size',
      media: 'image',
    },
    prepare({ title, subtitle, isActive, size, media }) {
      const sizeLabels = {
        'square': 'Kvadrat',
        'wide-thin': 'Geniş-İncə',
        'wide-medium': 'Geniş-Orta',
        'wide-thick': 'Geniş-Qalın',
        'tall-small': 'Şaquli-Kiçik',
        'tall-large': 'Şaquli-Böyük',
      }
      return {
        title: title || subtitle || 'Baner',
        subtitle: `${sizeLabels[size] || 'Ölçü seçilməyib'} | ${isActive ? '✅ Aktiv' : '❌ Deaktiv'}`,
        media: media,
      }
    },
  },
}

export const schemaTypes = [category, product, promoBanner, siteSettings, customerReview, order]