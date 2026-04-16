import type { Metadata } from "next";
import {
  Instrument_Serif,
  Playfair_Display,
  Outfit,
  Archivo_Black,
  Archivo,
  Geist,
  Bebas_Neue,
} from "next/font/google";
import { DebugWrapper } from "@/components/debug-tools/debug-wrapper";
import { MotionProvider } from "@/components/ui/motion-provider";
import "./globals.css";

/* Design 1 fonts */
const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

/* Shared across multiple designs */
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

/* Design 2, 3, 5 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/* Design 3, 4 */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

/* Ebook headline match — compressed heavy sans */
const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  weight: "400",
});

/* Design 4 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Nomad Chef — Marta Lesniewska",
  description:
    "Gotuję tam, gdzie mnie potrzebujesz — od prywatnych kolacji, przez garden party, po retreaty i wyjazdy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${archivoBlack.variable} ${archivo.variable} ${instrumentSerif.variable} ${geistSans.variable} ${playfair.variable} ${outfit.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-warm-white overflow-x-hidden">
        <MotionProvider>
          <DebugWrapper>{children}</DebugWrapper>
        </MotionProvider>
      </body>
    </html>
  );
}
