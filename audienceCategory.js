// audienceCategory.js
// "Kimə alırsan?" menyusundakı bölmələr (Qadınlar üçün, Kişilər üçün,
// Sevgililər üçün cüt hədiyyə, Korporativ hədiyyə və s.)
//
// Tam sərbəst idarə olunur: istədiyin qədər əlavə et, sil, yenidən adlandır —
// heç bir kod dəyişikliyi lazım deyil. Hər məhsulda "product.js" sənədindəki
// "🎯 Kimə aiddir?" sahəsindən bu bölmələrə bağlanır.

export default {
  name: 'audienceCategory',
  title: '🎯 "Kimə Alırsan?" Bölmələri',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: '📝 Ad (Azərbaycanca)',
      type: 'string',
      description: 'Məs: Qadınlar üçün hədiyyə, Kişilər üçün hədiyyə, Sevgililər üçün cüt hədiyyə, Korporativ hədiyyə',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'nameEn',
      title: '🇬🇧 Ad (İngiliscə)',
      type: 'string',
      description: 'İngilis versiyasında (ravio.az/en) göstərilir. Boş qalarsa, Azərbaycanca ad göstərilir.',
    },
    {
      name: 'slug',
      title: '🔗 URL',
      type: 'slug',
      description: '"Generate" düyməsinə bas — avtomatik yaranır. Sayt bunu /kime/... linkində istifadə edir.',
      options: {
        source: 'name',
        maxLength: 60,
        slugify: (input) =>
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
            .slice(0, 60),
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'order',
      title: '🔢 Sıra nömrəsi',
      type: 'number',
      description: '"Kimə alırsan?" menyusunda göstərilmə sırası — kiçik ədəd əvvəldə görünür. Boş qalarsa əlifba sırası ilə göstərilir.',
    },
    {
      name: 'isActive',
      title: '✅ Aktiv (menyuda göstər)?',
      type: 'boolean',
      initialValue: true,
      description: 'Söndürsən menyudan yox olur və səhifəsi bağlanır, məhsullardakı bağlantı isə silinmir — istənilən vaxt yenidən aça bilərsən.',
    },
  ],
  orderings: [
    {
      title: 'Sıra nömrəsi',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', isActive: 'isActive', order: 'order' },
    prepare({ title, isActive, order }) {
      return {
        title: `${isActive ? '✅' : '❌'} ${title || 'Ad yoxdur'}`,
        subtitle: order != null ? `Sıra: ${order}` : 'Sıra təyin edilməyib',
      };
    },
  },
};
