import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import fileTree from 'rspress-plugin-file-tree';
import { seoPlugin } from './plugins/seoPlugin';

const siteUrl = 'https://avatarnet.tech';

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
  title: 'Avatarnet: A Digital Heaven',
  description: 'A post-quantum and decentralized network for digital immortality.',
  icon: '/favicon-32.png',
  logoText: 'Avatarnet',
  head: [
    // Default to dark theme on first visit. Must run BEFORE Rspress's theme
    // script (which respects localStorage); pre-seeding here means no flash
    // from a brief light render before switching to dark.
    `<script>try{if(!localStorage.getItem('rspress-theme-appearance'))localStorage.setItem('rspress-theme-appearance','dark')}catch(e){}</script>`,
    // Raster favicon for Google search results (Google's image pipeline picks up PNG more reliably than SVG)
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
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
    '<script async src="https://www.googletagmanager.com/gtag/js?id=G-JQMYNEKKSJ"></script>',
    "<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('consent','default',{analytics_storage:'denied'});gtag('config','G-JQMYNEKKSJ');</script>",
  ],
  markdown: {
    globalComponents: [
      path.join(import.meta.dirname, 'theme', 'HDate.tsx'),
      path.join(import.meta.dirname, 'theme', 'Timeline.tsx'),
      path.join(import.meta.dirname, 'theme', 'DataCenterMap.tsx'),
    ],
  },
  plugins: [seoPlugin({ siteUrl }), fileTree({ initialExpandDepth: Infinity })],
  globalUIComponents: [
    // Forces per-page <title> via useHead — see theme/PageTitleFix.tsx for the
    // Rspress 2.0.8 client-side title bug this works around.
    path.join(import.meta.dirname, 'theme', 'PageTitleFix.tsx'),
  ],
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
