"use client";

import Link from "next/link";
import { EyebrowTag } from "@/components/shared/eyebrow-tag";
import { ScatterText } from "@/components/shared/scatter-text";
import { ContactLink } from "@/components/sections/contact/contact-link";
import { ContactForm } from "@/components/sections/contact/contact-form";
import { SECTION_IDS } from "@/config/section-ids";
import { LEGAL_SLUGS } from "@/config/legal";
import type { SiteT } from "@/types/site";
import { Section } from "@/components/shared/section";
import { FadeUp } from "@/components/shared/fade-up";
import { SectionContent } from "@/components/shared/section-content";
import { BodyText } from "@/components/shared/body-text";

type ContactPropsT = {
  data: SiteT["contact"];
  legalLinks?: SiteT["legalLinks"];
};

export function Contact({ data, legalLinks }: ContactPropsT) {
  return (
    <Section id={SECTION_IDS.contact} className="bg-yellow min-h-none">
      {/* <Starburst
        color="pink"
        rotate
        variant="logo-c"
        className="absolute -right-8 bottom-12 z-0 w-36 md:-right-6 md:bottom-2 md:w-44 lg:w-52"
      /> */}

      <SectionContent className="relative z-1">
        {/* Eyebrow */}
        <EyebrowTag color="coral" withLine>
          {data.eyebrow}
        </EyebrowTag>

        {/* Asymmetric split: massive heading left, form/links right */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8">
          {/* Left — large heading block */}
          <div className="flex flex-col justify-center leading-loose md:col-span-7">
            <ScatterText
              className="text-heading-lg leading-[95%]"
              lines={data.headingLines}
            />

            <FadeUp
              as="p"
              delay={0.2}
              className="text-subtitle-lg text-coral max-w-md whitespace-pre-line"
            >
              {data.lead}
            </FadeUp>

            {data.description && (
              <BodyText
                delay={0.6}
                className="text-coral mt-4 whitespace-pre-line md:pl-2"
              >
                {data.description}
              </BodyText>
            )}
          </div>

          {/* Right — contact links */}
          <div className="flex flex-col justify-end md:col-span-7 md:col-start-9">
            <FadeUp delay={0.3} className="">
              <ContactLink
                href={data.email.href}
                icon="mail"
                label={data.email.label}
                value={data.email.value}
              />
            </FadeUp>
            <FadeUp delay={0.6} className="">
              <ContactLink
                href={data.instagram.href}
                icon="instagram"
                label={data.instagram.label}
                value={data.instagram.value}
                external
              />
            </FadeUp>

            {/* Message form */}
            <FadeUp delay={0.4} className="mt-8">
              <ContactForm
                messagePlaceholder={data.formPlaceholder}
                submitLabel={data.submit.label}
                legalLinks={legalLinks}
                newsletter={data.newsletter}
              />
            </FadeUp>
          </div>
        </div>

        {/* Footer accent */}
        <FadeUp delay={0.2} amount={0.5} className="text-coral mt-16">
          {/* Brand mark line — divider above (matches original full-strength line) */}
          <div className="text-heading border-coral mt-8 flex items-center justify-between border-t pt-8 text-sm tracking-tight">
            <span>{data.footer}</span>
            <span>{2026}</span>
          </div>
        </FadeUp>
        <div className={`text-coral mt-8`}>
          <p>YOLO Bartosz Antonik</p>
          <p>ul. Terespolska 2/41</p>
          <p>03-813 Warszawa</p>
          <p>505 805 425</p>
          <p>NIP: 9372492352</p>
          <p>REGON: 360096277</p>
          <p className="mt-4">
            <Link
              href={legalLinks?.terms?.href ?? `/${LEGAL_SLUGS.terms}`}
              className="hover:text-off-black underline underline-offset-3"
            >
              {legalLinks?.terms?.label ?? "regulamin sprzedaży"}
            </Link>
          </p>
          <p className="mt-1">
            <Link
              href={legalLinks?.privacy?.href ?? `/${LEGAL_SLUGS.privacy}`}
              className="hover:text-off-black underline underline-offset-3"
            >
              {legalLinks?.privacy?.label ?? "polityka prywatności"}
            </Link>
          </p>
        </div>
      </SectionContent>
    </Section>
  );
}
