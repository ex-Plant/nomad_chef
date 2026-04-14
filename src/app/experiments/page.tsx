import Link from "next/link";

const experiments = [
  { href: "/", label: "Home (design-8)" },
  { href: "/buttons", label: "Buttons" },
  { href: "/ebook-swiper", label: "Ebook Swiper" },
];

export default function ExperimentsPage() {
  return (
    <div className="min-h-screen bg-[#1A1614] px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 font-sans text-4xl font-bold uppercase tracking-tight text-[#F5EEE5]">
          Experiments
        </h1>
        <p className="mb-10 text-sm text-[#F5EEE5]/50">
          {experiments.length} pages
        </p>
        <ul className="space-y-1">
          {experiments.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center justify-between rounded-lg px-4 py-3 text-[#F5EEE5] transition-colors hover:bg-[#F5EEE5]/10"
              >
                <span className="font-medium">{label}</span>
                <span className="font-mono text-xs text-[#F5EEE5]/40">
                  {href}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
