import type { CartItem, CartUnit } from '../types';

/** Ədədlər arasında fərqli rəng seçilibmi? */
export function hasMixedColors(item: Pick<CartItem, 'units'>): boolean {
  const u = item.units;
  return !!u && u.length > 1 && u.some((x) => x.variantIndex !== u[0].variantIndex);
}

/** "Gümüşü ×1 · Qızılı ×1" — rənglər ilk görünmə sırası ilə qruplaşdırılır. */
export function colorSummary(units: CartUnit[], localize: (c?: string) => string): string {
  const order: string[] = [];
  const counts = new Map<string, number>();
  for (const u of units) {
    const name = localize(u.colorName) || '—';
    if (!counts.has(name)) order.push(name);
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }
  return order.map((n) => `${n} ×${counts.get(n)}`).join(' · ');
}

/** Say dəyişəndə units massivini yeni sayla uyğunlaşdırır (çatmayanlar əsas rənglə tamamlanır). */
export function resizeUnits(item: CartItem, newQuantity: number): CartUnit[] | undefined {
  if (!item.units) return undefined;
  const main: CartUnit = item.units[0] ?? {
    variantIndex: item.variantIndex,
    colorName: item.colorName,
    image: item.images?.[0],
  };
  const out = item.units.slice(0, newQuantity);
  while (out.length < newQuantity) out.push({ ...main });
  return out;
}
