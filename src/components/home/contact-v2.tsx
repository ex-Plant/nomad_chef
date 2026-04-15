'use client';

import { Mail } from 'lucide-react';
import { InstagramIcon } from '@/components/ui/icons';
import { EyebrowTag } from '@/components/home/eyebrow-tag';
import { LinkButton } from '@/components/home/button';
import { ContactLink } from '@/components/home/contact-link';
import { SECTION_IDS } from '@/components/home/section-ids';
import { RotatingStarburst } from '@/components/home/rotating-starburst';
import { FadeUp } from '@/components/home/fade-up';
import { SectionContent } from '@/components/home/section-content';

export function ContactV2() {
  return (
    <section id={`${SECTION_IDS.contact}-v2`} className="relative overflow-hidden bg-yellow py-24 md:py-32 lg:py-40">
      <RotatingStarburst
        color="pink"
        className="absolute -right-8 bottom-12 z-0 w-36 md:-right-6 md:bottom-16 md:w-44 lg:w-52"
      />

      <SectionContent className="relative z-[1]">
        {/* Eyebrow */}
        <EyebrowTag color="coral" withLine>Kontakt</EyebrowTag>

        {/* Portfolio-style: stack until lg, then 2-col grid with large gap */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-20 xl:gap-40">
          {/* Left — large heading block */}
          <div className="lg:py-10">
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

          {/* Right — contact links + form, vertically centered */}
          <div className="mt-12 flex flex-col justify-center lg:mt-0 lg:py-10">
            <FadeUp delay={0.3} className="space-y-6">
              <ContactLink
                href="mailto:hello@nomadchef.pl"
                icon={<Mail size={20} strokeWidth={2.5} aria-hidden="true" />}
                label="Email"
                value="hello@nomadchef.pl"
              />
              <ContactLink
                href="https://instagram.com/mart_lesniewska"
                icon={<InstagramIcon size={20} strokeWidth={2.5} aria-hidden="true" />}
                label="Instagram"
                value="@mart_lesniewska"
                external
              />
            </FadeUp>

            {/* Message form — portfolio-style border-bottom fields */}
            <FadeUp delay={0.4} className="mt-10">
              <form className="space-y-0">
                <textarea
                  placeholder="Twoja wiadomosc..."
                  rows={4}
                  className="w-full resize-none border-b border-coral bg-transparent px-0 py-4 font-serif text-base text-off-black transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-coral/60 focus:border-off-black focus:outline-none"
                />
                <div className="pt-4">
                  <LinkButton href="mailto:hello@nomadchef.pl" variant="coral-solid">
                    Wyślij wiadomość
                  </LinkButton>
                </div>
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
