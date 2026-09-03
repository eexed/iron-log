import type { PresetExercise, ExerciseCategory } from '../types';

/**
 * 사전 탑재 운동 데이터셋.
 * id는 'category-slug' 규칙으로 고정하여, 기록 데이터가 이 상수 배열의
 * 순서/내용이 바뀌어도 깨지지 않도록 한다 (ExerciseLog는 이름을 스냅샷 저장).
 */
export const PRESET_EXERCISES: PresetExercise[] = [
  // 가슴 Chest
  { id: 'chest-barbell-bench-press', category: 'chest', name: '바벨 벤치프레스' },
  { id: 'chest-incline-dumbbell-press', category: 'chest', name: '인클라인 덤벨 프레스' },
  { id: 'chest-dumbbell-fly', category: 'chest', name: '덤벨 플라이' },
  { id: 'chest-dips', category: 'chest', name: '딥스' },
  { id: 'chest-pushup', category: 'chest', name: '푸시업' },
  { id: 'chest-pec-deck-fly', category: 'chest', name: '펙덱 플라이' },

  // 등 Back
  { id: 'back-barbell-row', category: 'back', name: '바벨 로우' },
  { id: 'back-pullup', category: 'back', name: '풀업(턱걸이)' },
  { id: 'back-lat-pulldown', category: 'back', name: '랫 풀 다운' },
  { id: 'back-seated-cable-row', category: 'back', name: '시티드 케이블 로우' },
  { id: 'back-deadlift', category: 'back', name: '데드리프트' },
  { id: 'back-one-arm-dumbbell-row', category: 'back', name: '원암 덤벨 로우' },

  // 하체 Legs
  { id: 'legs-barbell-back-squat', category: 'legs', name: '바벨 백 스쿼트' },
  { id: 'legs-leg-press', category: 'legs', name: '레그 프레스' },
  { id: 'legs-leg-extension', category: 'legs', name: '레그 익스텐션' },
  { id: 'legs-leg-curl', category: 'legs', name: '레그 컬' },
  { id: 'legs-romanian-deadlift', category: 'legs', name: '루마니안 데드리프트' },
  { id: 'legs-lunge', category: 'legs', name: '런지' },
  { id: 'legs-hip-thrust', category: 'legs', name: '힙 쓰러스트' },

  // 어깨 Shoulders
  { id: 'shoulders-overhead-press', category: 'shoulders', name: '오버헤드 프레스(OHP)' },
  { id: 'shoulders-dumbbell-shoulder-press', category: 'shoulders', name: '덤벨 숄더 프레스' },
  { id: 'shoulders-side-lateral-raise', category: 'shoulders', name: '사이드 레터럴 레이즈' },
  { id: 'shoulders-face-pull', category: 'shoulders', name: '페이스 풀' },
  { id: 'shoulders-reverse-pec-deck', category: 'shoulders', name: '리버스 펙덱 플라이' },

  // 팔 Arms
  { id: 'arms-barbell-curl', category: 'arms', name: '바벨 컬' },
  { id: 'arms-dumbbell-bicep-curl', category: 'arms', name: '덤벨 바이셉 컬' },
  { id: 'arms-cable-pushdown', category: 'arms', name: '삼두 푸시다운(케이블)' },
  { id: 'arms-lying-triceps-extension', category: 'arms', name: '라잉 트라이셉스 익스텐션(스컬크러셔)' },

  // 복근/코어 Core
  { id: 'core-plank', category: 'core', name: '플랭크' },
  { id: 'core-hanging-leg-raise', category: 'core', name: '행잉 레그레이즈' },
  { id: 'core-crunch', category: 'core', name: '크런치' },
  { id: 'core-ab-roller', category: 'core', name: '아브롤러(AB 슬라이드)' },
];

export const CATEGORY_ORDER: ExerciseCategory[] = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
];

export function getPresetsByCategory(category: ExerciseCategory): PresetExercise[] {
  return PRESET_EXERCISES.filter((e) => e.category === category);
}
