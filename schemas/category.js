// schemas/category.js
import { makeSlugify } from './slugify'

export default {
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
        slugify: makeSlugify(),
      },
    },
    {
      name: 'description',
      title: 'Açıqlama',
      type: 'text',
    },
  ],
}
