"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
} from "@/components/ui/chart";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ChartProps {
  data: { name: string; total: number }[];
  type?: "line" | "bar" | "pie";
  colors?: string[];
}

export default function Chart({
  data,
  type = "bar",
  colors = ["#55D462", "#9C66FF"],
}: ChartProps) {
  const config = data.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: colors[index % colors.length],
    };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  return (
    <ChartContainer config={config}>
      <ResponsiveContainer width="100%" height={300}>
        {type === "line" ? (
          <LineChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="total"
              stroke={colors[0]}
              strokeWidth={2}
            />
          </LineChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              outerRadius={100}
              innerRadius={60}
              label
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <ChartLegend />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="total" fill={colors[0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </ChartContainer>
  );
}
