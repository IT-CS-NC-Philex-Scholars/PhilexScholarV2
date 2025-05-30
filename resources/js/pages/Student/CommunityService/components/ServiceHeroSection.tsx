import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Timer } from 'lucide-react';

interface ServiceHeroSectionProps {
    serviceStatus: {
        status: string;
        color: string;
        bgColor: string;
    };
    scholarshipName: string;
    applicationId: number;
    activeEntry: any;
    progressPercentage: number;
    currentTotalHours: number;
    totalHoursCompleted: number;
    requiredHours: number;
    elapsedTime: {
        hours: number;
        minutes: number;
        seconds: number;
    };
}

export default function ServiceHeroSection({
    serviceStatus,
    scholarshipName,
    applicationId,
    activeEntry,
    progressPercentage,
    currentTotalHours,
    totalHoursCompleted,
    requiredHours,
    elapsedTime
}: ServiceHeroSectionProps) {
    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <div className="relative overflow-hidden">
            <Card className="border-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground">
                <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${serviceStatus.bgColor} animate-pulse-subtle`}></div>
                                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                                    {formatStatus(serviceStatus.status)}
                                </Badge>
                            </div>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                                    Community Service Dashboard
                                </h1>
                                <p className="text-primary-foreground/80 text-lg mt-2">
                                    {scholarshipName} • Application #{applicationId}
                                </p>
                            </div>
                            
                            {activeEntry && (
                                <div className="flex items-center gap-2 bg-primary-foreground/20 rounded-lg p-3 backdrop-blur-sm">
                                    <Timer className="h-5 w-5 text-orange-300" />
                                    <div>
                                        <p className="font-semibold">Active Session Running</p>
                                        <p className="text-sm text-primary-foreground/80">
                                            Started at {activeEntry.time_in} • {activeEntry.task_description}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-center lg:items-end text-center lg:text-right">
                            <div className="relative">
                                <div className="w-32 h-32 lg:w-40 lg:h-40">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            className="text-primary-foreground/20"
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="none"
                                            strokeDasharray={`${progressPercentage * 2.51} 251`}
                                            className="text-primary-foreground transition-all duration-1000 ease-out-expo"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl lg:text-3xl font-bold">
                                            {Math.round(progressPercentage)}%
                                        </span>
                                        <span className="text-xs lg:text-sm text-primary-foreground/80">
                                            Complete
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1">
                                <p className="text-2xl font-bold">
                                    {activeEntry ? currentTotalHours.toFixed(1) : totalHoursCompleted.toFixed(1)} / {requiredHours}
                                </p>
                                <p className="text-primary-foreground/80">
                                    {activeEntry ? 'Current Hours (Live)' : 'Hours Completed'}
                                </p>
                                {activeEntry && (
                                    <div className="text-sm text-primary-foreground/90 mt-2 flex items-center gap-2">
                                        <Timer className="h-4 w-4 animate-pulse" />
                                        <span className="font-mono">
                                            {String(elapsedTime.hours).padStart(2, '0')}:
                                            {String(elapsedTime.minutes).padStart(2, '0')}:
                                            {String(elapsedTime.seconds).padStart(2, '0')}
                                        </span>
                                        <span className="text-xs">elapsed</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Progress Bar */}
                    <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Overall Progress</span>
                            <span>{currentTotalHours < requiredHours ? `${(requiredHours - currentTotalHours).toFixed(1)} hours remaining` : 'Requirements met!'}</span>
                        </div>
                        <Progress 
                            value={progressPercentage} 
                            className="h-2 bg-primary-foreground/20" 
                            indicatorClassName="bg-primary-foreground"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}