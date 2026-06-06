export default {
  name: 'productReview',
  title: 'Müştəri rəyi',
  type: 'object',
  fields: [
    {
      name: 'name',
      title: '👤 Müştəri adı',
      type: 'string',
      description: 'Məsələn: Aytən M.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'rating',
      title: '⭐ Reytinq',
      type: 'number',
      initialValue: 5,
      options: {
        list: [
          { title: '⭐⭐⭐⭐⭐ — 5 (Əla)', value: 5 },
          { title: '⭐⭐⭐⭐ — 4 (Yaxşı)', value: 4 },
          { title: '⭐⭐⭐ — 3 (Orta)', value: 3 },
          { title: '⭐⭐ — 2', value: 2 },
          { title: '⭐ — 1', value: 1 },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'text',
      title: '💬 Rəy mətni',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().min(5).max(500),
    },
    {
      name: 'date',
      title: '📅 Tarix',
      type: 'string',
      description: 'Məsələn: May 2026',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'photo',
      title: '📷 Real məhsul şəkli (istəyə bağlı)',
      type: 'image',
      description: 'Müştərinin aldığı məhsulun fotoşəkli.',
      options: { hotspot: true },
    },
    {
      name: 'isActive',
      title: '✅ Saytda göstərilsin?',
      type: 'boolean',
      initialValue: true,
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'text',
      media: 'photo',
      rating: 'rating',
      isActive: 'isActive',
    },
    prepare({ title, subtitle, media, rating, isActive }) {
      const stars = '⭐'.repeat(rating || 5);
      return {
        title: `${isActive ? '✅' : '❌'} ${title} ${stars}`,
        subtitle: (subtitle || '').slice(0, 60),
        media,
      };
    },
  },
};
