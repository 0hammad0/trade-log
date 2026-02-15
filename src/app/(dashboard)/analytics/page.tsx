"use client";

import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { useAnalytics } from "@/hooks/use-analytics";
import { useProfile } from "@/hooks/use-profile";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingPage } from "@/components/shared/loading-page";
import { ErrorState } from "@/components/shared/error-state";
import {
  DateRangePicker,
  PerformanceTable,
  DayOfWeekChart,
  AnalyticsStatsCards,
  PnLCalendar,
} from "@/components/analytics";
import {
  EquityCurve,
  MonthlyPnLBar,
  WinLossPie,
  MarketDistribution,
} from "@/components/charts";
import type { AnalyticsPeriod } from "@/types";

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const { data, loading, error, fetchAnalytics } = useAnalytics();
  const { profile } = useProfile();

  const currency = profile?.default_currency || "USD";

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          description="Analyze your trading performance"
        />
        <ErrorState
          message={error}
          onRetry={() => fetchAnalytics(period)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Analytics"
        description="Comprehensive trading performance analysis"
      />

      <DateRangePicker period={period} onPeriodChange={setPeriod} />

      {loading && !data ? (
        <LoadingPage />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Key Statistics */}
          <AnalyticsStatsCards
            stats={data?.stats || null}
            loading={loading}
            currency={currency}
          />

          {/* Calendar + Distribution Charts - 3 column layout on desktop */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Calendar takes 2 columns on desktop */}
            <div className="lg:col-span-2">
              <PnLCalendar
                data={data?.dailyPnL || []}
                loading={loading}
                currency={currency}
              />
            </div>
            {/* Pie charts stack in 1 column */}
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-1">
              <WinLossPie
                trades={data?.trades || []}
                loading={loading}
              />
              <MarketDistribution
                trades={data?.trades || []}
                loading={loading}
              />
            </div>
          </div>

          {/* Equity & Monthly Charts */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            <EquityCurve
              trades={data?.trades || []}
              loading={loading}
              currency={currency}
            />
            <MonthlyPnLBar
              trades={data?.trades || []}
              loading={loading}
              currency={currency}
            />
          </div>

          {/* Day of Week + Performance Tables */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            <DayOfWeekChart
              data={data?.dayOfWeekPnL || []}
              loading={loading}
              currency={currency}
            />
            <PerformanceTable
              title="By Symbol"
              data={data?.symbolPerformance || []}
              loading={loading}
              currency={currency}
              type="symbol"
            />
            <PerformanceTable
              title="By Setup"
              data={data?.setupPerformance || []}
              loading={loading}
              currency={currency}
              type="setup"
            />
          </div>
        </div>
      )}
    </div>
  );
}
