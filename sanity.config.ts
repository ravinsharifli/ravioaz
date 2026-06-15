import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schameTypes'

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
              .title('Sifarişlər')
              .child(
                S.documentTypeList('order')
                  .title('Sifarişlər')
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),

            S.listItem()
              .title('Bu ayın sifarişləri')
              .child(
                S.documentList()
                  .title('Bu ayın sifarişləri')
                  .schemaType('order')
                  .filter('_type == "order" && year == $year && month == $month')
                  .params({
                    year: new Date().getFullYear(),
                    month: new Date().getMonth() + 1,
                  })
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),

            S.listItem()
              .title('Bu ilin sifarişləri')
              .child(
                S.documentList()
                  .title('Bu ilin sifarişləri')
                  .schemaType('order')
                  .filter('_type == "order" && year == $year')
                  .params({
                    year: new Date().getFullYear(),
                  })
                  .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
              ),

            S.divider(),

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