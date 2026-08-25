import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { AppointmentStatus, Urgency } from "@/lib/pulse-data";

export function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("glass gradient-ring rounded-2xl p-5", className)}>{children}</div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

type BtnVariant = "primary" | "ghost" | "outline" | "aqua" | "danger";

export function Btn({
  variant = "primary",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const styles: Record<BtnVariant, string> = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 shadow-[var(--shadow-glow)] border border-transparent",
    aqua: "bg-accent text-accent-foreground hover:opacity-90 border border-transparent",
    outline: "border border-input bg-transparent text-foreground hover:bg-secondary",
    ghost: "border border-transparent text-foreground hover:bg-secondary",
    danger: "bg-destructive text-destructive-foreground hover:opacity-90 border border-transparent",
  };
  return (
    <button
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        styles[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export type PillTone =
  | "muted"
  | "primary"
  | "teal"
  | "gold"
  | "olive"
  | "magenta"
  | "violet"
  | "danger";

export function Pill({
  tone = "muted",
  glow = false,
  className,
  children,
}: {
  tone?: PillTone;
  glow?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const tones: Record<PillTone, string> = {
    muted: "bg-secondary text-muted-foreground border-border",
    primary: "bg-primary/10 text-primary border-primary/25",
    teal: "bg-teal/15 text-accent-foreground border-teal/40",
    gold: "bg-gold/20 text-[oklch(0.42_0.1_92)] border-gold/50",
    olive: "bg-olive/15 text-olive border-olive/35",
    magenta: "bg-magenta/15 text-magenta border-magenta/35",
    violet: "bg-violet/15 text-violet border-violet/35",
    danger: "bg-destructive/12 text-destructive border-destructive/30",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        tones[tone],
        glow && "animate-hold",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const map: Record<AppointmentStatus, { tone: PillTone; glow: boolean }> = {
    BOOKED: { tone: "teal", glow: false },
    HELD: { tone: "gold", glow: true },
    COMPLETED: { tone: "olive", glow: false },
    CANCELLED: { tone: "danger", glow: false },
  };
  return (
    <Pill tone={map[status].tone} glow={map[status].glow}>
      {status}
    </Pill>
  );
}


export function UrgencyBadge({ level }: { level: Urgency }) {
  const map: Record<Urgency, string> = {
    LOW: "bg-olive text-white",
    MEDIUM: "bg-gold text-[oklch(0.25_0.06_92)]",
    HIGH: "bg-magenta text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider",
        map[level],
      )}
    >
      {level} URGENCY
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "teal" | "gold" | "violet" | "olive" | "magenta";
}) {
  const bg: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    teal: "bg-teal/20 text-accent-foreground",
    gold: "bg-gold/20 text-[oklch(0.42_0.1_92)]",
    violet: "bg-violet/15 text-violet",
    olive: "bg-olive/15 text-olive",
    magenta: "bg-magenta/15 text-magenta",
  };
  return (
    <GlassCard className="flex items-center gap-4">
      <div className={cn("grid size-11 shrink-0 place-items-center rounded-xl", bg[tone])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </p>
        <p className="font-display text-2xl leading-tight font-semibold">{value}</p>
        {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </GlassCard>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="glass inline-flex flex-wrap gap-1 rounded-xl p-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
            value === t
              ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-3 sm:p-6">
      <div
        className="fixed inset-0 bg-ink/45 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "glass-strong gradient-ring relative my-4 w-full rounded-3xl p-5 sm:p-6",
          wide ? "max-w-3xl" : "max-w-lg",
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-input bg-white/70 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function Avatar({ initials, tone = 0 }: { initials: string; tone?: number }) {
  const tones = [
    "bg-primary text-primary-foreground",
    "bg-teal text-accent-foreground",
    "bg-violet text-white",
    "bg-gold text-[oklch(0.25_0.06_92)]",
    "bg-olive text-white",
    "bg-magenta text-white",
  ];
  return (
    <div
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold",
        tones[tone % tones.length],
      )}
    >
      {initials}
    </div>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: "var(--gradient-aqua)" }}
      />
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-secondary border border-border",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
          checked ? "left-[1.375rem]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function EmptyState({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </GlassCard>
  );
}
