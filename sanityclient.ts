import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'w7scii42', 
  dataset: 'production',
  useCdn: false,  // false - həmişə ən təzə məlumatları gətirir
  apiVersion: '2026-02-09', 
});