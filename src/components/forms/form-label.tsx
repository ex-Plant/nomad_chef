import { cn } from "@/helpers/cn";

type FormLabelPropsT = {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

export function FormLabel({
  htmlFor,
  children,
  required,
  className,
}: FormLabelPropsT) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-2 block font-sans text-xs font-medium text-white",
        className
      )}
    >
      {children}
      {required && (
        <span aria-hidden="true" className="ml-0.5 text-yellow">
          *
        </span>
      )}
    </label>
  );
}
