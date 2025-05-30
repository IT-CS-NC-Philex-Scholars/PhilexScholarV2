import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CommunityServiceEntry, CommunityServiceReport, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import {
    Clock,
    Calendar,
    CheckCircle2,
    PlayCircle,
    PlusCircle,
    Upload,
    History,
    Award,
    Timer,
    FileText,
    BarChart3,
    Activity,
    Zap,
    ArrowRight,
    Eye,
    Download,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

// Import components
import ServiceHeroSection from './components/ServiceHeroSection';
import QuickStatsGrid from './components/QuickStatsGrid';
import ServiceProgressCard from './components/ServiceProgressCard';
import NextStepsCard from './components/NextStepsCard';
import EndSessionDialog from './components/EndSessionDialog';
import CancelSessionDialog from './components/CancelSessionDialog';

interface CommunityServiceDashboardProps {
    application: ScholarshipApplication;
    scholarship: ScholarshipProgram;
    serviceReports: CommunityServiceReport[];
    serviceEntries: CommunityServiceEntry[];
    totalDaysCompleted: number;
    totalHoursCompleted: number;
    requiredDays: number;
    requiredHours: number;
    remainingDays: number;
    remainingHours: number;
}

export default function Dashboard({
    application,
    scholarship,
    serviceReports,
    serviceEntries,
    totalDaysCompleted,
    totalHoursCompleted,
    requiredDays,
    requiredHours,
    remainingDays,
    remainingHours,
}: CommunityServiceDashboardProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showStartDialog, setShowStartDialog] = useState(false);
    const [showLogDialog, setShowLogDialog] = useState(false);
    const [showPdfDialog, setShowPdfDialog] = useState(false);
    const [showEndDialog, setShowEndDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showUndoDialog, setShowUndoDialog] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [undoReportId, setUndoReportId] = useState<number|null>(null);
    const [showUndoReportDialog, setShowUndoReportDialog] = useState(false);

    const activeEntry = serviceEntries.find(entry => entry.status === 'in_progress');

    // Real-time timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeEntry) {
            interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 1000);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [activeEntry]);

    // Calculate elapsed time for active session
    const getElapsedTime = () => {
        if (!activeEntry) return { hours: 0, minutes: 0, seconds: 0 };

        try {
            // Handle different date formats and extract just the date part
            let serviceDateStr = activeEntry.service_date;

            if (typeof serviceDateStr === 'object' && serviceDateStr && 'date' in serviceDateStr) {
                // Carbon object format
                serviceDateStr = (serviceDateStr as any).date.split(' ')[0];
            } else if (typeof serviceDateStr === 'string') {
                // Handle ISO datetime strings like "2025-05-24T00:00:00.000000Z"
                if (serviceDateStr.includes('T')) {
                    serviceDateStr = serviceDateStr.split('T')[0];
                } else if (serviceDateStr.includes(' ')) {
                    // Handle datetime strings with space
                    serviceDateStr = serviceDateStr.split(' ')[0];
                }
                // If it's already in YYYY-MM-DD format, leave as-is
            } else {
                // Fallback to today's date
                serviceDateStr = new Date().toISOString().split('T')[0];
            }

            // Create the start datetime by combining service date with time_in
            const startDate = new Date(`${serviceDateStr}T${activeEntry.time_in}:00`);
            const now = currentTime;

            // Validate the dates
            if (isNaN(startDate.getTime()) || isNaN(now.getTime())) {
                console.error('Invalid date in getElapsedTime:', {
                    originalServiceDate: activeEntry.service_date,
                    parsedServiceDate: serviceDateStr,
                    time_in: activeEntry.time_in,
                    constructedStartDate: `${serviceDateStr}T${activeEntry.time_in}:00`,
                    now
                });
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            const diffMs = now.getTime() - startDate.getTime();

            if (diffMs < 0) return { hours: 0, minutes: 0, seconds: 0 };

            const totalSeconds = Math.floor(diffMs / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            return { hours, minutes, seconds };
        } catch (error) {
            console.error('Error calculating elapsed time:', error, activeEntry);
            return { hours: 0, minutes: 0, seconds: 0 };
        }
    };

    const elapsedTime = getElapsedTime();
    const elapsedHours = elapsedTime.hours + (elapsedTime.minutes / 60);
    const currentTotalHours = totalHoursCompleted + elapsedHours;
    const progressPercentage = requiredHours > 0 ? Math.min(100, (currentTotalHours / requiredHours) * 100) : 0;

    // Determine service status
    const getServiceStatus = () => {
        if (activeEntry) return { status: 'active', color: 'orange', bgColor: 'bg-orange-500' };
        if (currentTotalHours >= requiredHours) return { status: 'completed', color: 'green', bgColor: 'bg-green-500' };
        if (serviceReports.some(r => r.status === 'pending_review')) return { status: 'pending', color: 'blue', bgColor: 'bg-blue-500' };
        if (serviceReports.some(r => r.status.startsWith('rejected_'))) return { status: 'action_required', color: 'red', bgColor: 'bg-red-500' };
        return { status: 'in_progress', color: 'gray', bgColor: 'bg-gray-500' };
    };

    const serviceStatusInfo = getServiceStatus();

    // Form hooks
    const {
        data: entryData,
        setData: setEntryData,
        post: postEntry,
        errors: entryErrors,
        processing: entryProcessing,
        reset: resetEntryForm,
    } = useForm({
        service_date: new Date().toISOString().split('T')[0],
        time_in: new Date().toTimeString().slice(0, 5),
        task_description: '',
    });

    const {
        data: endData,
        setData: setEndData,
        patch: patchEnd,
        errors: endErrors,
        processing: endProcessing,
        reset: resetEndForm,
    } = useForm({
        time_out: new Date().toTimeString().slice(0, 5),
        lessons_learned: '',
        photos: [] as File[],
    });

    const {
        data: logData,
        setData: setLogData,
        post: postLog,
        errors: logErrors,
        processing: logProcessing,
        reset: resetLogForm,
    } = useForm({
        report_type: 'tracked',
        service_date: '',
        total_hours: '',
        description: '',
        lessons_learned: '',
    });

    const {
        data: pdfData,
        setData: setPdfData,
        post: postPdf,
        errors: pdfErrors,
        processing: pdfProcessing,
        reset: resetPdfForm,
    } = useForm({
        report_type: 'pdf_upload',
        pdf_report: null as File | null,
    });

    // Form handlers
    const handleStartEntry = (e: React.FormEvent) => {
        e.preventDefault();
        postEntry(route('student.community-service.start-entry', application.id), {
            onSuccess: () => {
                toast.success('Service session started successfully!');
                resetEntryForm();
                setShowStartDialog(false);
            },
            onError: () => {
                toast.error('Failed to start session. Please check the form.');
            }
        });
    };

    const handleEndEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeEntry) return;

        // Validate that end time is after start time
        const startTime = activeEntry.time_in;
        const endTime = endData.time_out;

        if (!endTime) {
            toast.error('Please enter an end time.');
            return;
        }

        // More robust time comparison
        try {
            // Parse times properly and handle potential formatting issues
            const startTimeParts = startTime.split(':');
            const endTimeParts = endTime.split(':');

            const startHour = parseInt(startTimeParts[0], 10);
            const startMinute = parseInt(startTimeParts[1], 10);
            const endHour = parseInt(endTimeParts[0], 10);
            const endMinute = parseInt(endTimeParts[1], 10);

            // Convert to total minutes for comparison
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;

            if (endTotalMinutes <= startTotalMinutes) {
                toast.error(`End time (${endTime}) must be after start time (${startTime}).`);
                return;
            }
        } catch (error) {
            console.error('Error parsing times:', error);
            toast.error('Invalid time format. Please check your times.');
            return;
        }

        patchEnd(route('student.community-service.end-entry', [application.id, activeEntry.id]), {
            onSuccess: () => {
                toast.success('Service session completed successfully!');
                resetEndForm();
                setShowEndDialog(false);
                // Let Inertia handle the page refresh automatically
            },
            onError: (errors) => {
                console.error('End session errors:', errors);
                if (errors.time_out) {
                    toast.error(errors.time_out);
                } else {
                    toast.error('Failed to complete session. Please check the form.');
                }
            }
        });
    };

    const handleLogPastService = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate hours input
        const hoursValue = parseFloat(logData.total_hours as string) || 0;

        if (hoursValue < 0.5) {
            toast.error('Hours must be at least 0.5');
            return;
        }

        setLogData('total_hours', hoursValue.toString());

        // Small delay to ensure data is set
        setTimeout(() => {
            postLog(route('student.community-service.store', application.id), {
                onSuccess: () => {
                    toast.success('Past service logged successfully!');
                    resetLogForm();
                    setShowLogDialog(false);
                },
                onError: (errors) => {
                    console.error('Log past service errors:', errors);
                    toast.error('Failed to log past service. Please check the form.');
                }
            });
        }, 10);
    };

    const handleCancelSession = () => {
        if (!activeEntry) return;

        // Use DELETE method to cancel/delete the active entry
        router.delete(route('student.community-service.cancel-entry', [application.id, activeEntry.id]), {
            onSuccess: () => {
                toast.success('Session cancelled successfully.');
                setShowCancelDialog(false);
                // Let Inertia handle the page refresh automatically
            },
            onError: (errors: any) => {
                console.error('Cancel session errors:', errors);
                toast.error('Failed to cancel session. Please try again.');
            }
        });
    };

    const handlePdfUpload = (e: React.FormEvent) => {
        e.preventDefault();
        postPdf(route('student.community-service.store', application.id), {
            onSuccess: () => {
                toast.success('PDF report uploaded successfully!');
                resetPdfForm();
                setShowPdfDialog(false);
            },
            onError: () => {
                toast.error('Failed to upload PDF. Please check the form.');
            }
        });
    };

    const handleUndoServiceCompletion = () => {
        router.post(route('student.community-service.undo-completion', application.id), {}, {
            onSuccess: () => {
                toast.success('Service completion has been undone. You may continue reporting.');
                setShowUndoDialog(false);
            },
            onError: () => {
                toast.error('Failed to undo service completion.');
                setShowUndoDialog(false);
            }
        });
    };

    const handleUndoReport = (reportId: number) => {
        setUndoReportId(reportId);
        setShowUndoReportDialog(true);
    };

    const confirmUndoReport = () => {
        if (!undoReportId) return;
        router.delete(route('student.community-service.report.undo', { application: application.id, report: undoReportId }), {
            onSuccess: () => {
                toast.success('Report has been undone/deleted.');
                setShowUndoReportDialog(false);
                setUndoReportId(null);
            },
            onError: () => {
                toast.error('Failed to undo report.');
                setShowUndoReportDialog(false);
                setUndoReportId(null);
            }
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Student Dashboard', href: route('student.dashboard') },
        { title: 'My Applications', href: route('student.applications.index') },
        { title: 'Application Details', href: route('student.applications.show', application.id) },
        { title: 'Community Service' },
    ];

    // Combined activity timeline
    const combinedActivity = [
        ...serviceEntries.map(entry => ({
            ...entry,
            type: 'session',
            date: entry.created_at,
            title: 'Service Session',
            description: entry.task_description,
            hours: entry.hours_completed,
            icon: Timer
        })),
        ...serviceReports.map(report => ({
            ...report,
            type: 'report',
            date: report.submitted_at,
            title: report.report_type === 'pdf_upload' ? 'PDF Report Submitted' : 'Service Hours Logged',
            description: report.description,
            hours: report.total_hours,
            icon: FileText
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusBadgeVariant = (status: string) => {
        if (['approved', 'completed'].includes(status)) return 'default';
        if (status.startsWith('rejected_')) return 'destructive';
        if (['pending_review', 'in_progress'].includes(status)) return 'secondary';
        return 'outline';
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Community Service Dashboard" />

            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
                    {/* Undo Service Completion Button */}
                    {application.status === 'service_completed' && (
                        <div className="mb-6">
                            <Button variant="destructive" onClick={() => setShowUndoDialog(true)}>
                                Undo Service Completion
                            </Button>
                        </div>
                    )}

                    {/* Hero Section */}
                    <ServiceHeroSection
                        serviceStatus={serviceStatusInfo}
                        scholarshipName={scholarship.name}
                        applicationId={application.id}
                        activeEntry={activeEntry}
                        progressPercentage={progressPercentage}
                        currentTotalHours={currentTotalHours}
                        totalHoursCompleted={totalHoursCompleted}
                        requiredHours={requiredHours}
                        elapsedTime={elapsedTime}
                    />

                    {/* Quick Stats Grid */}
                    <QuickStatsGrid
                        currentTotalHours={currentTotalHours}
                        totalHoursCompleted={totalHoursCompleted}
                        activeEntry={activeEntry}
                        requiredHours={requiredHours}
                        serviceEntries={serviceEntries}
                        serviceReports={serviceReports}
                    />

                    {/* Main Content Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="actions" className="flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                <span className="hidden sm:inline">Quick Actions</span>
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex items-center gap-2">
                                <History className="h-4 w-4" />
                                <span className="hidden sm:inline">Activity</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Progress Details */}
                                <ServiceProgressCard
                                    totalHoursCompleted={totalHoursCompleted}
                                    requiredHours={requiredHours}
                                    totalDaysCompleted={totalDaysCompleted}
                                    requiredDays={requiredDays}
                                    serviceEntries={serviceEntries}
                                    remainingHours={remainingHours}
                                    progressPercentage={progressPercentage}
                                />

                                {/* Status & Next Steps */}
                                <NextStepsCard
                                    activeEntry={activeEntry}
                                    progressPercentage={progressPercentage}
                                    onStartSession={() => setShowStartDialog(true)}
                                    onLogPastService={() => setShowLogDialog(true)}
                                    onCompleteSession={() => setShowEndDialog(true)}
                                    onCancelSession={() => setShowCancelDialog(true)}
                                />
                            </div>
                        </TabsContent>

                        <TabsContent value="actions" className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {/* Start Live Session */}
                                <Card className="hover:shadow-lg transition-all duration-300 group">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                                <PlayCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Start Live Session</CardTitle>
                                                <CardDescription className="text-sm">
                                                    Clock in and track hours in real-time
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>Perfect for active service</span>
                                            </div>
                                            <Button
                                                onClick={() => setShowStartDialog(true)}
                                                className="w-full"
                                                disabled={!!activeEntry}
                                            >
                                                {activeEntry ? 'Session Active' : 'Start Session'}
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Log Past Service */}
                                <Card className="hover:shadow-lg transition-all duration-300 group">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                                <PlusCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Log Past Service</CardTitle>
                                                <CardDescription className="text-sm">
                                                    Enter details for completed service
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>For service already done</span>
                                            </div>
                                            <Button
                                                onClick={() => setShowLogDialog(true)}
                                                className="w-full"
                                                variant="outline"
                                            >
                                                Log Hours
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Upload PDF Report */}
                                <Card className="hover:shadow-lg transition-all duration-300 group">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                                <Upload className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Upload PDF Report</CardTitle>
                                                <CardDescription className="text-sm">
                                                    Submit complete service documentation
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <FileText className="h-4 w-4" />
                                                <span>Bulk submission option</span>
                                            </div>
                                            <Button
                                                onClick={() => setShowPdfDialog(true)}
                                                className="w-full"
                                                variant="outline"
                                            >
                                                Upload PDF
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <History className="h-5 w-5" />
                                                Activity Timeline
                                            </CardTitle>
                                            <CardDescription>
                                                Complete history of your service activities
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Filter className="h-4 w-4 mr-2" />
                                                Filter
                                            </Button>
                                            <Button variant="outline" size="sm">
                                                <Download className="h-4 w-4 mr-2" />
                                                Export
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="h-96">
                                        {combinedActivity.length > 0 ? (
                                            <div className="space-y-4">
                                                {combinedActivity.map((item, index) => (
                                                    <div key={`${item.type}-${item.id}-${index}`} className="flex gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                                                        <div className="flex-shrink-0">
                                                            <div className="w-10 h-10 bg-background border-2 border-muted-foreground/20 rounded-full flex items-center justify-center">
                                                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-semibold">{item.title}</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <Badge variant={getStatusBadgeVariant(item.status)}>
                                                                        {formatStatus(item.status)}
                                                                    </Badge>
                                                                    {item.type === 'report' && item.status !== 'approved' && (
                                                                        <Button variant="outline" size="sm" onClick={() => handleUndoReport(item.id)}>
                                                                            Undo
                                                                        </Button>
                                                                    )}
                                                                    <Button variant="ghost" size="sm">
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(item.date).toLocaleDateString()}
                                                                </span>
                                                                {item.hours > 0 && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {item.hours} hours
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                                <h3 className="font-semibold text-lg mb-2">No Activity Yet</h3>
                                                <p className="text-muted-foreground mb-4">
                                                    Start logging your community service to see your activity here.
                                                </p>
                                                <Button onClick={() => setActiveTab('actions')}>
                                                    Get Started
                                                </Button>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Dialogs */}
                <StartSessionDialog
                    open={showStartDialog}
                    onOpenChange={setShowStartDialog}
                    data={entryData}
                    setData={setEntryData}
                    onSubmit={handleStartEntry}
                    errors={entryErrors}
                    processing={entryProcessing}
                />

                <EndSessionDialog
                    open={showEndDialog}
                    onOpenChange={setShowEndDialog}
                    data={endData}
                    setData={setEndData}
                    onSubmit={handleEndEntry}
                    errors={endErrors}
                    processing={endProcessing}
                    activeEntry={activeEntry}
                    elapsedTime={elapsedTime}
                />

                <LogPastServiceDialog
                    open={showLogDialog}
                    onOpenChange={setShowLogDialog}
                    data={logData}
                    setData={setLogData}
                    onSubmit={handleLogPastService}
                    errors={logErrors}
                    processing={logProcessing}
                />

                <UploadPdfDialog
                    open={showPdfDialog}
                    onOpenChange={setShowPdfDialog}
                    data={pdfData}
                    setData={setPdfData}
                    onSubmit={handlePdfUpload}
                    errors={pdfErrors}
                    processing={pdfProcessing}
                />

                <CancelSessionDialog
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                    onConfirm={handleCancelSession}
                    activeEntry={activeEntry}
                    elapsedTime={elapsedTime}
                />

                {/* Undo Service Completion Dialog */}
                <Dialog open={showUndoDialog} onOpenChange={setShowUndoDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Undo Service Completion</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to undo service completion? This will allow you to continue reporting community service.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowUndoDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="button" variant="destructive" onClick={handleUndoServiceCompletion} className="flex-1">
                                Undo Service Completion
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Undo Report Dialog */}
                <Dialog open={showUndoReportDialog} onOpenChange={setShowUndoReportDialog}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Undo Report</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to undo/delete this report? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowUndoReportDialog(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="button" variant="destructive" onClick={confirmUndoReport} className="flex-1">
                                Undo Report
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

// Dialog Components
const StartSessionDialog: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: any;
    setData: (field: string, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    errors: any;
    processing: boolean;
}> = ({ open, onOpenChange, data, setData, onSubmit, errors, processing }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-blue-600" />
                    Start Live Session
                </DialogTitle>
                <DialogDescription>
                    Begin tracking your community service in real-time
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="service_date">Service Date</Label>
                        <Input
                            id="service_date"
                            type="date"
                            value={data.service_date}
                            onChange={e => setData('service_date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className={errors.service_date ? 'border-red-500' : ''}
                        />
                        {errors.service_date && <p className="text-sm text-red-600 mt-1">{errors.service_date}</p>}
                    </div>

                    <div>
                        <Label htmlFor="time_in">Start Time</Label>
                        <Input
                            id="time_in"
                            type="time"
                            value={data.time_in}
                            onChange={e => setData('time_in', e.target.value)}
                            className={errors.time_in ? 'border-red-500' : ''}
                        />
                        {errors.time_in && <p className="text-sm text-red-600 mt-1">{errors.time_in}</p>}
                    </div>

                    <div>
                        <Label htmlFor="task_description">What will you be doing?</Label>
                        <Textarea
                            id="task_description"
                            value={data.task_description}
                            onChange={e => setData('task_description', e.target.value)}
                            placeholder="Describe your service activities..."
                            rows={3}
                            className={errors.task_description ? 'border-red-500' : ''}
                        />
                        {errors.task_description && <p className="text-sm text-red-600 mt-1">{errors.task_description}</p>}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} className="flex-1">
                        {processing ? 'Starting...' : 'Start Session'}
                    </Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
);

const LogPastServiceDialog: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: any;
    setData: (field: string, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    errors: any;
    processing: boolean;
}> = ({ open, onOpenChange, data, setData, onSubmit, errors, processing }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <PlusCircle className="h-5 w-5 text-green-600" />
                    Log Past Service
                </DialogTitle>
                <DialogDescription>
                    Enter details for service you've already completed
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="service_date">Service Date</Label>
                        <Input
                            id="service_date"
                            type="date"
                            value={data.service_date}
                            onChange={e => setData('service_date', e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className={errors.service_date ? 'border-red-500' : ''}
                        />
                        {errors.service_date && <p className="text-sm text-red-600 mt-1">{errors.service_date}</p>}
                    </div>

                    <div>
                        <Label htmlFor="total_hours">Hours Completed</Label>
                        <Input
                            id="total_hours"
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={data.total_hours}
                            onChange={e => setData('total_hours', e.target.value)}
                            placeholder="e.g., 4 (half day) or 8 (full day)"
                            className={errors.total_hours ? 'border-red-500' : ''}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Days will be calculated automatically (8 hours = 1 day, 4 hours = 0.5 days)
                        </p>
                        {errors.total_hours && <p className="text-sm text-red-600 mt-1">{errors.total_hours}</p>}
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">Service Description (minimum 50 characters)</Label>
                    <Textarea
                        id="description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        placeholder="Describe what you did during your service (minimum 50 characters)..."
                        rows={4}
                        className={errors.description ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.description.length}/50 characters minimum
                    </p>
                    {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
                </div>

                <div>
                    <Label htmlFor="lessons_learned">Lessons Learned (Optional)</Label>
                    <Textarea
                        id="lessons_learned"
                        value={data.lessons_learned}
                        onChange={e => setData('lessons_learned', e.target.value)}
                        placeholder="What did you learn from this experience?"
                        rows={2}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing} className="flex-1">
                        {processing ? 'Submitting...' : 'Log Service Hours'}
                    </Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
);

const UploadPdfDialog: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: any;
    setData: (field: string, value: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    errors: any;
    processing: boolean;
}> = ({ open, onOpenChange, data, setData, onSubmit, errors, processing }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-purple-600" />
                    Upload PDF Report
                </DialogTitle>
                <DialogDescription>
                    Submit a complete service report document
                </DialogDescription>
            </DialogHeader>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
                <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">Requirements</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>• PDF format only</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Must include all service documentation</li>
                    <li>• Will mark service requirement as complete</li>
                </ul>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="pdf_report">Select PDF Report</Label>
                    <Input
                        id="pdf_report"
                        type="file"
                        accept=".pdf"
                        onChange={e => setData('pdf_report', e.target.files?.[0] || null)}
                        className={errors.pdf_report ? 'border-red-500' : ''}
                    />
                    {errors.pdf_report && <p className="text-sm text-red-600 mt-1">{errors.pdf_report}</p>}
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={processing || !data.pdf_report} className="flex-1">
                        {processing ? 'Uploading...' : 'Upload PDF Report'}
                    </Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
);