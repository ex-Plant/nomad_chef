type SectionContentPropsT = {
  children: React.ReactNode;
  className?: string;
};

export function SectionContent({
  children,
  className = "",
}: SectionContentPropsT) {
  return (
    <div className={` fest-container max-w-[1440px]   ${className}`}>
      {children}
    </div>
  );
}
