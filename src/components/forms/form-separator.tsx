import { cn } from "@/helpers/cn";

type FormSeparatorPropsT = {
  className?: string;
};

export function FormSeparator({ className }: FormSeparatorPropsT) {
  return (
    <div
      role="separator"
      aria-hidden
      className={cn("h-[1px] rounded-full bg-yellow my-8", className)}
    />
  );
}
