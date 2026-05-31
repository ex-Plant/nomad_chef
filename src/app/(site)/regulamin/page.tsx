import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLegalPage } from "@/lib/cms/get-legal-page";
import { TextPage } from "@/components/templates/text-page";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { LEGAL_SLUGS } from "@/config/legal";

export const metadata: Metadata = {
  title: "Regulamin sprzedaży — Nomad Chef",
  description:
    "Regulamin sprzedaży produktów Nomad Chef — warunki płatności, dostawy, reklamacji i odstąpienia od umowy.",
};

export default async function RegulaminPage() {
  const page = await getLegalPage(LEGAL_SLUGS.terms);
  if (!page) notFound();

  return (
    <TextPage
      title={page.title as unknown as SerializedEditorState}
      body={page.body as unknown as SerializedEditorState}
    />
  );
}
