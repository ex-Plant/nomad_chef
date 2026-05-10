import { RichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type TextPagePropsT = {
  title: SerializedEditorState;
  body: SerializedEditorState;
};

export function TextPage({ title, body }: TextPagePropsT) {
  return (
    <main className="min-h-lvh bg-warm-white px-6 py-24 md:px-12 md:py-32">
      <article className="mx-auto flex max-w-3xl flex-col gap-10">
        <header className="font-display text-4xl uppercase leading-[0.95] text-electric-blue md:text-6xl [&_h1]:contents [&_h2]:contents [&_h3]:contents [&_p]:contents">
          <RichText data={title} />
        </header>
        <div className="font-sans text-base leading-relaxed text-off-black [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:uppercase [&_h2]:text-electric-blue [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:uppercase [&_h3]:text-electric-blue [&_p]:mb-4 [&_a]:underline [&_a]:underline-offset-2 [&_a]:text-coral [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-semibold">
          <RichText data={body} />
        </div>
      </article>
    </main>
  );
}
