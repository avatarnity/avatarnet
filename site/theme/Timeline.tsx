import { useCalendar } from './CalendarContext';

interface Milestone {
  icon: string;
  title: string;
  gregorian: string;
  holocene: string;
}

const milestones: Milestone[] = [
  { icon: '🎨', title: 'Cave Paintings', gregorian: '~40,000 BCE', holocene: '~30,000 BHE' },
  { icon: '🪨', title: 'Clay Tablets', gregorian: '~3,400 BCE', holocene: '~6,600 HE' },
  { icon: '📜', title: 'Scribes', gregorian: '~2,600 BCE', holocene: '~7,400 HE' },
  { icon: '📖', title: 'Manuscripts', gregorian: '~300 CE', holocene: '~10,300 HE' },
  { icon: '🖨️', title: 'Printed Books', gregorian: '~1,440 CE', holocene: '~11,440 HE' },
  { icon: '📰', title: 'Newspapers', gregorian: '~1,605 CE', holocene: '~11,605 HE' },
  { icon: '📷', title: 'Photography', gregorian: '~1,826 CE', holocene: '~11,826 HE' },
  { icon: '🎙️', title: 'Audio Recording', gregorian: '~1,877 CE', holocene: '~11,877 HE' },
  { icon: '🌐', title: 'Websites', gregorian: '~1,991 CE', holocene: '~11,991 HE' },
  { icon: '🧠', title: 'Avatars', gregorian: 'Now', holocene: 'Now' },
];

// 4-3-3 brick layout — middle row offset by half a column
const rows: { items: Milestone[]; rtl: boolean }[] = [
  { items: milestones.slice(0, 4), rtl: false },
  { items: milestones.slice(4, 7), rtl: true },
  { items: milestones.slice(7, 10), rtl: false },
];

export default function Timeline() {
  const { holocene } = useCalendar();

  let globalIdx = 0;

  return (
    <div className="av-timeline">{rows.map((row, rowIdx) => {
      const isLast = rowIdx === rows.length - 1;
      const curveDir = rowIdx % 2 === 0 ? 'right' : 'left';

      return (
        <div key={rowIdx}>
          <div className={`av-timeline__row${row.rtl ? ' av-timeline__row--rtl av-timeline__row--offset' : ''}`}>
            {row.items.map((m, i) => {
              const idx = globalIdx++;
              const isLastItem = idx === milestones.length - 1;
              return (
                <div key={i} className={`av-timeline__node${isLastItem ? ' av-timeline__node--last' : ''}`}>
                  <span className="av-timeline__icon">{m.icon}</span>
                  <span className="av-timeline__title">{m.title}</span>
                  <div className="av-timeline__dot" />
                  <span className="av-timeline__date">{holocene ? m.holocene : m.gregorian}</span>
                </div>
              );
            })}
          </div>
          {!isLast && <div className={`av-timeline__curve av-timeline__curve--${curveDir}`} />}
        </div>
      );
    })}</div>
  );
}
