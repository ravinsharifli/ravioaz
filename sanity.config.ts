import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schameTypes'

export default defineConfig({
  name: 'default',
  title: 'MyProducts',

  projectId: 'w7scii42',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: schemaTypes,
  },
})