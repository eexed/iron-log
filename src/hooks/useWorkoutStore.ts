import { useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type {
  WorkoutSession,
  ExerciseLog,
  SetLog,
  Exercise,
  ExerciseCategory,
  PeriodizationState,
} from '../types';
import { storage } from '../lib/storage';
import {
  findLastPerformance,
  applyDeloadWeights,
  evaluateFatigueSignal,
  calcCurrentWeek,
} from '../lib/calculations';

const todayStr = () => new Date().toISOString().slice(0, 10);

function createEmptySet(setNumber: number, isDeload: boolean): SetLog {
  return {
    id: uuid(),
    setNumber,
    weightKg: null,
    reps: null,
    isCompleted: false,
    isDeloadSet: isDeload,
  };
}

/**
 * 오늘 세션 하나를 다루는 메인 훅.
 * '기본 틀' 데모를 위해 하루 1세션을 가정하지만, WorkoutSession[] 전체는
 * storage 레이어에 그대로 보존되므로 다중 세션/캘린더 확장이 쉽다.
 */
export function useWorkoutStore() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [periodization, setPeriodization] = useState<PeriodizationState>(
    storage.getPeriodization(),
  );
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory>('chest');

  useEffect(() => {
    setSessions(storage.getSessions());
  }, []);

  const today = todayStr();

  const todaySession = useMemo<WorkoutSession | undefined>(
    () => sessions.find((s) => s.date === today),
    [sessions, today],
  );

  const persist = useCallback((updated: WorkoutSession) => {
    storage.upsertSession(updated);
    setSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  }, []);

  const ensureTodaySession = useCallback((): WorkoutSession => {
    if (todaySession) return todaySession;
    const created: WorkoutSession = {
      id: uuid(),
      date: today,
      startedAt: new Date().toISOString(),
      exercises: [],
      isDeloadSession: periodization.isDeloadWeek,
      targetCategories: [],
    };
    persist(created);
    return created;
  }, [todaySession, today, periodization.isDeloadWeek, persist]);

  /** 종목 칩 클릭 → 오늘 세션에 종목을 추가하고, 직전 기록을 프리필한다. */
  const addExerciseToSession = useCallback(
    (exercise: Exercise) => {
      const session = ensureTodaySession();
      if (session.exercises.some((e) => e.exerciseId === exercise.id)) return;

      const last = findLastPerformance(sessions, exercise.id, today);
      const seedSetCount = last?.sets.length ?? 3;

      let sets: SetLog[] = Array.from({ length: seedSetCount }, (_, i) =>
        createEmptySet(i + 1, session.isDeloadSession),
      );

      if (session.isDeloadSession && last) {
        sets = applyDeloadWeights(
          sets,
          last.sets.map((s) => s.weightKg),
          periodization.deloadIntensityPct,
        );
      }

      const exerciseLog: ExerciseLog = {
        id: uuid(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        category: exercise.category,
        sets,
      };

      const updated: WorkoutSession = {
        ...session,
        exercises: [...session.exercises, exerciseLog],
        targetCategories: Array.from(
          new Set([...session.targetCategories, exercise.category]),
        ),
      };
      persist(updated);
    },
    [ensureTodaySession, sessions, today, periodization.deloadIntensityPct, persist],
  );

  const updateSet = useCallback(
    (exerciseLogId: string, setId: string, patch: Partial<SetLog>) => {
      const session = ensureTodaySession();
      const updated: WorkoutSession = {
        ...session,
        exercises: session.exercises.map((ex) =>
          ex.id !== exerciseLogId
            ? ex
            : { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)) },
        ),
      };
      persist(updated);
    },
    [ensureTodaySession, persist],
  );

  const addSet = useCallback(
    (exerciseLogId: string) => {
      const session = ensureTodaySession();
      const updated: WorkoutSession = {
        ...session,
        exercises: session.exercises.map((ex) => {
          if (ex.id !== exerciseLogId) return ex;
          const lastSet = ex.sets[ex.sets.length - 1];
          const newSet = createEmptySet(ex.sets.length + 1, session.isDeloadSession);
          if (lastSet) {
            newSet.weightKg = lastSet.weightKg;
            newSet.reps = lastSet.reps;
          }
          return { ...ex, sets: [...ex.sets, newSet] };
        }),
      };
      persist(updated);
    },
    [ensureTodaySession, persist],
  );

  const removeSet = useCallback(
    (exerciseLogId: string, setId: string) => {
      const session = ensureTodaySession();
      const updated: WorkoutSession = {
        ...session,
        exercises: session.exercises.map((ex) =>
          ex.id !== exerciseLogId
            ? ex
            : {
                ...ex,
                sets: ex.sets
                  .filter((s) => s.id !== setId)
                  .map((s, i) => ({ ...s, setNumber: i + 1 })),
              },
        ),
      };
      persist(updated);
    },
    [ensureTodaySession, persist],
  );

  /** 디로딩 모드 토글: 세션 플래그 + 이미 담긴 세트들의 무게를 일괄 재계산. */
  const toggleDeloadForToday = useCallback(
    (enabled: boolean) => {
      const session = ensureTodaySession();
      const updated: WorkoutSession = {
        ...session,
        isDeloadSession: enabled,
        exercises: session.exercises.map((ex) => {
          if (!enabled) return { ...ex, sets: ex.sets.map((s) => ({ ...s, isDeloadSet: false })) };
          const last = findLastPerformance(sessions, ex.exerciseId, today);
          const baseline = last?.sets.map((s) => s.weightKg) ?? ex.sets.map((s) => s.weightKg);
          return { ...ex, sets: applyDeloadWeights(ex.sets, baseline, periodization.deloadIntensityPct) };
        }),
      };
      persist(updated);
    },
    [ensureTodaySession, sessions, today, periodization.deloadIntensityPct, persist],
  );

  const fatigueSignal = useMemo(() => evaluateFatigueSignal(periodization), [periodization]);
  const currentWeek = useMemo(
    () => calcCurrentWeek(periodization.cycleStartDate),
    [periodization.cycleStartDate],
  );

  const savePeriodization = useCallback((next: PeriodizationState) => {
    storage.savePeriodization(next);
    setPeriodization(next);
  }, []);

  return {
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
    savePeriodization,
    fatigueSignal,
    currentWeek,
  };
}
