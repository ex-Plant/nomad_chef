import { ArrowRight } from "lucide-react";
import { type ReactNode, type ComponentProps } from "react";

type ContactLinkPropsT = {
  readonly href: string;
  readonly icon: ReactNode;
  readonly label: string;
  readonly value: string;
  readonly external?: boolean;
};

export function ContactLink({ href, icon, label, value, external }: ContactLinkPropsT) {
  const externalProps: ComponentProps<"a"> = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      className="group flex items-center gap-4 border-b border-coral pb-6 transition-colors duration-300 hover:border-coral"
      {...externalProps}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral text-white">
        {icon}
      </span>
      <div className="flex-1">
        <span className="block text-label-sm text-coral">{label}</span>
        <span className="block font-geist text-lg font-medium text-off-black">
          {value}
        </span>
      </div>
      <ArrowRight
        size={16}
        strokeWidth={2.5}
        className="text-coral transition-transform duration-300 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </a>
  );
}
