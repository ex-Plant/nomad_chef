import { getSite } from "@/lib/get-site";
import { HomepageShell } from "@/components/homepage-shell";

export default async function HomePage() {
  const site = await getSite("pl");

  return <HomepageShell site={site} />;
}
