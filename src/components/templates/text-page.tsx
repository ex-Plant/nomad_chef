import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type TextPagePropsT = {
  title: SerializedEditorState;
  body: SerializedEditorState;
};

export function TextPage({ title, body }: TextPagePropsT) {
  return (
    <main className="fest-container mx-auto min-h-lvh bg-white py-12 md:px-12">
      <article className="flex max-w-3xl flex-col gap-10 pr-6">
        <header className="font-display text-coral text-4xl leading-[0.95] uppercase md:text-6xl [&_h1]:contents [&_h2]:contents [&_h3]:contents [&_p]:contents">
          <RichText data={title} className={`bg-white box-decoration-clone`} />
        </header>
        <div className="text-off-black [&_h2]:font-display [&_h3]:font-display font-sans text-base leading-relaxed [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:uppercase [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:uppercase [&_li]:mb-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_strong]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6">
          <RichText data={body} />
        </div>
      </article>
    </main>
  );
}
