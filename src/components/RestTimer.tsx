import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Props {
  /** null이면 타이머 비활성 상태 */
  seconds: number | null;
  onDismiss: () => void;
  onExtend: (extraSeconds: number) => void;
}

/**
 * 세트 완료 체크박스를 누르면 부모가 이 컴포넌트에 초기 seconds를 넘겨 자동 시작한다.
 * 화면 하단에 고정되어 다음 세트를 준비하는 동안에도 항상 보인다.
 */
export function RestTimer({ seconds, onDismiss, onExtend }: Props) {
  const [remaining, setRemaining] = useState(seconds ?? 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (seconds == null) return;
    setRemaining(seconds);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  if (seconds == null) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const progress = seconds > 0 ? remaining / seconds : 0;

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 bg-surface-raised border border-line rounded-full pl-4 pr-2 h-14 shadow-lg shadow-black/40">
        <div className="relative h-8 w-8 shrink-0">
          <svg viewBox="0 0 36 36" className="h-8 w-8 -rotate-90">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#2A2A2A" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={remaining === 0 ? '#3FBF6B' : '#2E6FE8'}
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 16}
              strokeDashoffset={2 * Math.PI * 16 * (1 - progress)}
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="num font-display text-lg tabular-nums w-14 text-center">
          {mm}:{ss}
        </span>
        <button
          onClick={() => onExtend(30)}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-surface text-mute active:bg-line"
          aria-label="30초 추가"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={onDismiss}
          className="h-9 w-9 flex items-center justify-center rounded-full bg-surface text-mute active:bg-line"
          aria-label="타이머 닫기"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
