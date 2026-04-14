type SectionContentPropsT = {
  readonly children: React.ReactNode;
  readonly className?: string;
};

export function SectionContent({
  children,
  className = "",
}: SectionContentPropsT) {
  return (
    <div className={`px-6 md:px-12 lg:px-20 ${className}`}>{children}</div>
  );
}
