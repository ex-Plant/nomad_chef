export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildGreeting(firstName?: string | null): string {
  if (!firstName) return "Cześć,";
  return `Cześć ${escapeHtml(firstName)},`;
}
