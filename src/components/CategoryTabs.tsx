import { CATEGORY_ORDER } from '../constants/presetExercises';
import { CATEGORY_LABEL, type ExerciseCategory } from '../types';

interface Props {
  active: ExerciseCategory;
  onChange: (category: ExerciseCategory) => void;
}

/**
 * 상단 부위 탭.
 * 가로 스크롤 가능한 한 줄 탭으로, 헬스장에서 엄지 하나로 넘기며 고를 수 있도록
 * 터치 영역을 넉넉히 잡는다 (h-11, px-4).
 */
export function CategoryTabs({ active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="운동 부위"
      className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none"
    >
      {CATEGORY_ORDER.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat)}
            className={[
              'shrink-0 h-11 px-4 rounded-full font-display text-[15px] tracking-wide',
              'transition-colors duration-150',
              isActive
                ? 'bg-chalk text-ink'
                : 'bg-surface text-mute border border-line active:bg-surface-raised',
            ].join(' ')}
          >
            {CATEGORY_LABEL[cat]}
          </button>
        );
      })}
    </div>
  );
}
