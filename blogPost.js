// blogPost.js
// Blog yazıları. Nəşr/gizlətmə Sanity-nin öz Publish/Unpublish mexanizmi ilə
// idarə olunur (product.js-də olduğu kimi) — ayrıca "aktiv" sahəsinə ehtiyac yoxdur.

const azSlugify = (input) =>
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
    .replace(/-+/g, '-')
    .slice(0, 96);

export default {
  name: 'blogPost',
  title: '📰 Blog Yazısı',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: '📝 Başlıq (Azərbaycanca)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'titleEn',
      title: '🇬🇧 Başlıq (İngiliscə)',
      type: 'string',
      description: 'Boş qalarsa, /en səhifəsində Azərbaycanca başlıq göstərilir.',
    },
    {
      name: 'slug',
      title: '🔗 URL',
      type: 'slug',
      description: '"Generate" düyməsinə bas — avtomatik yaranır. Sayt bunu /blog/... linkində istifadə edir.',
      options: { source: 'title', maxLength: 96, slugify: azSlugify },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'coverImage',
      title: '🖼 Üz şəkli',
      type: 'image',
      options: { hotspot: true },
      description: 'Blog siyahısında və yazının başında görünür.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'excerpt',
      title: '💬 Qısa təsvir (Azərbaycanca)',
      type: 'text',
      rows: 3,
      description: 'Blog siyahısında başlığın altında görünür. SEO təsviri kimi də istifadə olunur (əgər aşağıda ayrıca yazmasan).',
      validation: (Rule) => Rule.required().max(200),
    },
    {
      name: 'excerptEn',
      title: '🇬🇧 Qısa təsvir (İngiliscə)',
      type: 'text',
      rows: 3,
    },
    {
      name: 'body',
      title: '📄 Məzmun (Azərbaycanca)',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'bodyEn',
      title: '🇬🇧 Məzmun (İngiliscə)',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image', options: { hotspot: true } }],
      description: 'Boş qalarsa, /en səhifəsində Azərbaycanca məzmun göstərilir.',
    },
    {
      name: 'publishedAt',
      title: '📅 Dərc tarixi',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      description: 'Blog siyahısında bu tarixə görə sıralanır (ən yenisi əvvəldə).',
    },
    {
      name: 'seoTitle',
      title: '🔍 SEO başlıq (ixtiyari)',
      type: 'string',
      description: 'Google-da görünən başlıq. Boş qalarsa, yuxarıdakı adi başlıq istifadə olunur.',
    },
    {
      name: 'seoDescription',
      title: '🔍 SEO təsviri (ixtiyari)',
      type: 'text',
      rows: 2,
      description: 'Google-da görünən təsvir. Boş qalarsa, "Qısa təsvir" istifadə olunur.',
    },
  ],
  orderings: [
    {
      title: 'Ən yeni əvvəldə',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
  preview: {
    select: { title: 'title', media: 'coverImage', publishedAt: 'publishedAt' },
    prepare({ title, media, publishedAt }) {
      return {
        title: title || 'Başlıq yoxdur',
        subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString('az-AZ') : 'Tarix yoxdur',
        media,
      };
    },
  },
};
