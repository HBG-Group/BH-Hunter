import { AVAILABILITY_STYLES } from "@/config/availability";
import type { AvailabilityState } from "@/types/domain";

interface Props {
  state: AvailabilityState;
  remaining: number;
}

// The green / yellow / red pill used on cards and the detail page.
export function AvailabilityBadge({ state, remaining }: Props) {
  const style = AVAILABILITY_STYLES[state];
  const text = state === "FULL" ? style.label : `${remaining} available`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.badgeClass}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: style.color }} />
      {text}
    </span>
  );
}
