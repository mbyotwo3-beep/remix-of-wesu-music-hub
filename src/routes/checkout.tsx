import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Smartphone, Check } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Wesu+" },
      { name: "description", content: "Complete your purchase on Wesu+ Music Streaming." },
    ],
  }),
  component: CheckoutPage,
});

type PaymentMethod = "mtn" | "airtel" | "zamtel" | "card";

function CheckoutPage() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("mtn");
  const [phoneNumber, setPhoneNumber] = useState("");

  const methods: { id: PaymentMethod; label: string; color: string; bg: string }[] = [
    { id: "mtn", label: "MTN MoMo", color: "text-yellow-500", bg: "bg-yellow-500" },
    { id: "airtel", label: "Airtel Money", color: "text-red-500", bg: "bg-red-500" },
    { id: "zamtel", label: "Zamtel Kwacha", color: "text-green-500", bg: "bg-green-500" },
    { id: "card", label: "Visa / Mastercard", color: "text-foreground", bg: "bg-white/20" },
  ];

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Checkout</h1>
        <p className="text-muted-foreground mb-8">Complete your purchase securely</p>

        {/* Order Summary */}
        <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between items-center py-3 border-b border-white/5">
            <span className="text-muted-foreground">Wesu+ Premium Monthly</span>
            <span className="font-semibold">ZMW 45.00</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">ZMW 45.00</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card border border-white/5 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {methods.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedMethod === m.id
                    ? "border-primary bg-primary/10"
                    : "border-white/10 hover:border-white/20 bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  {m.id === "card" ? (
                    <CreditCard className={`size-5 ${m.color}`} />
                  ) : (
                    <Smartphone className={`size-5 ${m.color}`} />
                  )}
                  <span className="font-medium text-sm">{m.label}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedMethod !== "card" ? (
            <div className="space-y-4">
              <label className="block text-sm font-medium">Mobile Money Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0977 123 456"
                className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                You will receive a prompt on your phone to authorize this payment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full bg-secondary/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <button className="w-full py-4 bg-primary text-obsidian rounded-2xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2">
          <Check className="size-4" />
          Pay ZMW 45.00
        </button>
      </div>
    </div>
  );
}
