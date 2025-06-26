// src/components/ui/charts.tsx

"use client";

import { Tooltip as RechartsTooltip, TooltipProps } from "recharts";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export function ChartContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border bg-white p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ChartTooltip(props: TooltipProps<number, string>) {
  return (
    <RechartsTooltip
      {...props}
      content={<ChartTooltipContent />}
      wrapperClassName="!outline-none"
    />
  );
}

export function ChartTooltipContent({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <Card className="border-muted bg-background text-foreground">
      <CardContent className="p-2 text-xs">
        <div className="font-semibold">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
