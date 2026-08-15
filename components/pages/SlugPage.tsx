import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, F } from '../../tokens';
import { client } from '../../sanityclient';
import { Product, CartItem } from '../../types';
import { fromCategorySlug, findProductBySlug } from '../../lib/categorySlug';
import { CATEGORY_SEO } from '../../lib/categorySeo';
import { SINGLE_PRODUCT_QUERY, mapSanityProduct } from '../../lib/sanityProduct';
import { getProductPriceRange } from '../../lib/productPrice';
import { getProductMetaDescription } from '../../lib/productMeta';
import { localizedProductName, localizedCategoryName } from '../../lib/productLocale';
import { DEFAULT_BOXES } from '../../constants/defaults';
import { SITE_URL } from '../../constants/seo';
import { getLangFromPath, withLangPrefix, useLocalizedNav } from '../../i18n/useLocalizedNav';
import CatalogLayout from '../catalog/CatalogLayout';
import LoadingGrid from '../catalog/LoadingGrid';
import NotFound from './NotFound';

const ProductPage = React.lazy(() => import('../ProductPage'));

interface SlugPageProps {
  products: Product[];
  loading: boolean;
  categories: string[];
  categoryNameMap?: Record<string, string>;
  setActiveCategory: React.Dispatch<React.SetStateAction<string | null>>;
  openProduct: (p: Product) => void;
  onAddToCart: (item: CartItem) => void;
  bulkDiscountPerUnit?: number;
}

export default function SlugPage({
  products,
  loading,
  categories,
  categoryNameMap,
  setActiveCategory,
  openProduct,
  onAddToCart,
  bulkDiscountPerUnit,
}: SlugPageProps) {
  const { slug: rawSlug = '' } = useParams<{ slug: string }>();
  const slug = decodeURIComponent(rawSlug).trim();
  const { navigate, lang } = useLocalizedNav();
  const location = useLocation();
  const { t } = useTranslation();
  const editItem = (location.state as { editItem?: CartItem } | null)?.editItem;

  const [fetchedProduct, setFetchedProduct] = useState<Product | null>(null);
  const [fetchingProduct, setFetchingProduct] = useState(false);

  const listProduct = useMemo(
    () => (slug ? findProductBySlug(products, slug) : undefined),
    [products, slug],
  );

  // Kateqoriya təyini fetch effektindən ƏVVƏL aparılır. Əvvəllər bu yoxlama
  // effektdən SONRA gəlirdi, ona görə də kateqoriyalar arasında keçiddə (məs.
  // /mehsullar/qolbaqlar → /mehsullar/tesbehler) hər dəfə lazımsız yerə
  // "bu slug-lı MƏHSUL var?" sorğusu Sanity-yə göndərilirdi. O sorğu (həmişə boş
  // qayıdır, çünki slug məhsul deyil, kateqoriyadır) fetchingProduct-u qısa
  // müddətə true edirdi, bu da bütün CatalogLayout-u (sidebar + kateqoriya
  // düymələri + grid) LoadingGrid ilə əvəz edib dərhal geri qaytarırdı —
  // istifadəçiyə "səhifə pozulur" kimi görünən vizual sıçrayış elə budur.
  const isKnownCategory = Boolean(CATEGORY_SEO[slug]);
  const matchedCategory = useMemo(() => fromCategorySlug(slug, categories), [slug, categories]);
  const isSlugACategory = isKnownCategory || (categories.length > 0 && matchedCategory !== null);

  useEffect(() => {
    if (!slug || listProduct || isSlugACategory) {
      setFetchedProduct(null);
      setFetchingProduct(false);
      return;
    }
    if (loading) return;

    let cancelled = false;
    setFetchingProduct(true);

    client
      .fetch(SINGLE_PRODUCT_QUERY, { slug })
      .then((raw: unknown) => {
        if (cancelled) return;
        setFetchedProduct(raw ? mapSanityProduct(raw) : null);
      })
      .catch((err) => {
        console.error('[Sanity] Məhsul yüklənmədi:', slug, err);
        if (!cancelled) setFetchedProduct(null);
      })
      .finally(() => {
        if (!cancelled) setFetchingProduct(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, listProduct, loading, isSlugACategory]);

  const currentProduct = listProduct ?? fetchedProduct ?? null;
  const pageLoading = loading || fetchingProduct;

  const isCategory = !pageLoading && !currentProduct && isSlugACategory;

  useEffect(() => {
    if (isCategory) {
      setActiveCategory(matchedCategory);
    }
  }, [isCategory, matchedCategory, setActiveCategory]);

  if (isCategory) {
    const filteredProducts = matchedCategory
      ? products.filter((p) => p.category === matchedCategory)
      : [];
    // CATEGORY_SEO əl ilə hazırlanmış Azərbaycanca SEO mətnləridir (Google AZ
    // bazarı üçün). İngilis versiyada bunun əvəzinə dinamik, dilə uyğun
    // başlıq/təsvir işlədirik ki, yarımçıq-tərcümə olunmuş mətn göstərilməsin.
    const seo = lang === 'az' ? CATEGORY_SEO[slug] : undefined;
    const displayCategory = matchedCategory ? localizedCategoryName(matchedCategory, lang, categoryNameMap) : null;
    const title = seo?.title || (displayCategory ? `${displayCategory} | Ravio` : t('slugPage.defaultTitle'));
    const desc = seo?.description || `${displayCategory || t('slugPage.breadcrumbProducts')} — ${t('slugPage.categoryDescSuffix')}`;
    const h1 = seo?.h1 || displayCategory || slug;
    const canonicalUrl = `${SITE_URL}${withLangPrefix(`/mehsullar/${slug}`, lang)}`;

    return (
      <>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={desc} />
          <link rel="canonical" href={canonicalUrl} />
          <script type="application/ld+json">
            {JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: h1,
              description: desc,
              url: canonicalUrl,
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: t('slugPage.breadcrumbHome'), item: `${SITE_URL}${withLangPrefix('/', lang)}` },
                  { '@type': 'ListItem', position: 2, name: t('slugPage.breadcrumbProducts'), item: `${SITE_URL}${withLangPrefix('/mehsullar', lang)}` },
                  { '@type': 'ListItem', position: 3, name: h1, item: canonicalUrl },
                ],
              },
            })}
          </script>
        </Helmet>
        <div style={{ padding: '24px 24px 0', maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', fontFamily: F.sans }}>{h1}</h1>
          <p style={{ color: C.textSec, margin: 0, fontSize: 14 }}>
            {loading ? t('productsPage.loading') : t('productsPage.countSuffix', { count: filteredProducts.length })}
          </p>
        </div>
        <CatalogLayout
          activeSlug={slug}
          activeCategory={matchedCategory}
          categories={categories}
          categoryNameMap={categoryNameMap}
          products={products}
          filteredProducts={filteredProducts}
          loading={loading}
          openProduct={openProduct}
        />
      </>
    );
  }

  const primaryImage = currentProduct?.variants?.[0]?.images?.[0] || '';
  const { min, max } = currentProduct ? getProductPriceRange(currentProduct) : { min: 0, max: 0 };
  const anyInStock = currentProduct
    ? (currentProduct.variants || []).some(v => v.inStock !== false)
    : false;
  const productUrl = `${SITE_URL}${withLangPrefix(`/mehsullar/${slug}`, lang)}`;
  const metaDesc = currentProduct ? getProductMetaDescription(currentProduct, lang) : '';
  const displayProductName = currentProduct ? localizedProductName(currentProduct, lang) : '';

  if (pageLoading) {
    return (
      <div style={{ padding: '48px 24px' }}>
        <LoadingGrid />
      </div>
    );
  }

  if (!currentProduct) {
    return <NotFound onHome={() => navigate('/mehsullar')} />;
  }

  return (
    <>
      <Helmet>
        <title>{`${displayProductName} | Ravio`}</title>
        <meta name="description" content={metaDesc} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`${displayProductName} | Ravio`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:url" content={productUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${displayProductName} | Ravio`} />
        <meta name="twitter:description" content={metaDesc} />
        <link rel="canonical" href={productUrl} />
        {primaryImage && <meta property="og:image" content={primaryImage} />}
        {primaryImage && <meta name="twitter:image" content={primaryImage} />}
        {(() => {
          const allPrices = currentProduct.variants
            .map((v) => v.discountPrice ?? v.price)
            .filter(Boolean);
          const priceMin = allPrices.length ? Math.min(...allPrices) : min;
          const priceMax = allPrices.length ? Math.max(...allPrices) : max;
          const allImgs = currentProduct.variants.flatMap((v) => v.images || []).slice(0, 5);
          const avail =
            anyInStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: displayProductName,
            image: allImgs,
            description: metaDesc || `${displayProductName} - Ravio`,
            sku: currentProduct.id,
            brand: { '@type': 'Brand', name: 'Ravio' },
            offers:
              priceMin === priceMax
                ? {
                    '@type': 'Offer',
                    url: productUrl,
                    priceCurrency: 'AZN',
                    price: String(priceMin),
                    availability: avail,
                    seller: { '@type': 'Organization', name: 'Ravio' },
                  }
                : {
                    '@type': 'AggregateOffer',
                    url: productUrl,
                    priceCurrency: 'AZN',
                    lowPrice: String(priceMin),
                    highPrice: String(priceMax),
                    offerCount: currentProduct.variants.length,
                    availability: avail,
                    seller: { '@type': 'Organization', name: 'Ravio' },
                  },
          };
          const breadcrumbSchema = {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: t('slugPage.breadcrumbHome'), item: `${SITE_URL}${withLangPrefix('/', lang)}` },
              { '@type': 'ListItem', position: 2, name: t('slugPage.breadcrumbProducts'), item: `${SITE_URL}${withLangPrefix('/mehsullar', lang)}` },
              { '@type': 'ListItem', position: 3, name: displayProductName, item: productUrl },
            ],
          };
          return (
            <>
              <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
              <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </>
          );
        })()}
      </Helmet>

      <Suspense fallback={<LoadingGrid />}>
        <ProductPage
          product={currentProduct}
          initialData={editItem?.productId === currentProduct.id ? editItem : undefined}
          boxes={DEFAULT_BOXES}
          coupons={currentProduct.coupons || []}
          bulkDiscountPerUnit={bulkDiscountPerUnit}
          onBack={() => navigate('/mehsullar')}
          onAddToCart={onAddToCart}
        />
      </Suspense>
    </>
  );
}
