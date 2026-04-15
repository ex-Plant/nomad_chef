'use client';

import { EnvelopeSimple, InstagramLogo, ArrowRight } from '@phosphor-icons/react';
import { EyebrowTag } from '@/components/home/eyebrow-tag';
import { Button } from '@/components/home/button';
import { SECTION_IDS } from '@/components/home/section-ids';
import { RotatingStarburst } from '@/components/home/rotating-starburst';
import { FadeUp } from '@/components/home/fade-up';
import { SectionContent } from '@/components/home/section-content';

export function Contact() {
  return (
    <section id={SECTION_IDS.contact} className="relative overflow-hidden bg-yellow py-24 md:py-32 lg:py-40">
      <RotatingStarburst
        color="pink"
        className="absolute -right-8 bottom-12 z-0 w-36 md:-right-6 md:bottom-16 md:w-44 lg:w-52"
      />

      <SectionContent className="relative z-[1]">
        {/* Eyebrow */}
        <EyebrowTag color="coral" withLine>Kontakt</EyebrowTag>

        {/* Asymmetric split: massive heading left, form/links right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Left — large heading block */}
          <div className="md:col-span-7">
            <FadeUp
              as="h2"
              delay={0.1}
              className="text-heading-xl text-coral"
            >
              Jesli czujesz,
              <br />
              ze to cos
              <br />
              <span className="text-off-black">dla Ciebie</span>
            </FadeUp>

            <FadeUp
              as="p"
              delay={0.2}
              className="mt-6 max-w-md text-subtitle-lg text-coral"
            >
              — napisz.
            </FadeUp>
          </div>

          {/* Right — contact links */}
          <div className="flex flex-col justify-end md:col-span-4 md:col-start-9">
            <FadeUp delay={0.3} className="space-y-6">
              {/* Email CTA */}
              <a
                href="mailto:hello@nomadchef.pl"
                className="group flex items-center gap-4 border-b border-coral pb-6 transition-colors duration-300 hover:border-coral"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral text-white">
                  <EnvelopeSimple size={20} weight="bold" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <span className="block text-label-sm text-coral">
                    Email
                  </span>
                  <span className="block font-geist text-lg font-medium text-off-black">
                    hello@nomadchef.pl
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="text-coral transition-transform duration-300 group-hover:translate-x-1 group-hover:text-coral"
                  aria-hidden="true"
                />
              </a>

              {/* Instagram CTA */}
              <a
                href="https://instagram.com/mart_lesniewska"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 border-b border-coral pb-6 transition-colors duration-300 hover:border-coral"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-coral text-white">
                  <InstagramLogo size={20} weight="bold" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <span className="block text-label-sm text-coral">
                    Instagram
                  </span>
                  <span className="block font-geist text-lg font-medium text-off-black">
                    @mart_lesniewska
                  </span>
                </div>
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="text-coral transition-transform duration-300 group-hover:translate-x-1 group-hover:text-coral"
                  aria-hidden="true"
                />
              </a>
            </FadeUp>

            {/* Message form */}
            <FadeUp delay={0.4} className="mt-10">
              <form className="space-y-4">
                <textarea
                  placeholder="Twoja wiadomosc..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-coral bg-yellow px-5 py-4 font-serif text-base text-off-black transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral"
                />
                <Button href="mailto:hello@nomadchef.pl" variant="coral-solid">
                  Wyślij wiadomość
                </Button>
              </form>
            </FadeUp>
          </div>
        </div>

        {/* Footer accent */}
        <FadeUp
          delay={0.2}
          amount={0.5}
          className="mt-24 flex items-center justify-between border-t border-coral pt-8"
        >
          <span className="text-heading text-sm tracking-tight text-coral">
            Nomad Chef
          </span>
          <span className="font-geist text-xs text-coral">
            2025
          </span>
        </FadeUp>
      </SectionContent>
    </section>
  );
}
