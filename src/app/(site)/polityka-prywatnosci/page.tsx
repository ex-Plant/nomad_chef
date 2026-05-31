import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage } from "@/lib/cms/get-legal-page";
import { TextPage } from "@/components/templates/text-page";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { LEGAL_SLUGS } from "@/config/legal";

export const metadata: Metadata = {
  title: "Polityka prywatności — Nomad Chef",
  description:
    "Polityka prywatności Nomad Chef — zasady przetwarzania danych osobowych zgodne z RODO.",
};

export default async function PolitykaPrywatnosciPage() {
  const page = await getLegalPage(LEGAL_SLUGS.privacy);
  if (!page) notFound();

  return (
    <TextPage
      title={page.title as unknown as SerializedEditorState}
      body={page.body as unknown as SerializedEditorState}
    />
  );
}
