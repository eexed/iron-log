import type { DailySummary } from '../types';
import { CATEGORY_LABEL } from '../types';

interface Props {
  summary: DailySummary;
}

export function DailySummaryCard({ summary }: Props) {
  return (
    <div className="rounded-card bg-surface border border-line px-4 py-3.5">
      <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
        {summary.categories.map((cat) => (
          <span
            key={cat}
            className="text-[11px] font-medium px-2 py-1 rounded-md bg-surface-raised text-mute"
          >
            {CATEGORY_LABEL[cat]}
          </span>
        ))}
        {summary.isDeloadSession && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-plate-yellow/15 text-plate-yellow">
            디로딩
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="총 볼륨" value={`${summary.totalVolumeKg.toLocaleString()}`} unit="kg" />
        <Stat label="총 세트" value={`${summary.totalSets}`} unit="세트" />
        <Stat
          label="운동 시간"
          value={summary.durationMinutes != null ? `${summary.durationMinutes}` : '—'}
          unit="분"
        />
      </div>
    </div>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-[11px] text-mute mb-0.5">{label}</p>
      <p className="num font-display text-xl">
        {value}
        <span className="text-mute text-xs font-body ml-0.5">{unit}</span>
      </p>
    </div>
  );
}
