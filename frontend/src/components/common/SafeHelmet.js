// src/components/common/SafeHelmet.js
import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SafeHelmet Component
 * 
 * A comprehensive wrapper around react-helmet-async that handles all SEO metadata,
 * Open Graph tags, Twitter Cards, and structured data for the e-commerce platform.
 * 
 * Features:
 * - Safe string conversion to prevent "Helmet expects a string" errors
 * - Complete Open Graph meta tags for social media sharing
 * - Twitter Card support for Twitter/X previews
 * - Structured data (JSON-LD) for enhanced search results
 * - Canonical URL handling for SEO
 * - Multi-language support (en, sw for Swahili)
 * - Mobile-optimized viewport settings
 * - Favicon and app icon management
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (will be appended with site name)
 * @param {string} props.description - Page meta description
 * @param {string} props.keywords - SEO keywords (comma-separated)
 * @param {string} props.image - Social media preview image URL
 * @param {string} props.url - Canonical page URL
 * @param {string} props.type - Open Graph type (website, product, article, etc.)
 * @param {string} props.siteName - Override default site name
 * @param {string} props.locale - Page locale (default: en_KE)
 * @param {Object} props.product - Product-specific metadata for product pages
 * @param {Object} props.article - Article-specific metadata for blog posts
 * @param {boolean} props.noIndex - Prevent search engine indexing
 * @param {boolean} props.noFollow - Prevent search engines from following links
 * @param {Object} props.structuredData - Custom JSON-LD structured data
 * @param {React.ReactNode} props.children - Additional helmet children
 */
const SafeHelmet = ({ 
  title = '',
  description = '',
  keywords = '',
  image = '',
  url = '',
  type = 'website',
  siteName = 'Oshocks Junior Bike Shop',
  locale = 'en_KE',
  product = null,
  article = null,
  noIndex = false,
  noFollow = false,
  structuredData = null,
  children,
  ...props 
}) => {
  // ========================================
  // SAFE STRING CONVERSION
  // ========================================
  const toSafeString = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return String(value).trim();
  };

  // ========================================
  // BASE METADATA
  // ========================================
  const defaultTitle = 'Oshocks Junior Bike Shop';
  const defaultDescription = 'Kenya\'s Premier Cycling Marketplace - Shop bicycles, accessories, spare parts & cycling gear. Fast delivery across Nairobi & Kenya. M-Pesa & Card payments accepted.';
  const defaultKeywords = 'bicycles Kenya, bike shop Nairobi, cycling accessories, bicycle spare parts, mountain bikes, road bikes, M-Pesa bicycle payment';
  const defaultImage = `${window.location.origin}/images/og-default.jpg`;
  const baseUrl = window.location.origin;

  const safeTitle = toSafeString(title, defaultTitle);
  const fullTitle = title ? `${safeTitle} | ${siteName}` : siteName;
  const safeDescription = toSafeString(description, defaultDescription);
  const safeKeywords = toSafeString(keywords, defaultKeywords);
  const safeImage = toSafeString(image, defaultImage);
  const safeUrl = toSafeString(url, window.location.href);
  const safeSiteName = toSafeString(siteName);
  const safeLocale = toSafeString(locale);
  const safeType = toSafeString(type);

  // ========================================
  // ROBOTS META TAG
  // ========================================
  const robotsContent = [];
  if (noIndex) robotsContent.push('noindex');
  if (noFollow) robotsContent.push('nofollow');
  const robotsTag = robotsContent.length > 0 
    ? robotsContent.join(', ') 
    : 'index, follow';

  // ========================================
  // STRUCTURED DATA (JSON-LD)
  // ========================================
  const generateStructuredData = () => {
    // Custom structured data takes precedence
    if (structuredData) {
      return structuredData;
    }

    // Default Organization Schema
    const organizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: safeSiteName,
      url: baseUrl,
      logo: `${baseUrl}/images/logo.png`,
      description: defaultDescription,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KE',
        addressLocality: 'Nairobi'
      },
      sameAs: [
        // Add social media URLs here when available
        // 'https://facebook.com/oshocksjunior',
        // 'https://instagram.com/oshocksjunior',
      ]
    };

    // Product Schema for product pages
    if (product) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: toSafeString(product.name),
        description: toSafeString(product.description),
        image: toSafeString(product.image, safeImage),
        brand: {
          '@type': 'Brand',
          name: toSafeString(product.brand, 'Oshocks')
        },
        offers: {
          '@type': 'Offer',
          price: toSafeString(product.price),
          priceCurrency: 'KES',
          availability: product.inStock 
            ? 'https://schema.org/InStock' 
            : 'https://schema.org/OutOfStock',
          url: safeUrl,
          seller: {
            '@type': 'Organization',
            name: safeSiteName
          }
        },
        ...(product.rating && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: toSafeString(product.rating.value),
            reviewCount: toSafeString(product.rating.count)
          }
        }),
        ...(product.sku && { sku: toSafeString(product.sku) })
      };
    }

    // Article Schema for blog posts
    if (article) {
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: safeTitle,
        description: safeDescription,
        image: safeImage,
        datePublished: toSafeString(article.publishDate),
        dateModified: toSafeString(article.modifiedDate || article.publishDate),
        author: {
          '@type': 'Person',
          name: toSafeString(article.author, 'Oshocks Team')
        },
        publisher: {
          '@type': 'Organization',
          name: safeSiteName,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/images/logo.png`
          }
        }
      };
    }

    // Default Website Schema
    return organizationSchema;
  };

  const jsonLd = generateStructuredData();

  // ========================================
  // RENDER COMPONENT
  // ========================================
  return (
    <Helmet {...props}>
      {/* ===== PRIMARY META TAGS ===== */}
      <html lang={safeLocale.split('_')[0]} />
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={safeDescription} />
      <meta name="keywords" content={safeKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={safeUrl} />
      
      {/* Robots */}
      <meta name="robots" content={robotsTag} />
      
      {/* Viewport & Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#1a73e8" />
      
      {/* Language Alternatives */}
      <link rel="alternate" hrefLang="en" href={safeUrl} />
      <link rel="alternate" hrefLang="sw" href={safeUrl} />
      <link rel="alternate" hrefLang="x-default" href={safeUrl} />

      {/* ===== OPEN GRAPH / FACEBOOK ===== */}
      <meta property="og:type" content={safeType} />
      <meta property="og:url" content={safeUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={safeImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={safeSiteName} />
      <meta property="og:locale" content={safeLocale} />
      
      {/* Product-specific OG tags */}
      {product && (
        <>
          <meta property="og:price:amount" content={toSafeString(product.price)} />
          <meta property="og:price:currency" content="KES" />
          {product.availability && (
            <meta property="og:availability" content={product.inStock ? 'instock' : 'outofstock'} />
          )}
        </>
      )}

      {/* ===== TWITTER CARD ===== */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={safeUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={safeImage} />
      {/* Add Twitter handle when available */}
      {/* <meta name="twitter:site" content="@oshocksjunior" /> */}

      {/* ===== MOBILE APP META ===== */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={safeSiteName} />
      <meta name="format-detection" content="telephone=yes" />
      
      {/* ===== FAVICONS ===== */}
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* ===== STRUCTURED DATA (JSON-LD) ===== */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* ===== ADDITIONAL CUSTOM TAGS ===== */}
      {children}
    </Helmet>
  );
};

// ========================================
// PROP TYPES VALIDATION
// ========================================
SafeHelmet.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  keywords: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.oneOf([
    'website', 
    'product', 
    'article', 
    'profile'
  ]),
  siteName: PropTypes.string,
  locale: PropTypes.string,
  product: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    brand: PropTypes.string,
    sku: PropTypes.string,
    inStock: PropTypes.bool,
    rating: PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      count: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  }),
  article: PropTypes.shape({
    publishDate: PropTypes.string,
    modifiedDate: PropTypes.string,
    author: PropTypes.string
  }),
  noIndex: PropTypes.bool,
  noFollow: PropTypes.bool,
  structuredData: PropTypes.object,
  children: PropTypes.node
};

export default SafeHelmet;