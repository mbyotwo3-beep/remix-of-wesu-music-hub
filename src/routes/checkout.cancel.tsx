import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/checkout/cancel")({
  head: () => ({
    meta: [
      { title: "Payment Cancelled — Wesu+" },
      { name: "description", content: "Your payment process has been cancelled." },
    ],
  }),
  component: CheckoutCancelPage,
});

function CheckoutCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-xl">
        <div className="size-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="size-10 text-red-500 animate-pulse" />
        </div>

        <h1 className="text-3xl font-extrabold mb-3">Payment Cancelled</h1>
        <p className="text-muted-foreground text-sm mb-8 text-balance">
          The payment process was cancelled or did not complete. No charges were made to your
          account.
        </p>

        <div className="space-y-3">
          <Link
            to="/subscriptions"
            className="w-full py-4 bg-primary text-obsidian rounded-2xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="size-4" />
            Try Again
          </Link>

          <Link
            to="/"
            className="w-full py-4 border border-border hover:bg-foreground/5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
