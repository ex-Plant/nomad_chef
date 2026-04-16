"use client";

import { Mail } from "lucide-react";
import { InstagramIcon } from "@/components/ui/icons";
import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { Button } from "@/components/home/button";
import { ContactLink } from "@/components/home/contact-link";
import { SECTION_IDS } from "@/components/home/section-ids";
import { Section } from "@/components/home/section";
import { Starburst } from "@/components/home/starburst";
import { FadeUp } from "@/components/home/fade-up";
import { SectionContent } from "@/components/home/section-content";

export function Contact() {
  return (
    <Section id={SECTION_IDS.contact} className="bg-yellow">
      <Starburst
        color="pink"
        rotate
        className="absolute -right-8 bottom-12 z-0 w-36 md:-right-6 md:bottom-16 md:w-44 lg:w-52"
      />

      <SectionContent className="relative z-[1]">
        {/* Eyebrow */}
        <EyebrowTag color="coral" withLine>
          Kontakt
        </EyebrowTag>

        {/* Asymmetric split: massive heading left, form/links right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Left — large heading block */}
          <div className="md:col-span-7 ">
            <FadeUp
              as="h2"
              delay={0.1}
              className="text-heading-lg xl:text-heading-xl  text-coral"
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
          <div className="flex flex-col justify-end md:col-span-7 md:col-start-9">
            <FadeUp delay={0.3} className="space-y-6">
              <ContactLink
                href="mailto:hello@nomadchef.pl"
                icon={<Mail size={20} strokeWidth={2.5} aria-hidden="true" />}
                label="Email"
                value="hello@nomadchef.pl"
              />
              <ContactLink
                href="https://instagram.com/mart_lesniewska"
                icon={
                  <InstagramIcon
                    size={20}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                }
                label="Instagram"
                value="@mart_lesniewska"
                external
              />
            </FadeUp>

            {/* Message form */}
            <FadeUp delay={0.4} className="mt-10">
              <form className="space-y-4">
                <textarea
                  placeholder="Twoja wiadomosc..."
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-coral bg-yellow px-5 py-4 font-serif text-base text-off-black transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral"
                />
                <Button asChild variant="coral-solid" withArrow>
                  <a href="mailto:hello@nomadchef.pl">Wyślij wiadomość</a>
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
          <span className="font-geist text-xs text-coral">2025</span>
        </FadeUp>
      </SectionContent>
    </Section>
  );
}
