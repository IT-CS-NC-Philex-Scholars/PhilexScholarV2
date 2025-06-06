import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ApplicationPipelineProps {
    stats: {
        applicationStats: Record<string, number>;
    };
}

export default function ApplicationPipeline({ stats }: ApplicationPipelineProps) {
    const totalApplications = Object.values(stats.applicationStats).reduce((sum, count) => sum + count, 0);

    const approvedCount = (stats.applicationStats['approved'] || 0) + (stats.applicationStats['enrolled'] || 0);
    const enrolledCount = stats.applicationStats['enrolled'] || 0;

    const pipelineData = [
        {
            name: 'Total Applications',
            value: totalApplications,
            rate: totalApplications > 0 ? 100 : 0,
        },
        {
            name: 'Approved',
            value: approvedCount,
            rate: totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0,
        },
        {
            name: 'Enrolled',
            value: enrolledCount,
            rate: approvedCount > 0 ? Math.round((enrolledCount / approvedCount) * 100) : 0,
        },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Application Pipeline</CardTitle>
                <CardDescription>Conversion rates through the application funnel.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {pipelineData.map((stage) => (
                        <div key={stage.name} className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <p className="text-sm font-medium">{stage.name}</p>
                                <div className="flex items-baseline gap-x-2">
                                    <span className="text-2xl font-bold">{stage.value}</span>
                                    {stage.name !== 'Total Applications' && (
                                        <span className="text-sm text-muted-foreground">({stage.rate}%)</span>
                                    )}
                                </div>
                            </div>
                            <Progress value={stage.rate} />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
} 