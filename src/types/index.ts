/**
 * Iron Log — 도메인 모델
 * 로컬 우선(local-first) 저장을 전제로, 모든 엔티티는 자체 id/timestamp를 가진다.
 */

// ────────────────────────────────────────────────────────────
// 1. 운동 부위 카테고리
// ────────────────────────────────────────────────────────────
export type ExerciseCategory =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core';

export const CATEGORY_LABEL: Record<ExerciseCategory, string> = {
  chest: '가슴',
  back: '등',
  legs: '하체',
  shoulders: '어깨',
  arms: '팔',
  core: '복근/코어',
};

// ────────────────────────────────────────────────────────────
// 2. 프리셋 / 커스텀 운동 종목
// ────────────────────────────────────────────────────────────
export interface PresetExercise {
  id: string; // 안정적인 slug, 예: 'chest-barbell-bench-press'
  category: ExerciseCategory;
  name: string; // 화면에 표시되는 한글명
  isCustom?: false;
}

export interface CustomExercise {
  id: string; // uuid
  category: ExerciseCategory;
  name: string;
  isCustom: true;
  createdAt: string; // ISO timestamp
}

export type Exercise = PresetExercise | CustomExercise;

// ────────────────────────────────────────────────────────────
// 3. 세트 기록
// ────────────────────────────────────────────────────────────
export interface SetLog {
  id: string;
  setNumber: number; // 1부터 시작
  weightKg: number | null; // null = 아직 입력 전
  reps: number | null;
  isCompleted: boolean;
  isDeloadSet: boolean; // 디로딩 모드로 계산된 세트인지 여부
  restSeconds?: number; // 이 세트 완료 후 실제로 쉰 시간(선택)
}

// ────────────────────────────────────────────────────────────
// 4. 운동 종목 단위 로그 (하나의 세션 안에서 종목별로 묶음)
// ────────────────────────────────────────────────────────────
export interface ExerciseLog {
  id: string;
  exerciseId: string;
  exerciseName: string; // 프리셋 삭제/변경에도 기록이 깨지지 않도록 스냅샷 저장
  category: ExerciseCategory;
  sets: SetLog[];
  notes?: string;
}

// ────────────────────────────────────────────────────────────
// 5. 하루 운동 세션
// ────────────────────────────────────────────────────────────
export interface WorkoutSession {
  id: string;
  date: string; // 'YYYY-MM-DD'
  startedAt: string; // ISO timestamp
  endedAt?: string; // ISO timestamp, 세션 종료 시 기록
  exercises: ExerciseLog[];
  isDeloadSession: boolean; // 디로딩 주간에 수행된 세션인지
  targetCategories: ExerciseCategory[]; // 캘린더 배지용 요약
}

// ────────────────────────────────────────────────────────────
// 6. 주기화(Periodization) / 디로딩 상태
// ────────────────────────────────────────────────────────────
export interface PeriodizationState {
  cycleStartDate: string; // 현재 고강도 사이클이 시작된 날짜
  cycleLengthWeeks: number; // 목표 사이클 길이, 기본 6~8주
  currentWeek: number; // 사이클 몇 주차인지 (파생값이지만 캐시)
  isDeloadWeek: boolean; // 이번 주가 디로딩 주간으로 지정되었는지
  deloadIntensityPct: number; // 디로딩 시 적용할 본세트 대비 비율, 기본 50
  lastDeloadDate?: string;
}

// 정체기/디로딩 권장 판단에 쓰이는 파생 지표
export interface FatigueSignal {
  weekNumber: number;
  recommendedDeload: boolean;
  reason: 'cycle-length-reached' | 'volume-plateau' | 'manual' | null;
}

// ────────────────────────────────────────────────────────────
// 7. 종목별 "직전 기록" 조회 결과 (Ghost text / placeholder 용)
// ────────────────────────────────────────────────────────────
export interface LastPerformance {
  exerciseId: string;
  date: string;
  sets: Pick<SetLog, 'weightKg' | 'reps'>[];
}

// ────────────────────────────────────────────────────────────
// 8. 대시보드 요약 (일별 카드)
// ────────────────────────────────────────────────────────────
export interface DailySummary {
  date: string;
  totalVolumeKg: number; // Σ(weight × reps), 완료된 세트만
  totalSets: number;
  durationMinutes: number | null;
  categories: ExerciseCategory[];
  isDeloadSession: boolean;
}

// ────────────────────────────────────────────────────────────
// 9. 백업/복원 페이로드
// ────────────────────────────────────────────────────────────
export interface BackupPayload {
  version: 1;
  exportedAt: string;
  sessions: WorkoutSession[];
  customExercises: CustomExercise[];
  periodization: PeriodizationState;
}
