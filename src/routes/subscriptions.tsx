import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { getSubscriptionPlans, getPaymentMethods } from "@/lib/music.functions";

const plansQO = queryOptions({ queryKey: ["plans"], queryFn: () => getSubscriptionPlans() });
const methodsQO = queryOptions({ queryKey: ["methods"], queryFn: () => getPaymentMethods() });

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription Plans — Wesu+" },
      { name: "description", content: "Choose your Wesu+ subscription plan." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(plansQO);
    context.queryClient.ensureQueryData(methodsQO);
  },
  component: SubscriptionsPage,
  errorComponent: ({ error }) => <div className="p-12 text-center">Failed: {error.message}</div>,
  notFoundComponent: () => <div className="p-12 text-center">Not found</div>,
});

function SubscriptionsPage() {
  const { data: plans } = useSuspenseQuery(plansQO);
  const { data: methods } = useSuspenseQuery(methodsQO);

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Sound</h1>
          <p className="text-muted-foreground text-lg">
            Stream for free or support artists with Premium
          </p>
        </div>

        <div
          className={`grid gap-8 max-w-5xl mx-auto ${plans.length > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {plans.map((p, i) => {
            const featured = i === 1;
            const features = Array.isArray(p.features) ? (p.features as string[]) : [];
            return (
              <div
                key={p.id}
                className={`p-8 rounded-3xl relative overflow-hidden ${
                  featured ? "bg-surface border-2 border-primary" : "bg-card border border-border"
                }`}
              >
                {featured && (
                  <div className="absolute top-0 right-0 bg-primary text-obsidian px-4 py-1 text-[10px] font-black uppercase rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                <div
                  className={`text-sm font-bold uppercase tracking-wider mb-2 ${featured ? "text-primary" : "text-muted-foreground"}`}
                >
                  {p.name}
                </div>
                <div className="text-5xl font-bold mb-6">
                  ZMW {Number(p.price_zmw).toFixed(0)}
                  <span className="text-lg text-muted-foreground font-normal">/{p.interval}</span>
                </div>
                <ul className="space-y-4 text-sm text-muted-foreground mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Check className="size-2.5 text-primary" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/checkout"
                  search={{ plan: p.code }}
                  className={`block w-full py-4 rounded-2xl font-bold text-center transition-all ${
                    featured
                      ? "bg-primary text-obsidian hover:brightness-110 shadow-lg shadow-primary/10"
                      : "border border-border hover:bg-foreground/5"
                  }`}
                >
                  {Number(p.price_zmw) === 0 ? "Start Free" : "Choose Plan"}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-3">Supported Payment Methods</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">
            Pay with any of the methods below — all secured via DPO Pay
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* MTN MoMo */}
            <div className="bg-white dark:bg-white rounded-2xl border border-yellow-200 p-4 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:border-yellow-400 transition-all min-h-[96px]">
              <img
                src="/images/logo-mtn-momo-official.png"
                alt="MTN MoMo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-[9px] font-bold uppercase tracking-wide text-yellow-700">
                Mobile Money
              </span>
            </div>
            {/* Airtel Money */}
            <div className="bg-white dark:bg-white rounded-2xl border border-red-200 p-4 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:border-red-400 transition-all min-h-[96px]">
              <img
                src="/images/logo-airtel-money-official.png"
                alt="Airtel Money"
                className="h-12 w-auto object-contain"
              />
              <span className="text-[9px] font-bold uppercase tracking-wide text-red-700">
                Mobile Money
              </span>
            </div>
            {/* Zamtel */}
            <div className="bg-white dark:bg-white rounded-2xl border border-green-200 p-4 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:border-green-400 transition-all min-h-[96px]">
              <img
                src="/images/logo-zamtel-money-official.png"
                alt="Zamtel Money"
                className="h-10 w-auto object-contain"
              />
              <span className="text-[9px] font-bold uppercase tracking-wide text-green-700">
                Mobile Money
              </span>
            </div>
            {/* Visa */}
            <div className="bg-white dark:bg-white rounded-2xl border border-blue-200 p-4 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:border-blue-400 transition-all min-h-[96px]">
              <img src="/images/logo-visa.png" alt="Visa" className="h-8 w-auto object-contain" />
              <span className="text-[9px] font-bold uppercase tracking-wide text-blue-700">
                Card
              </span>
            </div>
            {/* Mastercard */}
            <div className="bg-white dark:bg-white rounded-2xl border border-orange-200 p-4 flex flex-col items-center justify-center gap-1 hover:shadow-md hover:border-orange-400 transition-all min-h-[96px]">
              <img
                src="/images/logo-mastercard.png"
                alt="Mastercard"
                className="h-10 w-auto object-contain"
              />
              <span className="text-[9px] font-bold uppercase tracking-wide text-orange-700">
                Card
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
