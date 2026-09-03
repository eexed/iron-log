import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { getPresetsByCategory } from '../constants/presetExercises';
import type { Exercise, ExerciseCategory, CustomExercise } from '../types';
import { v4 as uuid } from 'uuid';

interface Props {
  category: ExerciseCategory;
  customExercises: CustomExercise[];
  loggedExerciseIds: string[]; // 오늘 이미 추가된 종목 — 체크 표시용
  onSelect: (exercise: Exercise) => void;
  onAddCustom: (exercise: CustomExercise) => void;
}

/**
 * 선택된 부위의 기초 운동을 칩으로 노출한다.
 * 이미 오늘 세션에 담긴 종목은 체크 아이콘으로 표시해 중복 추가 실수를 막는다.
 */
export function ExerciseChips({
  category,
  customExercises,
  loggedExerciseIds,
  onSelect,
  onAddCustom,
}: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [draftName, setDraftName] = useState('');

  const presets = getPresetsByCategory(category);
  const customForCategory = customExercises.filter((e) => e.category === category);
  const all: Exercise[] = [...presets, ...customForCategory];

  function submitCustom() {
    const name = draftName.trim();
    if (!name) {
      setIsAdding(false);
      return;
    }
    const custom: CustomExercise = {
      id: uuid(),
      category,
      name,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    onAddCustom(custom);
    onSelect(custom);
    setDraftName('');
    setIsAdding(false);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {all.map((exercise) => {
        const isLogged = loggedExerciseIds.includes(exercise.id);
        return (
          <button
            key={exercise.id}
            onClick={() => onSelect(exercise)}
            className={[
              'flex items-center gap-1.5 h-11 px-3.5 rounded-xl text-[14px] font-medium',
              'border transition-colors duration-150 active:scale-[0.98]',
              isLogged
                ? 'bg-plate-green/15 border-plate-green text-plate-green'
                : 'bg-surface border-line text-chalk active:bg-surface-raised',
            ].join(' ')}
          >
            {isLogged && <Check size={15} strokeWidth={2.5} />}
            {exercise.name}
          </button>
        );
      })}

      {isAdding ? (
        <div className="flex items-center gap-1.5 h-11 pl-3 pr-1.5 rounded-xl bg-surface-raised border border-plate-blue">
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
            placeholder="새 운동 이름"
            className="bg-transparent outline-none text-[14px] w-28 placeholder:text-mute"
          />
          <button
            onClick={submitCustom}
            className="h-8 w-8 flex items-center justify-center rounded-lg bg-plate-blue text-ink"
            aria-label="커스텀 운동 추가"
          >
            <Check size={16} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 h-11 px-3.5 rounded-xl text-[14px] font-medium border border-dashed border-line text-mute active:bg-surface"
        >
          <Plus size={16} />
          직접 추가
        </button>
      )}
    </div>
  );
}
