import { ImagePlus, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { taggrClient } from "../../lib/taggr/taggrClient";
import type {
  CreatePostAttachment,
  CreatePostInput,
  CreatePollInput,
  TaggrPost,
  TaggrRealm,
} from "../../lib/taggr/taggrTypes";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PostPreview } from "./PostPreview";

function emptyInput(defaultRealm?: string): CreatePostInput {
  return {
    text: "",
    realm: defaultRealm,
    imageUrl: "",
  };
}

async function readAttachment(file: File): Promise<CreatePostAttachment> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return {
    name: file.name,
    bytes,
    mimeType: file.type || "application/octet-stream",
    previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
  };
}

function normalizedPoll(poll?: CreatePollInput) {
  if (!poll) return undefined;

  return {
    ...poll,
    options: poll.options.map((option) => option.trim()).filter(Boolean),
  };
}

export function CreatePostForm({
  realms,
  defaultRealm,
  isAuthenticated,
  draft,
  draftNonce,
  mode = "create",
  editPostId,
  originalText,
  onDraftApplied,
  onCreated,
}: {
  realms: TaggrRealm[];
  defaultRealm?: string;
  isAuthenticated: boolean;
  draft?: CreatePostInput | null;
  draftNonce?: number;
  mode?: "create" | "edit";
  editPostId?: string;
  originalText?: string;
  onDraftApplied?: () => void;
  onCreated: (post: TaggrPost) => void;
}) {
  const [input, setInput] = useState<CreatePostInput>(() => emptyInput(defaultRealm));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollOptions = normalizedPoll(input.poll)?.options ?? [];

  useEffect(() => {
    return () => {
      if (input.attachment?.previewUrl) {
        URL.revokeObjectURL(input.attachment.previewUrl);
      }
    };
  }, [input.attachment?.previewUrl]);

  useEffect(() => {
    if (!draft || draftNonce === undefined) return;

    if (input.attachment?.previewUrl) {
      URL.revokeObjectURL(input.attachment.previewUrl);
    }
    setInput({
      text: draft.text,
      realm: draft.realm ?? defaultRealm,
      imageUrl: draft.imageUrl ?? "",
      attachment: draft.attachment,
      poll: draft.poll,
      repostId: draft.repostId,
    });
    onDraftApplied?.();
  }, [defaultRealm, draft, draftNonce, onDraftApplied]);

  async function submit() {
    if (!input.text.trim()) return;
    setIsSubmitting(true);
    try {
      const post =
        mode === "edit" && editPostId && typeof originalText === "string"
          ? await taggrClient.editPost({
              ...input,
              postId: editPostId,
              originalText,
              imageUrl: input.imageUrl?.trim() || undefined,
            })
          : await taggrClient.createPost({
              ...input,
              imageUrl: input.imageUrl?.trim() || undefined,
              poll: normalizedPoll(input.poll),
            });
      onCreated(post);
      if (input.attachment?.previewUrl) {
        URL.revokeObjectURL(input.attachment.previewUrl);
      }
      setInput(emptyInput(defaultRealm));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const attachment = await readAttachment(file);
    setInput((value) => {
      if (value.attachment?.previewUrl) {
        URL.revokeObjectURL(value.attachment.previewUrl);
      }
      return {
        ...value,
        attachment,
      };
    });
  }

  function clearAttachment() {
    setInput((value) => {
      if (value.attachment?.previewUrl) {
        URL.revokeObjectURL(value.attachment.previewUrl);
      }
      return {
        ...value,
        attachment: undefined,
      };
    });
  }

  function togglePoll() {
    setInput((value) => ({
      ...value,
      poll: value.poll
        ? undefined
        : {
            options: ["Option 1", "Option 2"],
            deadline: 24,
          },
    }));
  }

  return (
    <section className="grid gap-5 p-4 md:p-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.65fr)]">
      <div className="border border-[var(--color-border)] bg-[var(--color-panel)] p-4 md:p-5">
        <div className="mb-5">
          <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
            {mode === "edit" ? "edit" : "compose"}
          </p>
          <h2 className="mt-2 text-2xl text-[var(--color-text)]">
            {mode === "edit"
              ? "Revise a published post without leaving the archive."
              : input.repostId
                ? "Publish a canonical repost with commentary."
                : "Publish through Taggr, present as archive."}
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
              Upload image
            </span>
            <input
              accept="image/*"
              className="block w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-3 font-mono text-sm text-[var(--color-text)] file:mr-3 file:border-0 file:bg-[var(--color-panel-strong)] file:px-3 file:py-2 file:font-mono file:text-xs file:uppercase file:text-[var(--color-text)]"
              onChange={onFileChange}
              type="file"
            />
          </label>

          {input.attachment ? (
            <div className="flex items-center justify-between border border-[var(--color-border)] bg-[var(--color-panel-strong)] px-3 py-2 font-mono text-[11px] uppercase text-[var(--color-muted)]">
              <span className="truncate pr-3">{input.attachment.name}</span>
              <Button onClick={clearAttachment} size="sm" type="button" variant="ghost">
                <X size={13} />
                Remove
              </Button>
            </div>
          ) : null}

          {mode === "create" && !input.repostId ? (
            <div className="border border-[var(--color-border)] bg-[var(--color-panel-strong)] p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
                  Poll
                </p>
                <p className="mt-1 text-sm text-[var(--color-soft)]">
                  Attach a poll to this post.
                </p>
              </div>
              <Button onClick={togglePoll} type="button" variant="ghost">
                {input.poll ? "Remove poll" : "Add poll"}
              </Button>
            </div>

            {input.poll ? (
              <div className="mt-4 grid gap-4">
                <label>
                  <span className="mb-2 block font-mono text-xs uppercase text-[var(--color-muted)]">
                    Options
                  </span>
                  <textarea
                    className="min-h-28 w-full border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm leading-6 text-[var(--color-text)] placeholder:text-[var(--color-muted)]"
                    placeholder="One option per line"
                    value={input.poll.options.join("\n")}
                    onChange={(event) =>
                      setInput((value) => ({
                        ...value,
                        poll: value.poll
                          ? {
                              ...value.poll,
                              options: event.target.value.split(/\r?\n/),
                            }
                          : value.poll,
                      }))
                    }
                  />
                </label>

                <label>
                  <span className="mb-2 block font-mono text-xs uppercase text-[var(--color-muted)]">
                    Expires in
                  </span>
                  <select
                    className="h-11 w-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 font-mono text-sm text-[var(--color-text)]"
                    value={input.poll.deadline}
                    onChange={(event) =>
                      setInput((value) => ({
                        ...value,
                        poll: value.poll
                          ? {
                              ...value.poll,
                              deadline: Number(event.target.value),
                            }
                          : value.poll,
                      }))
                    }
                  >
                    {[24, 48, 72].map((hours) => (
                      <option key={hours} value={hours}>
                        {hours} hours
                      </option>
                    ))}
                  </select>
                </label>

                <p className="font-mono text-[11px] uppercase leading-5 text-[var(--color-muted)]">
                  Polls need at least two non-empty options.
                </p>
              </div>
            ) : null}
            </div>
          ) : null}

          {input.repostId ? (
            <div className="border border-[var(--color-border)] bg-[var(--color-panel-strong)] p-3 font-mono text-xs uppercase text-[var(--color-muted)]">
              Reposting post #{input.repostId}. Add commentary above the original post.
            </div>
          ) : null}

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
            disabled={
              !input.text.trim() ||
              isSubmitting ||
              (mode === "create" && Boolean(input.poll) && pollOptions.length < 2)
            }
            onClick={submit}
            variant="primary"
          >
            <Send size={16} />
            {mode === "edit" ? "Save changes" : "Publish post"}
          </Button>
        </div>

        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <p className="font-mono text-[11px] uppercase leading-5 text-[var(--color-muted)]">
            {mode === "edit"
              ? "Real mode saves edits through Taggr's edit_post method and preserves the canonical patch history expected by the original frontend."
              : "Real mode publishes text through Taggr's add_post method. External image URLs are appended to the post body, and uploaded images are sent as native Taggr file attachments."}
          </p>
        </div>
      </div>

      <PostPreview input={input} />
    </section>
  );
}
