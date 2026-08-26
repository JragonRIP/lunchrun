"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FlaskConical } from "lucide-react";
import { setTestModeAction } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function TestModeToggle({
  enabled,
  compact = false,
  variant = "light",
}: {
  enabled: boolean;
  compact?: boolean;
  variant?: "light" | "dark";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !enabled;
    startTransition(async () => {
      const result = await setTestModeAction(next);
      if (!result.ok) {
        toast.error(result.error || "Could not update test mode");
        return;
      }
      toast.success(next ? "Test mode on — ordering is open" : "Test mode off");
      router.refresh();
    });
  }

  if (compact) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={toggle}
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition",
          enabled
            ? "bg-amber-400 text-lr-black"
            : variant === "dark"
              ? "bg-white/10 text-neutral-300 hover:bg-white/15"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
        )}
        aria-pressed={enabled}
      >
        <FlaskConical className="h-3.5 w-3.5" />
        {enabled ? "Test ON" : "Test"}
      </button>
    );
  }

  return (
    <section
      className={cn(
        "rounded-3xl border p-5 shadow-sm",
        enabled
          ? "border-amber-300 bg-amber-50"
          : "border-neutral-200 bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical
              className={cn("h-5 w-5", enabled ? "text-amber-700" : "text-neutral-500")}
            />
            <h2 className="font-black">Test mode</h2>
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Keep ordering open past cutoff and capacity so you can place test
            orders, shop, and deliver end-to-end. Turn off when you go live.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={pending}
          onClick={toggle}
          className={cn(
            "relative h-8 w-14 shrink-0 rounded-full transition",
            enabled ? "bg-amber-500" : "bg-neutral-300",
            pending && "opacity-60",
          )}
        >
          <span
            className={cn(
              "absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition",
              enabled && "translate-x-6",
            )}
          />
        </button>
      </div>
      {enabled ? (
        <p className="mt-3 text-xs font-bold text-amber-800">
          Students can order right now even after cutoff.
        </p>
      ) : null}
    </section>
  );
}
