import type {
  WorkoutSession,
  CustomExercise,
  PeriodizationState,
  BackupPayload,
} from '../types';

/**
 * 로컬 우선(local-first) 저장소.
 * - 모든 읽기/쓰기는 동기적이며 네트워크나 로그인 없이 즉시 동작한다.
 * - 향후 IndexedDB로 교체하더라도 이 모듈의 함수 시그니처만 유지하면
 *   나머지 앱 코드는 변경할 필요가 없도록 얇은 어댑터로 설계했다.
 */

const KEYS = {
  sessions: 'ironlog:sessions',
  customExercises: 'ironlog:customExercises',
  periodization: 'ironlog:periodization',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    // 손상된 데이터는 앱을 죽이지 않고 기본값으로 안전하게 폴백한다.
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  getSessions(): WorkoutSession[] {
    return read<WorkoutSession[]>(KEYS.sessions, []);
  },
  saveSessions(sessions: WorkoutSession[]): void {
    write(KEYS.sessions, sessions);
  },
  upsertSession(session: WorkoutSession): void {
    const sessions = storage.getSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) sessions[idx] = session;
    else sessions.push(session);
    storage.saveSessions(sessions);
  },

  getCustomExercises(): CustomExercise[] {
    return read<CustomExercise[]>(KEYS.customExercises, []);
  },
  addCustomExercise(exercise: CustomExercise): void {
    const list = storage.getCustomExercises();
    list.push(exercise);
    write(KEYS.customExercises, list);
  },

  getPeriodization(): PeriodizationState {
    return read<PeriodizationState>(KEYS.periodization, {
      cycleStartDate: new Date().toISOString().slice(0, 10),
      cycleLengthWeeks: 6,
      currentWeek: 1,
      isDeloadWeek: false,
      deloadIntensityPct: 50,
    });
  },
  savePeriodization(state: PeriodizationState): void {
    write(KEYS.periodization, state);
  },

  exportJSON(): BackupPayload {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      sessions: storage.getSessions(),
      customExercises: storage.getCustomExercises(),
      periodization: storage.getPeriodization(),
    };
  },

  importJSON(payload: BackupPayload): void {
    storage.saveSessions(payload.sessions ?? []);
    write(KEYS.customExercises, payload.customExercises ?? []);
    storage.savePeriodization(payload.periodization ?? storage.getPeriodization());
  },
};

/** 세션 배열을 세트 단위 평탄화된 CSV 문자열로 변환한다. */
export function sessionsToCSV(sessions: WorkoutSession[]): string {
  const header = [
    'date',
    'session_id',
    'is_deload_session',
    'category',
    'exercise_name',
    'set_number',
    'weight_kg',
    'reps',
    'is_deload_set',
    'is_completed',
  ].join(',');

  const rows: string[] = [];
  for (const session of sessions) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        rows.push(
          [
            session.date,
            session.id,
            session.isDeloadSession,
            ex.category,
            `"${ex.exerciseName.replace(/"/g, '""')}"`,
            set.setNumber,
            set.weightKg ?? '',
            set.reps ?? '',
            set.isDeloadSet,
            set.isCompleted,
          ].join(','),
        );
      }
    }
  }
  return [header, ...rows].join('\n');
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
