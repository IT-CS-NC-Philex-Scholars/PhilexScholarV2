import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, BookOpen, CheckCircle2, PlayCircle, PlusCircle, XCircle } from 'lucide-react';

interface NextStepsCardProps {
    activeEntry: any;
    progressPercentage: number;
    onStartSession: () => void;
    onLogPastService: () => void;
    onCompleteSession: () => void;
    onCancelSession: () => void;
}

export default function NextStepsCard({
    activeEntry,
    progressPercentage,
    onStartSession,
    onLogPastService,
    onCompleteSession,
    onCancelSession
}: NextStepsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Next Steps
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {activeEntry ? (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                            <span className="font-semibold text-orange-700 dark:text-orange-300">
                                Session Active
                            </span>
                        </div>
                        <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                            Complete your current session to log hours
                        </p>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                onClick={onCompleteSession}
                                className="flex-1"
                            >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Complete Session
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={onCancelSession}
                                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancel Session
                            </Button>
                        </div>
                    </div>
                ) : progressPercentage >= 100 ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
                        <Award className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="font-semibold text-green-700 dark:text-green-300">
                            Requirements Complete!
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Congratulations on completing your community service.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Choose an action to continue your service:
                        </p>
                        <div className="space-y-2">
                            <Button 
                                size="sm" 
                                onClick={onStartSession}
                                className="w-full justify-start"
                                variant="outline"
                            >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Start Live Session
                            </Button>
                            <Button 
                                size="sm" 
                                onClick={onLogPastService}
                                className="w-full justify-start"
                                variant="outline"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Log Past Service
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}