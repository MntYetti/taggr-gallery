import { useMemo, useState } from "react";
import type { TaggrPoll } from "../../lib/taggr/taggrTypes";
import { Button } from "../ui/Button";

const HOUR = 60 * 60 * 1000;

export function PollPanel({
  poll,
  createdAt,
  preview = false,
  isAuthenticated = false,
  onVote,
}: {
  poll: TaggrPoll;
  createdAt?: string;
  preview?: boolean;
  isAuthenticated?: boolean;
  onVote?: (option: number, anonymously: boolean) => Promise<void> | void;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totals = useMemo(() => {
    const totalVotes = poll.voters.length;
    return poll.options.map((_, index) => {
      const visibleVotes = poll.votes[String(index)]?.length ?? 0;
      return {
        visibleVotes,
        percent: totalVotes ? Math.round((visibleVotes / totalVotes) * 100) : 0,
      };
    });
  }, [poll]);
  const expiresAt = createdAt
    ? new Date(new Date(createdAt).getTime() + poll.deadline * HOUR)
    : undefined;
  const expired = expiresAt ? Date.now() > expiresAt.getTime() : false;

  async function submit(anonymously: boolean) {
    if (selectedOption === null || !onVote) return;
    setIsSubmitting(true);
    try {
      await onVote(selectedOption, anonymously);
      setSelectedOption(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-3 border border-[var(--color-border)] bg-[var(--color-panel)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs uppercase text-[var(--color-muted)]">poll</p>
          <p className="text-sm text-[var(--color-soft)]">
            {poll.voters.length} total vote{poll.voters.length === 1 ? "" : "s"}
          </p>
        </div>
        <span className="font-mono text-[11px] uppercase text-[var(--color-muted)]">
          {expired ? "poll closed" : `expires in ${poll.deadline}h`}
        </span>
      </div>

      <div className="space-y-3">
        {poll.options.map((option, index) => (
          <label
            key={`${option}-${index}`}
            className="block border border-[var(--color-border)] bg-[var(--color-panel-strong)] p-3"
          >
            {!preview && onVote && !expired ? (
              <div className="flex items-start gap-3">
                <input
                  checked={selectedOption === index}
                  className="mt-1"
                  disabled={!isAuthenticated || isSubmitting}
                  name="taggr-poll-option"
                  onChange={() => setSelectedOption(index)}
                  type="radio"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm leading-6 text-[var(--color-text)]">{option}</div>
                  <PollBar percent={totals[index]?.percent ?? 0} />
                  <div className="mt-2 font-mono text-[11px] uppercase text-[var(--color-muted)]">
                    {totals[index]?.visibleVotes ?? 0} visible / {totals[index]?.percent ?? 0}%
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-sm leading-6 text-[var(--color-text)]">{option}</div>
                <PollBar percent={totals[index]?.percent ?? 0} />
                <div className="mt-2 font-mono text-[11px] uppercase text-[var(--color-muted)]">
                  {totals[index]?.visibleVotes ?? 0} visible / {totals[index]?.percent ?? 0}%
                </div>
              </div>
            )}
          </label>
        ))}
      </div>

      {!preview && onVote ? (
        expired ? (
          <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
            Poll expired.
          </p>
        ) : isAuthenticated ? (
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={selectedOption === null || isSubmitting}
              onClick={() => void submit(false)}
              variant="secondary"
            >
              {isSubmitting ? "Submitting..." : "Vote"}
            </Button>
            <Button
              disabled={selectedOption === null || isSubmitting}
              onClick={() => void submit(true)}
              variant="ghost"
            >
              Vote anonymously
            </Button>
          </div>
        ) : (
          <p className="font-mono text-xs uppercase text-[var(--color-muted)]">
            Login through a registered Taggr delegation domain to vote.
          </p>
        )
      ) : null}
    </section>
  );
}

function PollBar({ percent }: { percent: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)]">
      <div
        className="h-full bg-[var(--color-accent)] transition-[width]"
        style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
      />
    </div>
  );
}