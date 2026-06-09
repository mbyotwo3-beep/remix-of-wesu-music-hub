import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";

export const Route = createFileRoute("/subscriptions")({
  head: () => ({
    meta: [
      { title: "Subscription Plans — Wesu+" },
      { name: "description", content: "Choose your Wesu+ subscription plan. Free streaming or Premium with no ads and offline downloads." },
      { property: "og:title", content: "Subscription Plans — Wesu+" },
      { property: "og:description", content: "Choose your Wesu+ subscription plan. Free streaming or Premium with no ads and offline downloads." },
    ],
  }),
  component: SubscriptionsPage,
});

const freeFeatures = [
  "Ad-supported listening",
  "Standard audio quality",
  "Unlimited playlist creation",
  "Access to charts & trending",
];

const premiumFeatures = [
  "Ad-free & unlimited skips",
  "Lossless high-res audio (FLAC)",
  "Offline downloads",
  "Exclusive artist content",
  "Early access to new releases",
  "Priority customer support",
];

function SubscriptionsPage() {
  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Sound</h1>
          <p className="text-muted-foreground text-lg">Stream for free or support artists with Premium</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 bg-card border border-white/5 rounded-3xl relative overflow-hidden">
            <div className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-2">Free</div>
            <div className="text-5xl font-bold mb-6">
              ZMW 0<span className="text-lg text-muted-foreground font-normal">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-muted-foreground mb-8">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="size-2.5 text-primary" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 border border-white/10 rounded-2xl font-bold hover:bg-white/5 transition-colors">
              Start Free
            </button>
          </div>

          {/* Premium Tier */}
          <div className="p-8 bg-surface border-2 border-primary rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-obsidian px-4 py-1 text-[10px] font-black uppercase rounded-bl-xl">
              Most Popular
            </div>
            <div className="text-primary text-sm font-bold uppercase tracking-wider mb-2">Premium</div>
            <div className="text-5xl font-bold mb-6">
              ZMW 45<span className="text-lg text-muted-foreground font-normal">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-muted-foreground mb-8">
              {premiumFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check className="size-2.5 text-primary" />
                  </div>
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 bg-primary text-obsidian rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/10">
              Go Premium
            </button>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Supported Payment Methods</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-video bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex flex-col justify-between hover:bg-yellow-500/20 transition-colors cursor-pointer">
              <div className="size-8 bg-yellow-500 rounded-lg" />
              <p className="font-bold text-yellow-500 text-sm">MTN MoMo</p>
            </div>
            <div className="aspect-video bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col justify-between hover:bg-red-500/20 transition-colors cursor-pointer">
              <div className="size-8 bg-red-500 rounded-lg" />
              <p className="font-bold text-red-500 text-sm">Airtel Money</p>
            </div>
            <div className="aspect-video bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex flex-col justify-between hover:bg-green-500/20 transition-colors cursor-pointer">
              <div className="size-8 bg-green-500 rounded-lg" />
              <p className="font-bold text-green-500 text-sm">Zamtel Kwacha</p>
            </div>
            <div className="aspect-video bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:bg-white/10 transition-colors cursor-pointer">
              <div className="size-8 bg-white/20 rounded-lg" />
              <p className="font-bold text-sm">Visa / Mastercard</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
