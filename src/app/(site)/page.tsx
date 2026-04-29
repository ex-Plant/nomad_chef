import { getSite } from "@/lib/get-site";
import { HomepageShell } from "@/components/homepage-shell";
import { getProductBySlug } from "@/lib/get-product";
import { CartBuyButton } from "@/components/sections/cart/cart-buy-button";

export default async function HomePage() {
  const [site, digital, physical] = await Promise.all([
    getSite("pl"),
    getProductBySlug("cookbook-digital"),
    getProductBySlug("cookbook-physical"),
  ]);

  return (
    <>
      <HomepageShell site={site} />
      <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2">
        <CartBuyButton
          product={digital}
          label="Kup ebook"
          variant="coral-solid"
          size="compact"
        />
        <CartBuyButton
          product={physical}
          label="Kup książkę"
          variant="blue-solid"
          size="compact"
        />
      </div>
    </>
  );
}
