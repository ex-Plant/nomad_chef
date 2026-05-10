import type { ReactNode } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { FormError } from "./form-error";

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
        <FormError id={errorId}>
          {errors
            .map((e) => (typeof e === "string" ? e : (e?.message ?? "")))
            .filter(Boolean)
            .join(", ")}
        </FormError>
      )}
    </div>
  );
}
