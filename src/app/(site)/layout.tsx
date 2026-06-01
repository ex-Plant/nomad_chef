import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { DebugWrapper } from "@/components/debug-tools/debug-wrapper";
import { MotionProvider } from "@/components/ui/motion-provider";
import { ENV } from "@/config/env";
import { getSite } from "@/lib/cms/get-site";
import { fontVariables } from "./fonts";
import "../globals.css";

const DEFAULT_TITLE =
  "Chaos Kitchen — Marta Leśniewska Twój osobisty chef kuchni";
const DEFAULT_DESCRIPTION =
  "Prywatne kolacje, garden party i kulinarne retreaty w Polsce i za granicą. Gotuję tam, gdzie jej potrzebujesz — od kameralnej kuchni po wyjazdy.";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  if (!cookieStore.get("payload-token")) redirect("/admin");

  return (
    <html
      lang="pl"
      className={`${fontVariables} overscroll-none scroll-smooth antialiased`}
    >
      <body className="relative flex min-h-lvh flex-col overflow-x-clip bg-black">
        <MotionProvider>
          <DebugWrapper>{children}</DebugWrapper>
        </MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
