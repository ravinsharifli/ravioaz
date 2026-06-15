// ═══════════════════════════════════════════════════════════════
//  RAVIO — BÜTÜN SANITY SXEMLƏRİ
//  Bu faylı schameTypes.js ilə əvəzlə (köhnəni sil, yenisini yapışdır)
// ═══════════════════════════════════════════════════════════════

import product      from './product'
import productReview from './productReview'
import siteSettings from './siteSettings'
import order        from './schemas/order'
import manufacturer from './schemas/manufacturer'
import courierProvider from './schemas/courier'

// ── Kateqoriya sxemi (dəyişilməyib) ──────────────────────────
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

// ── Bütün tiplər ──────────────────────────────────────────────
export const schemaTypes = [
  // 📦 Sifariş idarəetmə
  order,
  manufacturer,
  courierProvider,

  // 🛍 Məhsullar
  category,
  product,
  productReview,

  // ⚙️ Sayt tənzimləmələri
  siteSettings,
]