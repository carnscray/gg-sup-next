'use client';

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
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

const chartConfig = {
    revenue: {
        label: "Total Revenue",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

interface WeeklyRevenueChartProps {
    data: { week: string; revenue: number }[];
}

export function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {

    if (!data || data.length === 0) {
        return (
            <Card className="col-span-full xl:col-span-4">
                <CardHeader>
                    <CardTitle>Weekly Revenue</CardTitle>
                    <CardDescription>Weeks ending on Sunday</CardDescription>
                </CardHeader>
                <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
                    No revenue data found for this period.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full xl:col-span-4">
            <CardHeader>
                <CardTitle>Weekly Revenue</CardTitle>
                <CardDescription>Weeks ending on Sunday</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart
                        accessibilityLayer
                        data={data}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />

                        <XAxis
                            dataKey="week"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />

                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => `$${value}`}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent formatter={(value) => `$${value}`} />}
                        />

                        <Line
                            dataKey="revenue"
                            type="monotone"
                            stroke="var(--color-revenue)"
                            strokeWidth={2}
                            dot={{
                                r: 4,
                            }}
                            activeDot={{
                                r: 6,
                            }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}