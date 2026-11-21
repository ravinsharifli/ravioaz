// scripts/llms.test.mjs — llms-full.txt qurucusunun sadə yoxlaması (şəbəkəsiz). `npm test` işlədir.
import assert from 'node:assert/strict';
import { buildLlmsFull, formatAzn } from '../lib/llmsFull.mjs';

assert.equal(formatAzn(19.9), '19.90₼');
assert.equal(formatAzn(4.9), '4.90₼');

const out = buildLlmsFull(
  [
    { name: 'Polad Qolbaq', slug: 'polad-qolbaq', category: 'Qolbaqlar', prices: [19.9, 24.9], desc: 'Lazer yazılı qolbaq.' },
    { name: 'Tək Qiymətli', slug: 'tek', category: 'Qolbaqlar', prices: [9.99] },
    { name: 'Qiymətsiz', slug: 'qiymetsiz', category: 'Breloklar', prices: [] },
    { name: '', slug: 'bos' },
    null,
  ],
  '2026-11-21',
);

assert.ok(out.includes('## Qolbaqlar (2 məhsul)'));
assert.ok(out.includes('## Breloklar (1 məhsul)'));
assert.ok(out.includes('[Polad Qolbaq](https://ravio.az/mehsullar/polad-qolbaq) — 19.90₼ – 24.90₼. Lazer yazılı qolbaq.'));
assert.ok(out.includes('[Tək Qiymətli](https://ravio.az/mehsullar/tek) — 9.99₼'));
assert.ok(out.includes('qiymət səhifədə'));
assert.ok(out.includes('Cəmi 3 məhsul'));
assert.ok(!out.includes('/mehsullar/bos'));
console.log('✅ llms.test.mjs keçdi');
