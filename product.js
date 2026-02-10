export default {
  name: 'product',
  title: 'Məhsul',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Məhsulun Adı',
      type: 'string',
    },
    {
      name: 'category',
      title: 'Kateqoriya',
      type: 'reference',
      to: [{type: 'category'}], 
    },
    {
      name: 'price',
      title: 'Qiymət',
      type: 'number',
    },
    {
      name: 'description',
      title: 'Məhsul haqqında',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Şəkil',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
  ],
}