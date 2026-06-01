import { cookies } from "next/headers";
import { getSite } from "@/lib/cms/get-site";
import { HomepageShell } from "@/components/homepage-shell";
import { getProductBySlug } from "@/lib/cms/get-product";

export default async function HomePage() {
  const cookieStore = await cookies();
  const [site, digital] = await Promise.all([
    getSite("pl"),
    getProductBySlug("cookbook-digital"),
  ]);

  // Pre-launch guard: only logged-in (CMS) users see the buy CTA, so the
  // public can't trigger a real purchase by accident before launch.
  const isLoggedIn = Boolean(cookieStore.get("payload-token"));

  return (
    <HomepageShell
      site={site}
      digitalProduct={digital}
      isLoggedIn={isLoggedIn}
    />
  );
}
