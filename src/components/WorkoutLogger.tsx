import { useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { CategoryTabs } from './CategoryTabs';
import { ExerciseChips } from './ExerciseChips';
import { SetLogTable } from './SetLogTable';
import { RestTimer } from './RestTimer';
import { DeloadBanner } from './DeloadBanner';
import { DailySummaryCard } from './DailySummaryCard';
import { useWorkoutStore } from '../hooks/useWorkoutStore';
import { storage, sessionsToCSV, downloadFile } from '../lib/storage';
import { findLastPerformance, toDailySummary } from '../lib/calculations';
import { CATEGORY_LABEL } from '../types';
import type { BackupPayload } from '../types';

/**
 * 정보 계층: [부위 선택] → [기초 운동 선택] → [세트 기록 카드] 순으로
 * 위에서 아래로 흐르는 단일 스크롤 화면. 헬스장에서 한 손 스크롤만으로
 * 처음부터 끝까지 조작 가능하도록 별도 모달/페이지 전환을 두지 않았다.
 */
export function WorkoutLogger() {
  const {
    sessions,
    todaySession,
    activeCategory,
    setActiveCategory,
    addExerciseToSession,
    updateSet,
    addSet,
    removeSet,
    toggleDeloadForToday,
    periodization,
    fatigueSignal,
  } = useWorkoutStore();

  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [customExercises, setCustomExercises] = useState(() => storage.getCustomExercises());

  const loggedExerciseIds = todaySession?.exercises.map((e) => e.exerciseId) ?? [];
  const isDeloadToday = todaySession?.isDeloadSession ?? periodization.isDeloadWeek;

  function handleExport(format: 'json' | 'csv') {
    if (format === 'json') {
      const payload: BackupPayload = storage.exportJSON();
      downloadFile(`ironlog-backup-${Date.now()}.json`, JSON.stringify(payload, null, 2), 'application/json');
    } else {
      downloadFile(`ironlog-export-${Date.now()}.csv`, sessionsToCSV(sessions), 'text/csv');
    }
  }

  function handleImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result as string) as BackupPayload;
        storage.importJSON(payload);
        window.location.reload();
      } catch {
        alert('파일을 읽을 수 없어요. 올바른 백업 JSON 파일인지 확인해주세요.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-20 bg-ink/95 backdrop-blur border-b border-line px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between h-14">
          <h1 className="font-display text-xl tracking-wide">Iron Log</h1>
          <div className="flex items-center gap-1">
            <label className="h-9 w-9 flex items-center justify-center rounded-lg text-mute active:bg-surface cursor-pointer">
              <Upload size={17} />
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
              />
            </label>
            <button
              onClick={() => handleExport('csv')}
              className="h-9 px-2.5 flex items-center gap-1 rounded-lg text-mute text-[12px] active:bg-surface"
            >
              <Download size={15} /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="h-9 px-2.5 flex items-center gap-1 rounded-lg text-mute text-[12px] active:bg-surface"
            >
              <Download size={15} /> JSON
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4 flex flex-col gap-4 max-w-xl mx-auto">
        <DeloadBanner
          periodization={periodization}
          fatigueSignal={fatigueSignal}
          isDeloadToday={isDeloadToday}
          onToggleDeload={toggleDeloadForToday}
        />

        {todaySession && todaySession.exercises.length > 0 && (
          <DailySummaryCard summary={toDailySummary(todaySession)} />
        )}

        <section>
          <p className="font-display text-[13px] tracking-wide text-mute uppercase mb-2">
            부위 선택
          </p>
          <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
        </section>

        <section>
          <p className="font-display text-[13px] tracking-wide text-mute uppercase mb-2">
            {CATEGORY_LABEL[activeCategory]} 기초 운동
          </p>
          <ExerciseChips
            category={activeCategory}
            customExercises={customExercises}
            loggedExerciseIds={loggedExerciseIds}
            onSelect={addExerciseToSession}
            onAddCustom={(ex) => {
              storage.addCustomExercise(ex);
              setCustomExercises((prev) => [...prev, ex]);
            }}
          />
        </section>

        {todaySession?.exercises.length ? (
          <section className="flex flex-col gap-4">
            <p className="font-display text-[13px] tracking-wide text-mute uppercase">
              오늘의 세트 기록
            </p>
            {todaySession.exercises.map((exerciseLog) => (
              <div key={exerciseLog.id}>
                <p className="text-[15px] font-medium mb-1.5">{exerciseLog.exerciseName}</p>
                <SetLogTable
                  exerciseLog={exerciseLog}
                  lastPerformance={findLastPerformance(sessions, exerciseLog.exerciseId, todaySession.date)}
                  onUpdateSet={(setId, patch) => updateSet(exerciseLog.id, setId, patch)}
                  onAddSet={() => addSet(exerciseLog.id)}
                  onRemoveSet={(setId) => removeSet(exerciseLog.id, setId)}
                  onSetCompleted={(seconds) => setRestSeconds(seconds)}
                />
              </div>
            ))}
          </section>
        ) : (
          <p className="text-center text-mute text-[13px] py-10">
            위에서 운동을 선택하면 세트 기록이 여기에 표시돼요.
          </p>
        )}
      </main>

      <RestTimer
        seconds={restSeconds}
        onDismiss={() => setRestSeconds(null)}
        onExtend={(extra) => setRestSeconds((r) => (r ?? 0) + extra)}
      />
    </div>
  );
}
