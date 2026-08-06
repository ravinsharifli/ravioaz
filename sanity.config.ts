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