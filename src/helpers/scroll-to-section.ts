export function scrollToSection(id: string) {
  const targetId = id.startsWith("#") ? id.slice(1) : id;
  document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
}
