// schemas/index.js — Sanity Studio-nun bütün sənəd tipləri BURADAN toplanır.
// (Əvvəl bu fayl kökdə "schameTypes.js" adı ilə idi — ad səhv yazılmışdı.)
import category from './category'
import product from './product'
import siteSettings from './siteSettings'
import audienceCategory from './audienceCategory'
import blogPost from './blogPost'

export const schemaTypes = [
  category,
  product,
  siteSettings,
  audienceCategory,
  blogPost,
]
