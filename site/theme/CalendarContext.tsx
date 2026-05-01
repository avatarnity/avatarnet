import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface CalendarContextType {
  holocene: boolean;
  toggle: () => void;
  toYear: (gregorian: number) => number;
}

const CalendarContext = createContext<CalendarContextType>({
  holocene: true,
  toggle: () => {},
  toYear: (g) => g + 10000,
});

export function useCalendar() {
  return useContext(CalendarContext);
}

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [holocene, setHolocene] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('av-calendar');
    if (stored === 'gregorian') setHolocene(false);
  }, []);

  const toggle = () => {
    setHolocene((prev) => {
      const next = !prev;
      localStorage.setItem('av-calendar', next ? 'holocene' : 'gregorian');
      return next;
    });
  };

  const toYear = (gregorian: number) => holocene ? gregorian + 10000 : gregorian;

  return (
    <CalendarContext.Provider value={{ holocene, toggle, toYear }}>
      {children}
    </CalendarContext.Provider>
  );
}
