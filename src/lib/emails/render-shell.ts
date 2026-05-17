import { EMAIL_COLORS, getLogoUrl, type EmailItemT } from "./constants";

type RenderShellArgsT = {
  title?: string;
  items: EmailItemT[];
  footer?: string;
  omitLogo?: boolean;
};

export function renderEmailShell({
  title,
  items,
  footer,
  omitLogo = false,
}: RenderShellArgsT): string {
  const itemsHtml = items.map(renderItem).join("\n");
  const titleHtml = title ? renderTitle(title) : "";
  const logoHtml = omitLogo ? "" : renderLogo();
  const footerHtml = renderBrandFooter(footer);

  return `<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 32px 24px;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 32px;">
      ${titleHtml}
      ${itemsHtml}
      ${logoHtml}
      ${footerHtml}
    </div>
  </body>
</html>`;
}

function renderLogo(): string {
  // alt="" so if the image ever fails, no broken-text label leaks into the
  // recipient's client; the surrounding div collapses cleanly.
  return `<div style="text-align: left; margin-top: 32px;">
  <img src="${getLogoUrl()}" alt="" width="140" height="140" style="display: inline-block; width: 140px; height: 140px;">
</div>`;
}

function renderItem(item: EmailItemT): string {
  if (item.type === "text") {
    const margin = item.marginBottom ?? "16px";
    const weight = item.bold ? "font-weight: bold;" : "";
    // Authoring convention: `\n` in text content renders as an in-paragraph
    // line break. Templates pass natural newlines; the renderer maps them.
    const content = item.content.replace(/\n/g, "<br>");
    return `<p style="color: ${EMAIL_COLORS.text}; font-size: 16px; line-height: 1.6; margin: 0 0 ${margin} 0; ${weight}">${content}</p>`;
  }

  if (item.type === "button") {
    return `<p style="margin: 32px 0; text-align: center;">
  <a href="${item.url}" style="background-color: ${EMAIL_COLORS.coral}; color: ${EMAIL_COLORS.textOnDark}; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: 16px; letter-spacing: 0.02em;">${item.label}</a>
</p>`;
  }

  return item.html;
}

function renderTitle(title: string): string {
  return `<h1 style="color: ${EMAIL_COLORS.text}; font-size: 26px; line-height: 1.2; margin: 0 0 24px 0; text-align: center; letter-spacing: -0.01em;">${title}</h1>`;
}

function renderBrandFooter(extra?: string): string {
  const extraHtml = extra
    ? `<p style="color: ${EMAIL_COLORS.muted}; font-size: 14px; text-align: center; margin: 32px 0 8px 0;">${extra}</p>`
    : "";
  const topMargin = extra ? "0" : "32px";
  const brandHtml = `<p style="color: ${EMAIL_COLORS.muted}; font-size: 14px; line-height: 1.6; text-align: center; margin: ${topMargin} 0 0 0;">Marta Leśniewska<br>Chaos Kitchen</p>`;
  return `${extraHtml}${brandHtml}`;
}
