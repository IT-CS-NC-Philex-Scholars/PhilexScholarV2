import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line, CartesianGrid } from 'recharts';

interface ApplicationTrendsProps {
    stats: {
        applicationTrends: Array<{ date: string; 'New Applications': number }>;
    };
    chartColors: {
        mutedForeground: string;
        primary: string;
    };
}

export default function ApplicationTrends({ stats, chartColors }: ApplicationTrendsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <CardDescription>New applications over the last 7 weeks.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.applicationTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="date"
                            stroke={chartColors.mutedForeground}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis stroke={chartColors.mutedForeground} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'hsla(var(--muted))' }}
                            contentStyle={{
                                backgroundColor: 'hsla(var(--background))',
                                borderColor: 'hsla(var(--border))',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="New Applications"
                            stroke={chartColors.primary}
                            strokeWidth={2}
                            dot={{ r: 4, fill: chartColors.primary }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
