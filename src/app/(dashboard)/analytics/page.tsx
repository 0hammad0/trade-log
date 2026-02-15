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
} from "@/components/analytics";
import { EquityCurve, MonthlyPnLBar } from "@/components/charts";
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
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Analyze your trading performance"
      />

      <DateRangePicker period={period} onPeriodChange={setPeriod} />

      {loading && !data ? (
        <LoadingPage />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
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

          <div className="grid gap-6 lg:grid-cols-2">
            <PerformanceTable
              title="Performance by Symbol"
              data={data?.symbolPerformance || []}
              loading={loading}
              currency={currency}
              type="symbol"
            />
            <PerformanceTable
              title="Performance by Setup"
              data={data?.setupPerformance || []}
              loading={loading}
              currency={currency}
              type="setup"
            />
          </div>

          <DayOfWeekChart
            data={data?.dayOfWeekPnL || []}
            loading={loading}
            currency={currency}
          />
        </>
      )}
    </div>
  );
}
