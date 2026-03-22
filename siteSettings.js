export default {
  name: 'siteSettings',
  title: 'Sayt Tənzimləmələri',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    {
      name: 'logo',
      title: '🖼 Loqo (saytda yuxarıda görünür)',
      type: 'image',
      options: { hotspot: true },
      description: 'PNG və ya JPEG. Yükləyin → Publish basın.',
    },
  ],
}