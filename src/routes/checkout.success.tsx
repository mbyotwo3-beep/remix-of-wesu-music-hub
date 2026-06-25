import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Headphones, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({
    meta: [
      { title: "Payment Successful — Wesu+" },
      { name: "description", content: "Your payment has been successfully processed." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({
    sim: typeof s.sim === "string" ? s.sim : undefined,
    ref: typeof s.ref === "string" ? s.ref : undefined,
  }),
  component: CheckoutSuccessPage,
});

function CheckoutSuccessPage() {
  const { sim, ref } = Route.useSearch();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-xl">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="size-10 text-primary animate-pulse" />
        </div>

        <h1 className="text-3xl font-extrabold mb-3">Payment Successful!</h1>
        <p className="text-muted-foreground text-sm mb-6 text-balance">
          Thank you for your purchase. Your account has been upgraded, or your items have been added
          to your library.
        </p>

        {ref && (
          <div className="bg-foreground/5 rounded-xl p-4 mb-8 text-left border border-border">
            <div className="flex justify-between text-xs py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Transaction ID</span>
              <span className="font-mono font-semibold select-all text-right">{ref}</span>
            </div>
            <div className="flex justify-between text-xs py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Status</span>
              <span className="text-primary font-bold uppercase text-right">Completed</span>
            </div>
            {sim && (
              <div className="flex justify-between text-xs py-1.5">
                <span className="text-muted-foreground">Mode</span>
                <span className="text-yellow-500 font-bold uppercase text-right">Simulation</span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="w-full py-4 bg-primary text-obsidian rounded-2xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Headphones className="size-4" />
            Start Listening
          </Link>

          <Link
            to="/"
            className="w-full py-4 border border-border hover:bg-foreground/5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            Back to Home
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
