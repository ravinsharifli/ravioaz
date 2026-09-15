import { BlogPostSummary, BlogPostDetail } from '../types';

// Siyahı üçün YÜNGÜL sorğu — body (məzmun) daxil deyil, çünki şəkilli uzun
// yazılar böyüyəndə bunu HƏR blog siyahısı açılışında endirmək istəmirik.
// Tam məzmun yalnız istifadəçi konkret yazını açanda BLOG_POST_QUERY ilə gəlir.
export const BLOG_LIST_QUERY = `*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc) {
  _id, title, titleEn, "slug": slug.current,
  excerpt, excerptEn,
  "coverImageUrl": coverImage.asset->url,
  publishedAt
}`;

export const BLOG_POST_QUERY = `*[_type == "blogPost" && slug.current == $slug][0]{
  _id, title, titleEn, "slug": slug.current,
  excerpt, excerptEn,
  "coverImageUrl": coverImage.asset->url,
  body, bodyEn,
  publishedAt,
  seoTitle, seoDescription
}`;

export function mapBlogSummary(raw: any): BlogPostSummary {
  return {
    id: raw._id,
    title: raw.title || '',
    titleEn: raw.titleEn || '',
    slug: raw.slug || '',
    excerpt: raw.excerpt || '',
    excerptEn: raw.excerptEn || '',
    coverImageUrl: raw.coverImageUrl || '',
    publishedAt: raw.publishedAt || '',
  };
}

export function mapBlogDetail(raw: any): BlogPostDetail {
  return {
    ...mapBlogSummary(raw),
    body: raw.body || [],
    bodyEn: raw.bodyEn || [],
    seoTitle: raw.seoTitle || '',
    seoDescription: raw.seoDescription || '',
  };
}
