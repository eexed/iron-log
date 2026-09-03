import type {
  WorkoutSession,
  SetLog,
  LastPerformance,
  PeriodizationState,
  FatigueSignal,
  DailySummary,
} from '../types';

/** 완료된 세트만 볼륨(무게 × 횟수) 계산에 포함한다. */
export function calcSessionVolume(session: WorkoutSession): number {
  let total = 0;
  for (const ex of session.exercises) {
    for (const set of ex.sets) {
      if (set.isCompleted && set.weightKg != null && set.reps != null) {
        total += set.weightKg * set.reps;
      }
    }
  }
  return total;
}

export function calcSessionSetCount(session: WorkoutSession): number {
  return session.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length,
    0,
  );
}

export function calcSessionDurationMinutes(session: WorkoutSession): number | null {
  if (!session.endedAt) return null;
  const ms = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

export function toDailySummary(session: WorkoutSession): DailySummary {
  return {
    date: session.date,
    totalVolumeKg: calcSessionVolume(session),
    totalSets: calcSessionSetCount(session),
    durationMinutes: calcSessionDurationMinutes(session),
    categories: session.targetCategories,
    isDeloadSession: session.isDeloadSession,
  };
}

/**
 * 특정 종목의 가장 최근 완료 기록을 찾는다.
 * '이전 세트 기록(Ghost text)'과 입력 placeholder에 사용된다.
 */
export function findLastPerformance(
  sessions: WorkoutSession[],
  exerciseId: string,
  beforeDate?: string,
): LastPerformance | null {
  const sorted = [...sessions]
    .filter((s) => !beforeDate || s.date < beforeDate)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  for (const session of sorted) {
    const match = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (match) {
      const completed = match.sets.filter((s) => s.isCompleted);
      if (completed.length > 0) {
        return {
          exerciseId,
          date: session.date,
          sets: completed.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
        };
      }
    }
  }
  return null;
}

/** 디로딩 모드: 직전 본세트 무게의 지정 비율(기본 50%)을 2.5kg 단위로 반올림하여 일괄 적용. */
export function applyDeloadWeights(
  sets: SetLog[],
  baselineWeights: (number | null)[],
  intensityPct: number,
): SetLog[] {
  return sets.map((set, i) => {
    const baseline = baselineWeights[i] ?? baselineWeights[baselineWeights.length - 1] ?? null;
    if (baseline == null) return { ...set, isDeloadSet: true };
    const raw = baseline * (intensityPct / 100);
    const rounded = Math.round(raw / 2.5) * 2.5;
    return { ...set, weightKg: rounded, isDeloadSet: true };
  });
}

/** 사이클 시작일 기준 현재 주차(1부터 시작)를 계산한다. */
export function calcCurrentWeek(cycleStartDate: string, today: Date = new Date()): number {
  const start = new Date(cycleStartDate);
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, Math.floor(diffDays / 7) + 1);
}

/** 목표 사이클 길이에 도달했거나 이미 지났으면 디로딩을 권장한다. */
export function evaluateFatigueSignal(state: PeriodizationState): FatigueSignal {
  const week = calcCurrentWeek(state.cycleStartDate);
  if (!state.isDeloadWeek && week >= state.cycleLengthWeeks) {
    return { weekNumber: week, recommendedDeload: true, reason: 'cycle-length-reached' };
  }
  return { weekNumber: week, recommendedDeload: false, reason: null };
}

/** 새 고강도 사이클을 시작한다 (디로딩 주간 종료 시 호출). */
export function startNewCycle(state: PeriodizationState, today: string): PeriodizationState {
  return {
    ...state,
    cycleStartDate: today,
    currentWeek: 1,
    isDeloadWeek: false,
    lastDeloadDate: today,
  };
}
