import { getSite } from "@/lib/get-site";
import { HomepageShell } from "@/components/homepage-shell";
import { getProductBySlug } from "@/lib/get-product";

export default async function HomePage() {
  const [site, digital] = await Promise.all([
    getSite("pl"),
    getProductBySlug("cookbook-digital"),
  ]);

  return <HomepageShell site={site} digitalProduct={digital} />;
}
