import { Plus, Trash2, Snowflake } from 'lucide-react';
import type { ExerciseLog, LastPerformance, SetLog } from '../types';

interface Props {
  exerciseLog: ExerciseLog;
  lastPerformance: LastPerformance | null;
  onUpdateSet: (setId: string, patch: Partial<SetLog>) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  /** 세트를 완료 체크한 순간 호출 — 상위에서 휴식 타이머를 시작시킨다. */
  onSetCompleted: (restSeconds: number) => void;
}

const DEFAULT_REST_SECONDS = 90;

/**
 * 세트별 [번호 | 이전 기록(고스트) | 무게 | 횟수 | 완료] 행.
 * 무게/횟수 입력은 inputMode="decimal"/"numeric"으로 모바일 숫자 키패드를 강제 호출한다.
 */
export function SetLogTable({
  exerciseLog,
  lastPerformance,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onSetCompleted,
}: Props) {
  return (
    <div className="rounded-card bg-surface border border-line overflow-hidden">
      <div className="grid grid-cols-[2.5rem_1fr_1fr_2.75rem] gap-2 px-3 pt-3 pb-2 text-[11px] text-mute font-medium">
        <span>세트</span>
        <span>무게(kg)</span>
        <span>횟수</span>
        <span className="text-center">완료</span>
      </div>

      <div className="flex flex-col">
        {exerciseLog.sets.map((set, i) => {
          const ghost = lastPerformance?.sets[i];
          return (
            <div
              key={set.id}
              className={[
                'grid grid-cols-[2.5rem_1fr_1fr_2.75rem] gap-2 items-center px-3 py-1.5',
                set.isCompleted ? 'bg-plate-green/10' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-1 num text-[15px] text-mute">
                {set.isDeloadSet && (
                  <Snowflake size={13} className="text-plate-yellow shrink-0" aria-label="디로딩 세트" />
                )}
                {set.setNumber}
              </div>

              <input
                type="number"
                inputMode="decimal"
                value={set.weightKg ?? ''}
                placeholder={ghost?.weightKg != null ? String(ghost.weightKg) : '0'}
                onChange={(e) =>
                  onUpdateSet(set.id, {
                    weightKg: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="num h-11 rounded-lg bg-surface-raised border border-line px-2 text-[16px] text-chalk placeholder:text-mute/50 focus:border-plate-blue"
              />

              <input
                type="number"
                inputMode="numeric"
                value={set.reps ?? ''}
                placeholder={ghost?.reps != null ? String(ghost.reps) : '0'}
                onChange={(e) =>
                  onUpdateSet(set.id, {
                    reps: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                className="num h-11 rounded-lg bg-surface-raised border border-line px-2 text-[16px] text-chalk placeholder:text-mute/50 focus:border-plate-blue"
              />

              <button
                onClick={() => {
                  const next = !set.isCompleted;
                  onUpdateSet(set.id, { isCompleted: next });
                  if (next) onSetCompleted(DEFAULT_REST_SECONDS);
                }}
                aria-pressed={set.isCompleted}
                aria-label={`세트 ${set.setNumber} 완료`}
                className={[
                  'h-11 w-11 rounded-lg flex items-center justify-center border transition-colors',
                  set.isCompleted
                    ? 'bg-plate-green border-plate-green text-ink'
                    : 'bg-surface-raised border-line text-transparent',
                ].join(' ')}
              >
                ✓
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-3 py-2 border-t border-line">
        <button
          onClick={onAddSet}
          className="flex items-center gap-1 h-9 px-3 rounded-lg text-[13px] text-mute active:bg-surface-raised"
        >
          <Plus size={14} /> 세트 추가
        </button>
        {exerciseLog.sets.length > 1 && (
          <button
            onClick={() => onRemoveSet(exerciseLog.sets[exerciseLog.sets.length - 1].id)}
            className="flex items-center gap-1 h-9 px-3 rounded-lg text-[13px] text-mute active:bg-surface-raised"
          >
            <Trash2 size={14} /> 마지막 세트 삭제
          </button>
        )}
      </div>
    </div>
  );
}
