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
}

// Major data center markets worldwide, capacity in MW (2025)
const DATA_CENTERS: DataCenter[] = [
  // United States
  { name: 'Northern Virginia', lat: 38.95, lng: -77.45, mw: 3945, country: 'US', source: 'SSG' },
  { name: 'Phoenix', lat: 33.45, lng: -112.07, mw: 1380, country: 'US', source: 'SSG' },
  { name: 'Dallas\u2013Fort Worth', lat: 32.9, lng: -97.04, mw: 1125, country: 'US', source: 'SSG' },
  { name: 'Atlanta', lat: 33.75, lng: -84.39, mw: 1065, country: 'US', source: 'SSG' },
  { name: 'Chicago', lat: 41.88, lng: -87.63, mw: 805, country: 'US', source: 'SSG' },
  { name: 'Silicon Valley', lat: 37.39, lng: -122.03, mw: 700, country: 'US', source: 'CBRE' },
  { name: 'New York / New Jersey', lat: 40.73, lng: -74.17, mw: 600, country: 'US', source: 'CBRE' },
  { name: 'Austin / San Antonio', lat: 30.27, lng: -97.74, mw: 463, country: 'US', source: 'SSG' },
  { name: 'Las Vegas / Reno', lat: 36.17, lng: -115.14, mw: 400, country: 'US', source: 'CBRE' },
  { name: 'Portland / Hillsboro', lat: 45.54, lng: -122.94, mw: 350, country: 'US', source: 'CBRE' },

  // Asia Pacific
  { name: 'Beijing', lat: 39.9, lng: 116.4, mw: 1799, country: 'CN', source: 'CBRE' },
  { name: 'Shanghai', lat: 31.23, lng: 121.47, mw: 1200, country: 'CN', source: 'CBRE' },
  { name: 'Tokyo', lat: 35.68, lng: 139.69, mw: 1100, country: 'JP', source: 'CBRE' },
  { name: 'Singapore', lat: 1.35, lng: 103.82, mw: 1000, country: 'SG', source: 'CBRE' },
  { name: 'Seoul', lat: 37.57, lng: 126.98, mw: 500, country: 'KR', source: 'SRG' },
  { name: 'Sydney', lat: -33.87, lng: 151.21, mw: 400, country: 'AU', source: 'CBRE' },
  { name: 'Mumbai', lat: 19.08, lng: 72.88, mw: 300, country: 'IN', source: 'SRG' },
  { name: 'Hong Kong', lat: 22.32, lng: 114.17, mw: 300, country: 'HK', source: 'SRG' },

  // Europe
  { name: 'London', lat: 51.51, lng: -0.13, mw: 1100, country: 'GB', source: 'CBRE' },
  { name: 'Frankfurt', lat: 50.11, lng: 8.68, mw: 800, country: 'DE', source: 'CBRE' },
  { name: 'Paris', lat: 48.86, lng: 2.35, mw: 600, country: 'FR', source: 'CBRE' },
  { name: 'Amsterdam', lat: 52.37, lng: 4.9, mw: 500, country: 'NL', source: 'CBRE' },
  { name: 'Dublin', lat: 53.35, lng: -6.26, mw: 300, country: 'IE', source: 'SRG' },
  { name: 'Stockholm', lat: 59.33, lng: 18.07, mw: 200, country: 'SE', source: 'SRG' },
  { name: 'Madrid', lat: 40.42, lng: -3.7, mw: 150, country: 'ES', source: 'SRG' },
  { name: 'Milan', lat: 45.46, lng: 9.19, mw: 150, country: 'IT', source: 'SRG' },
  { name: 'Warsaw', lat: 52.23, lng: 21.01, mw: 100, country: 'PL', source: 'SRG' },

  // Rest of world
  { name: 'Toronto', lat: 43.65, lng: -79.38, mw: 300, country: 'CA', source: 'CBRE' },
  { name: 'S\u00e3o Paulo', lat: -23.55, lng: -46.63, mw: 200, country: 'BR', source: 'SRG' },
  { name: 'Johannesburg', lat: -26.2, lng: 28.04, mw: 100, country: 'ZA', source: 'SRG' },
  { name: 'Santiago', lat: -33.45, lng: -70.67, mw: 50, country: 'CL', source: 'SRG' },
  { name: 'Lagos', lat: 6.52, lng: 3.38, mw: 30, country: 'NG', source: 'SRG' },
  { name: 'Nairobi', lat: -1.29, lng: 36.82, mw: 20, country: 'KE', source: 'SRG' },
];

const TOTAL_MW = DATA_CENTERS.reduce((sum, dc) => sum + dc.mw, 0);
const SORTED = [...DATA_CENTERS].sort((a, b) => b.mw - a.mw);

const SOURCES = [
  { key: 'CBRE', name: 'CBRE Global Data Center Trends 2025', url: 'https://www.cbre.com/insights/reports/global-data-center-trends-2025' },
  { key: 'SSG', name: 'Site Selection Group: 10 Largest US Data Center Metros 2025', url: 'https://info.siteselectiongroup.com/blog/the-10-largest-u.s.-data-center-metro-areas-by-power-capacity-in-2025' },
  { key: 'SRG', name: 'Synergy Research Group', url: 'https://www.srgresearch.com/articles/hyperscale-operators-to-account-for-67-of-all-data-center-capacity-by-2031' },
  { key: 'Brookings', name: 'Brookings Institution: The Future of Data Centers', url: 'https://www.brookings.edu/articles/the-future-of-data-centers/' },
];

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

const SOURCE_LABELS: Record<string, string> = { SSG: 'Site Selection Group', CBRE: 'CBRE', SRG: 'Synergy Research' };

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

  const handleTap = useCallback((dc: DataCenter, e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0] || e.changedTouches[0];
    setTooltip((prev) => prev?.name === dc.name ? null : dc);
    setTooltipPos({ x: touch.clientX, y: touch.clientY });
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

      {tooltip && (
        <div
          className="av-dc-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPos.x + 12,
            top: tooltipPos.y - 40,
          }}
        >
          <strong>{tooltip.name}</strong>
          <span>{tooltip.mw.toLocaleString()} MW</span>
          <span>{((tooltip.mw / TOTAL_MW) * 100).toFixed(1)}% of mapped capacity</span>
        </div>
      )}

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
              <td>{SOURCE_LABELS[dc.source] || dc.source}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <td><strong>Total (33 markets)</strong></td>
            <td />
            <td className="av-dc-num"><strong>{TOTAL_MW.toLocaleString()}</strong></td>
            <td className="av-dc-num"><strong>100%</strong></td>
            <td />
          </tr>
        </tfoot>
      </table>

      <div className="av-dc-sources">
        <strong>Sources</strong>
        <ul>
          {SOURCES.map((s) => (
            <li key={s.key}>
              <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
            </li>
          ))}
        </ul>
        <p>
          Capacity figures represent commissioned multitenant power in megawatts (MW) for major
          colocation and hyperscale markets as of mid-2025. These 33 markets are a subset of
          the roughly 11,000 data centres worldwide. Figures for smaller markets are estimates
          based on available industry reporting.
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
