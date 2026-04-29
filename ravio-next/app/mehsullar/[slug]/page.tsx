import { client } from '@/lib/sanity';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const slugs = await client.fetch(
    `*[_type == "product" && defined(slug.current)]{ "slug": slug.current }`
  );
  return slugs.map((s: { slug: string }) => ({ slug: s.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{ name, description }`,
    { slug }
  );
  if (!product) return { title: 'Məhsul tapılmadı' };
  return {
    title: `${product.name} | Ravio`,
    description: product.description || `${product.name} — Ravio`,
  };
}

export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await client.fetch(
    `*[_type == "product" && slug.current == $slug][0]{
      _id, name, description,
      "variants": variants[]{ modelName, colorName, price, discountPrice, stock }
    }`,
    { slug }
  );

  if (!product) notFound();

  return (
    <main style={{ padding: '32px' }}>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </main>
  );
}

export const revalidate = 60;