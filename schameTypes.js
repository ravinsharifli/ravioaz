import product from './product'
import siteSettings from './siteSettings'
import audienceCategory from './audienceCategory'
import blogPost from './blogPost'

const category = {
  name: 'category',
  title: 'Kateqoriya',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Kateqoriya adı',
      type: 'string',
    },
    {
      name: 'nameEn',
      title: '🇬🇧 Category name (English)',
      type: 'string',
      description: 'İngilis versiyasında (ravio.az/en) göstərilir. Boş qalarsa, Azərbaycanca ad göstərilir.',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        slugify: input =>
          input
            .toLowerCase()
            .replace(/ə/g, 'e')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ü/g, 'u')
            .replace(/ğ/g, 'g')
            .replace(/ş/g, 's')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-'),
      },
    },
    {
      name: 'description',
      title: 'Açıqlama',
      type: 'text',
    },
  ],
}

export const schemaTypes = [
  category,
  product,
  siteSettings,
  audienceCategory,
  blogPost,
]