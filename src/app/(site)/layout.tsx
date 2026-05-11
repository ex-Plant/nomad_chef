import type { Metadata, Viewport } from "next";
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
import { getSite } from "@/lib/get-site";
import "../globals.css";

const DEFAULT_TITLE = "Chaos Kitchen  — Marta Lesniewska";
const DEFAULT_DESCRIPTION =
  "Gotuję tam, gdzie mnie potrzebujesz — od prywatnych kolacji, przez garden party, po retreaty i wyjazdy.";

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

/* Ebook headline match - compressed heavy sans */
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

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: site.siteTitle || DEFAULT_TITLE,
    description: site.siteDescription || DEFAULT_DESCRIPTION,
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${archivoBlack.variable} ${archivo.variable} ${instrumentSerif.variable} ${geistSans.variable} ${playfair.variable} ${outfit.variable} ${bebasNeue.variable} overscroll-none scroll-smooth antialiased`}
    >
      <body className="relative flex min-h-lvh flex-col overflow-x-clip bg-black">
        <MotionProvider>
          <DebugWrapper>{children}</DebugWrapper>
        </MotionProvider>
      </body>
    </html>
  );
}
