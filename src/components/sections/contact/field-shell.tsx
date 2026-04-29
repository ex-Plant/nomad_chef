import type { ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

type FieldShellPropsT = {
  field: AnyFieldApi;
  children: ReactNode;
};

export function FieldShell({ field, children }: FieldShellPropsT) {
  const errors = field.state.meta.errors;
  const hasErrors = errors.length > 0;
  const errorId = `${field.name}-error`;
  return (
    <div className="relative h-fit">
      {children}
      {hasErrors && (
        <p id={errorId} role="alert" className="mt-1 px-1 text-sm text-coral">
          {errors
            .map((e) => (typeof e === "string" ? e : (e?.message ?? "")))
            .filter(Boolean)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
