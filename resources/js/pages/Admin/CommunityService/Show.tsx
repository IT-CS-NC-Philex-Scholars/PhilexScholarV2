import React, { useMemo, useState, useEffect } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AppLayout from '@/layouts/app-layout';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Download,
    Clock,
    MapPin,
    Phone,
    Mail,
    GraduationCap,
    School,
    Calendar,
    Timer,
    FileText,
    Image,
    Activity,
    User,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Upload,
} from 'lucide-react';
import axios from 'axios';

// Constants
const HOURS_PER_DAY = 8;

// Interfaces
interface UserData {
    id: number;
    name: string;
    email: string;
}

interface StudentProfile {
    id: number;
    user: UserData;
    phone_number: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    school_name: string;
    school_level: string;
    school_type: 'public' | 'private';
    gpa?: number | string | null;
}

interface ScholarshipProgramData {
    id: number;
    name: string;
    community_service_days: number;
}

interface CommunityServiceEntry {
    id: number;
    scholarship_application_id: number;
    service_date: string;
    time_in: string;
    time_out?: string | null;
    task_description: string;
    lessons_learned?: string | null;
    photos?: string[] | null;
    hours_completed: number;
    status: 'in_progress' | 'completed' | 'approved' | 'rejected' | 'pending_review';
    admin_notes?: string | null;
    created_at: string;
    updated_at: string;
}

interface ScholarshipApplicationData {
    id: number;
    student_profile_id: number;
    scholarship_program_id: number;
    status: string;
    studentProfile: StudentProfile;
    scholarshipProgram: ScholarshipProgramData;
}

interface Report {
    id: number;
    scholarship_application_id: number;
    description: string;
    days_completed: number;
    status: 'pending_review' | 'approved' | 'rejected_incomplete' | 'rejected_guidelines' | 'rejected_other';
    rejection_reason?: string | null;
    submitted_at?: string | null;
    reviewed_at?: string | null;
    pdf_report_path?: string | null;
    report_type: 'tracked' | 'pdf_upload';
    total_hours: number;
    created_at: string;
    updated_at: string;
    scholarshipApplication: ScholarshipApplicationData;
}

interface ShowPageProps {
    report: Report;
    entries?: CommunityServiceEntry[];
}

// Helper Functions
const formatDate = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
        return 'Invalid Date';
    }
};

const formatTime = (timeString?: string | null): string => {
    if (!timeString) return 'N/A';
    try {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return format(date, 'h:mm a');
    } catch {
        return 'Invalid Time';
    }
};

const formatStatus = (status: string): string => {
    if (!status) return 'Unknown';
    return status
        .replace(/_/g, ' ')
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved':
            return 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
        case 'pending_review':
        case 'completed':
            return 'bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
        case 'rejected':
            return 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
        case 'in_progress':
            return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
        default:
            return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
};

const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export default function Show({ report, entries = [] }: ShowPageProps) {
    const { scholarshipApplication } = report;
    const { studentProfile, scholarshipProgram } = scholarshipApplication;

    const [isReportRejectionModalOpen, setIsReportRejectionModalOpen] = useState(false);
    const [isEntryRejectionModalOpen, setIsEntryRejectionModalOpen] = useState(false);
    const [currentEntryForRejection, setCurrentEntryForRejection] = useState<CommunityServiceEntry | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentEntryForDelete, setCurrentEntryForDelete] = useState<CommunityServiceEntry | null>(null);
    const deleteForm = useForm({});
    const [isUndoModalOpen, setIsUndoModalOpen] = useState(false);
    const [currentEntryForUndo, setCurrentEntryForUndo] = useState<CommunityServiceEntry | null>(null);
    const undoForm = useForm({});
    const [approvedHours, setApprovedHours] = useState<number>(0);
    const [isCreateReportModalOpen, setIsCreateReportModalOpen] = useState(false);

    // Admin report creation form
    const adminReportForm = useForm({
        description: '',
        total_hours: '',
        days_completed: '',
        pdf_file: null as File | null,
        admin_notes: '',
    });

    const requiredServiceHours = scholarshipProgram.community_service_days * HOURS_PER_DAY;

    const { totalApprovedHoursFromEntries, approvedEntriesCount, pendingEntriesCount, rejectedEntriesCount } = useMemo(() => {
        if (report.report_type !== 'tracked') {
            return {
                totalApprovedHoursFromEntries: report.total_hours || 0,
                approvedEntriesCount: 0,
                pendingEntriesCount: 0,
                rejectedEntriesCount: 0,
            };
        }
        let approvedHours = 0;
        let approved = 0;
        let pending = 0;
        let rejected = 0;
        entries.forEach((entry) => {
            const isPendingReview = entry.status === 'pending_review' || entry.status === 'completed' || entry.status === 'in_progress';
            if (entry.status === 'approved') {
                approvedHours += entry.hours_completed;
                approved++;
            } else if (isPendingReview) {
                pending++;
            } else if (entry.status === 'rejected') {
                rejected++;
            }
        });
        return {
            totalApprovedHoursFromEntries: approvedHours,
            approvedEntriesCount: approved,
            pendingEntriesCount: pending,
            rejectedEntriesCount: rejected,
        };
    }, [entries, report.report_type, report.total_hours]);

    const progressPercentage = useMemo(() => {
        if (requiredServiceHours === 0) return 100;
        const currentHours = report.report_type === 'tracked' ? approvedHours : report.total_hours;
        return Math.min((currentHours / requiredServiceHours) * 100, 100);
    }, [approvedHours, report.total_hours, requiredServiceHours, report.report_type]);

    const canReviewReport = report.status === 'pending_review';

    // Fetch approved hours from backend
    useEffect(() => {
        const fetchApprovedHours = async () => {
            try {
                const res = await axios.get(route('admin.community-service.reports.approved-hours', { report: report.id }));
                setApprovedHours(res.data.approved_hours);
            } catch (e) {
                setApprovedHours(0);
            }
        };
        if (report.report_type === 'tracked') {
            fetchApprovedHours();
        }
    }, [report.id, report.report_type]);

    // When an entry is approved, rejected, deleted, or approval is undone, refetch approved hours
    const refreshApprovedHours = () => {
        if (report.report_type === 'tracked') {
            axios.get(route('admin.community-service.reports.approved-hours', { report: report.id }))
                .then(res => setApprovedHours(res.data.approved_hours))
                .catch(() => setApprovedHours(0));
        }
    };

    const handleReportApprove = () => {
        if (report.report_type === 'tracked' && approvedHours < requiredServiceHours) {
            toast.error('Cannot approve report.', {
                description: `Required ${requiredServiceHours} hours not met. Only ${approvedHours.toFixed(2)} approved hours from entries.`,
            });
            return;
        }
        setIsProcessing(true);
        router.patch(route('admin.community-service.reports.update-status', { report: report.id }), {
            status: 'approved',
            rejection_reason: ''
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Report approved successfully.');
                setIsProcessing(false);
            },
            onError: (errors: Record<string, string>) => {
                toast.error('Failed to approve report.', { description: Object.values(errors).join('\n') || 'An unknown error occurred.' });
                setIsProcessing(false);
            }
        });
    };

    const openReportRejectionModal = () => {
        setRejectionReason('');
        setIsReportRejectionModalOpen(true);
    };

    const submitReportRejection = () => {
        if (!rejectionReason.trim()) {
            toast.warning('Rejection reason is required.');
            return;
        }
        setIsProcessing(true);
        router.patch(route('admin.community-service.reports.update-status', { report: report.id }), {
            status: 'rejected_other',
            rejection_reason: rejectionReason
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Report rejected successfully.');
                setIsReportRejectionModalOpen(false);
                setRejectionReason('');
                setIsProcessing(false);
            },
            onError: (errors: Record<string, string>) => {
                toast.error('Failed to reject report.', { description: Object.values(errors).join('\n') || 'An unknown error occurred.' });
                setIsProcessing(false);
            }
        });
    };

    const handleEntryReview = (entry: CommunityServiceEntry, action: 'approve' | 'reject') => {
        if (action === 'approve') {
            setIsProcessing(true);
            router.patch(route('admin.community-service.entries.update-status', { entry: entry.id }), {
                status: 'approved',
                admin_notes: ''
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Entry #${entry.id} approved.`);
                    setIsProcessing(false);
                    refreshApprovedHours();
                },
                onError: (errors: Record<string, string>) => {
                    toast.error(`Failed to approve entry #${entry.id}.`, {
                        description: Object.values(errors).join('\n') || 'An unknown error occurred.',
                    });
                    setIsProcessing(false);
                }
            });
        } else {
            setCurrentEntryForRejection(entry);
            setAdminNotes('');
            setIsEntryRejectionModalOpen(true);
        }
    };

    const submitEntryRejection = () => {
        if (!currentEntryForRejection) return;
        if (!adminNotes.trim()) {
            toast.warning('Admin notes (rejection reason) are required for entry rejection.');
            return;
        }
        setIsProcessing(true);
        router.patch(route('admin.community-service.entries.update-status', { entry: currentEntryForRejection.id }), {
            status: 'rejected',
            admin_notes: adminNotes
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Entry #${currentEntryForRejection.id} rejected.`);
                setIsEntryRejectionModalOpen(false);
                setCurrentEntryForRejection(null);
                setAdminNotes('');
                setIsProcessing(false);
                refreshApprovedHours();
            },
            onError: (errors: Record<string, string>) => {
                toast.error(`Failed to reject entry #${currentEntryForRejection.id}.`, {
                    description: Object.values(errors).join('\n') || 'An unknown error occurred.',
                });
                setIsProcessing(false);
            }
        });
    };

    const handleEntryDelete = (entry: CommunityServiceEntry) => {
        setCurrentEntryForDelete(entry);
        setIsDeleteModalOpen(true);
    };

    const submitEntryDelete = () => {
        if (!currentEntryForDelete) return;
        deleteForm.delete(route('admin.community-service.entries.destroy', { entry: currentEntryForDelete.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Entry #${currentEntryForDelete.id} deleted.`);
                setIsDeleteModalOpen(false);
                setCurrentEntryForDelete(null);
                refreshApprovedHours();
            },
            onError: (errors: Record<string, string>) => {
                toast.error(`Failed to delete entry #${currentEntryForDelete.id}.`, {
                    description: Object.values(errors).join('\n') || 'An unknown error occurred.',
                });
                setIsDeleteModalOpen(false);
                setCurrentEntryForDelete(null);
            }
        });
    };

    const handleEntryUndoApproval = (entry: CommunityServiceEntry) => {
        setCurrentEntryForUndo(entry);
        setIsUndoModalOpen(true);
    };

    const submitEntryUndoApproval = () => {
        if (!currentEntryForUndo) return;
        undoForm.patch(route('admin.community-service.entries.undo-approval', { entry: currentEntryForUndo.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Approval for entry #${currentEntryForUndo.id} has been undone.`);
                setIsUndoModalOpen(false);
                setCurrentEntryForUndo(null);
                refreshApprovedHours();
            },
            onError: (errors: Record<string, string>) => {
                toast.error(`Failed to undo approval for entry #${currentEntryForUndo.id}.`, {
                    description: Object.values(errors).join('\n') || 'An unknown error occurred.',
                });
                setIsUndoModalOpen(false);
                setCurrentEntryForUndo(null);
            }
        });
    };

    const handleAdminReportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        adminReportForm.post(route('admin.community-service.create-report', { 
            application: report.scholarship_application_id 
        }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsCreateReportModalOpen(false);
                adminReportForm.reset();
                toast.success('Community service report created successfully.');
            },
            onError: (errors: Record<string, string>) => {
                toast.error('Failed to create report.', { 
                    description: Object.values(errors).join('\n') || 'An unknown error occurred.' 
                });
            }
        });
    };

    const pdfDownloadUrl =
        report.pdf_report_path && report.report_type === 'pdf_upload'
            ? route('admin.community-service.reports.download-pdf', { report: report.id })
            : undefined;

    return (
        <AppLayout>
            <Head title={`CS Report #${report.id} - ${studentProfile.user.name}`} />

            <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
                <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.history.back()}
                                    className="h-9 w-9 p-0"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                                        Community Service Report #{report.id}
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        Review and manage community service submission
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={`${getStatusColor(report.status)} font-medium px-3 py-1`}>
                                    {formatStatus(report.status)}
                                </Badge>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <Card className="border-border bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-500 dark:bg-blue-600 rounded-xl shadow-sm">
                                            <Activity className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xl md:text-2xl font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                                                {Number(report.report_type === 'tracked' ? approvedHours : report.total_hours).toFixed(2)}
                                            </p>
                                            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Hours Completed</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {report.report_type === 'tracked' && (
                                <>
                                    <Card className="border-border bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/30 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-green-500 dark:bg-green-600 rounded-xl shadow-sm">
                                                    <CheckCircle className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xl md:text-2xl font-bold text-green-700 dark:text-green-300 tabular-nums">{approvedEntriesCount}</p>
                                                    <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Approved</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-yellow-500 dark:bg-yellow-600 rounded-xl shadow-sm">
                                                    <Clock className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xl md:text-2xl font-bold text-yellow-700 dark:text-yellow-300 tabular-nums">{pendingEntriesCount}</p>
                                                    <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">Pending</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-border bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/20 dark:to-red-900/30 border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-red-500 dark:bg-red-600 rounded-xl shadow-sm">
                                                    <XCircle className="h-5 w-5 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xl md:text-2xl font-bold text-red-700 dark:text-red-300 tabular-nums">{rejectedEntriesCount}</p>
                                                    <p className="text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wide">Rejected</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>

                        {/* Admin Tools */}
                        <div className="flex flex-col lg:flex-row gap-4 p-6 bg-gradient-to-r from-blue-50/50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                                    <p className="font-semibold text-foreground">Admin Tools</p>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Create additional reports or manage community service entries
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button 
                                    onClick={() => setIsCreateReportModalOpen(true)}
                                    variant="outline"
                                    className="shadow-md hover:shadow-lg transition-all duration-200"
                                    size="lg"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    Create Report
                                </Button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {canReviewReport && (
                            <div className="flex flex-col lg:flex-row gap-4 p-6 bg-gradient-to-r from-muted/30 to-muted/50 rounded-xl border border-border shadow-sm">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse"></div>
                                        <p className="font-semibold text-foreground">Ready to review?</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {report.report_type === 'tracked' 
                                            ? `${Number(approvedHours).toFixed(2)}/${requiredServiceHours} hours approved • ${isNaN(progressPercentage) ? 0 : Math.round(progressPercentage)}% complete`
                                            : 'PDF submission awaiting review'
                                        }
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button 
                                        onClick={handleReportApprove} 
                                        disabled={isProcessing} 
                                        className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
                                        size="lg"
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Approve Report
                                    </Button>
                                    <Button 
                                        variant="destructive" 
                                        onClick={openReportRejectionModal} 
                                        disabled={isProcessing}
                                        className="shadow-md hover:shadow-lg transition-all duration-200"
                                        size="lg"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject Report
                                    </Button>
                                    {pdfDownloadUrl && (
                                        <Button variant="outline" asChild className="shadow-md hover:shadow-lg transition-all duration-200" size="lg">
                                            <a href={pdfDownloadUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4 mr-2" />
                                                Download PDF
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                        {/* Student Information Sidebar */}
                        <div className="xl:col-span-1 space-y-6">
                            {/* Student Profile */}
                            <Card className="sticky top-6 shadow-md border-border">
                                <CardHeader className="pb-4 bg-gradient-to-r from-muted/20 to-transparent">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Student Profile
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-12 w-12">
                                            <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                                                {getInitials(studentProfile.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-foreground">{studentProfile.user.name}</p>
                                            <p className="text-sm text-muted-foreground">Student ID: {studentProfile.id}</p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{studentProfile.user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">{studentProfile.phone_number || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <div className="text-muted-foreground">
                                                <p>{studentProfile.address}</p>
                                                <p>{studentProfile.city}, {studentProfile.state} {studentProfile.zip_code}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <School className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium text-sm text-foreground">{studentProfile.school_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatStatus(studentProfile.school_level)} • {formatStatus(studentProfile.school_type)}
                                                </p>
                                            </div>
                                        </div>
                                        {studentProfile.gpa && (
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="font-medium text-sm text-foreground">GPA: {studentProfile.gpa}</p>
                                                    <p className="text-xs text-muted-foreground">Academic Performance</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Progress Card */}
                            <Card className="shadow-md border-border">
                                <CardHeader className="pb-4 bg-gradient-to-r from-muted/20 to-transparent">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded-lg">
                                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        Service Progress
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-foreground">
                                                {Number(report.report_type === 'tracked' ? approvedHours : report.total_hours).toFixed(2)} / {requiredServiceHours} hours
                                            </span>
                                            <span className="text-sm text-muted-foreground">{isNaN(progressPercentage) ? 0 : Math.round(progressPercentage)}%</span>
                                        </div>
                                        <Progress value={progressPercentage} className="h-3" />
                                        <div className="text-xs text-muted-foreground">
                                            <p className="font-medium text-foreground">{scholarshipProgram.name}</p>
                                            <p>Required: {scholarshipProgram.community_service_days} days ({requiredServiceHours} hours)</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content Area */}
                        <div className="xl:col-span-3">
                            <Tabs defaultValue="overview" className="space-y-6">
                                <TabsList className="grid w-full grid-cols-3 bg-muted p-1 rounded-xl shadow-sm">
                                    <TabsTrigger 
                                        value="overview" 
                                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                                    >
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="sessions" 
                                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200 relative"
                                    >
                                        <span className="hidden sm:inline">Service Sessions</span>
                                        <span className="sm:hidden">Sessions</span>
                                        {report.report_type === 'tracked' && pendingEntriesCount > 0 && (
                                            <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300">
                                                {pendingEntriesCount}
                                            </Badge>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="details" 
                                        className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                                    >
                                        <span className="hidden sm:inline">Report Details</span>
                                        <span className="sm:hidden">Details</span>
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="space-y-6">
                                    <Card className="shadow-md border-border">
                                        <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent">
                                            <CardTitle className="text-xl">Report Summary</CardTitle>
                                            <CardDescription className="text-base">
                                                Submitted on {formatDate(report.submitted_at)} • {formatStatus(report.report_type)} Report
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Total Days</Label>
                                                        <p className="text-lg font-semibold text-foreground">{report.days_completed} days</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Total Hours</Label>
                                                        <p className="text-lg font-semibold text-foreground">{report.total_hours} hours</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                                                        <p className="text-lg font-semibold text-foreground">{formatDate(report.submitted_at)}</p>
                                                    </div>
                                                    {report.reviewed_at && (
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Reviewed</Label>
                                                            <p className="text-lg font-semibold text-foreground">{formatDate(report.reviewed_at)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {report.description && (
                                                <div>
                                                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                                                    <div className="mt-2 p-3 bg-muted/50 rounded-lg border border-border">
                                                        <p className="text-foreground">{report.description}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {report.rejection_reason && (
                                                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                                    <div className="flex items-start gap-2">
                                                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                                                        <div>
                                                            <Label className="text-sm font-medium text-destructive">Rejection Reason</Label>
                                                            <p className="text-destructive/90 mt-1">{report.rejection_reason}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="sessions" className="space-y-6">
                                    {report.report_type === 'tracked' && entries.length > 0 ? (
                                        <div className="space-y-4">
                                            {entries.map((entry) => (
                                                <Card key={entry.id} className="hover:shadow-lg transition-all duration-200 border-border group">
                                                    <CardContent className="p-6">
                                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className={`${getStatusColor(entry.status)} text-xs`}>
                                                                        {formatStatus(entry.status)}
                                                                    </Badge>
                                                                    <span className="text-sm text-gray-600">
                                                                        Entry #{entry.id}
                                                                    </span>
                                                                </div>

                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-foreground">{formatDate(entry.service_date)}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Timer className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="text-foreground">
                                                                            {formatTime(entry.time_in)} - {formatTime(entry.time_out)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                                        <span className="font-medium text-foreground">{entry.hours_completed}h</span>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <Label className="text-xs font-medium text-muted-foreground">Task Description</Label>
                                                                    <p className="text-foreground mt-1">{entry.task_description}</p>
                                                                </div>

                                                                {entry.lessons_learned && (
                                                                    <div>
                                                                        <Label className="text-xs font-medium text-muted-foreground">Lessons Learned</Label>
                                                                        <p className="text-foreground mt-1">{entry.lessons_learned}</p>
                                                                    </div>
                                                                )}

                                                                {entry.admin_notes && (
                                                                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                                                        <Label className="text-xs font-medium text-yellow-800 dark:text-yellow-300">Admin Notes</Label>
                                                                        <p className="text-yellow-700 dark:text-yellow-200 mt-1">{entry.admin_notes}</p>
                                                                    </div>
                                                                )}

                                                                {entry.photos && entry.photos.length > 0 && (
                                                                    <div>
                                                                        <Label className="text-xs font-medium text-muted-foreground">Photos ({entry.photos.length})</Label>
                                                                        <div className="flex items-center gap-2 mt-2">
                                                                            <Image className="h-4 w-4 text-muted-foreground" />
                                                                            <span className="text-xs text-muted-foreground">{entry.photos.length} photo(s) attached</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {(entry.status === 'pending_review' || entry.status === 'completed' || entry.status === 'in_progress') && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleEntryReview(entry, 'approve')}
                                                                        disabled={isProcessing}
                                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                                    >
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => handleEntryReview(entry, 'reject')}
                                                                        disabled={isProcessing}
                                                                    >
                                                                        <XCircle className="h-3 w-3 mr-1" />
                                                                        Reject
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleEntryDelete(entry)}
                                                                        disabled={isProcessing}
                                                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            )}
                                                            {entry.status === 'approved' && (
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleEntryUndoApproval(entry)}
                                                                        disabled={isProcessing}
                                                                        className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                                                    >
                                                                        Undo Approval
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleEntryDelete(entry)}
                                                                        disabled={isProcessing}
                                                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card>
                                            <CardContent className="p-8 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="p-4 bg-muted rounded-full">
                                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">No Service Sessions</h3>
                                                        <p className="text-muted-foreground text-sm mt-1">
                                                            {report.report_type === 'pdf_upload' 
                                                                ? 'This is a PDF upload report with no individual sessions.'
                                                                : 'No service sessions have been submitted yet.'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>

                                <TabsContent value="details" className="space-y-6">
                                    <Card className="shadow-md border-border">
                                        <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent">
                                            <CardTitle className="text-xl">Administrative Details</CardTitle>
                                            <CardDescription className="text-base">Complete report information and metadata</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Report ID</Label>
                                                        <p className="text-lg font-mono text-foreground">{report.id}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Application ID</Label>
                                                        <p className="text-lg font-mono text-foreground">{report.scholarship_application_id}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Report Type</Label>
                                                        <Badge variant="outline" className="mt-1">
                                                            {formatStatus(report.report_type)}
                                                        </Badge>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                                                        <Badge className={`${getStatusColor(report.status)} mt-1`}>
                                                            {formatStatus(report.status)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                                                        <p className="text-lg text-foreground">{formatDate(report.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                                                        <p className="text-lg text-foreground">{formatDate(report.updated_at)}</p>
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-muted-foreground">Submitted</Label>
                                                        <p className="text-lg text-foreground">{formatDate(report.submitted_at)}</p>
                                                    </div>
                                                    {report.reviewed_at && (
                                                        <div>
                                                            <Label className="text-sm font-medium text-muted-foreground">Reviewed</Label>
                                                            <p className="text-lg text-foreground">{formatDate(report.reviewed_at)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {report.pdf_report_path && (
                                                <div className="border-t border-border pt-6">
                                                    <Label className="text-sm font-medium text-muted-foreground">PDF Report</Label>
                                                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                                                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-blue-900 dark:text-blue-100">PDF Report Available</p>
                                                                    <p className="text-sm text-blue-700 dark:text-blue-300">Click to download and review</p>
                                                                </div>
                                                            </div>
                                                            {pdfDownloadUrl && (
                                                                <Button variant="outline" asChild className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300">
                                                                    <a href={pdfDownloadUrl} target="_blank" rel="noopener noreferrer">
                                                                        <Download className="h-4 w-4 mr-2" />
                                                                        Download
                                                                    </a>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>

                    {/* Modals */}
                    <AlertDialog open={isReportRejectionModalOpen} onOpenChange={setIsReportRejectionModalOpen}>
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-destructive" />
                                    Reject Report #{report.id}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Please provide a clear reason for rejecting this community service report. This feedback will help the student understand what needs to be improved.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rejection_reason" className="text-sm font-medium">
                                        Rejection Reason *
                                    </Label>
                                    <textarea
                                        id="rejection_reason"
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="e.g., Insufficient documentation, unclear photos, missing required hours..."
                                        disabled={isProcessing}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel disabled={isProcessing}>
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    onClick={submitReportRejection}
                                    disabled={isProcessing || !rejectionReason.trim()}
                                    variant="destructive"
                                    className="min-w-[120px]"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Rejecting...
                                        </div>
                                    ) : (
                                        'Reject Report'
                                    )}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog open={isEntryRejectionModalOpen} onOpenChange={setIsEntryRejectionModalOpen}>
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-destructive" />
                                    Reject Session #{currentEntryForRejection?.id}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Please provide specific feedback about why this service session is being rejected. This will help the student improve future submissions.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin_notes" className="text-sm font-medium">
                                        Admin Notes / Rejection Reason *
                                    </Label>
                                    <textarea
                                        id="admin_notes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="e.g., Task description too vague, photos don't show actual work, time logs inconsistent..."
                                        disabled={isProcessing}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </div>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel disabled={isProcessing}>
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    onClick={submitEntryRejection}
                                    disabled={isProcessing || !adminNotes.trim()}
                                    variant="destructive"
                                    className="min-w-[120px]"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Rejecting...
                                        </div>
                                    ) : (
                                        'Reject Session'
                                    )}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Delete Entry Modal */}
                    <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <XCircle className="h-5 w-5 text-destructive" />
                                    Delete Session #{currentEntryForDelete?.id}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Are you sure you want to delete this service session? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        This will permanently remove the session and all its data.
                                    </Label>
                                </div>
                            </div>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel disabled={deleteForm.processing}>
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    onClick={submitEntryDelete}
                                    disabled={deleteForm.processing}
                                    variant="destructive"
                                    className="min-w-[120px]"
                                >
                                    {deleteForm.processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Deleting...
                                        </div>
                                    ) : (
                                        'Delete Session'
                                    )}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Undo Approval Modal */}
                    <AlertDialog open={isUndoModalOpen} onOpenChange={setIsUndoModalOpen}>
                        <AlertDialogContent className="max-w-md">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                    Undo Approval for Session #{currentEntryForUndo?.id}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Are you sure you want to undo the approval for this service session? This will set its status back to pending review.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">
                                        This action can help correct mistakes if a session was approved in error.
                                    </Label>
                                </div>
                            </div>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel disabled={undoForm.processing}>
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    onClick={submitEntryUndoApproval}
                                    disabled={undoForm.processing}
                                    variant="outline"
                                    className="border-yellow-500 text-yellow-600 min-w-[120px]"
                                >
                                    {undoForm.processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                                            Undoing...
                                        </div>
                                    ) : (
                                        'Undo Approval'
                                    )}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Create Report Modal */}
                    <AlertDialog open={isCreateReportModalOpen} onOpenChange={setIsCreateReportModalOpen}>
                        <AlertDialogContent className="max-w-lg">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5 text-blue-600" />
                                    Create Community Service Report
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                    Create a community service report on behalf of the student. This can include PDF uploads or manual entry.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <form onSubmit={handleAdminReportSubmit} className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="total_hours" className="text-sm font-medium">
                                            Total Hours *
                                        </Label>
                                        <Input
                                            id="total_hours"
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            value={adminReportForm.data.total_hours}
                                            onChange={(e) => adminReportForm.setData('total_hours', e.target.value)}
                                            placeholder="e.g., 40"
                                            disabled={adminReportForm.processing}
                                            className="mt-1"
                                        />
                                        {adminReportForm.errors.total_hours && (
                                            <p className="mt-1 text-xs text-red-500">{adminReportForm.errors.total_hours}</p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="days_completed" className="text-sm font-medium">
                                            Days Completed *
                                        </Label>
                                        <Input
                                            id="days_completed"
                                            type="number"
                                            min="0"
                                            value={adminReportForm.data.days_completed}
                                            onChange={(e) => adminReportForm.setData('days_completed', e.target.value)}
                                            placeholder="e.g., 5"
                                            disabled={adminReportForm.processing}
                                            className="mt-1"
                                        />
                                        {adminReportForm.errors.days_completed && (
                                            <p className="mt-1 text-xs text-red-500">{adminReportForm.errors.days_completed}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="description" className="text-sm font-medium">
                                        Description *
                                    </Label>
                                    <Textarea
                                        id="description"
                                        value={adminReportForm.data.description}
                                        onChange={(e) => adminReportForm.setData('description', e.target.value)}
                                        placeholder="Describe the community service activities performed..."
                                        disabled={adminReportForm.processing}
                                        className="mt-1 min-h-[80px]"
                                    />
                                    {adminReportForm.errors.description && (
                                        <p className="mt-1 text-xs text-red-500">{adminReportForm.errors.description}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="pdf_file" className="text-sm font-medium">
                                        PDF Report (Optional)
                                    </Label>
                                    <Input
                                        id="pdf_file"
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => adminReportForm.setData('pdf_file', e.target.files?.[0] || null)}
                                        disabled={adminReportForm.processing}
                                        className="mt-1"
                                    />
                                    {adminReportForm.errors.pdf_file && (
                                        <p className="mt-1 text-xs text-red-500">{adminReportForm.errors.pdf_file}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="admin_notes" className="text-sm font-medium">
                                        Admin Notes
                                    </Label>
                                    <Textarea
                                        id="admin_notes"
                                        value={adminReportForm.data.admin_notes}
                                        onChange={(e) => adminReportForm.setData('admin_notes', e.target.value)}
                                        placeholder="Notes about this report creation (e.g., 'Created from hardcopy documentation')"
                                        disabled={adminReportForm.processing}
                                        className="mt-1"
                                    />
                                </div>
                            </form>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel disabled={adminReportForm.processing}>
                                    Cancel
                                </AlertDialogCancel>
                                <Button
                                    onClick={handleAdminReportSubmit}
                                    disabled={adminReportForm.processing || !adminReportForm.data.description || !adminReportForm.data.total_hours || !adminReportForm.data.days_completed}
                                    className="min-w-[120px]"
                                >
                                    {adminReportForm.processing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Creating...
                                        </div>
                                    ) : (
                                        'Create Report'
                                    )}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}