import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, TrendingUp } from 'lucide-react';

interface ServiceProgressCardProps {
    totalHoursCompleted: number;
    requiredHours: number;
    totalDaysCompleted: number;
    requiredDays: number;
    serviceEntries: any[];
    remainingHours: number;
    progressPercentage: number;
}

export default function ServiceProgressCard({
    totalHoursCompleted,
    requiredHours,
    totalDaysCompleted,
    requiredDays,
    serviceEntries,
    remainingHours,
    progressPercentage
}: ServiceProgressCardProps) {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Progress Overview
                </CardTitle>
                <CardDescription>
                    Detailed breakdown of your community service progress
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Hours Completed</span>
                            <span className="text-sm text-muted-foreground">
                                {totalHoursCompleted.toFixed(1)} / {requiredHours}
                            </span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                        
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Days Completed</span>
                            <span className="text-sm text-muted-foreground">
                                {totalDaysCompleted} / {requiredDays}
                            </span>
                        </div>
                        <Progress 
                            value={requiredDays > 0 ? (totalDaysCompleted / requiredDays) * 100 : 0} 
                            className="h-3" 
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Average per Session</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {serviceEntries.length > 0 
                                    ? (totalHoursCompleted / serviceEntries.length).toFixed(1) 
                                    : '0.0'
                                } hours
                            </p>
                        </div>

                        <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Estimated Completion</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {remainingHours > 0 
                                    ? `${Math.ceil(remainingHours / (serviceEntries.length > 0 ? totalHoursCompleted / serviceEntries.length : 4))} more sessions`
                                    : 'Complete!'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}