"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartDataPoint } from "@/types";

const chartConfig = {
  sales: {
    label: "Sales",
    color: "black",
  },
} satisfies ChartConfig;

export function SalesChart({ data }: { data: ChartDataPoint[] }) {
  return (
    <Card className="border-zinc-200 shadow-sm bg-white font-sans">
      <CardHeader className="border-b border-zinc-50 pb-4">
        <CardTitle className="text-xs font-bold uppercase tracking-widest">
          Revenue Overview
        </CardTitle>
        <CardDescription className="text-[10px] uppercase font-medium">
          Daily sales performance for the current period
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer config={chartConfig} className="h-75 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
              top: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: string) => value.slice(0, 3)}
              className="text-[10px] font-bold"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="rgba(0,0,0,0.05)"
              fillOpacity={0.4}
              stroke="black"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}