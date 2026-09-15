import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { C, F, R } from '../../tokens';
import { BlogPostSummary } from '../../types';
import { client } from '../../sanityclient';
import { BLOG_LIST_QUERY, mapBlogSummary } from '../../lib/sanityBlog';
import { toWebP } from '../../lib/image';
import { getLangFromPath, withLangPrefix } from '../../i18n/useLocalizedNav';
import { SITE_URL } from '../../constants/seo';

export default function BlogListPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const lang = getLangFromPath(location.pathname);
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    client
      .fetch<any[]>(BLOG_LIST_QUERY)
      .then((raw) => {
        if (!cancelled) setPosts(raw.map(mapBlogSummary));
      })
      .catch((err) => console.error('[Sanity] Blog siyahısı yüklənmə xətası:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('blogListPage.meta.title')}</title>
        <meta name="description" content={t('blogListPage.meta.description')} />
        <link rel="canonical" href={`${SITE_URL}${withLangPrefix('/blog', lang)}`} />
      </Helmet>

      <div style={{ padding: '32px 24px 8px', maxWidth: 1120, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: 0, fontFamily: F.sans, color: C.black, letterSpacing: '-0.3px' }}>
          {t('blogListPage.title')}
        </h1>
      </div>

      <div style={{ padding: '24px 24px 56px', maxWidth: 1120, margin: '0 auto' }}>
        {loading ? (
          <p style={{ color: C.textSec, fontSize: 14 }}>{t('blogListPage.loading')}</p>
        ) : posts.length === 0 ? (
          <p style={{ color: C.textSec, fontSize: 14, padding: '32px 0' }}>{t('blogListPage.empty')}</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {posts.map((post) => {
              const title = lang === 'en' && post.titleEn ? post.titleEn : post.title;
              const excerpt = lang === 'en' && post.excerptEn ? post.excerptEn : post.excerpt;
              const dateStr = post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'az-AZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '';
              return (
                <Link
                  key={post.id}
                  to={withLangPrefix(`/blog/${post.slug}`, lang)}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <BlogCard imageUrl={post.coverImageUrl} title={title} excerpt={excerpt} date={dateStr} readMoreText={t('blogListPage.readMore')} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

function BlogCard({
  imageUrl,
  title,
  excerpt,
  date,
  readMoreText,
}: {
  imageUrl: string;
  title: string;
  excerpt: string;
  date: string;
  readMoreText: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? C.primary : C.border}`,
        borderRadius: R.lg,
        overflow: 'hidden',
        background: C.white,
        transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
        boxShadow: hovered ? '0 10px 30px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ aspectRatio: '16/10', background: C.bg, overflow: 'hidden' }}>
        {imageUrl && (
          <img
            src={toWebP(imageUrl, 560, 72)}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
        {date && (
          <span style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
            {date}
          </span>
        )}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.black, fontFamily: F.sans, margin: '0 0 8px', lineHeight: 1.35 }}>
          {title}
        </h2>
        <p style={{ fontSize: 13, color: C.textSec, lineHeight: 1.5, margin: '0 0 14px', flex: 1 }}>{excerpt}</p>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{readMoreText}</span>
      </div>
    </div>
  );
}
