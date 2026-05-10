import { cn } from "@/helpers/cn";

type FormSeparatorPropsT = {
  className?: string;
};

export function FormSeparator({ className }: FormSeparatorPropsT) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn("bg-yellow my-6 h-[1px] rounded-full", className)}
    />
  );
}
