import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className="text-lg font-bold text-lr-black">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-neutral-500">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
