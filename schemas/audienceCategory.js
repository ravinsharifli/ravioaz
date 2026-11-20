// schemas/audienceCategory.js
// "Kimə alırsan?" menyusundakı bölmələr (Qadınlar üçün, Kişilər üçün,
// Sevgililər üçün cüt hədiyyə, Korporativ hədiyyə və s.)
//
// Tam sərbəst idarə olunur: istədiyin qədər əlavə et, sil, yenidən adlandır —
// heç bir kod dəyişikliyi lazım deyil. Hər məhsulda "schemas/product.js" sənədindəki
// "🎯 Kimə aiddir?" sahəsindən bu bölmələrə bağlanır.

import { makeSlugify } from './slugify'

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
        slugify: makeSlugify(60),
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: '📄 Səhifə mətni (Azərbaycanca)',
      type: 'text',
      rows: 6,
      description: 'Bölmə səhifəsində başlığın altında göstərilir. Google bu mətnə baxıb səhifənin nə haqqında olduğunu anlayır. 80–200 söz yaz: kimə, hansı hallar üçün, hansı məhsullar, fərdiləşdirmə və çatdırılma. Paraqrafları boş sətirlə ayır. Boş qalarsa mətn göstərilmir.',
    },
    {
      name: 'descriptionEn',
      title: '🇬🇧 Səhifə mətni (İngiliscə)',
      type: 'text',
      rows: 6,
      description: 'İngilis versiyasında (ravio.az/en) göstərilir. Boş qalarsa İngilis səhifədə mətn göstərilmir.',
    },
    {
      name: 'seoTitle',
      title: '🔎 Google başlığı (Azərbaycanca, ixtiyari)',
      type: 'string',
      description: 'Google-da görünən başlıq (50–60 simvol). Boş qalarsa avtomatik şablon istifadə olunur.',
      validation: (Rule) => Rule.max(70).warning('70 simvoldan uzun başlıq Google-da kəsilə bilər.'),
    },
    {
      name: 'seoDescription',
      title: '🔎 Google təsviri (Azərbaycanca, ixtiyari)',
      type: 'text',
      rows: 3,
      description: 'Google-da başlığın altında görünən təsvir (140–160 simvol). Boş qalarsa avtomatik şablon istifadə olunur.',
      validation: (Rule) => Rule.max(170).warning('170 simvoldan uzun təsvir Google-da kəsilə bilər.'),
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
