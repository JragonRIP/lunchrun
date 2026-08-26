import { ShoppingBag, Store, Utensils } from "lucide-react";

const steps = [
  {
    icon: ShoppingBag,
    title: "Order",
    text: "Pick snacks before cutoff",
  },
  {
    icon: Store,
    title: "I shop",
    text: "We grab them at the store",
  },
  {
    icon: Utensils,
    title: "You get it",
    text: "Delivered at lunch",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="rounded-3xl border border-neutral-100 bg-white p-5">
      <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-neutral-400">
        How it works
      </h2>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {steps.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-lr-yellow text-lr-black">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-2 text-sm font-black">
              {i + 1}. {title}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
