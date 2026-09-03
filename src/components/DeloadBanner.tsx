import { AlertTriangle } from 'lucide-react';
import type { FatigueSignal, PeriodizationState } from '../types';

interface Props {
  periodization: PeriodizationState;
  fatigueSignal: FatigueSignal;
  isDeloadToday: boolean;
  onToggleDeload: (enabled: boolean) => void;
}

/**
 * "고강도 훈련 N주차 / 목표 주차" 카운터와 정체기 도달 시 권장 배지.
 * 스위치를 켜면 오늘 세션 전체가 디로딩 세션으로 태깅되고,
 * 이미 담긴 세트의 무게가 지정 비율로 즉시 재계산된다 (useWorkoutStore 참고).
 */
export function DeloadBanner({ periodization, fatigueSignal, isDeloadToday, onToggleDeload }: Props) {
  return (
    <div className="rounded-card bg-surface border border-line px-4 py-3.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display text-[13px] tracking-wide text-mute uppercase">
            훈련 사이클
          </p>
          <p className="num font-display text-2xl mt-0.5">
            {fatigueSignal.weekNumber}
            <span className="text-mute text-base font-body">
              {' '}
              / {periodization.cycleLengthWeeks}주차
            </span>
          </p>
        </div>

        <button
          role="switch"
          aria-checked={isDeloadToday}
          onClick={() => onToggleDeload(!isDeloadToday)}
          className={[
            'relative h-8 w-14 rounded-full transition-colors shrink-0',
            isDeloadToday ? 'bg-plate-yellow' : 'bg-line',
          ].join(' ')}
        >
          <span
            className={[
              'absolute top-1 h-6 w-6 rounded-full bg-ink transition-transform',
              isDeloadToday ? 'translate-x-7' : 'translate-x-1',
            ].join(' ')}
          />
        </button>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5">
        <span
          className={[
            'h-1.5 flex-1 rounded-full',
            isDeloadToday ? 'bg-plate-yellow' : 'bg-line',
          ].join(' ')}
        />
        <span className="text-[11px] text-mute shrink-0">
          {isDeloadToday ? '디로딩 주간 (본세트의 50%)' : '고강도 주간'}
        </span>
      </div>

      {fatigueSignal.recommendedDeload && !isDeloadToday && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-plate-yellow/10 border border-plate-yellow/40 px-3 py-2">
          <AlertTriangle size={16} className="text-plate-yellow shrink-0 mt-0.5" />
          <p className="text-[13px] text-chalk leading-snug">
            목표 사이클({periodization.cycleLengthWeeks}주)에 도달했어요. 정체기를 피하려면
            이번 주는 디로딩을 권장해요.
          </p>
        </div>
      )}
    </div>
  );
}
