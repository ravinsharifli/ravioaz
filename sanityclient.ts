import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: 'w7scii42', 
  dataset: 'production',
  useCdn: true,  // true - CDN vasitəsilə sürətli yükləmə
  apiVersion: '2026-02-09', 
});