const customerReview = {
  name: 'customerReview',
  title: 'Müştəri Rəyləri',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: '👤 Müştəri adı',
      type: 'string',
      description: 'Məsələn: Aytən M.',
      validation: Rule => Rule.required(),
    },
    {
      name: 'product',
      title: '📦 Aldığı məhsul',
      type: 'string',
      description: 'Məsələn: Polad qolbaq, Premium giftbox',
      validation: Rule => Rule.required(),
    },
    {
      name: 'rating',
      title: '⭐ Reytinq (1-5)',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5),
      initialValue: 5,
      options: {
        list: [
          { title: '⭐⭐⭐⭐⭐ — 5 (Əla)', value: 5 },
          { title: '⭐⭐⭐⭐ — 4 (Yaxşı)', value: 4 },
          { title: '⭐⭐⭐ — 3 (Orta)', value: 3 },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'text',
      title: '💬 Rəy mətni',
      type: 'text',
      rows: 4,
      description: 'Müştərinin dedikləri. Mümkün qədər real saxlayın.',
      validation: Rule => Rule.required().min(20).max(500),
    },
    {
      name: 'date',
      title: '📅 Tarix (göstəriləcək)',
      type: 'string',
      description: 'Məsələn: Aprel 2026, Mart 2026',
      validation: Rule => Rule.required(),
    },
    {
      name: 'order',
      title: '🔢 Sıra',
      type: 'number',
      description: 'Kiçik rəqəm = əvvəl göstərilir (1, 2, 3...)',
      initialValue: 99,
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
      isActive: 'isActive',
      rating: 'rating',
    },
    prepare({ title, subtitle, isActive, rating }) {
      const stars = '⭐'.repeat(rating || 5);
      return {
        title: `${title} ${stars}`,
        subtitle: `${isActive ? '✅' : '❌'} · ${(subtitle || '').slice(0, 60)}...`,
      };
    },
  },
};

export default customerReview;