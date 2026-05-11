import { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

/* ── Phrase data ─────────────────────────────────────────────── */

interface Phrase {
  text: string;
  script: string;
  dir: 'ltr' | 'rtl';
}

const PHRASES: Phrase[] = [
  { text: 'A Digital Heaven',       script: 'latin',      dir: 'ltr' },
  { text: 'Цифровой Рай',           script: 'cyrillic',   dir: 'ltr' },
  { text: 'एक डिजिटल स्वर्गलोक',         script: 'devanagari', dir: 'ltr' },
  { text: 'اک ڈیجیٹل جنّت',          script: 'arabic',     dir: 'rtl' },
  { text: 'デジタルの天国',            script: 'katakana',   dir: 'ltr' },
  { text: 'Sebuah Surga Digital',    script: 'latin',      dir: 'ltr' },
  { text: 'ਇੱਕ ਡਿਜੀਟਲ ਸਚਖੰਡ',          script: 'gurmukhi',   dir: 'ltr' },
  { text: '一个数字天堂',              script: 'cjk',        dir: 'ltr' },
  { text: '디지털 천국',               script: 'hangul',     dir: 'ltr' },
  { text: 'جنّة رقمية',               script: 'arabic',     dir: 'rtl' },
  { text: 'Bir Dijital Cennet',      script: 'latin',      dir: 'ltr' },
  { text: 'Un Cielo Digital',        script: 'latin',      dir: 'ltr' },
];

/* ── Script character pools for random scramble glyphs ─────── */

const SCRIPT_POOLS: Record<string, string[]> = {
  latin:      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
  cyrillic:   'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзиклмнопрстуфхцчшщэюя'.split(''),
  devanagari: 'अआइईउऊएऐओऔकखगघचछजझटठडढणतथदधनपफबभमयरलवशषसह'.split(''),
  arabic:     'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'.split(''),
  cjk:        '天地人和道德仁义礼智信日月星辰风云雷电山川河海花鸟鱼虫数字堂'.split(''),
  katakana:   'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン'.split(''),
  hangul:     '가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허'.split(''),
  gurmukhi:   'ਅਆਇਈਉਊਏਐਓਔਕਖਗਘਚਛਜਝਟਠਡਢਣਤਥਦਧਨਪਫਬਭਮਯਰਲਵਸਹ'.split(''),
};

/* ── Grapheme-safe splitting ─────────────────────────────────── */

function toGraphemes(text: string): string[] {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const seg = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return [...seg.segment(text)].map(s => s.segment);
  }
  return Array.from(text);
}

/* ── Animation constants ─────────────────────────────────────── */

const HOLD_MS = 3000;
const SCRAMBLE_SPEED = 60;
const CHAR_STAGGER = 30;
const SCRAMBLE_CYCLES = 12;

/* ── Animation hook ──────────────────────────────────────────── */

function useScrambleAnimation(phrases: Phrase[]) {
  const [displayText, setDisplayText] = useState(phrases[0].text);
  const [dir, setDir] = useState<'ltr' | 'rtl'>(phrases[0].dir);
  const stateRef = useRef<{
    phase: 'holding' | 'scrambling';
    phraseIndex: number;
    startTime: number;
    fromGraphemes: string[];
    toGraphemes: string[];
  }>({
    phase: 'holding',
    phraseIndex: 0,
    startTime: 0,
    fromGraphemes: toGraphemes(phrases[0].text),
    toGraphemes: [],
  });
  const rafRef = useRef<number>(0);
  const reducedMotion = useRef(false);

  const animate = useCallback((timestamp: number) => {
    const state = stateRef.current;

    if (state.phase === 'holding') {
      if (state.startTime === 0) state.startTime = timestamp;
      if (timestamp - state.startTime >= HOLD_MS) {
        const nextIndex = (state.phraseIndex + 1) % phrases.length;
        const target = phrases[nextIndex];
        state.phase = 'scrambling';
        state.startTime = timestamp;
        state.fromGraphemes = toGraphemes(phrases[state.phraseIndex].text);
        state.toGraphemes = toGraphemes(target.text);
        setDir(target.dir);
      }
      rafRef.current = requestAnimationFrame(animate);
      return;
    }

    // Scrambling phase — only scramble up to target length
    const elapsed = timestamp - state.startTime;
    const toLen = state.toGraphemes.length;
    const nextIndex = (state.phraseIndex + 1) % phrases.length;
    const pool = SCRIPT_POOLS[phrases[nextIndex].script] || SCRIPT_POOLS.latin;

    const chars: string[] = [];
    let allLocked = true;

    for (let i = 0; i < toLen; i++) {
      const charStart = i * CHAR_STAGGER;
      const charElapsed = elapsed - charStart;
      const lockTime = SCRAMBLE_CYCLES * SCRAMBLE_SPEED;

      if (charElapsed < 0) {
        // Not started yet — show old character if it exists, else space
        chars.push(state.fromGraphemes[i] ?? ' ');
        allLocked = false;
      } else if (charElapsed >= lockTime) {
        // Locked — show target character
        chars.push(state.toGraphemes[i]);
      } else {
        // Scrambling — preserve spaces, randomize everything else
        const target = state.toGraphemes[i];
        if (target === ' ') {
          chars.push(' ');
        } else {
          chars.push(pool[Math.floor(Math.random() * pool.length)]);
        }
        allLocked = false;
      }
    }

    setDisplayText(chars.join(''));

    if (allLocked) {
      state.phase = 'holding';
      state.phraseIndex = nextIndex;
      state.startTime = timestamp;
      setDisplayText(phrases[nextIndex].text);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [phrases]);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion.current) return;

    rafRef.current = requestAnimationFrame(animate);

    // Pause on tab hidden
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
      } else {
        stateRef.current.startTime = 0;
        rafRef.current = requestAnimationFrame(animate);
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [animate]);

  return { displayText, dir };
}

/* ── Main component ──────────────────────────────────────────── */

export function HeroScramble() {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const subtitleRef = useRef<HTMLElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const originalRef = useRef('');
  const { displayText, dir } = useScrambleAnimation(PHRASES);

  useEffect(() => {
    let portalSpan: HTMLSpanElement | null = null;

    function tryAttach() {
      const subtitle = document.querySelector('.rp-home-hero__subtitle') as HTMLElement | null;
      if (!subtitle || subtitle.querySelector('.av-hero-scramble')) return;

      subtitleRef.current = subtitle;
      originalRef.current = subtitle.textContent ?? '';
      subtitle.textContent = '';

      portalSpan = document.createElement('span');
      subtitle.appendChild(portalSpan);
      setContainer(portalSpan);
    }

    // Try immediately
    tryAttach();

    // Watch for SPA navigations that recreate the subtitle element
    const observer = new MutationObserver(() => {
      // If our portal target was removed, reset
      if (portalSpan && !document.contains(portalSpan)) {
        portalSpan = null;
        subtitleRef.current = null;
        setContainer(null);
      }
      // Try to re-attach if subtitle exists but we have no portal
      if (!portalSpan) tryAttach();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (subtitleRef.current) {
        subtitleRef.current.textContent = originalRef.current;
      }
      setContainer(null);
      subtitleRef.current = null;
    };
  }, []);

  // Auto-scale: shrink text when it would overflow the container
  // useLayoutEffect fires before paint so there's no visible flash
  useLayoutEffect(() => {
    const span = spanRef.current;
    const subtitle = subtitleRef.current;
    if (!span || !subtitle) return;

    const parentWidth = subtitle.parentElement?.clientWidth ?? subtitle.clientWidth;
    const textWidth = span.scrollWidth;

    if (textWidth > parentWidth && parentWidth > 0) {
      const scale = parentWidth / textWidth;
      span.style.transform = `scaleX(${scale})`;
      span.style.transformOrigin = 'center';
    } else {
      span.style.transform = '';
    }
  }, [displayText]);

  if (!container) return null;

  return createPortal(
    <span className="av-hero-scramble" dir={dir} ref={spanRef}>{displayText}</span>,
    container,
  );
}
