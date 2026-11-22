import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Ravio Admin',

  projectId: 'w7scii42',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Ravio')
          .items([
            S.listItem()
              .title('Məhsullar')
              .child(
                S.documentTypeList('product').title('Məhsullar')
              ),

            S.listItem()
              .title('Kateqoriyalar')
              .child(
                S.documentTypeList('category').title('Kateqoriyalar')
              ),

            S.listItem()
              .title('Sifarişlər')
              .child(
                S.documentTypeList('order')
                  .title('Sifarişlər')
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),

            S.listItem()
              .title('📰 Blog yazıları')
              .child(
                S.documentTypeList('blogPost')
                  .title('Blog yazıları')
                  .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
              ),

            S.listItem()
              .title('Kimə hədiyyə (kateqoriyalar)')
              .child(
                S.documentTypeList('audienceCategory').title('Kimə hədiyyə (kateqoriyalar)')
              ),

            S.divider(),

            S.listItem()
              .title('Sayt tənzimləmələri')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
                  .title('Sayt tənzimləmələri')
              ),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes as any,
  },
})