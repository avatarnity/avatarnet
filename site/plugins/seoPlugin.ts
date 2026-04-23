import * as fs from 'node:fs';
import * as path from 'node:path';
import type { RspressPlugin } from '@rspress/core';

interface SeoPluginOptions {
  siteUrl: string;
}

export function seoPlugin({ siteUrl }: SeoPluginOptions): RspressPlugin {
  return {
    name: 'seo-plugin',

    async afterBuild(config, _isProd) {
      const outDir = config.outDir ?? 'build';
      const buildDir = path.isAbsolute(outDir)
        ? outDir
        : path.resolve(import.meta.dirname, '..', outDir);

      if (!fs.existsSync(buildDir)) return;

      await generateSitemap(buildDir, siteUrl);
      await generateLlmsFullTxt(buildDir, config.root ?? 'content');
    },
  };
}

async function generateSitemap(buildDir: string, siteUrl: string) {
  const htmlFiles: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'static') {
        walk(full);
      } else if (entry.isFile() && entry.name.endsWith('.html') && entry.name !== '404.html') {
        htmlFiles.push(full);
      }
    }
  }

  walk(buildDir);

  const today = new Date().toISOString().split('T')[0];
  const urls = htmlFiles.map(file => {
    const relative = path.relative(buildDir, file).replace(/\\/g, '/');
    const loc = relative === 'index.html' ? '' : relative;
    return `  <url>\n    <loc>${siteUrl}/${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

  fs.writeFileSync(path.join(buildDir, 'sitemap.xml'), xml);
  console.log(`[seo-plugin] sitemap.xml generated (${urls.length} URLs)`);
}

async function generateLlmsFullTxt(buildDir: string, contentRoot: string) {
  const contentDir = path.isAbsolute(contentRoot)
    ? contentRoot
    : path.resolve(import.meta.dirname, '..', contentRoot);

  const mdFiles: string[] = [];

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const stat = fs.statSync(full);
      if (stat.isDirectory() && entry.name !== 'public') {
        walk(full);
      } else if (stat.isFile() && /\.(md|mdx)$/.test(entry.name) && !/^index\.(md|mdx)$/.test(entry.name)) {
        mdFiles.push(full);
      }
    }
  }

  walk(contentDir);
  mdFiles.sort();

  const sections: string[] = ['# Avatarnet Documentation (Full Export)\n'];

  for (const file of mdFiles) {
    const raw = fs.readFileSync(file, 'utf-8');
    const { title, body } = parseFrontmatter(raw);
    if (!body.trim()) continue;
    sections.push(`## ${title || path.basename(file, path.extname(file))}\n\n${body.trim()}\n`);
  }

  fs.writeFileSync(path.join(buildDir, 'llms-full.txt'), sections.join('\n'));
  console.log(`[seo-plugin] llms-full.txt generated (${mdFiles.length} pages)`);
}

function parseFrontmatter(raw: string): { title: string; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { title: '', body: raw };

  const fm = match[1];
  const body = match[2];
  const titleMatch = fm.match(/^title:\s*["']?(.+?)["']?\s*$/m);
  return { title: titleMatch?.[1] ?? '', body };
}
