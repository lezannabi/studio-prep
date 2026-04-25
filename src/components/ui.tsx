import { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = ""
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_24px_80px_rgba(33,42,39,0.08)] backdrop-blur ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
            {subtitle ?? "Studio Prep"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-stone-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/90 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-stone-900">{value}</p>
      <p className="mt-1 text-sm text-stone-600">{hint}</p>
    </div>
  );
}

export function Badge({
  children,
  tone = "default"
}: {
  children: ReactNode;
  tone?: "default" | "accent" | "muted" | "success" | "warning";
}) {
  const toneClasses = {
    default: "border-stone-200 bg-white text-stone-700",
    accent: "border-teal-200 bg-teal-50 text-teal-800",
    muted: "border-stone-200 bg-stone-100 text-stone-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700"
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

export function GhostButton({
  children,
  active = false,
  onClick
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm transition ${
        active
          ? "border-teal-700 bg-teal-700 text-white"
          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
      }`}
    >
      {children}
    </button>
  );
}
