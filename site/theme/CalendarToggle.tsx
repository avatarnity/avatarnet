import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCalendar } from './CalendarContext';

export function CalendarToggle() {
  const { holocene, toggle } = useCalendar();
  const [container, setContainer] = useState<Element | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Insert just left of the dark/light theme toggle
    const themeToggle = document.querySelector('.rp-switch-appearance');
    if (themeToggle?.parentElement) {
      const wrapper = document.createElement('div');
      wrapper.className = 'av-calendar-toggle-wrapper';
      themeToggle.parentElement.insertBefore(wrapper, themeToggle);
      setContainer(wrapper);
      return () => { wrapper.remove(); };
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [open]);

  if (!container) return null;

  const items = [
    { label: 'Holocene', value: true },
    { label: 'Gregorian', value: false },
  ];

  return createPortal(
    <div
      ref={ref}
      className="rp-nav-menu__item"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="rp-nav-menu__item__container">
        {holocene ? '12026' : '2026'}
        <svg className="rp-nav-menu__item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <ul className={`rp-hover-group rp-hover-group--center${open ? '' : ' rp-hover-group--hidden'}`}>
        {items.map((item) => (
          <li
            key={item.label}
            className={`rp-hover-group__item${item.value === holocene ? ' rp-hover-group__item--active' : ''}`}
            onClick={() => { if (item.value !== holocene) toggle(); setOpen(false); }}
          >
            <div className="rp-hover-group__item__link">{item.label}</div>
          </li>
        ))}
      </ul>
    </div>,
    container,
  );
}
