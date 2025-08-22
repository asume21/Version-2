import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { billingAPI, type BillingPlan } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

export default function Billing() {
  const [email, setEmail] = useState("");
  const [, navigate] = useLocation();

  const plansQuery = useQuery({
    queryKey: ["/api/billing/plans"],
    queryFn: async () => billingAPI.getPlans(),
  });

  const statusQuery = useQuery({
    queryKey: ["/api/billing/status", email || ""],
    queryFn: async () => billingAPI.getStatus({ email: email || undefined }),
    enabled: !!email,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (priceId: string) => {
      const successUrl = window.location.origin + "/dashboard";
      const cancelUrl = window.location.href;
      return billingAPI.createCheckoutSession({ priceId, email: email || undefined, successUrl, cancelUrl });
    },
    onSuccess: ({ url }) => {
      if (url) {
        window.location.href = url;
      }
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const returnUrl = window.location.href;
      return billingAPI.createPortalSession({ email: email || undefined, returnUrl });
    },
    onSuccess: ({ url }) => {
      if (url) {
        window.location.href = url;
      }
    },
  });

  const plans: BillingPlan[] = useMemo(() => plansQuery.data?.plans ?? [], [plansQuery.data]);
  const stripeEnabled = plansQuery.data?.enabled ?? false;

  return (
    <div className="min-h-screen bg-github-dark text-github-text pt-16">
      <div className="flex">
        <div className="flex-1 ml-64 p-8 space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Billing</h1>
            <p className="text-github-text-secondary">Manage your subscription and billing settings</p>
          </div>

          {!stripeEnabled && (
            <Card className="bg-github-secondary border-github-border">
              <CardContent className="p-6">
                <p className="text-yellow-400">Billing is not configured. Please set STRIPE keys on the server.</p>
              </CardContent>
            </Card>
          )}

          <Card className="bg-github-secondary border-github-border">
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 max-w-lg">
                <Input
                  placeholder="Email for checkout and portal (optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button
                  variant="outline"
                  disabled={!email || portalMutation.isPending}
                  onClick={() => portalMutation.mutate()}
                >
                  Manage Billing
                </Button>
              </div>
              {statusQuery.isFetching && email && (
                <p className="text-github-text-secondary text-sm">Checking subscription status…</p>
              )}
              {statusQuery.data && (
                <p className="text-github-text-secondary text-sm">
                  Status: {statusQuery.data.enabled ? (statusQuery.data.active ? `Active (${statusQuery.data.status})` : "Inactive") : "Disabled"}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="bg-github-secondary border-github-border">
                <CardHeader>
                  <CardTitle>{plan.nickname}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold">
                    {plan.unitAmount != null ? `$${(plan.unitAmount / 100).toFixed(2)}` : "-"}
                    {plan.interval ? <span className="text-base text-github-text-secondary">/{plan.interval}</span> : null}
                  </div>
                  {plan.id === "free" ? (
                    <Button onClick={() => navigate("/dashboard")}>Start Free</Button>
                  ) : (
                    <Button
                      disabled={!stripeEnabled || checkoutMutation.isPending}
                      onClick={() => checkoutMutation.mutate(plan.id)}
                    >
                      {checkoutMutation.isPending ? "Redirecting…" : "Subscribe"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
