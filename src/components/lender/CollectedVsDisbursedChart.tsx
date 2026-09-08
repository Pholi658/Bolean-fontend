"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { compactMaloti, formatMaloti } from "@/lib/format";

interface DataPoint {
  month: string;
  collected: number;
  disbursed: number;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const disbursed = payload.find((p) => p.dataKey === "disbursed")?.value ?? 0;
  const collected = payload.find((p) => p.dataKey === "collected")?.value ?? 0;

  return (
    <div className="rounded-lg bg-popover/95 border border-border px-3.5 py-2.5 shadow-xl backdrop-blur-md">
      <p className="text-[11.5px] font-medium text-foreground mb-1.5">{label}</p>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-sm bg-primary inline-block" /> Disbursed
        <span className="ml-auto text-foreground font-medium">{formatMaloti(disbursed)}</span>
      </div>
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-1">
        <span className="w-1.5 h-1.5 rounded-sm bg-success inline-block" /> Collected
        <span className="ml-auto text-foreground font-medium">{formatMaloti(collected)}</span>
      </div>
    </div>
  );
}

export function CollectedVsDisbursedChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={176}>
      <AreaChart data={data} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="disbursedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--success)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="0" />
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickCount={3}
          width={46}
          tick={{ fill: "var(--muted-foreground)", fontSize: 10.5 }}
          tickFormatter={(v: number) => compactMaloti(v)}
        />
        <Tooltip content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="disbursed"
          stroke="var(--primary)"
          strokeWidth={2}
          fill="url(#disbursedFill)"
        />
        <Area
          type="monotone"
          dataKey="collected"
          stroke="var(--success)"
          strokeWidth={2}
          fill="url(#collectedFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
