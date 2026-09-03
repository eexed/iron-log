import { useState } from 'react';
import { Download, Upload, Menu, X, Trash2, Calendar as CalendarIcon, Dumbbell } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'today' | 'calendar'>('today');

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());

  const loggedExerciseIds = todaySession?.exercises.map((e) => e.exerciseId) ?? [];
  const isDeloadToday = todaySession?.isDeloadSession ?? periodization.isDeloadWeek;

  function handleRemoveExercise(exerciseLogId: string) {
    if (!todaySession) return;
    if (!confirm('해당 운동 종목을 삭제할까요?')) return;
    const updatedExercises = todaySession.exercises.filter((ex) => ex.id !== exerciseLogId);
    const updatedSession = { ...todaySession, exercises: updatedExercises };
    const updatedAll = sessions.map((s) => (s.id === todaySession.id ? updatedSession : s));
    storage.saveSessions(updatedAll);
    window.location.reload();
  }

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

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const workoutDatesSet = new Set(
    sessions.filter((s) => s.exercises.length > 0).map((s) => s.date)
  );

  const selectedSession = sessions.find((s) => s.date === selectedDate);

  return (
    <div className="min-h-screen pb-28 text-ink-light bg-[#121212] text-white">
      <header className="sticky top-0 z-20 bg-[#1e1e1e]/90 backdrop-blur border-b border-gray-800 px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="메뉴 열기"
            >
              <Menu size={22} />
            </button>
            <h1 className="font-bold text-lg tracking-wide">
              {currentView === 'today' ? 'Iron Log' : '운동 달력'}
            </h1>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80%] bg-[#1e1e1e] border-r border-gray-800 h-full p-5 flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold tracking-wider text-emerald-400">IRON LOG</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCurrentView('today');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'today' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <Dumbbell size={18} />
                  오늘의 운동 기록
                </button>
                <button
                  onClick={() => {
                    setCurrentView('calendar');
                    setIsMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'calendar' ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <CalendarIcon size={18} />
                  운동 달력 & 기록
                </button>
              </nav>
            </div>

            <div className="border-t border-gray-800 pt-4 flex flex-col gap-2">
              <p className="text-xs text-gray-500 font-semibold mb-1">데이터 관리</p>
              <label className="flex items-center gap-2 text-xs text-gray-300 p-2 rounded hover:bg-gray-800 cursor-pointer">
                <Upload size={14} /> 백업 불러오기 (JSON)
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
                />
              </label>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-2 text-xs text-gray-300 p-2 rounded hover:bg-gray-800 text-left"
              >
                <Download size={14} /> JSON 백업 저장
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 text-xs text-gray-300 p-2 rounded hover:bg-gray-800 text-left"
              >
                <Download size={14} /> CSV 내보내기
              </button>
            </div>
          </div>
        </div>
      )}

      {currentView === 'today' ? (
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
            <p className="text-[13px] tracking-wide text-gray-400 uppercase mb-2">부위 선택</p>
            <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
          </section>

          <section>
            <p className="text-[13px] tracking-wide text-gray-400 uppercase mb-2">
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
              <p className="text-[13px] tracking-wide text-gray-400 uppercase">오늘의 세트 기록</p>
              {todaySession.exercises.map((exerciseLog) => (
                <div key={exerciseLog.id} className="bg-[#1e1e1e] p-3 rounded-xl border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[15px] font-semibold">{exerciseLog.exerciseName}</p>
                    <button
                      onClick={() => handleRemoveExercise(exerciseLog.id)}
                      className="text-gray-500 hover:text-red-400 p-1"
                      title="운동 삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
            <p className="text-center text-gray-500 text-[13px] py-10">
              위에서 운동을 선택하면 세트 기록이 여기에 표시돼요.
            </p>
          )}
        </main>
      ) : (
        <main className="px-4 pt-4 flex flex-col gap-4 max-w-xl mx-auto">
          <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-base">
                {year}년 {month + 1}월
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  이전달
                </button>
                <button
                  onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs"
                >
                  다음달
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
              <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasWorkout = workoutDatesSet.has(dateStr);
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`h-10 rounded-lg flex flex-col items-center justify-center relative transition-all text-xs ${
                      isSelected ? 'ring-2 ring-emerald-400 font-bold' : ''
                    } ${hasWorkout ? 'bg-emerald-950/40 text-emerald-300' : 'hover:bg-gray-800 text-gray-300'}`}
                  >
                    <span>{day}</span>
                    {hasWorkout && (
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-[#1e1e1e] p-4 rounded-xl border border-gray-800">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <CalendarIcon size={16} className="text-emerald-400" />
              {selectedDate} 기록
            </h3>

            {selectedSession && selectedSession.exercises.length > 0 ? (
              <div className="flex flex-col gap-3">
                {selectedSession.exercises.map((ex) => (
                  <div key={ex.id} className="border-b border-gray-800/80 pb-2.5 last:border-b-0">
                    <p className="text-sm font-medium text-white mb-1">{ex.exerciseName}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ex.sets.map((set, idx) => (
                        <span
                          key={set.id}
                          className="text-[11px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded"
                        >
                          {idx + 1}세트: {set.weightKg ?? 0}kg × {set.reps ?? 0}회
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 text-xs py-6">
                이 날짜에는 운동 기록이 없습니다.
              </p>
            )}
          </div>
        </main>
      )}

      <RestTimer
        seconds={restSeconds}
        onDismiss={() => setRestSeconds(null)}
        onExtend={(extra) => setRestSeconds((r) => (r ?? 0) + extra)}
      />
    </div>
  );
}