import { cn } from "@/helpers/cn";

type FormSeparatorPropsT = {
  className?: string;
};

export function FormSeparator({ className }: FormSeparatorPropsT) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn("h-[3px] rounded-full bg-yellow", className)}
    />
  );
}
