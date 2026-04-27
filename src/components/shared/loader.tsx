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
      aria-label="Loading"
      className={cn("flex items-center justify-center", className)}
    >
      <div className="animate-bounce w-12 md:w-16 animate-rotate">
        <Starburst className={`animate-rotate`} color={color} variant="v1-b" />
      </div>
    </div>
  );
}
