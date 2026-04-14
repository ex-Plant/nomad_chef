import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/dist/ssr';

function Section({ title, bg, children }: { title: string; bg: string; children: React.ReactNode }) {
  return (
    <div className={`${bg} px-8 py-20 md:px-16`}>
      <p className="mb-12 font-[family-name:var(--font-geist-sans)] text-[10px] uppercase tracking-[0.3em] text-white/30">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

function Card({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="font-[family-name:var(--font-geist-sans)] text-[10px] uppercase tracking-[0.2em] text-white/20">
        {String(n).padStart(2, '0')}
      </span>
      {children}
    </div>
  );
}

export default function ButtonsPage() {
  return (
    <div className="min-h-[100dvh]">

      {/* ── ON CORAL ── */}
      <Section title="On Coral — Services" bg="bg-coral">

        <Card n={1}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.97] active:translate-y-[1px]">
            Zobacz oferte
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-off-black/5 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={12} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={2}>
          <a href="#" className="inline-flex items-center gap-3 rounded-full border border-white/60 px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white hover:bg-white/5 active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <ArrowRight size={12} weight="bold" className="opacity-60" />
          </a>
        </Card>

        <Card n={3}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-yellow px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black shadow-[0_2px_8px_rgba(229,245,93,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(229,245,93,0.4)] active:scale-[0.97] active:translate-y-[1px]">
            Zobacz oferte
            <ArrowRight size={12} weight="bold" />
          </a>
        </Card>

        <Card n={4}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-electric-blue px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(25,62,244,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(25,62,244,0.4)] active:scale-[0.97] active:translate-y-[1px]">
            Zobacz oferte
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={12} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={5}>
          <a href="#" className="group inline-flex items-center gap-4 rounded-full bg-off-black px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-off-black/90 active:scale-[0.97] active:translate-y-[1px]">
            Zapytaj
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coral transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={11} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={6}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-white px-3 py-2.5 pr-8 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.97] active:translate-y-[1px]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white">
              <ArrowRight size={14} weight="bold" />
            </span>
            Zobacz oferte
          </a>
        </Card>

        <Card n={7}>
          <a href="#" className="inline-flex items-center gap-3 rounded-full border border-yellow/70 px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-yellow transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-yellow hover:bg-yellow/5 active:scale-[0.97] active:translate-y-[1px]">
            Zapytaj
            <ArrowRight size={12} weight="bold" className="opacity-70" />
          </a>
        </Card>

        <Card n={8}>
          <a href="#" className="group inline-flex items-center gap-4 font-[family-name:var(--font-instrument)] text-xl italic text-white transition-all duration-300 hover:gap-5">
            Zobacz oferte
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-all duration-300 group-hover:border-white group-hover:bg-white/10">
              <ArrowUpRight size={16} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={9}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-yellow px-4 py-2.5 pl-8 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] active:translate-y-[1px]">
            Zapytaj
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-off-black text-yellow transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={13} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={10}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full border-2 border-white px-8 py-3.5 font-[family-name:var(--font-archivo-black)] text-[13px] uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white hover:text-coral active:scale-[0.97] active:translate-y-[1px]">
            Zobacz oferte
            <ArrowRight size={13} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Card>

      </Section>

      {/* ── ON BLUE ── */}
      <Section title="On Blue — Ebook" bg="bg-electric-blue">

        <Card n={11}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-coral px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(222,100,69,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(222,100,69,0.4)] active:scale-[0.97] active:translate-y-[1px]">
            Kup ebook
            <ArrowRight size={12} weight="bold" />
          </a>
        </Card>

        <Card n={12}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-yellow px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black shadow-[0_2px_8px_rgba(229,245,93,0.25)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(229,245,93,0.35)] active:scale-[0.97] active:translate-y-[1px]">
            Kup ebook
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-off-black/10 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={11} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={13}>
          <a href="#" className="inline-flex items-center gap-3 rounded-full border border-coral/70 px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-coral transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-coral hover:bg-coral/5 active:scale-[0.97] active:translate-y-[1px]">
            Kup ebook
            <ArrowRight size={12} weight="bold" className="opacity-70" />
          </a>
        </Card>

        <Card n={14}>
          <a href="#" className="inline-flex items-center gap-3 rounded-full border border-yellow/60 px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-yellow transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-yellow hover:bg-yellow/5 active:scale-[0.97] active:translate-y-[1px]">
            Kup ebook
            <ArrowRight size={12} weight="bold" className="opacity-60" />
          </a>
        </Card>

        <Card n={15}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-electric-blue shadow-[0_2px_8px_rgba(255,255,255,0.15)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_16px_rgba(255,255,255,0.2)] active:scale-[0.97] active:translate-y-[1px]">
            Kup ebook
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-electric-blue/10 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={11} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={16}>
          <a href="#" className="group inline-flex items-center gap-4 rounded-full bg-coral px-4 py-2.5 pr-8 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(222,100,69,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(222,100,69,0.4)] active:scale-[0.97] active:translate-y-[1px]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-coral">
              <ArrowRight size={14} weight="bold" />
            </span>
            Kup ebook
          </a>
        </Card>

        <Card n={17}>
          <a href="#" className="group inline-flex items-center gap-4 font-[family-name:var(--font-instrument)] text-xl italic text-coral transition-all duration-300 hover:gap-5">
            Kup ebook
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-coral/40 transition-all duration-300 group-hover:border-coral group-hover:bg-coral/10">
              <ArrowUpRight size={16} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={18}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full border-2 border-coral px-8 py-3.5 font-[family-name:var(--font-archivo-black)] text-[13px] uppercase tracking-wide text-coral transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-coral hover:text-white active:scale-[0.97] active:translate-y-[1px]">
            Kup ebook
            <ArrowRight size={13} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Card>

        <Card n={19}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-yellow px-4 py-2.5 pl-8 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] active:translate-y-[1px]">
            Kup ebook
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-electric-blue text-white transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={13} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={20}>
          <a href="#" className="group inline-flex items-center gap-4 font-[family-name:var(--font-instrument)] text-xl italic text-yellow transition-all duration-300 hover:gap-5">
            Kup ebook
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-yellow/40 transition-all duration-300 group-hover:border-yellow group-hover:bg-yellow/10">
              <ArrowUpRight size={16} weight="bold" />
            </span>
          </a>
        </Card>

      </Section>

      {/* ── ON PINK ── */}
      <Section title="On Pink — Footer / Contact" bg="bg-pink">

        <Card n={21}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-off-black/5 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={12} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={22}>
          <a href="#" className="inline-flex items-center gap-3 rounded-full border border-white/60 px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white hover:bg-white/5 active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <ArrowRight size={12} weight="bold" className="opacity-60" />
          </a>
        </Card>

        <Card n={23}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-coral px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(222,100,69,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(222,100,69,0.4)] active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <ArrowRight size={12} weight="bold" />
          </a>
        </Card>

        <Card n={24}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-electric-blue px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(25,62,244,0.3)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(25,62,244,0.4)] active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={12} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={25}>
          <a href="#" className="group inline-flex items-center gap-4 rounded-full bg-off-black px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-off-black/90 active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={11} weight="bold" className="text-off-black" />
            </span>
          </a>
        </Card>

        <Card n={26}>
          <a href="#" className="inline-flex items-center gap-3 rounded-full border border-coral/70 px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-coral transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-coral hover:bg-coral/5 active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <ArrowRight size={12} weight="bold" className="opacity-70" />
          </a>
        </Card>

        <Card n={27}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-yellow px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black shadow-[0_2px_8px_rgba(229,245,93,0.25)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_20px_rgba(229,245,93,0.35)] active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-off-black/10 transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight size={11} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={28}>
          <a href="#" className="group inline-flex items-center gap-4 font-[family-name:var(--font-instrument)] text-xl italic text-white transition-all duration-300 hover:gap-5">
            Napisz do mnie
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-all duration-300 group-hover:border-white group-hover:bg-white/10">
              <ArrowUpRight size={16} weight="bold" />
            </span>
          </a>
        </Card>

        <Card n={29}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full border-2 border-white px-8 py-3.5 font-[family-name:var(--font-archivo-black)] text-[13px] uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white hover:text-pink active:scale-[0.97] active:translate-y-[1px]">
            Napisz do mnie
            <ArrowRight size={13} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </Card>

        <Card n={30}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-white px-4 py-2.5 pr-8 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] active:scale-[0.97] active:translate-y-[1px]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white">
              <ArrowRight size={14} weight="bold" />
            </span>
            Napisz do mnie
          </a>
        </Card>

      </Section>

      {/* ── ON WARM WHITE ── */}
      <Section title="On Warm White — General" bg="bg-warm-white">

        <Card n={0}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-coral px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(222,100,69,0.2)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_16px_rgba(222,100,69,0.3)] active:scale-[0.97] active:translate-y-[1px]">
            Solid coral
            <ArrowRight size={12} weight="bold" />
          </a>
        </Card>

        <Card n={0}>
          <a href="#" className="group inline-flex items-center gap-3 rounded-full bg-electric-blue px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(25,62,244,0.2)] transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:shadow-[0_4px_16px_rgba(25,62,244,0.3)] active:scale-[0.97] active:translate-y-[1px]">
            Solid blue
            <ArrowRight size={12} weight="bold" />
          </a>
        </Card>

        <Card n={0}>
          <a href="#" className="inline-flex items-center gap-3 rounded-full border border-off-black/20 px-8 py-4 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-off-black transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-off-black/40 hover:bg-off-black/[0.02] active:scale-[0.97] active:translate-y-[1px]">
            Outline dark
            <ArrowRight size={12} weight="bold" className="opacity-40" />
          </a>
        </Card>

        <Card n={0}>
          <a href="#" className="group inline-flex items-center gap-4 rounded-full bg-off-black px-4 py-2.5 pr-8 font-[family-name:var(--font-geist-sans)] text-[13px] font-medium uppercase tracking-wide text-white transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] active:translate-y-[1px]">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white">
              <ArrowRight size={14} weight="bold" />
            </span>
            Solid dark
          </a>
        </Card>

      </Section>

    </div>
  );
}
