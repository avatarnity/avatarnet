import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(import.meta.dirname, 'content'),
  outDir: 'build',
  title: 'Avatarnet',
  description: 'A post-quantum and decentralized network for digital immortality.',
  icon: '/favicon.svg',
  logoText: 'Avatarnet',
  head: [
    ['meta', { property: 'og:site_name', content: 'Avatarnet' }],
    ['meta', { property: 'og:image', content: '/iconmark-color.svg' }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:image', content: '/iconmark-color.svg' }],
  ],
  markdown: {
    globalComponents: [
      path.join(import.meta.dirname, 'theme', 'HDate.tsx'),
      path.join(import.meta.dirname, 'theme', 'Timeline.tsx'),
    ],
  },
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
