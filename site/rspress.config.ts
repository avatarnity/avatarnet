import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import { seoPlugin } from './plugins/seoPlugin';

const siteUrl = 'https://avatarnet.org';

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      name: 'Avatarnet',
      url: siteUrl,
      logo: `${siteUrl}/iconmark-color.svg`,
      sameAs: ['https://github.com/avatarnity/avatarnet'],
    },
    {
      '@type': 'WebSite',
      name: 'Avatarnet',
      url: siteUrl,
      description:
        'A post-quantum and decentralized network for digital immortality.',
    },
  ],
});

export default defineConfig({
  root: path.join(import.meta.dirname, 'content'),
  outDir: 'build',
  title: 'Avatarnet',
  description: 'A post-quantum and decentralized network for digital immortality.',
  icon: '/favicon.svg',
  logoText: 'Avatarnet',
  head: [
    ['meta', { property: 'og:site_name', content: 'Avatarnet' }],
    ['meta', { property: 'og:image', content: `${siteUrl}/iconmark-color.svg` }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:image', content: `${siteUrl}/iconmark-color.svg` }],
    // Canonical URL (dynamic per page)
    (route) => ['link', { rel: 'canonical', href: `${siteUrl}${route.routePath}` }],
    (route) => ['meta', { property: 'og:url', content: `${siteUrl}${route.routePath}` }],
    // JSON-LD structured data
    `<script type="application/ld+json">${jsonLd}</script>`,
    // GA4 cookieless mode (no cookies, no consent banner needed)
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-J6TB0E4BDY"></script>',
    "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('consent','default',{analytics_storage:'denied'});gtag('config','G-J6TB0E4BDY');</script>",
  ],
  markdown: {
    globalComponents: [
      path.join(import.meta.dirname, 'theme', 'HDate.tsx'),
      path.join(import.meta.dirname, 'theme', 'Timeline.tsx'),
      path.join(import.meta.dirname, 'theme', 'DataCenterMap.tsx'),
    ],
  },
  plugins: [seoPlugin({ siteUrl })],
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/avatarnity/avatarnet',
      },
    ],
    footer: {
      message: 'Released under the AGPL-3.0 License. All documentation licensed under CC-BY-SA 4.0.',
    },
    lastUpdated: true,
  },
});
