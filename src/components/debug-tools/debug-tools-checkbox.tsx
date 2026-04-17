"use client";

type DebugToolsCheckboxPropsT = {
  toggleFunc: () => void;
  currentVal: boolean;
  label: string;
};

export function DebugToolsCheckbox({ toggleFunc, currentVal, label }: DebugToolsCheckboxPropsT) {
  return (
    <label className="flex items-center gap-2 text-xs text-white">
      <input type="checkbox" onChange={toggleFunc} checked={currentVal} />
      <span>{label}</span>
    </label>
  );
}
