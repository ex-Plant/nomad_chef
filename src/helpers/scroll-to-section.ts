export function scrollToSection(
  id: string,
  bahavior: "smooth" | "instant" = "smooth",
) {
  const targetId = id.startsWith("#") ? id.slice(1) : id;
  document.getElementById(targetId)?.scrollIntoView({ behavior: bahavior });
}
