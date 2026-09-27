import { useState } from "react";
import { Camera, Check, Film, Instagram, PenTool, Scissors, Send, Shirt, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { INSTAGRAM_URL } from "@/data/landing";

// Shared pieces for the talent call and hire forms. Matches the poster: square
// edges, hairline black borders, mono uppercase labels.

export const EASE = [0.65, 0, 0.35, 1] as const;

export const CREATIVE_TYPES = [
  { id: "model", label: "Model", icon: User },
  { id: "photographer", label: "Photographer", icon: Camera },
  { id: "videographer", label: "Videographer", icon: Film },
  { id: "designer", label: "Designer", icon: PenTool },
  { id: "stylist", label: "Stylist", icon: Shirt },
  { id: "hair_makeup", label: "Hair / Makeup", icon: Scissors },
  { id: "other", label: "Other", icon: Sparkles },
] as const;

export const CITIES = [
  { id: "columbus", label: "Columbus" },
  { id: "other_ohio", label: "Elsewhere in Ohio" },
  { id: "other", label: "Outside Ohio" },
] as const;

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const IG_RE = /^@?[A-Za-z0-9._]{1,30}$/;
export const URL_RE = /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i;

const fieldBase =
  "rounded-none border border-black/20 bg-white/70 text-[#1a1a1a] shadow-none transition-colors placeholder:text-black/35 hover:border-black/40 focus-visible:border-black focus-visible:ring-0 focus-visible:outline-none";
export const inputClass = `h-11 px-3 ${fieldBase}`;
export const selectClass = `h-11 w-full px-3 text-sm ${fieldBase}`;
export const textareaClass = `min-h-24 resize-none px-3 py-2.5 ${fieldBase}`;
export const microClass = "font-mono text-[0.68rem] font-medium uppercase tracking-[0.08em] text-[#555]";
export const primaryButtonClass =
  "h-11 gap-2 rounded-none border-black bg-black px-5 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-white hover:border-[var(--color-coral-dark)] hover:bg-[var(--color-coral-dark)] disabled:border-black/20 disabled:bg-black/20 disabled:opacity-100 cursor-pointer";
export const ghostButtonClass =
  "h-11 gap-2 rounded-none px-0 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#666] hover:bg-transparent hover:text-black cursor-pointer";
export const cardClass =
  "relative gap-0 rounded-none border border-black bg-[var(--color-paper)] p-0 text-[#1a1a1a] ring-0 shadow-[6px_6px_0_0_rgba(0,0,0,0.08)]";
export const checkRowClass =
  "flex items-start gap-3 border border-black/15 bg-white/60 p-4 text-sm text-[#1a1a1a] cursor-pointer transition-colors hover:border-black/40 has-checked:border-black";
export const checkboxClass = "mt-0.5 size-4 shrink-0 cursor-pointer accent-black";

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const clean = (v: string) => {
  const t = v.trim();
  return t.length ? t : null;
};

export const withScheme = (v: string) => {
  const t = v.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};

export const utmSource = () => {
  const source = new URLSearchParams(window.location.search).get("utm_source");
  return source ? source.slice(0, 100) : null;
};

export const Field = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) => (
  <label className="flex flex-col gap-1.5 text-sm">
    <span className="font-medium text-[#1a1a1a]">
      {label}
      {hint && <span className="ml-1 font-normal text-[#777]">{hint}</span>}
    </span>
    {children}
  </label>
);

export const TypeTile = ({
  label,
  icon: Icon,
  selected,
  onToggle,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onToggle}
    className={cn(
      "relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-none border p-4 last:col-span-2 last:flex-row text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
      selected
        ? "border-black bg-black text-white"
        : "border-black/15 bg-white/60 text-[#444] hover:border-black hover:text-black",
    )}
  >
    <Icon className="size-5" />
    <span>{label}</span>
  </button>
);

export const PrivacyNote = ({ purpose }: { purpose: string }) => (
  <p className="text-xs leading-relaxed text-[#666]">
    We only use this to {purpose}. DM{" "}
    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-black">
      @huoapp
    </a>{" "}
    anytime to be removed.
  </p>
);

// Thank-you screen actions: pass the link on, or follow along on Instagram.
export const ShareActions = ({ shareText, sharePath }: { shareText: string; sharePath: string }) => {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}${sharePath}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Huo", text: shareText, url });
      } catch {
        // dismissed the share sheet
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link:", url);
    }
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
      <Button type="button" onClick={share} className={cn(primaryButtonClass, "flex-1")}>
        {copied ? <Check className="size-3.5" /> : <Send className="size-3.5" />}
        {copied ? "Link copied" : "Send to a creative"}
      </Button>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 flex-1 items-center justify-center gap-2 border border-black px-5 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-black transition-colors hover:bg-black hover:text-white"
      >
        <Instagram className="size-3.5" />
        Follow @huoapp
      </a>
    </div>
  );
};
