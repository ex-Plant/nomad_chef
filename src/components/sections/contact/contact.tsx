"use client";

import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { ScatterText } from "@/components/shared/scatter-text";
import { Button } from "@/components/shared/button";
import { ContactLink } from "@/components/sections/contact/contact-link";
import { SECTION_IDS } from "@/config/section-ids";
import { CONTENT } from "@/config/content";
import { Section } from "@/components/shared/section";
import { Starburst } from "@/components/shared/starburst";
import { FadeUp } from "@/components/shared/fade-up";
import { SectionContent } from "@/components/shared/section-content";

export function Contact() {
  return (
    <Section id={SECTION_IDS.contact} className="bg-yellow min-h-fit">
      <Starburst
        color="pink"
        rotate
        variant="logo-h"
        className="absolute -right-8 bottom-12 z-0 w-36 md:-right-6 md:bottom-2 md:w-44 lg:w-52"
      />

      <SectionContent className="relative z-1 ">
        {/* Eyebrow */}
        <EyebrowTag color="coral" withLine>
          {CONTENT.contact.eyebrow}
        </EyebrowTag>

        {/* Asymmetric split: massive heading left, form/links right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Left — large heading block */}
          <div className="md:col-span-7 flex flex-col justify-center ">
            <ScatterText
              className="text-heading-lg"
              lines={CONTENT.contact.headingLines}
            />

            <FadeUp
              as="p"
              delay={0.2}
              className="mt- max-w-md text-subtitle-lg text-coral"
            >
              {CONTENT.contact.lead}
            </FadeUp>
          </div>

          {/* Right — contact links */}
          <div className="flex flex-col justify-end md:col-span-7 md:col-start-9">
            <FadeUp delay={0.3} className="">
              <ContactLink
                href={CONTENT.contact.email.href}
                icon="mail"
                label={CONTENT.contact.email.label}
                value={CONTENT.contact.email.value}
              />
              <ContactLink
                href={CONTENT.contact.instagram.href}
                icon="instagram"
                label={CONTENT.contact.instagram.label}
                value={CONTENT.contact.instagram.value}
                external
              />
            </FadeUp>

            {/* Message form */}
            <FadeUp delay={0.4} className="mt-8">
              <form className="">
                <textarea
                  placeholder={CONTENT.contact.formPlaceholder}
                  rows={4}
                  className="w-full resize-none  rounded-lg border border-coral bg-yellow px-5 py-4 font-sans text-base text-off-black field-sizing-content transition-colors duration-300 ease-brand placeholder:text-coral focus:bg-white focus:outline-none focus:ring-2 focus:ring-coral min-h-32"
                />
                <Button
                  className={`mt-4`}
                  size="compact"
                  asChild
                  variant="coral-solid"
                >
                  <a href={CONTENT.contact.submit.href}>{CONTENT.contact.submit.label}</a>
                </Button>
              </form>
            </FadeUp>
          </div>
        </div>

        {/* Footer accent */}
        <FadeUp
          delay={0.2}
          amount={0.5}
          className=" flex items-center justify-between border-t border-coral pt-8  mt-16 text-heading text-sm tracking-tight text-coral"
        >
          <span>{CONTENT.contact.footer}</span>
        </FadeUp>
      </SectionContent>
    </Section>
  );
}
