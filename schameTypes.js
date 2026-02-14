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
    // --- ŞƏKIL ---
    {
      name: 'image',
      title: '🖼 Baner Şəkli',
      type: 'image',
      description: 'Canva-da hazırladığınız şəkli buraya yükləyin',
      options: {
        hotspot: true,
      },
    },

    // --- ÖLÇÜ SEÇİMİ ---
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

    // --- DÜYMƏ ---
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
      description: 'Düyməyə basdıqda hansı kateqoriya açılsın? (Sanity-dəki kateqoriya adını dəqiq yazın. Boş buraxsanız bütün məhsullar açılır)',
    },

    // --- AKTİV/DEAKTIV ---
    {
      name: 'isActive',
      title: '✅ Aktiv?',
      type: 'boolean',
      description: 'Baner saytda göstərilsin?',
      initialValue: true,
    },

    // --- SIRA ---
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
      title: 'buttonText',
      isActive: 'isActive',
      size: 'size',
      media: 'image',
    },
    prepare({ title, isActive, size, media }) {
      const sizeLabels = {
        'square': 'Kvadrat',
        'wide-thin': 'Geniş-İncə',
        'wide-medium': 'Geniş-Orta',
        'wide-thick': 'Geniş-Qalın',
        'tall-small': 'Şaquli-Kiçik',
        'tall-large': 'Şaquli-Böyük',
      }
      return {
        title: title || 'Baner',
        subtitle: `${sizeLabels[size] || size} | ${isActive ? '✅ Aktiv' : '❌ Deaktiv'}`,
        media: media,
      }
    },
  },
}

export const schemaTypes = [category, product, promoBanner]