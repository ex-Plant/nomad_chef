import { Starburst } from "@/components/shared/starburst";
import { cn } from "@/helpers/cn";

type LoaderColorT = "blue" | "coral" | "yellow" | "pink";

type LoaderPropsT = {
  className?: string;
  color?: LoaderColorT;
};

export function Loader({ className, color = "blue" }: LoaderPropsT) {
  return (
    <div
      role="status"
      aria-label="Ładowanie"
      className={cn("bg-coral flex items-center justify-center", className)}
    >
      <div className="animate-rotate w-12 animate-bounce md:w-16">
        <Starburst className="animate-rotate" color={color} variant="v1-b" />
      </div>
    </div>
  );
}
