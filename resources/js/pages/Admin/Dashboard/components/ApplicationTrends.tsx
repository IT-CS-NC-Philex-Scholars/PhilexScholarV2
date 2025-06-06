import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    LineChart,
    XAxis,
    YAxis,
    Line,
    CartesianGrid,
} from '@/components/ui/chart';

interface ApplicationTrendsProps {
    stats: {
        applicationTrends: Array<{ date: string; 'New Applications': number }>;
    };
}

export default function ApplicationTrends({ stats }: ApplicationTrendsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>New applications over the last 7 weeks.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <LineChart accessibilityLayer data={stats.applicationTrends}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Line
                            dataKey="New Applications"
                            type="natural"
                            stroke="var(--color-primary)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
