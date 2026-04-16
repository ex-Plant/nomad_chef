"use client";

import { EyebrowTag } from "@/components/home/eyebrow-tag";
import { ScatterText } from "@/components/home/scatter-text";
import { Button } from "@/components/home/button";
import { ContactLink } from "@/components/home/contact-link";
import { SECTION_IDS } from "@/components/home/section-ids";
import { Section } from "@/components/home/section";
import { Starburst } from "@/components/home/starburst";
import { FadeUp } from "@/components/home/fade-up";
import { SectionContent } from "@/components/home/section-content";

export function Contact() {
  return (
    <Section id={SECTION_IDS.contact} className="bg-yellow min-h-fit">
      <Starburst
        color="pink"
        rotate
        className="absolute -right-8 bottom-12 z-0 w-36 md:-right-6 md:bottom-16 md:w-44 lg:w-52"
      />

      <SectionContent className="relative z-1 ">
        {/* Eyebrow */}
        <EyebrowTag color="coral" withLine>
          Kontakt
        </EyebrowTag>

        {/* Asymmetric split: massive heading left, form/links right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Left — large heading block */}
          <div className="md:col-span-7 flex flex-col justify-center ">
            <ScatterText
              className="text-heading-lg xl:text-heading-xl"
              lines={[
                { text: "Jesli czujesz,", className: "text-coral" },
                { text: "ze to cos", className: "text-coral" },
                { text: "dla Ciebie", className: "text-off-black" },
              ]}
            />

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
            <FadeUp delay={0.3} className="">
              <ContactLink
                href="mailto:hello@nomadchef.pl"
                icon="mail"
                label="Email"
                value="hello@nomadchef.pl"
              />
              <ContactLink
                href="https://instagram.com/mart_lesniewska"
                icon="instagram"
                label="Instagram"
                value="@mart_lesniewska"
                external
              />
            </FadeUp>

            {/* Message form */}
            <FadeUp delay={0.4} className="mt-8">
              <form className="">
                <textarea
                  placeholder="Twoja wiadomosc..."
                  rows={4}
                  className="w-full resize-none  rounded-lg border border-coral bg-yellow px-5 py-4 font-serif text-base text-off-black field-sizing-content transition-colors duration-300 ease-brand placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral min-h-32"
                />
                <Button
                  className={`mt-4`}
                  size="compact"
                  asChild
                  variant="coral-solid"
                >
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
          className=" flex items-center justify-between border-t border-coral pt-8  mt-16"
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
