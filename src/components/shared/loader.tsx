import { Starburst } from "@/components/shared/starburst";
import { cn } from "@/helpers/cn";

type LoaderPropsT = {
  className?: string;
};

export function Loader({ className }: LoaderPropsT) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn("flex items-center justify-center", className)}
    >
      <div className="animate-bounce w-12 md:w-16 animate-rotate">
        <Starburst className={`animate-rotate`} color="blue" variant="v1-b" />
      </div>
    </div>
  );
}
