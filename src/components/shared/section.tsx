import type { SectionIdT } from "@/config/section-ids";
import { cn } from "@/helpers/cn";

type SectionPropsT = {
  ref?: React.Ref<HTMLElement>;
  id?: SectionIdT;
  className?: string;
  children: React.ReactNode;
};

export function Section({ ref, id, className, children }: SectionPropsT) {
  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "relative flex min-h-dvh flex-col overflow-x-clip py-24 justify-center",
        className
      )}
    >
      {children}
    </section>
  );
}
