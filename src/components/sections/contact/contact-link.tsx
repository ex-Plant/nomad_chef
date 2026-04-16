import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { type ComponentProps } from "react";

const ICON_MAP = {
  mail: Mail,
  instagram: InstagramIcon,
  phone: Phone,
  location: MapPin,
} as const;

type ContactLinkIconT = keyof typeof ICON_MAP;

type ContactLinkPropsT = {
  readonly href: string;
  readonly icon: ContactLinkIconT;
  readonly label: string;
  readonly value: string;
  readonly external?: boolean;
};

export function ContactLink({
  href,
  icon,
  label,
  value,
  external,
}: ContactLinkPropsT) {
  const externalProps: ComponentProps<"a"> = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  const Icon = ICON_MAP[icon];

  return (
    <a
      href={href}
      className="group flex items-center gap-4 border-b border-coral  transition-colors duration-300 hover:border-coral py-4"
      {...externalProps}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-coral text-white">
        <Icon size={20} strokeWidth={2.5} aria-hidden="true" />
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
