"use client";

import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { useProfile } from "@/hooks/use-profile";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCards, RecentTrades, QuickActions } from "@/components/dashboard";
import {
  EquityCurve,
  WinLossPie,
  MonthlyPnLBar,
  MarketDistribution,
} from "@/components/charts";

export default function DashboardPage() {
  const { stats, recentTrades, loading } = useDashboardStats();
  const { profile } = useProfile();

  const currency = profile?.default_currency || "USD";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your trading performance"
      />

      <StatsCards stats={stats} loading={loading} currency={currency} />

      <div className="grid gap-6 lg:grid-cols-2">
        <EquityCurve trades={recentTrades} loading={loading} currency={currency} />
        <MonthlyPnLBar trades={recentTrades} loading={loading} currency={currency} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <WinLossPie trades={recentTrades} loading={loading} />
        <MarketDistribution trades={recentTrades} loading={loading} />
        <QuickActions />
      </div>

      <RecentTrades trades={recentTrades} loading={loading} />
    </div>
  );
}
