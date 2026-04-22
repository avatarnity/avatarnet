import { useCalendar } from './CalendarContext';

export default function HDate({ g }: { g: number }) {
  const { toYear } = useCalendar();
  return <span>{toYear(g)}</span>;
}
