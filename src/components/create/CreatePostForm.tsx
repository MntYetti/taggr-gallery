import { ImagePlus, Send } from "lucide-react";
import { useState } from "react";
import { taggrClient } from "../../lib/taggr/taggrClient";
import type { CreatePostInput, TaggrPost, TaggrRealm } from "../../lib/taggr/taggrTypes";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PostPreview } from "./PostPreview";

export function CreatePostForm({
  realms,
  defaultRealm,
  isAuthenticated,
  onCreated,
}: {
  realms: TaggrRealm[];
  defaultRealm?: string;
  isAuthenticated: boolean;
  onCreated: (post: TaggrPost) => void;
}) {
  const [input, setInput] = useState<CreatePostInput>({
    text: "",
    realm: defaultRealm,
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit() {
    if (!input.text.trim()) return;
    setIsSubmitting(true);
    const post = await taggrClient.createPost({
      ...input,
      imageUrl: input.imageUrl?.trim() || undefined,
    });
    onCreated(post);
    setInput({ text: "", realm: defaultRealm, imageUrl: "" });
    setIsSubmitting(false);
  }

  return (
    <section className="grid gap-5 p-4 md:p-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)]">
      <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-4 md:p-5">
        <div className="mb-5">
          <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
            compose
          </p>
          <h2 className="mt-2 text-2xl text-[var(--color-text)]">
            Publish through Taggr, present as archive.
          </h2>
        </div>

        {!isAuthenticated ? (
          <p className="mb-5 border border-[var(--color-border)] p-3 font-mono text-xs uppercase text-[var(--color-muted)]">
            Public browsing is open. Posting requires Internet Identity and the
            real Taggr write method mapping.
          </p>
        ) : null}

        <div className="grid gap-4">
          <label>
            <span className="mb-2 block font-mono text-xs uppercase text-[var(--color-muted)]">
              Realm
            </span>
            <select
              className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 font-mono text-sm text-[var(--color-text)]"
              value={input.realm ?? ""}
              onChange={(event) =>
                setInput((value) => ({
                  ...value,
                  realm: event.target.value || undefined,
                }))
              }
            >
              <option value="">No realm</option>
              {realms.map((realm) => (
                <option key={realm.id} value={realm.id}>
                  {realm.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 flex items-center gap-2 font-mono text-xs uppercase text-[var(--color-muted)]">
              <ImagePlus size={14} />
              Image URL
            </span>
            <Input
              placeholder="https://..."
              value={input.imageUrl ?? ""}
              onChange={(event) =>
                setInput((value) => ({ ...value, imageUrl: event.target.value }))
              }
            />
          </label>

          <label>
            <span className="mb-2 block font-mono text-xs uppercase text-[var(--color-muted)]">
              Text
            </span>
            <textarea
              className="min-h-52 w-full border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm leading-6 text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
              placeholder="Write the artifact note..."
              value={input.text}
              onChange={(event) =>
                setInput((value) => ({ ...value, text: event.target.value }))
              }
            />
          </label>

          <Button
            className="justify-self-start"
            disabled={!input.text.trim() || isSubmitting}
            onClick={submit}
            variant="primary"
          >
            <Send size={16} />
            Publish post
          </Button>
        </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <p className="font-mono text-[11px] uppercase leading-5 text-[var(--color-muted)]">
            Real mode publishes text through Taggr's add_post method. Image URLs
            are appended to the post body; native binary attachment upload can be
            added here if this client grows beyond URL-based image publishing.
          </p>
        </div>
      </div>

      <PostPreview input={input} />
    </section>
  );
}
