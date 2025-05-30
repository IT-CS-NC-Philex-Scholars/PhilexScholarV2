import { Card, CardContent } from '@/components/ui/card';
import { Activity, CheckCircle2, FileText, Target } from 'lucide-react';

interface QuickStatsGridProps {
    currentTotalHours: number;
    totalHoursCompleted: number;
    activeEntry: any;
    requiredHours: number;
    serviceEntries: any[];
    serviceReports: any[];
}

export default function QuickStatsGrid({
    currentTotalHours,
    totalHoursCompleted,
    activeEntry,
    requiredHours,
    serviceEntries,
    serviceReports
}: QuickStatsGridProps) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 animate-counter">
                                {activeEntry ? currentTotalHours.toFixed(1) : totalHoursCompleted.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {activeEntry ? 'Live Hours' : 'Hours Done'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 animate-counter">
                                {Math.max(0, requiredHours - currentTotalHours).toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground">Hours Left</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 animate-counter">
                                {serviceEntries.length}
                            </p>
                            <p className="text-xs text-muted-foreground">Sessions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 animate-counter">
                                {serviceReports.length}
                            </p>
                            <p className="text-xs text-muted-foreground">Reports</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}