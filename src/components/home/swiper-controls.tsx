import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/home/button";
import { ProgressDots } from "@/components/home/progress-dots";

type SwiperControlsPropsT = {
  readonly total: number;
  readonly active: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onSelect: (i: number) => void;
  readonly className?: string;
};

export function SwiperControls({
  total,
  active,
  onPrev,
  onNext,
  onSelect,
  className = "",
}: SwiperControlsPropsT) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <ProgressDots total={total} active={active} onSelect={onSelect} />
      <div className="flex gap-3">
        <Button
          variant="yellow"
          size="icon-sm"
          onClick={onPrev}
          aria-label="Poprzedni"
          // rounded
        >
          <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
        </Button>
        <Button
          variant="yellow"
          size="icon-sm"
          onClick={onNext}
          aria-label="Następny"
          // rounded
        >
          <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
