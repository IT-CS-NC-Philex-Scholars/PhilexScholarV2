import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface StudentDemographicsProps {
    stats: {
        studentDemographicsBySchoolName: Record<string, number>;
    };
}

export default function StudentDemographics({ stats }: StudentDemographicsProps) {
    const studentDemographicsChartData = Object.entries(stats.studentDemographicsBySchoolName)
        .map(([name, count]) => ({
            name: name === '' || name === null ? 'Unknown' : name,
            count: count,
        }))
        .filter((item) => item.count > 0);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Student Demographics</CardTitle>
                <CardDescription>Distribution of students by school name (Top 10).</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={studentDemographicsChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-primary)" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
