import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';

interface DataCenter {
  name: string;
  lat: number;
  lng: number;
  mw: number;
  country: string;
  source: string;
  sourceUrl?: string;
  // If the figure was inferred (interpolated, midpointed, or back-projected
  // from a stated number rather than reported directly), explain the math here.
  note?: string;
}

// Major data center markets worldwide, operational/live IT load in MW
// All figures verified from primary or trade-press sources during the 2025 audit.
// Per-city sourceUrl points to the exact report/article that reported the figure.
const DATA_CENTERS: DataCenter[] = [
  // United States
  { name: 'Northern Virginia', lat: 38.95, lng: -77.45, mw: 3945, country: 'US', source: 'SSG', sourceUrl: 'https://info.siteselectiongroup.com/blog/the-10-largest-u.s.-data-center-metro-areas-by-power-capacity-in-2025' },
  { name: 'Phoenix', lat: 33.45, lng: -112.07, mw: 1380, country: 'US', source: 'SSG', sourceUrl: 'https://info.siteselectiongroup.com/blog/the-10-largest-u.s.-data-center-metro-areas-by-power-capacity-in-2025' },
  { name: 'Dallas\u2013Fort Worth', lat: 32.9, lng: -97.04, mw: 1125, country: 'US', source: 'SSG', sourceUrl: 'https://info.siteselectiongroup.com/blog/the-10-largest-u.s.-data-center-metro-areas-by-power-capacity-in-2025' },
  { name: 'Atlanta', lat: 33.75, lng: -84.39, mw: 1065, country: 'US', source: 'SSG', sourceUrl: 'https://info.siteselectiongroup.com/blog/the-10-largest-u.s.-data-center-metro-areas-by-power-capacity-in-2025' },
  { name: 'Chicago', lat: 41.88, lng: -87.63, mw: 805, country: 'US', source: 'SSG', sourceUrl: 'https://info.siteselectiongroup.com/blog/the-10-largest-u.s.-data-center-metro-areas-by-power-capacity-in-2025' },
  { name: 'Portland / Hillsboro', lat: 45.54, lng: -122.94, mw: 800, country: 'US', source: 'Hillsboro News Times', sourceUrl: 'https://hillsboronewstimes.com/2025/10/01/one-of-hillsboros-largest-data-center-operators-plans-6th-facility/' },
  { name: 'Silicon Valley', lat: 37.39, lng: -122.03, mw: 718, country: 'US', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/books/north-america-data-center-trends-h2-2025', note: 'CBRE figure for the Silicon Valley market boundary; bleeds into the broader South Bay.' },
  { name: 'Northern New Jersey', lat: 40.73, lng: -74.17, mw: 572, country: 'US', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/new-jersey-data-center-market' },
  { name: 'Austin', lat: 30.27, lng: -97.74, mw: 165, country: 'US', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/books/north-america-data-center-trends-h2-2025' },
  { name: 'Las Vegas', lat: 36.17, lng: -115.14, mw: 427, country: 'US', source: 'Data Center Frontier', sourceUrl: 'https://www.datacenterfrontier.com/site-selection/article/33012732/hyperscale-driven-us-mountain-west-data-center-markets-continue-building-up-and-big' },

  // Asia Pacific
  { name: 'Beijing', lat: 39.9, lng: 116.4, mw: 2000, country: 'CN', source: 'Cushman & Wakefield', sourceUrl: 'https://www.cushmanwakefield.com/en/greater-china/news/2025/06/surging-demand-for-data-infrastructure-fuels-real-estate-transformation' },
  { name: 'Shanghai', lat: 31.23, lng: 121.47, mw: 1200, country: 'CN', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/reports/global-data-center-trends-2025', note: "CBRE only states '>1 GW'. Floor 1000 + typical 2024 growth ≈ 1200." },
  { name: 'Tokyo', lat: 35.68, lng: 139.69, mw: 1160, country: 'JP', source: 'Cushman & Wakefield', sourceUrl: 'https://www.cushmanwakefield.com/en/news/2025/05/demand-for-data-infrastructure-fuels-real-estate-transformation-across-global-data-center-markets' },
  { name: 'Hong Kong', lat: 22.32, lng: 114.17, mw: 1090, country: 'HK', source: 'Arizton', sourceUrl: 'https://www.arizton.com/market-reports/hong-kong-data-center-market-size-analysis' },
  { name: 'Singapore', lat: 1.35, lng: 103.82, mw: 1000, country: 'SG', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/reports/asia-pacific-data-centre-trends-opportunities' },
  { name: 'Mumbai', lat: 19.08, lng: 72.88, mw: 810, country: 'IN', source: 'Cushman & Wakefield', sourceUrl: 'https://www.cushmanwakefield.com/en/india/news/2025/07/mumbais-under-construction-data-center-capacity-ranks-6th-globally' },
  { name: 'Sydney', lat: -33.87, lng: 151.21, mw: 789, country: 'AU', source: 'm3 Property', sourceUrl: 'https://m3property.com.au/static/88f0d39061ca9072f2bf0a5b61dc5c3f/M3-Property-Report-Data-Centre-Growth-in-Australia-November-25.pdf' },
  { name: 'Jakarta', lat: -6.21, lng: 106.85, mw: 659, country: 'ID', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/jakarta-data-center-market' },
  { name: 'Bangkok', lat: 13.76, lng: 100.50, mw: 540, country: 'TH', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/thailand-data-center-market' },
  { name: 'Seoul', lat: 37.57, lng: 126.98, mw: 520, country: 'KR', source: 'W.Media', sourceUrl: 'https://w.media/a-closer-look-at-south-koreas-data-center-market-in-2025/' },
  { name: 'Johor Bahru', lat: 1.49, lng: 103.74, mw: 487, country: 'MY', source: 'JLL', sourceUrl: 'https://www.jll.com/en-sea/insights/market-dynamics/johor-bahru-data-centre' },
  { name: 'Manila', lat: 14.60, lng: 120.98, mw: 316, country: 'PH', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/philippines-data-center-market' },
  { name: 'Kuala Lumpur', lat: 3.14, lng: 101.69, mw: 200, country: 'MY', source: 'JLL', sourceUrl: 'https://www.jll.com/en-sea/newsroom/kuala-lumpur-q2-2025-market-dynamics-report' },
  { name: 'Ho Chi Minh City', lat: 10.82, lng: 106.63, mw: 78, country: 'VN', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/vietnam-data-center-market' },

  // Europe
  { name: 'Frankfurt', lat: 50.11, lng: 8.68, mw: 1300, country: 'DE', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/frankfurt-data-center-market' },
  { name: 'London', lat: 51.51, lng: -0.13, mw: 1189, country: 'GB', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/figures/european-data-centres-figures-q2-2025' },
  { name: 'Dublin', lat: 53.35, lng: -6.26, mw: 1150, country: 'IE', source: 'Gardiner & Theobald', sourceUrl: 'https://www.gardiner.com/marketintel/dublin-the-heart-of-irelands-data-centre-boom' },
  { name: 'Amsterdam', lat: 52.37, lng: 4.9, mw: 1050, country: 'NL', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/amsterdam-data-center-market' },
  { name: 'Paris', lat: 48.86, lng: 2.35, mw: 600, country: 'FR', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/reports/global-data-center-trends-2025', note: 'CBRE reports a 500–700 MW range; midpoint used.' },
  { name: 'Milan', lat: 45.46, lng: 9.19, mw: 200, country: 'IT', source: 'Cushman & Wakefield', sourceUrl: 'https://www.cushmanwakefield.com/en/insights/emea-data-centre-update' },
  { name: 'Madrid', lat: 40.42, lng: -3.7, mw: 195, country: 'ES', source: 'Cushman & Wakefield', sourceUrl: 'https://www.cushmanwakefield.com/en/spain/news/2025/03/madrid-among-the-top-10-cities-for-data-center-infrastructure-in-emea' },
  { name: 'Warsaw', lat: 52.23, lng: 21.01, mw: 157, country: 'PL', source: 'Cushman & Wakefield', sourceUrl: 'https://www.cushmanwakefield.com/en/insights/emea-data-centre-update' },
  { name: 'Stockholm', lat: 59.33, lng: 18.07, mw: 200, country: 'SE', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/sweden-data-center-market', note: 'Sweden total 470 MW (Mordor); Stockholm is ~42% of national capacity → 200.' },
  { name: 'Istanbul', lat: 41.01, lng: 28.98, mw: 60, country: 'TR', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/turkey-data-center-market' },

  // CIS
  { name: 'Moscow', lat: 55.76, lng: 37.62, mw: 380, country: 'RU', source: 'Mordor Intelligence', sourceUrl: 'https://www.mordorintelligence.com/industry-reports/russia-data-center-market' },

  // Middle East
  { name: 'Dubai', lat: 25.20, lng: 55.27, mw: 232, country: 'AE', source: 'Arizton', sourceUrl: 'https://www.arizton.com/market-reports/united-arab-emirates-data-center-market' },
  { name: 'Riyadh', lat: 24.71, lng: 46.68, mw: 115, country: 'SA', source: 'Arizton', sourceUrl: 'https://www.arizton.com/market-reports/saudi-arabia-data-center-market-investment-analysis', note: 'Arizton 2030 projection ~280 MW back-calculated at 16% CAGR; conservative 115.' },
  { name: 'Tel Aviv', lat: 32.07, lng: 34.78, mw: 60, country: 'IL', source: 'Arizton', sourceUrl: 'https://www.arizton.com/market-reports/israel-data-center-market' },

  // Rest of world
  { name: 'S\u00e3o Paulo', lat: -23.55, lng: -46.63, mw: 493, country: 'BR', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/reports/global-data-center-trends-2025' },
  { name: 'Toronto', lat: 43.65, lng: -79.38, mw: 312, country: 'CA', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/local-response/north-america-data-center-trends-h1-2025-market-profiles-toronto' },
  { name: 'Johannesburg', lat: -26.2, lng: 28.04, mw: 248, country: 'ZA', source: 'Arizton', sourceUrl: 'https://www.businesswire.com/news/home/20250624706803/en/South-Africa-Data-Center-Market-Investment-Analysis-Growth-Opportunities-2025-2030-Johannesburg-Emerges-as-a-Leading-Hub-with-15-Data-Centers-and-More-on-the-Horizon---ResearchAndMarkets.com' },
  { name: 'Santiago', lat: -33.45, lng: -70.67, mw: 148, country: 'CL', source: 'CBRE', sourceUrl: 'https://www.cbre.com/insights/reports/global-data-center-trends-2025' },
  { name: 'Lagos', lat: 6.52, lng: 3.38, mw: 50, country: 'NG', source: 'Connecting Africa', sourceUrl: 'https://www.connectingafrica.com/data-centers/nigeria-s-data-center-growth-prospects-amid-power-constraints' },
  { name: 'Cairo', lat: 30.04, lng: 31.24, mw: 30, country: 'EG', source: 'Arizton', sourceUrl: 'https://www.arizton.com/market-reports/egypt-data-center-market', note: 'Arizton Egypt national total ≈ 30 MW, ~95% concentrated in Cairo.' },
  { name: 'Casablanca', lat: 33.57, lng: -7.59, mw: 15, country: 'MA', source: 'Arizton', sourceUrl: 'https://www.arizton.com/market-reports/morocco-data-center-market', note: 'Arizton lists 2–3 commissioned facilities; estimate 2 × ~7 MW ≈ 15.' },
  { name: 'Nairobi', lat: -1.29, lng: 36.82, mw: 15, country: 'KE', source: 'Arizton', sourceUrl: 'https://www.arizton.com/market-reports/kenya-data-center-market-investment-analysis' },
  { name: 'Addis Ababa', lat: 9.02, lng: 38.75, mw: 15, country: 'ET', source: 'DatacenterDynamics', sourceUrl: 'https://www.datacenterdynamics.com/en/news/raxio-launches-data-center-in-addis-ababa-ethiopia/' },
  { name: 'Accra', lat: 5.56, lng: -0.19, mw: 10, country: 'GH', source: 'DatacenterDynamics', sourceUrl: 'https://www.datacenterdynamics.com/en/news/africa-data-centres-and-onix-partner-for-data-center-build-in-accra-ghana/' },
];

const TOTAL_MW = DATA_CENTERS.reduce((sum, dc) => sum + dc.mw, 0);
const SORTED = [...DATA_CENTERS].sort((a, b) => b.mw - a.mw);

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

function useIsDark(): boolean {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return dark;
}

const THEME = {
  dark: { geoFill: '#1a1a2e', geoStroke: '#2a2a4a', geoHover: '#1e1e36' },
  light: { geoFill: '#e2e0f0', geoStroke: '#c4c2d6', geoHover: '#d4d2e8' },
};

const SOURCE_LABELS: Record<string, string> = {
  SSG: 'Site Selection Group',
  CBRE: 'CBRE',
  'Mordor Intelligence': 'Mordor Intelligence',
  Arizton: 'Arizton',
  JLL: 'JLL',
  DatacenterDynamics: 'DatacenterDynamics',
  'Cushman & Wakefield': 'Cushman & Wakefield',
  'Hillsboro News Times': 'Hillsboro News Times',
  'Data Center Frontier': 'Data Center Frontier',
  'Gardiner & Theobald': 'Gardiner & Theobald',
  'W.Media': 'W.Media',
  'Connecting Africa': 'Connecting Africa',
  'm3 Property': 'm3 Property',
};

function getRadius(mw: number): number {
  // Range: ~1.5 (20 MW) to ~8 (3945 MW)
  return Math.sqrt(mw / 80) + 1;
}

function getColor(mw: number): string {
  const ratio = Math.min(mw / 4000, 1);
  if (ratio > 0.6) return '#ff2a6d';
  if (ratio > 0.3) return '#d445eb';
  if (ratio > 0.1) return '#6645eb';
  return '#38bdf8';
}

function getGlow(mw: number): string {
  const ratio = Math.min(mw / 4000, 1);
  const spread = 1 + ratio * 4;
  return `drop-shadow(0 0 ${spread}px ${getColor(mw)})`;
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function MapView() {
  const isDark = useIsDark();
  const theme = isDark ? THEME.dark : THEME.light;
  const [tooltip, setTooltip] = useState<DataCenter | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback((dc: DataCenter, e: React.MouseEvent) => {
    setTooltip(dc);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleTap = useCallback((dc: DataCenter, e: React.TouchEvent<SVGCircleElement>) => {
    e.stopPropagation();
    // Use the dot's actual on-screen position rather than touch coords —
    // react-simple-maps wraps the SVG in transforms which make touch.clientX/Y
    // unreliable on mobile, dropping the tooltip far from the dot.
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip((prev) => prev?.name === dc.name ? null : dc);
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const handleBackgroundTap = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={{ scale: 160, center: [10, 10] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={theme.geoFill}
                  stroke={theme.geoStroke}
                  strokeWidth={0.5}
                  onTouchStart={handleBackgroundTap}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: theme.geoHover },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {DATA_CENTERS.map((dc) => (
            <Marker
              key={dc.name}
              coordinates={[dc.lng, dc.lat]}
              onMouseEnter={(e) => handleMouseEnter(dc, e as unknown as React.MouseEvent)}
              onMouseMove={handleMouseMove as any}
              onMouseLeave={handleMouseLeave}
            >
              <circle
                r={getRadius(dc.mw)}
                fill={getColor(dc.mw)}
                fillOpacity={0.7}
                stroke={getColor(dc.mw)}
                strokeWidth={0.5}
                strokeOpacity={0.9}
                style={{ filter: getGlow(dc.mw), cursor: 'pointer' }}
                onTouchStart={(e) => handleTap(dc, e as unknown as React.TouchEvent)}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (() => {
        // Clamp tooltip to viewport so it never lands off-screen
        const W = 280;
        const H = tooltip.note ? 160 : 100;
        const M = 8;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
        let left = tooltipPos.x + 12;
        let top = tooltipPos.y - H - 4;
        if (left + W > vw - M) left = vw - W - M;
        if (left < M) left = M;
        if (top < M) top = tooltipPos.y + 12;
        if (top + H > vh - M) top = vh - H - M;
        return (
        <div
          className="av-dc-tooltip"
          style={{
            position: 'fixed',
            left,
            top,
          }}
        >
          <strong>{tooltip.name}</strong>
          <span>{tooltip.mw.toLocaleString()} MW</span>
          <span>{((tooltip.mw / TOTAL_MW) * 100).toFixed(1)}% of mapped capacity</span>
          <span className="av-dc-tooltip-source">
            Source: {SOURCE_LABELS[tooltip.source] || tooltip.source}
          </span>
          {tooltip.note && (
            <span className="av-dc-tooltip-note">
              <span className="av-dc-info">ⓘ</span> {tooltip.note}
            </span>
          )}
        </div>
        );
      })()}

      <div className="av-dc-legend">
        <div className="av-dc-legend-item">
          <span className="av-dc-dot" style={{ background: '#38bdf8' }} />
          <span>&lt; 200 MW</span>
        </div>
        <div className="av-dc-legend-item">
          <span className="av-dc-dot" style={{ background: '#6645eb' }} />
          <span>200{'\u2013'}1,200 MW</span>
        </div>
        <div className="av-dc-legend-item">
          <span className="av-dc-dot" style={{ background: '#d445eb' }} />
          <span>1,200{'\u2013'}2,400 MW</span>
        </div>
        <div className="av-dc-legend-item">
          <span className="av-dc-dot" style={{ background: '#ff2a6d' }} />
          <span>&gt; 2,400 MW</span>
        </div>
      </div>
    </>
  );
}

function TableView() {
  return (
    <div className="av-dc-table-wrap">
      <table className="av-dc-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Market</th>
            <th>Country</th>
            <th>MW</th>
            <th>Share</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {SORTED.map((dc, i) => (
            <tr key={dc.name}>
              <td>{i + 1}</td>
              <td>
                <span className="av-dc-dot-inline" style={{ background: getColor(dc.mw) }} />
                {dc.name}
              </td>
              <td>{dc.country}</td>
              <td className="av-dc-num">{dc.mw.toLocaleString()}</td>
              <td className="av-dc-num">{((dc.mw / TOTAL_MW) * 100).toFixed(1)}%</td>
              <td>
                {dc.sourceUrl ? (
                  <a href={dc.sourceUrl} target="_blank" rel="noopener noreferrer">
                    {SOURCE_LABELS[dc.source] || dc.source}
                  </a>
                ) : (
                  SOURCE_LABELS[dc.source] || dc.source
                )}
                {dc.note && (
                  <span
                    className="av-dc-info"
                    title={dc.note}
                    aria-label={dc.note}
                  >
                    {' '}ⓘ
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <td><strong>Total ({SORTED.length} markets)</strong></td>
            <td />
            <td className="av-dc-num"><strong>{TOTAL_MW.toLocaleString()}</strong></td>
            <td className="av-dc-num"><strong>100%</strong></td>
            <td />
          </tr>
        </tfoot>
      </table>

      <div className="av-dc-sources">
        <p>
          Capacity figures are commissioned multitenant power (MW) as of mid-2025.
          These {SORTED.length} markets are a subset of the roughly 11,000 data
          centres worldwide. Click any source to verify; ⓘ marks figures derived
          from a stated range or related total.
        </p>
      </div>
    </div>
  );
}

export default function DataCenterMap() {
  const [view, setView] = useState<'map' | 'table'>('map');
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent page scroll when mouse is over the map (so wheel zooms the map instead)
  useEffect(() => {
    const el = containerRef.current;
    if (!el || view !== 'map') return;

    const preventScroll = (e: WheelEvent) => {
      e.preventDefault();
    };

    el.addEventListener('wheel', preventScroll, { passive: false });
    return () => el.removeEventListener('wheel', preventScroll);
  }, [view]);

  return (
    <div className="av-dc-wrap">
      <div className="av-dc-toolbar">
        <button
          className={`av-dc-toggle ${view === 'map' ? 'av-dc-toggle--active' : ''}`}
          onClick={() => setView('map')}
          title="Map view"
          type="button"
        >
          <MapIcon />
        </button>
        <button
          className={`av-dc-toggle ${view === 'table' ? 'av-dc-toggle--active' : ''}`}
          onClick={() => setView('table')}
          title="Table view"
          type="button"
        >
          <TableIcon />
        </button>
      </div>

      {view === 'map' ? (
        <div className="av-dc-map" ref={containerRef}>
          <MapView />
          <p className="av-dc-caption">
            Each dot is a cluster of GPS coordinates. Each coordinate is a military target.
          </p>
        </div>
      ) : (
        <TableView />
      )}
    </div>
  );
}
