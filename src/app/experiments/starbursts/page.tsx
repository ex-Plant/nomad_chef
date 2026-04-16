import { Starburst } from "@/components/shared/starburst";

const VARIANTS = [
  "organic",
  "v1-a",
  "v1-b",
  "logo-a",
  "logo-b",
  "logo-c",
  "logo-d",
  "logo-e",
  "logo-f",
  "logo-g",
  "logo-h",
] as const;

export default function StarburstShowcase() {
  return (
    <div className="min-h-screen bg-warm-white p-12">
      <h1 className="mb-12 text-3xl font-bold text-off-black">
        Starburst Variants
      </h1>
      <div className="grid grid-cols-4 gap-8">
        {VARIANTS.map((variant) => (
          <div key={variant} className="flex flex-col items-center gap-4">
            <p className="font-mono text-sm text-off-black">{variant}</p>
            <div className="flex gap-4">
              <div className="relative h-48 w-48">
                <Starburst variant={variant} color="blue" className="w-48" />
              </div>
              <div className="relative h-48 w-48">
                <Starburst variant={variant} color="coral" className="w-48" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
