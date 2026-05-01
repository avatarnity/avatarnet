import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCalendar } from './CalendarContext';

const items = [
  { label: 'Holocene', value: true },
  { label: 'Gregorian', value: false },
];

/** Expandable calendar picker following the NavScreenLangs pattern. */
function CalendarPicker() {
  const { holocene, toggle } = useCalendar();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div
        className="av-calendar-screen"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="av-calendar-screen__left">Calendar</div>
        <div className="av-calendar-screen__right">
          {holocene ? new Date().getFullYear() + 10000 : new Date().getFullYear()}
          <svg
            className={`av-calendar-screen__icon${isOpen ? ' av-calendar-screen__icon--open' : ''}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      <div
        className="av-calendar-screen-group"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.2s ease-out',
        }}
      >
        <div className="av-calendar-screen-group__inner">
          {items.map((item) => (
            <span
              key={item.label}
              className={`av-calendar-screen-group__item${item.value === holocene ? ' av-calendar-screen-group__item--active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (item.value !== holocene) toggle();
                setIsOpen(false);
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Observe the DOM for a container matching `selector`. When it appears,
 * create a wrapper element inserted via `insert` and portal-render into it.
 * Cleans up on unmount or if the container is removed.
 */
function usePortalContainer(
  selector: string,
  insert: (container: Element, wrapper: HTMLDivElement) => void,
) {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    function tryAttach(): HTMLDivElement | null {
      const container = document.querySelector(selector);
      if (!container) return null;
      // Already attached?
      if (container.querySelector('.av-calendar-mobile-wrapper')) return null;
      const div = document.createElement('div');
      div.className = 'av-calendar-mobile-wrapper';
      insert(container, div);
      return div;
    }

    // Try immediately
    const existing = tryAttach();
    if (existing) {
      setWrapper(existing);
      return () => { existing.remove(); };
    }

    // Otherwise watch for the container to appear
    const observer = new MutationObserver(() => {
      const div = tryAttach();
      if (div) {
        setWrapper(div);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      wrapper?.remove();
    };
  }, [selector]);

  return wrapper;
}

export function CalendarToggleMobile() {
  // Tablet hamburger hover menu (769-1280px):
  // Insert before the divider (NavScreenDivider) inside the hover group.
  const hamburgerWrapper = usePortalContainer(
    '.rp-nav-hamburger__md__hover-group',
    (container, div) => {
      // Insert after NavScreenLangs (last item before divider)
      const divider = container.querySelector('.rp-nav-screen-divider');
      if (divider) {
        container.insertBefore(div, divider);
      } else {
        container.appendChild(div);
      }
    },
  );

  // Mobile full-screen drawer (≤768px):
  // Insert after NavScreenAppearance inside .rp-nav-screen__container
  const screenWrapper = usePortalContainer(
    '.rp-nav-screen__container',
    (container, div) => {
      // Find the appearance row and insert after it
      const appearance = container.querySelector('.rp-nav-screen-appearance');
      if (appearance?.nextSibling) {
        container.insertBefore(div, appearance.nextSibling);
      } else {
        container.appendChild(div);
      }
    },
  );

  return (
    <>
      {hamburgerWrapper && createPortal(<CalendarPicker />, hamburgerWrapper)}
      {screenWrapper && createPortal(<CalendarPicker />, screenWrapper)}
    </>
  );
}
