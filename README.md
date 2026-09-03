# Iron Log — 로컬 우선 운동 기록 PWA

메모장 대신 쓰는, 로그인 없는 운동 기록 앱의 기본 틀입니다.

## 실행 방법

```bash
npm install
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드 + PWA 매니페스트/서비스워커 생성
```

## 폴더 구조

```
src/
  types/index.ts               # 도메인 모델 (ExerciseCategory, SetLog, WorkoutSession ...)
  constants/presetExercises.ts # 부위별 기초 운동 프리셋 데이터
  lib/storage.ts               # LocalStorage 어댑터 + JSON/CSV 백업
  lib/calculations.ts          # 볼륨/디로딩 중량/사이클 주차 계산
  hooks/useWorkoutStore.ts     # 오늘 세션 상태 관리 (읽기/쓰기 전부 이 훅을 통함)
  components/
    CategoryTabs.tsx           # 부위 탭
    ExerciseChips.tsx          # 기초 운동 칩 + 커스텀 운동 추가
    SetLogTable.tsx            # 세트별 무게/횟수/완료 입력 테이블 (고스트 텍스트 포함)
    RestTimer.tsx               # 세트 완료 시 자동 시작되는 휴식 타이머
    DeloadBanner.tsx            # 사이클 주차 카운터 + 디로딩 토글 + 권장 배지
    DailySummaryCard.tsx        # 총 볼륨/세트/시간 요약
    WorkoutLogger.tsx           # 위 컴포넌트를 조립하는 메인 화면
```

## 설계 메모

- **로컬 우선**: 모든 데이터는 `localStorage`에 즉시 저장됩니다(`lib/storage.ts`).
  IndexedDB로 교체하더라도 이 파일의 함수 시그니처만 유지하면 나머지 코드는
  변경할 필요가 없습니다.
- **디로딩 계산**: 종목을 처음 담을 때, 또는 디로딩 토글을 켤 때
  `findLastPerformance`로 직전 본세트 무게를 찾아 `applyDeloadWeights`로
  지정 비율(기본 50%)을 2.5kg 단위로 반올림해 일괄 적용합니다.
- **디로딩 권장 배지**: `evaluateFatigueSignal`이 사이클 시작일 기준 경과
  주차를 계산해, 목표 주차(기본 6~8주)에 도달하면 `DeloadBanner`에 경고를
  표시합니다.
- **색상 체계**: 올림픽 역도 원판 색상(적=25kg, 청=20kg, 황=15kg, 녹=10kg)을
  그대로 UI 상태 신호로 재사용했습니다 — 녹색=완료, 청색=진행 중, 황색=디로딩/피로
  경고, 적색=고강도. OLED 순검정(#0A0A0A) 배경 위에 얹어 배터리 소모와 헬스장
  환경에서의 시인성을 동시에 잡았습니다.
- **아직 붙이지 않은 것**: 월간 캘린더 뷰, 세션 히스토리 리스트, CSV 불러오기는
  `lib/storage.ts`의 `sessionsToCSV`/`importJSON`을 그대로 재사용해 화면만
  추가하면 됩니다. 데이터 모델(`WorkoutSession[]`)은 이미 다중 세션·다중 날짜를
  지원하도록 설계되어 있습니다.

## 다음 확장 지점

1. `WorkoutSession[]`을 날짜별로 그룹화해 캘린더 뷰 추가
2. `PeriodizationState`에 `cycleLengthWeeks` 편집 UI 연결
3. `applyDeloadWeights`의 반올림 단위(현재 2.5kg 고정)를 사용자 설정값으로 분리
4. IndexedDB 어댑터로 `lib/storage.ts` 내부만 교체 (외부 인터페이스 동일 유지)
