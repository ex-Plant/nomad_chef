import {
  EMAIL_COLORS,
  EMAIL_LAYOUT,
  getLogoUrl,
  type EmailItemT,
} from "./constants";

type RenderShellArgsT = {
  title?: string;
  items: EmailItemT[];
  omitLogo?: boolean;
  omitFooter?: boolean;
};

export function renderEmailShell({
  title,
  items,
  omitLogo = false,
  omitFooter = false,
}: RenderShellArgsT): string {
  const itemsHtml = items.map(renderItem).join("\n");
  const titleHtml = title ? renderTitle(title) : "";
  const logoHtml = omitLogo ? "" : renderLogo();
  const footerHtml = omitFooter ? "" : renderBrandFooter();

  return `<!DOCTYPE html>
<html lang="pl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 0 auto; padding: 40px 24px 24px;">
      ${titleHtml}
      ${itemsHtml}
      ${footerHtml}
      ${logoHtml}
    </div>
  </body>
</html>`;
}

function renderLogo(): string {
  // alt="" so if the image ever fails, no broken-text label leaks into the
  // recipient's client; the surrounding div collapses cleanly.
  // No top margin — the gap above the logo is owned by the footer's
  // bottom margin (EMAIL_LAYOUT.logoGap).
  return `<div style="text-align: left; margin-top: 0;">
  <img src="${getLogoUrl()}" alt="" width="140" height="140" style="display: inline-block; width: 140px; height: 140px;">
</div>`;
}

function renderItem(item: EmailItemT): string {
  if (item.type === "text") {
    const margin = item.marginBottom ?? EMAIL_LAYOUT.gap;
    const weight = item.bold ? "font-weight: bold;" : "";
    // Authoring convention: `\n` in text content renders as an in-paragraph
    // line break. Templates pass natural newlines; the renderer maps them.
    const content = item.content.replace(/\n/g, "<br>");
    return `<p style="color: ${EMAIL_COLORS.muted}; font-size: ${EMAIL_LAYOUT.fontSize}; line-height: 1.6; margin: 0 0 ${margin} 0; ${weight}">${content}</p>`;
  }

  if (item.type === "button") {
    return `<p style="margin: ${EMAIL_LAYOUT.buttonGap} 0; text-align: left;">
  <a href="${item.url}" style="background-color: ${EMAIL_COLORS.coral}; color: ${EMAIL_COLORS.textOnDark}; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block; font-size: ${EMAIL_LAYOUT.fontSize}; letter-spacing: 0.02em;">${item.label}</a>
</p>`;
  }

  return item.html;
}

function renderTitle(title: string): string {
  return `<h1 style="color: ${EMAIL_COLORS.muted}; font-size: ${EMAIL_LAYOUT.fontSize}; line-height: 1.6; margin: 0 0 ${EMAIL_LAYOUT.gap} 0; text-align: center; letter-spacing: -0.01em;">${title}</h1>`;
}

function renderBrandFooter(): string {
  return `<p style="color: ${EMAIL_COLORS.muted}; font-size: ${EMAIL_LAYOUT.fontSize}; line-height: 1.6; text-align: left; margin: 0 0 ${EMAIL_LAYOUT.logoGap} 0;">Marta Leśniewska<br>Chaos Kitchen</p>`;
}
