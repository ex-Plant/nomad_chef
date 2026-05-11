import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Playfair_Display,
  Archivo_Black,
  Geist,
} from "next/font/google";
import { DebugWrapper } from "@/components/debug-tools/debug-wrapper";
import { MotionProvider } from "@/components/ui/motion-provider";
import { getSite } from "@/lib/get-site";
import "../globals.css";

const DEFAULT_TITLE =
  "Chaos Kitchen — kucharka na prywatne kolacje i retreaty | Marta Leśniewska";
const DEFAULT_DESCRIPTION =
  "Prywatne kolacje, garden party i kulinarne retreaty w Polsce i za granicą. Marta Leśniewska gotuje tam, gdzie jej potrzebujesz — od kameralnej kuchni po wyjazdy.";

const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = site.siteTitle || DEFAULT_TITLE;
  const description = site.siteDescription || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "pl_PL",
      images: [{ url: "/og.jpg", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.jpg"],
    },
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
      className={`${archivoBlack.variable} ${instrumentSerif.variable} ${geistSans.variable} ${playfair.variable} overscroll-none scroll-smooth antialiased`}
    >
      <body className="relative flex min-h-lvh flex-col overflow-x-clip bg-black">
        <MotionProvider>
          <DebugWrapper>{children}</DebugWrapper>
        </MotionProvider>
      </body>
    </html>
  );
}
