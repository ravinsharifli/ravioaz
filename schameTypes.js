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
      name: 'image',
      title: 'Baner Şəkli',
      type: 'image',
      description: 'Canva-da hazırladığınız şəkli buraya yükləyin (tövsiyə olunan ölçü: 1200x400px)',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'buttonText',
      title: 'Düymə mətni',
      type: 'string',
      description: 'Məsələn: İndi kəşf et, Alışa başla',
    },
    {
      name: 'buttonCategory',
      title: 'Düymə kateqoriyası',
      type: 'string',
      description: 'Düyməyə basdıqda hansı kateqoriya açılsın? (Məsələn: Elektronika, Geyim). Boş buraxsanız bütün məhsullar açılacaq.',
    },
    {
      name: 'isActive',
      title: 'Aktiv?',
      type: 'boolean',
      description: 'Baner saytda göstərilsin?',
      initialValue: true,
    },
    {
      name: 'order',
      title: 'Sıra',
      type: 'number',
      description: 'Baner göstərilmə sırası (1 = birinci)',
      validation: Rule => Rule.required().min(1),
    },
  ],
  preview: {
    select: {
      title: 'buttonText',
      isActive: 'isActive',
      media: 'image',
    },
    prepare({ title, isActive, media }) {
      return {
        title: title || 'Baner',
        subtitle: isActive ? '✅ Aktiv' : '❌ Deaktiv',
        media: media,
      }
    },
  },
}

export const schemaTypes = [category, product, promoBanner]