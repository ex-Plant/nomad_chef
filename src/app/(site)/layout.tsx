import type { Metadata, Viewport } from "next";
import { DebugWrapper } from "@/components/debug-tools/debug-wrapper";
import { MotionProvider } from "@/components/ui/motion-provider";
import { ENV } from "@/config/env";
import { getSite } from "@/lib/get-site";
import { fontVariables } from "./fonts";
import "../globals.css";

const DEFAULT_TITLE =
  "Chaos Kitchen — kucharka na prywatne kolacje i retreaty | Marta Leśniewska";
const DEFAULT_DESCRIPTION =
  "Prywatne kolacje, garden party i kulinarne retreaty w Polsce i za granicą. Marta Leśniewska gotuje tam, gdzie jej potrzebujesz — od kameralnej kuchni po wyjazdy.";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = site.siteTitle || DEFAULT_TITLE;
  const description = site.siteDescription || DEFAULT_DESCRIPTION;
  return {
    metadataBase: new URL(ENV.SITE_URL),
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
      className={`${fontVariables} overscroll-none scroll-smooth antialiased`}
    >
      <body className="relative flex min-h-lvh flex-col overflow-x-clip bg-black">
        <MotionProvider>
          <DebugWrapper>{children}</DebugWrapper>
        </MotionProvider>
      </body>
    </html>
  );
}
