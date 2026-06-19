import type { Pin } from "@/types";
import {
  getPinAuthor,
  getPinDescription,
  getPinLink,
  getPinThumbnail,
} from "@/utils/pinDisplay";

interface PinCardProps {
  pin: Pin;
}

export default function PinCard({ pin }: PinCardProps) {
  const thumbnail = getPinThumbnail(pin);
  const link = getPinLink(pin);
  const author = getPinAuthor(pin);
  const description = getPinDescription(pin);

  return (
    <article className="break-inside-avoid mb-5 rounded-2xl border border-[var(--slate-border)] bg-[var(--slate-surface)] overflow-hidden shadow-sm hover:shadow-[var(--slate-shadow)] transition-all duration-200 hover:-translate-y-0.5">
      {thumbnail && link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="block overflow-hidden bg-black/5"
        >
          <img
            src={thumbnail}
            alt={pin.title}
            loading="lazy"
            className="w-full h-auto block rounded-t-2xl"
          />
        </a>
      ) : (
        <div className="aspect-video rounded-t-2xl bg-[var(--slate-border)]/60" />
      )}

      <div className="px-3.5 py-2.5 space-y-1">
        <h3 className="text-sm font-medium text-[var(--slate-surface-text)] font-[family-name:var(--font-ui)] leading-snug">
          {pin.title}
        </h3>

        {author && (
          <p className="text-sm font-semibold text-[var(--slate-surface-text)] font-[family-name:var(--font-ui)] leading-tight">
            {author}
          </p>
        )}

        {description && (
          <p className="text-xs text-[var(--slate-muted)] leading-snug font-[family-name:var(--font-serif)]">
            {description}
          </p>
        )}
      </div>
    </article>
  );
}
