type SectionContentPropsT = {
  readonly children: React.ReactNode;
  readonly className?: string;
};

export function SectionContent({
  children,
  className = "",
}: SectionContentPropsT) {
  return (
    <div className={` fest-container max-w-[1440px]  ${className}`}>
      {children}
    </div>
  );
}
