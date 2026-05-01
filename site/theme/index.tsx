import './index.css';
import '@rspress/core/dist/theme/layout/NotFountLayout/index.css';
import { useEffect } from 'react';
import { Layout as OriginalLayout } from '@rspress/core/theme-original';
import { CalendarProvider, useCalendar } from './CalendarContext';
import { CalendarToggle } from './CalendarToggle';
import { CalendarToggleMobile } from './CalendarToggleMobile';

// Re-export everything from the original theme
export * from '@rspress/core/theme-original';

// Override: custom HomeFeature
export { HomeFeature } from './HomeFeature';

function AutoDateConverter() {
  const { holocene } = useCalendar();

  useEffect(() => {
    function convertDates() {
      const targets = document.querySelectorAll('.rp-last-updated span');
      for (const el of targets) {
        const text = el.textContent ?? '';
        if (!text.trim()) continue;
        if (holocene) {
          el.textContent = text.replace(/\b((?:19|20)\d{2})\b/g, (_m, y) => String(Number(y) + 10000));
        } else {
          el.textContent = text.replace(/\b(1(?:19|20)\d{2})\b/g, (_m, y) => String(Number(y) - 10000));
        }
      }
    }

    // Retry until the LastUpdated component renders its timestamp
    let attempts = 0;
    const id = setInterval(() => {
      convertDates();
      attempts++;
      if (attempts >= 20) clearInterval(id);
    }, 200);
    return () => clearInterval(id);
  }, [holocene]);

  return null;
}

function Layout() {
  return (
    <CalendarProvider>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="av-brand-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6645EB" />
            <stop offset="38%" stopColor="#D445EB" />
          </linearGradient>
        </defs>
      </svg>
      <OriginalLayout />
      <CalendarToggle />
      <CalendarToggleMobile />
      <AutoDateConverter />
    </CalendarProvider>
  );
}

function NotFoundLayout() {
  return (
    <div className="rp-not-found">
      <p className="rp-not-found__error-code">404</p>
      <h1 className="rp-not-found__title">PAGE NOT FOUND</h1>
      <div className="rp-not-found__divider" />
      <div className="rp-not-found__action">
        <a href="/" className="rp-button rp-button--alt">
          Back to Docs
        </a>
      </div>
    </div>
  );
}

export { Layout, NotFoundLayout };
