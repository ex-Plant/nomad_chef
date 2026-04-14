type ProgressDotsPropsT = {
  readonly total: number;
  readonly active: number;
  readonly onSelect?: (i: number) => void;
};

export function ProgressDots({ total, active, onSelect }: ProgressDotsPropsT) {
  const Tag = onSelect ? "button" : "div";

  return (
    <div className="flex items-center gap-3">
      {Array.from({ length: total }, (_, i) => (
        <Tag
          key={i}
          {...(onSelect && { onClick: () => onSelect(i) })}
          aria-label={onSelect ? `Slide ${i + 1}` : undefined}
          className={`h-3 rounded-full transition-[background-color] duration-500 ${
            i === active
              ? "w-10 bg-yellow"
              : "w-3 bg-white/30 hover:bg-white/50"
          }`}
          style={{ willChange: "background-color" }}
        />
      ))}
    </div>
  );
}
