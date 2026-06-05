import { Product } from '../types';

export const PRODUCTS_QUERY = `*[_type == "product"] | order(bestSellerOrder asc) {
  _id, name, "slug": slug.current, description,
  category->{ name },
  variants[] {
    modelName, colorName, price, discountPrice, stock,
    images[]{ asset->{ url } }
  },
  isPremium, premiumOrder, premiumSize,
  isBestSeller, bestSellerOrder, orderCount,
  hasBulkDiscount, bulkDiscountNote,
  bulkTiers[]{ minQty, maxQty, discountAmount, label },
  allowBoxSelection,
  customBoxOptions[]{ id, name, desc, price, isActive, "imageUrl": image.asset->url },
  coupons[]{ code, discountType, discountValue, minOrderAmount, isActive, description },
  reviews[]{ name, rating, text, date, isActive, "photoUrl": photo.asset->url }
}`;

export const SINGLE_PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0]{
  _id, name, "slug": slug.current, description,
  category->{ name },
  variants[] {
    modelName, colorName, price, discountPrice, stock,
    images[]{ asset->{ url } }
  },
  isPremium, premiumOrder, premiumSize,
  isBestSeller, bestSellerOrder, orderCount,
  hasBulkDiscount, bulkDiscountNote,
  bulkTiers[]{ minQty, maxQty, discountAmount, label },
  allowBoxSelection,
  customBoxOptions[]{ id, name, desc, price, isActive, "imageUrl": image.asset->url },
  coupons[]{ code, discountType, discountValue, minOrderAmount, isActive, description },
  reviews[]{ name, rating, text, date, isActive, "photoUrl": photo.asset->url }
}`;

export const SETTINGS_QUERY = `*[_type == "siteSettings"][0]{
  "metroSchedule": {
    "stations": metroSchedule[]{
      name,
      isActive,
      "daySchedules": daySchedules[]{
        day,
        allDayOpen,
        timeSlots
      }
    }
  },
  "reelPosts": reelPosts[isActive != false]{
    label, title, subtitle, ctaText,
    "imageUrl": image.asset->url,
    "slug": product->slug.current
  },
  "heroSlides": heroSlides[isActive != false]{
    label, title, subtitle, ctaText,
    "imageUrl": image.asset->url
  }
}`;

export function mapSanityProduct(raw: any): Product {
  const variants = (raw.variants || []).map((v: any) => ({
    modelName: v.modelName || '',
    colorName: v.colorName || '',
    images: (v.images || [])
      .map((img: any) => (img?.asset?.url ? img.asset.url : typeof img === 'string' ? img : ''))
      .filter(Boolean),
    price: v.price ?? 0,
    discountPrice: v.discountPrice ?? undefined,
    stock: v.stock ?? 0,
  }));
  return {
    id: raw._id,
    name: raw.name,
    slug: (raw.slug || '').trim().toLowerCase(),
    category: raw.category?.name || '',
    description: raw.description || '',
    variants,
    isPremium: raw.isPremium || false,
    premiumOrder: raw.premiumOrder,
    premiumSize: raw.premiumSize,
    isBestSeller: raw.isBestSeller || false,
    bestSellerOrder: raw.bestSellerOrder,
    orderCount: raw.orderCount || 0,
    hasBulkDiscount: raw.hasBulkDiscount || false,
    bulkDiscountNote: raw.bulkDiscountNote || '',
    bulkTiers: raw.bulkTiers || [],
    allowBoxSelection: raw.allowBoxSelection !== false,
    customBoxOptions: (raw.customBoxOptions || [])
      .filter((b: any) => b.isActive !== false)
      .map((b: any) => ({
        id: b.id && b.id.trim() ? b.id.trim() : b.name,
        name: b.name,
        desc: b.desc || '',
        price: b.price ?? 0,
        imageUrl: b.imageUrl || null,
      })),
    coupons: (raw.coupons || []).filter((c: any) => c.isActive !== false),
    reviews: (raw.reviews || [])
      .filter((r: any) => r.isActive !== false && r.name && r.text)
      .map((r: any) => ({
        name: r.name,
        rating: r.rating ?? 5,
        text: r.text,
        date: r.date || '',
        photoUrl: r.photoUrl || undefined,
        isActive: r.isActive !== false,
      })),
  };
}
