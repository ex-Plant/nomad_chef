import { cn } from "@/helpers/cn";

type FormLabelPropsT = {
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
};

export function FormLabel({ htmlFor, children, className }: FormLabelPropsT) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1 block font-sans text-xs font-medium text-off-black",
        className,
      )}
    >
      {children}
    </label>
  );
}
