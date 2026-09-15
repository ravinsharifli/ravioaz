import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PortableText, PortableTextComponents } from '@portabletext/react';
import { C, F } from '../../tokens';
import { BlogPostDetail } from '../../types';
import { client } from '../../sanityclient';
import { BLOG_POST_QUERY, mapBlogDetail } from '../../lib/sanityBlog';
import { toWebP } from '../../lib/image';
import { getLangFromPath, withLangPrefix } from '../../i18n/useLocalizedNav';
import { SITE_URL, OG_IMAGE } from '../../constants/seo';

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.black, fontFamily: F.sans, margin: '32px 0 12px' }}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontSize: 18, fontWeight: 700, color: C.black, fontFamily: F.sans, margin: '26px 0 10px' }}>{children}</h3>
    ),
    normal: ({ children }) => (
      <p style={{ fontSize: 16, lineHeight: 1.8, color: '#333333', fontFamily: F.sans, margin: '0 0 18px' }}>{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: `3px solid ${C.primary}`,
          margin: '20px 0',
          padding: '4px 0 4px 18px',
          fontSize: 16,
          fontStyle: 'italic',
          color: '#444444',
        }}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul style={{ margin: '0 0 18px', paddingLeft: 22, color: '#333333', fontSize: 16, lineHeight: 1.8 }}>{children}</ul>,
    number: ({ children }) => <ol style={{ margin: '0 0 18px', paddingLeft: 22, color: '#333333', fontSize: 16, lineHeight: 1.8 }}>{children}</ol>,
  },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer" style={{ color: C.primary, textDecoration: 'underline' }}>
        {children}
      </a>
    ),
    strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  },
  types: {
    image: ({ value }) => {
      const url = value?.asset?.url;
      if (!url) return null;
      return (
        <img
          src={toWebP(url, 900, 78)}
          alt={value?.alt || ''}
          style={{ width: '100%', borderRadius: 12, margin: '24px 0', display: 'block' }}
        />
      );
    },
  },
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const lang = getLangFromPath(location.pathname);

  const [post, setPost] = useState<BlogPostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setPost(null);
    let cancelled = false;
    client
      .fetch<any>(BLOG_POST_QUERY, { slug })
      .then((raw) => {
        if (!cancelled) setPost(raw ? mapBlogDetail(raw) : null);
      })
      .catch((err) => console.error('[Sanity] Blog yazısı yüklənmə xətası:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return <div style={{ padding: '64px 24px', textAlign: 'center' as const, color: C.textSec }}>{t('blogListPage.loading')}</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: '64px 24px', maxWidth: 640, margin: '0 auto', textAlign: 'center' as const }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 10px', fontFamily: F.sans, color: C.black }}>
          {t('blogPostPage.notFoundTitle')}
        </h1>
        <p style={{ color: C.textSec, margin: '0 0 20px', fontSize: 14 }}>{t('blogPostPage.notFoundText')}</p>
        <Link
          to={withLangPrefix('/blog', lang)}
          style={{
            display: 'inline-block', padding: '11px 22px', background: C.primary, color: C.white,
            borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: F.sans, textDecoration: 'none',
          }}
        >
          {t('blogPostPage.notFoundCta')}
        </Link>
      </div>
    );
  }

  const title = lang === 'en' && post.titleEn ? post.titleEn : post.title;
  const excerpt = lang === 'en' && post.excerptEn ? post.excerptEn : post.excerpt;
  const body = lang === 'en' && post.bodyEn && post.bodyEn.length > 0 ? post.bodyEn : post.body;
  const metaTitle = post.seoTitle || `${title} | Ravio Blog`;
  const metaDescription = post.seoDescription || excerpt;
  const canonicalUrl = `${SITE_URL}${withLangPrefix(`/blog/${post.slug}`, lang)}`;
  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: metaDescription,
    image: post.coverImageUrl || OG_IMAGE,
    datePublished: post.publishedAt,
    author: { '@type': 'Organization', name: 'Ravio' },
    publisher: { '@type': 'Organization', name: 'Ravio', logo: { '@type': 'ImageObject', url: OG_IMAGE } },
    mainEntityOfPage: canonicalUrl,
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        {post.coverImageUrl && <meta property="og:image" content={post.coverImageUrl} />}
        <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      </Helmet>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 64px' }}>
        <Link
          to={withLangPrefix('/blog', lang)}
          style={{ fontSize: 13, fontWeight: 600, color: C.textSec, textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}
        >
          {t('blogPostPage.backToBlog')}
        </Link>

        {dateStr && (
          <span style={{ display: 'block', fontSize: 12, fontWeight: 600, color: C.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' as const, marginBottom: 10 }}>
            {dateStr}
          </span>
        )}
        <h1 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: C.black, fontFamily: F.sans, margin: '0 0 24px', lineHeight: 1.25 }}>
          {title}
        </h1>

        {post.coverImageUrl && (
          <img
            src={toWebP(post.coverImageUrl, 1000, 78)}
            alt={title}
            style={{ width: '100%', borderRadius: 14, marginBottom: 28, display: 'block' }}
          />
        )}

        <div>
          <PortableText value={body} components={portableTextComponents} />
        </div>
      </article>
    </>
  );
}
