import { Plus, Trash2 } from 'lucide-react';
import type { ExerciseLog, ExerciseSet, LastPerformance } from '../types';

interface Props {
  exerciseLog: ExerciseLog;
  lastPerformance?: LastPerformance | null;
  onUpdateSet: (setId: string, patch: Partial<ExerciseSet>) => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onSetCompleted: (restSeconds: number) => void;
}

export function SetLogTable({
  exerciseLog,
  lastPerformance,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      {lastPerformance && (
        <p className="text-[11px] text-gray-400">
          지난 기록: 최고 {lastPerformance.bestWeight}kg × {lastPerformance.bestReps}회
        </p>
      )}

      {/* 테이블 헤더 */}
      <div className="grid grid-cols-[36px_1fr_1fr_32px] gap-2 px-1 text-[11px] text-gray-400 text-center">
        <span>세트</span>
        <span>무게 (kg)</span>
        <span>횟수 (회)</span>
        <span></span>
      </div>

      {/* 세트 리스트 */}
      <div className="flex flex-col gap-1.5">
        {exerciseLog.sets.map((set, idx) => (
          <div
            key={set.id}
            className="grid grid-cols-[36px_1fr_1fr_32px] gap-2 items-center bg-[#282828] p-1 rounded-lg"
          >
            <span className="text-center font-bold text-xs text-gray-400">{idx + 1}</span>
            <input
              type="number"
              inputMode="decimal"
              value={set.weight || ''}
              placeholder="0"
              onChange={(e) => onUpdateSet(set.id, { weight: Number(e.target.value) })}
              className="w-full bg-[#1a1a1a] text-center text-sm py-1.5 rounded text-white outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <input
              type="number"
              inputMode="numeric"
              value={set.reps || ''}
              placeholder="0"
              onChange={(e) => onUpdateSet(set.id, { reps: Number(e.target.value) })}
              className="w-full bg-[#1a1a1a] text-center text-sm py-1.5 rounded text-white outline-none focus:ring-1 focus:ring-emerald-400"
            />
            <button
              onClick={() => onRemoveSet(set.id)}
              className="flex items-center justify-center text-gray-500 hover:text-red-400 p-1"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* 세트 추가 버튼 */}
      <button
        onClick={onAddSet}
        className="mt-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-300 transition-colors"
      >
        <Plus size={14} /> 세트 추가
      </button>
    </div>
  );
}