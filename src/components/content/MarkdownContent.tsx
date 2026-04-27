import type { ReactNode } from "react";
import { ExternalLink, Play } from "lucide-react";
import { safeWebUrl } from "../../lib/security/urls";

type MarkdownContentProps = {
  source: string;
  compact?: boolean;
  className?: string;
  disableLinks?: boolean;
};

type ListBlock = {
  type: "ul" | "ol";
  items: string[];
};

type Block =
  | { type: "blockquote"; text: string }
  | { type: "code"; code: string }
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | ListBlock
  | { type: "paragraph"; text: string };

const urlPattern = /https?:\/\/[^\s<>)"']+/g;

export function MarkdownContent({
  source,
  compact = false,
  className = "",
  disableLinks = false,
}: MarkdownContentProps) {
  const media = extractMedia(source);
  const classes = [
    "markdown-body",
    compact ? "markdown-body-compact" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {parseBlocks(source).map((block, index) =>
        renderBlock(block, index, disableLinks),
      )}
      {!compact && media.length ? (
        <div className="media-preview-stack">
          {media.map((item) =>
            item.kind === "youtube" ? (
              <YouTubePreview key={item.url} {...item} />
            ) : (
              <TwitterPreview key={item.url} {...item} />
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let list: ListBlock | null = null;
  let code: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ") });
      paragraph = [];
    }
  }

  function flushQuote() {
    if (quote.length) {
      blocks.push({ type: "blockquote", text: quote.join(" ") });
      quote = [];
    }
  }

  function flushList() {
    if (list) {
      blocks.push(list);
      list = null;
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushQuote();
      flushList();
      if (code) {
        blocks.push({ type: "code", code: code.join("\n") });
        code = null;
      } else {
        code = [];
      }
      continue;
    }

    if (code) {
      code.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushQuote();
      flushList();
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushQuote();
      flushList();
      blocks.push({
        type: "heading",
        level: Math.min(Math.max(heading[1].length, 2), 4) as 2 | 3 | 4,
        text: heading[2],
      });
      continue;
    }

    const quoteLine = line.match(/^>\s?(.*)$/);
    if (quoteLine) {
      flushParagraph();
      flushList();
      quote.push(quoteLine[1]);
      continue;
    }

    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      flushQuote();
      const type = unordered ? "ul" : "ol";
      const text = unordered?.[1] ?? ordered?.[1] ?? "";
      if (!list || list.type !== type) flushList();
      if (!list) list = { type, items: [] };
      list.items.push(text);
      continue;
    }

    flushQuote();
    flushList();
    paragraph.push(line.trim());
  }

  if (code) blocks.push({ type: "code", code: code.join("\n") });
  flushParagraph();
  flushQuote();
  flushList();
  return blocks;
}

function renderBlock(block: Block, index: number, disableLinks: boolean) {
  if (block.type === "heading") {
    const Tag = `h${block.level}` as "h2" | "h3" | "h4";
    return <Tag key={index}>{renderInline(block.text, disableLinks)}</Tag>;
  }

  if (block.type === "blockquote") {
    return <blockquote key={index}>{renderInline(block.text, disableLinks)}</blockquote>;
  }

  if (block.type === "code") {
    return (
      <pre key={index}>
        <code>{block.code}</code>
      </pre>
    );
  }

  if (block.type === "ul" || block.type === "ol") {
    const Tag = block.type;
    return (
      <Tag key={index}>
        {block.items.map((item, itemIndex) => (
          <li key={itemIndex}>{renderInline(item, disableLinks)}</li>
        ))}
      </Tag>
    );
  }

  if (block.type === "paragraph") {
    return <p key={index}>{renderInline(block.text, disableLinks)}</p>;
  }

  return null;
}

function renderInline(text: string, disableLinks: boolean): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(!?\[[^\]]+]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|https?:\/\/[^\s<>)"']+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    nodes.push(renderInlineToken(match[0], nodes.length, disableLinks));
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderInlineToken(token: string, key: number, disableLinks: boolean) {
  const image = token.match(/^!\[([^\]]+)]\(([^)]+)\)$/);
  if (image) {
    if (disableLinks) {
      return (
        <span className="markdown-link-text" key={key}>
          {image[1] || "image"}
        </span>
      );
    }

    return <MarkdownLink key={key} href={image[2]} label={image[1] || "image"} />;
  }

  const link = token.match(/^\[([^\]]+)]\(([^)]+)\)$/);
  if (link) {
    if (disableLinks) {
      return (
        <span className="markdown-link-text" key={key}>
          {link[1]}
        </span>
      );
    }

    return <MarkdownLink key={key} href={link[2]} label={link[1]} />;
  }

  if (token.startsWith("`")) return <code key={key}>{token.slice(1, -1)}</code>;
  if (token.startsWith("**")) return <strong key={key}>{token.slice(2, -2)}</strong>;
  if (token.startsWith("*")) return <em key={key}>{token.slice(1, -1)}</em>;
  if (disableLinks) {
    return (
      <span className="markdown-link-text" key={key}>
        {shortUrl(token)}
      </span>
    );
  }

  return <MarkdownLink key={key} href={token} label={shortUrl(token)} />;
}

function MarkdownLink({ href, label }: { href: string; label: string }) {
  const safeHref = safeWebUrl(href);

  if (!safeHref) return <span className="markdown-link-text">{label}</span>;

  return (
    <a href={safeHref} rel="noreferrer" target="_blank">
      {label}
    </a>
  );
}

function shortUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url;
  }
}

function extractMedia(source: string) {
  const urls = source.match(urlPattern) ?? [];
  const seen = new Set<string>();

  return urls
    .map((url) => cleanUrl(url))
    .filter((url) => {
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    })
    .map((url) => youtubeMedia(url) ?? twitterMedia(url))
    .filter(Boolean) as Array<
    | { kind: "youtube"; id: string; url: string; title: string }
    | { kind: "twitter"; id: string; url: string; host: string }
  >;
}

function cleanUrl(url: string) {
  return url.replace(/[.,!?;:]+$/, "");
}

function youtubeMedia(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  let id: string | null = null;

  if (host === "youtu.be") id = parsed.pathname.slice(1).split("/")[0];
  if (host === "youtube.com" || host === "m.youtube.com") {
    if (parsed.pathname === "/watch") id = parsed.searchParams.get("v");
    if (parsed.pathname.startsWith("/shorts/")) id = parsed.pathname.split("/")[2];
    if (parsed.pathname.startsWith("/embed/")) id = parsed.pathname.split("/")[2];
  }

  if (!id || !/^[\w-]{6,}$/.test(id)) return null;

  return {
    kind: "youtube" as const,
    id,
    title: "YouTube preview",
    url,
  };
}

function twitterMedia(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");
  if (!["twitter.com", "x.com", "mobile.twitter.com"].includes(host)) return null;

  const id = parsed.pathname.match(/\/status(?:es)?\/(\d+)/)?.[1];
  if (!id) return null;

  return {
    kind: "twitter" as const,
    host,
    id,
    url,
  };
}

function YouTubePreview({
  id,
  title,
  url,
}: {
  id: string;
  title: string;
  url: string;
}) {
  return (
    <div className="media-preview">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
      />
      <a href={url} rel="noreferrer" target="_blank">
        <Play size={14} />
        Open YouTube
      </a>
    </div>
  );
}

function TwitterPreview({
  id,
  url,
  host,
}: {
  id: string;
  url: string;
  host: string;
}) {
  return (
    <div className="media-preview twitter-preview">
      <iframe
        loading="lazy"
        src={`https://platform.twitter.com/embed/Tweet.html?id=${id}&theme=dark`}
        title={`${host} post preview`}
      />
      <a href={url} rel="noreferrer" target="_blank">
        <ExternalLink size={14} />
        Open {host}
      </a>
    </div>
  );
}
