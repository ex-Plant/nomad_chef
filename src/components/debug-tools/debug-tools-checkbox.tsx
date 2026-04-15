"use client";

type DebugToolsCheckboxPropsT = {
  readonly toggleFunc: () => void;
  readonly currentVal: boolean;
  readonly label: string;
};

export function DebugToolsCheckbox({ toggleFunc, currentVal, label }: DebugToolsCheckboxPropsT) {
  return (
    <label className="flex items-center gap-2 text-xs text-white">
      <input type="checkbox" onChange={toggleFunc} checked={currentVal} />
      <span>{label}</span>
    </label>
  );
}
