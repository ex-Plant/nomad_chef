import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/button";
import { ProgressDots } from "@/components/shared/progress-dots";
import { CONTENT } from "@/config/content";

type SwiperControlsPropsT = {
  total: number;
  active: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (i: number) => void;
  className?: string;
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
          aria-label={CONTENT.shared.swiperControls.prevLabel}
          // rounded
        >
          <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
        </Button>
        <Button
          variant="yellow"
          size="icon-sm"
          onClick={onNext}
          aria-label={CONTENT.shared.swiperControls.nextLabel}
          // rounded
        >
          <ArrowRight size={20} strokeWidth={2.5} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
