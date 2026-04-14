"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/home/button";
import heroImg from "@/app/moodboard/gallery/client-selected-8.webp";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <section
      ref={ref}
      id="hero"
      className="relative min-h-[100dvh] overflow-hidden bg-coral"
    >
      {/* Primary background image with parallax zoom */}
      <motion.div
        style={{ scale: imageScale, opacity: imageOpacity }}
        className="absolute inset-0 z-0"
      >
        <Image
          src={heroImg}
          alt="Jajko na niebieskim tle — dramatyczna fotografia kulinarna"
          fill
          className="object-cover"
          sizes="100vw"
          priority
          placeholder="blur"
        />
        <div className="absolute inset-0 bg-coral/40" />
      </motion.div>

      {/* Asymmetric layout: text left, floating image right */}
      <div className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-6 pb-16 md:flex-row md:items-end md:justify-between md:px-12 md:pb-20 lg:px-20">
        {/* Left text block — pushed to bottom-left */}
        <motion.div style={{ y: textY }} className="max-w-2xl">
          <motion.h1
            className="font-[family-name:var(--font-archivo-black)] text-6xl uppercase leading-[0.85] tracking-tighter text-white md:text-8xl lg:text-[10rem]"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            Nomad
            <br />
            Chef
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md font-[family-name:var(--font-instrument)] text-xl text-white/90 italic md:text-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.32, 0.72, 0, 1] }}
          >
            Jedzenie dopasowane do miejsca, ludzi i momentu
          </motion.p>

          <motion.p
            className="mt-3 max-w-lg font-[family-name:var(--font-instrument)] text-base text-white/70 md:text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            Gotuje tam, gdzie mnie potrzebujesz — od prywatnych kolacji, przez
            garden party, po retreaty i wyjazdy w Polsce i za granica.
          </motion.p>

          {/* CTAs */}
          <motion.div
            className="mt-8 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.4, ease: [0.32, 0.72, 0, 1] }}
          >
            <Button href="#uslugi" variant="yellow-solid">
              Zobacz oferte
            </Button>
            <Button href="#kontakt" variant="coral-solid">
              Napisz do mnie
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
