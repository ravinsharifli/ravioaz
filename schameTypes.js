import product from './product'
import productReview from './productReview'
import siteSettings from './siteSettings'
import order from './schemas/order'

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

export const schemaTypes = [
  order,
  category,
  product,
  productReview,
  siteSettings,
]