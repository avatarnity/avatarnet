import { useLocation, usePages, useSite } from '@rspress/core/runtime';
import { useHead } from '@unhead/react';

// Per-page browser tab title for Rspress 2.0.8 with a symlinked content tree.
//
// Rspress's default Layout reads title via initPageData(), which keys
// __RSPRESS_PAGE_META by the route's file path. For symlinked .md files,
// that key never matches the one the MDX compiler wrote (which uses the
// resolved real path), so initPageData returns title='' / frontmatter={}
// and Layout falls back to just the global site title — on every page.
//
// We bypass the broken lookup by reading from usePages(), which is built
// from extractPageData on the resolved file and is keyed by routePath
// (URL space). Registered as a globalUIComponent so it renders after
// Layout — last useHead wins, so this one's title is what unhead emits.
export default function PageTitleFix() {
  const { site } = useSite();
  const { pages } = usePages();
  const { pathname } = useLocation();

  // Sidebar links carry a .html suffix but pages.routePath does not.
  const normalize = (p: string) =>
    p.replace(/\.html$/, '').replace(/\/$/, '').toLowerCase();
  const current = pages.find(
    (p: { routePath: string }) => normalize(p.routePath) === normalize(pathname),
  ) as
    | { title?: string; frontmatter?: { title?: string; pageType?: string } }
    | undefined;

  const mainTitle = site.title || '';
  const pageTitle = current?.frontmatter?.title ?? current?.title ?? '';
  const isHome = current?.frontmatter?.pageType === 'home' || pathname === '/';
  const fullTitle =
    isHome || !pageTitle || pageTitle === mainTitle
      ? mainTitle
      : `${pageTitle} | ${mainTitle}`;

  useHead({
    title: fullTitle,
    meta: [{ property: 'og:title', content: fullTitle }],
  });

  return null;
}
