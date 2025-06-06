import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication, ScholarshipProgram, DocumentUpload, DocumentRequirement } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
    Calendar, 
    FileText, 
    CheckCircle2, 
    AlertTriangle, 
    XCircle, 
    Upload, 
    DollarSign, 
    Clock, 
    File, 
    Check, 
    Award,
    BookOpen,
    HelpCircle,
    Rocket,
    Star,
    Timer,
    TrendingUp,
    Eye,
    Download,
    Edit,
    Send,
    MapPin,
    Users,
    Heart,
    Zap,
    Activity,
    ArrowRight,
    ChevronRight,
    MoreHorizontal,
    RefreshCcw,
    AlertCircle,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import MissingDocumentsOnboardingModal from './components/MissingDocumentsOnboardingModal';

interface DocumentUploadItem {
    requirement: DocumentRequirement;
    upload: DocumentUpload | null;
}

interface ApplicationShowProps {
    application: ScholarshipApplication;
    scholarship: ScholarshipProgram;
    documentUploads: DocumentUploadItem[];
    canSubmit: boolean;
}

export default function Show({ 
    application, 
    scholarship, 
    documentUploads,
    canSubmit 
}: ApplicationShowProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedRequirement, setSelectedRequirement] = useState<DocumentRequirement | null>(null);
    const [showMissingDocsModal, setShowMissingDocsModal] = useState(false);
    const [startHighlightingUploads, setStartHighlightingUploads] = useState(false);
    
    // Helper functions
    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };
    
    const getStatusInfo = (status: string) => {
        if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'approved'].includes(status)) {
            return { color: 'green', bgColor: 'bg-green-500', icon: CheckCircle2, variant: 'default' as const };
        }
        if (status.startsWith('rejected_') || status === 'rejected') {
            return { color: 'red', bgColor: 'bg-red-500', icon: XCircle, variant: 'destructive' as const };
        }
        if (['disbursement_pending', 'service_pending', 'documents_under_review', 'pending_review'].includes(status)) {
            return { color: 'blue', bgColor: 'bg-blue-500', icon: Clock, variant: 'secondary' as const };
        }
        if (['enrolled'].includes(status)) {
            return { color: 'purple', bgColor: 'bg-purple-500', icon: Rocket, variant: 'secondary' as const };
        }
        return { color: 'gray', bgColor: 'bg-gray-500', icon: FileText, variant: 'outline' as const };
    };

    const getStatusDescription = (status: string) => {
        const descriptions = {
            'draft': 'Complete your application by uploading all required documents.',
            'submitted': 'Your application is being reviewed by our team.',
            'documents_approved': 'Documents approved! Eligibility verification in progress.',
            'eligibility_verified': 'You\'ve been selected! Enrollment process underway.',
            'enrolled': 'Congratulations! Complete your community service requirement.',
            'service_completed': 'Service complete! Disbursement being processed.',
            'disbursement_processed': 'Scholarship awarded! Funds have been disbursed.',
            'completed': 'Application completed successfully! 🎉',
            'documents_rejected': 'Some documents need attention. Please review and resubmit.',
            'rejected': 'Application not approved at this time.'
        };
        return descriptions[status as keyof typeof descriptions] || 'Application is being processed.';
    };
    
    const calculateProgress = () => {
        const statuses = [
            'draft', 'submitted', 'documents_pending', 'documents_under_review', 'documents_approved',
            'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 
            'disbursement_pending', 'disbursement_processed', 'completed'
        ];
        const index = statuses.indexOf(application.status);
        return index === -1 ? 0 : Math.round((index / (statuses.length - 1)) * 100);
    };

    const progressPercentage = calculateProgress();
    const statusInfo = getStatusInfo(application.status);
    const StatusIcon = statusInfo.icon;

    const submitApplication = () => {
        router.post(route('student.applications.submit', application.id), {}, {
            onSuccess: () => {
                toast.success('Application submitted successfully!');
            },
            onError: () => {
                toast.error('Failed to submit application. Please try again.');
            }
        });
    };

    const openUploadDialog = (requirement: DocumentRequirement) => {
        setSelectedRequirement(requirement);
        setShowUploadDialog(true);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Student Dashboard', href: route('student.dashboard') },
        { title: 'My Applications', href: route('student.applications.index') },
        { title: 'Application Details' }
    ];

    // Count approved and total documents
    const approvedDocs = documentUploads.filter(doc => 
        doc.upload && ['approved', 'documents_approved'].includes(doc.upload.status)
    ).length;
    const totalDocs = documentUploads.length;
    const documentsProgress = totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0;

    useEffect(() => {
        const missingOrRejectedDocsExist = documentUploads.some(
            item => !item.upload || item.upload.status === 'rejected'
        );

        if (!missingOrRejectedDocsExist) {
            setShowMissingDocsModal(false);
            return;
        }

        const isDraft = application.status === 'draft';
        const isDocsRejectedStatus = application.status === 'documents_rejected';
        const actualRejectionsPresent = documentUploads.some(item => item.upload?.status === 'rejected');

        if (isDraft || isDocsRejectedStatus || actualRejectionsPresent) {
            setShowMissingDocsModal(true);
        } else {
            setShowMissingDocsModal(false);
        }
    }, [application.status, documentUploads]);

    const handleGoToDocuments = () => {
        setActiveTab('documents');
        setShowMissingDocsModal(false);
        setStartHighlightingUploads(true);
    };

    useEffect(() => {
        if (activeTab !== 'documents' && startHighlightingUploads) {
            setStartHighlightingUploads(false);
        }
    }, [activeTab, startHighlightingUploads]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Application Details" />
            <MissingDocumentsOnboardingModal
                isOpen={showMissingDocsModal}
                onClose={() => setShowMissingDocsModal(false)}
                documents={documentUploads}
                onGoToDocuments={handleGoToDocuments}
                applicationStatus={application.status}
            />

            <div className="min-h-screen bg-background">
                <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
                    {/* Hero Status Section */}
                    <Card className="border-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground overflow-hidden">
                        <CardContent className="p-6 lg:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${statusInfo.bgColor} animate-pulse-subtle`}></div>
                                        <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                                            Application #{application.id}
                                        </Badge>
                                    </div>
                                    
                                    <div>
                                        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                                            {scholarship.name}
                                        </h1>
                                        <p className="text-primary-foreground/80 text-lg">
                                            {scholarship.semester} • {scholarship.academic_year}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2 bg-primary-foreground/20 rounded-lg p-3 backdrop-blur-sm">
                                        <StatusIcon className="h-5 w-5" />
                                        <div>
                                            <p className="font-semibold">{formatStatus(application.status)}</p>
                                            <p className="text-sm text-primary-foreground/80">
                                                {getStatusDescription(application.status)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center lg:items-end text-center lg:text-right space-y-4">
                                    {/* Circular Progress */}
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
                                                    {progressPercentage}%
                                                </span>
                                                <span className="text-xs lg:text-sm text-primary-foreground/80">
                                                    Complete
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className="text-2xl font-bold">
                                            ${scholarship.per_student_budget.toLocaleString()}
                                        </p>
                                        <p className="text-primary-foreground/80">Award Amount</p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Overall Progress</span>
                                    <span>{progressPercentage < 100 ? 'In Progress' : 'Complete'}</span>
                                </div>
                                <Progress 
                                    value={progressPercentage} 
                                    className="h-2 bg-primary-foreground/20" 
                                    indicatorClassName="bg-primary-foreground"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    {application.status === 'enrolled' && (
                        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                            <CardContent className="p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
                                            <Timer className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                                                Ready for Community Service
                                            </h3>
                                            <p className="text-sm text-purple-600 dark:text-purple-400">
                                                Start tracking your {scholarship.community_service_days * 8} required hours
                                            </p>
                                        </div>
                                    </div>
                                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                                        <Link href={route('student.community-service.dashboard', { application: application.id })}>
                                            <Rocket className="h-4 w-4 mr-2" />
                                            Start Service
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Main Content */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-3 lg:w-fit lg:grid-cols-3">
                            <TabsTrigger value="overview" className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                <span className="hidden sm:inline">Overview</span>
                            </TabsTrigger>
                            <TabsTrigger value="documents" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Documents</span>
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                <span className="hidden sm:inline">Timeline</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Scholarship Details */}
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Scholarship Details
                                        </CardTitle>
                                        <CardDescription>
                                            Information about your scholarship program
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-medium text-muted-foreground">Award Amount</span>
                                                </div>
                                                <p className="text-2xl font-bold text-green-600">
                                                    ${scholarship.per_student_budget.toLocaleString()}
                                                </p>
                                            </div>

                                            {scholarship.community_service_days > 0 && (
                                                <div className="p-4 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Clock className="h-4 w-4 text-blue-600" />
                                                        <span className="text-sm font-medium text-muted-foreground">Service Hours</span>
                                                    </div>
                                                    <p className="text-2xl font-bold text-blue-600">
                                                        {scholarship.community_service_days * 8}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="h-4 w-4 text-purple-600" />
                                                    <span className="text-sm font-medium text-muted-foreground">Academic Year</span>
                                                </div>
                                                <p className="text-lg font-semibold">
                                                    {scholarship.academic_year}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {scholarship.semester}
                                                </p>
                                            </div>

                                            <div className="p-4 bg-muted/50 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <FileText className="h-4 w-4 text-orange-600" />
                                                    <span className="text-sm font-medium text-muted-foreground">Application ID</span>
                                                </div>
                                                <p className="text-lg font-semibold">
                                                    #{application.id}
                                                </p>
                                            </div>
                                        </div>

                                        {scholarship.description && (
                                            <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20">
                                                <div className="flex items-start gap-3">
                                                    <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-primary mb-2">About This Scholarship</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {scholarship.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Status & Next Steps */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Zap className="h-5 w-5" />
                                            Current Status
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className={`p-4 rounded-lg border ${
                                            statusInfo.color === 'green' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
                                            statusInfo.color === 'red' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
                                            statusInfo.color === 'blue' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                            statusInfo.color === 'purple' ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800' :
                                            'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
                                        }`}>
                                            <div className="flex items-center gap-2 mb-2">
                                                <StatusIcon className={`h-5 w-5 ${
                                                    statusInfo.color === 'green' ? 'text-green-600 dark:text-green-400' :
                                                    statusInfo.color === 'red' ? 'text-red-600 dark:text-red-400' :
                                                    statusInfo.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                                    statusInfo.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                                    'text-gray-600 dark:text-gray-400'
                                                }`} />
                                                <span className="font-semibold">{formatStatus(application.status)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {getStatusDescription(application.status)}
                                            </p>
                                        </div>

                                        {/* Important Dates */}
                                        {(application.submitted_at || application.reviewed_at) && (
                                            <div className="space-y-3">
                                                <Separator />
                                                <h4 className="font-medium">Important Dates</h4>
                                                
                                                {application.submitted_at && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                                            <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Submitted</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(application.submitted_at).toLocaleDateString(undefined, { 
                                                                    year: 'numeric', month: 'long', day: 'numeric' 
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {application.reviewed_at && (
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                                                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Reviewed</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(application.reviewed_at).toLocaleDateString(undefined, { 
                                                                    year: 'numeric', month: 'long', day: 'numeric' 
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Admin Notes */}
                                        {application.admin_notes && (
                                            <div className="space-y-3">
                                                <Separator />
                                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                                                    <div className="flex items-start gap-2">
                                                        <HelpCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Admin Notes</p>
                                                            <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                                                                {application.admin_notes}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="documents" className="space-y-6">
                            {/* Documents Header */}
                            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                                    Document Requirements
                                                </h3>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    {documentsProgress === 100 ? 'All documents submitted!' : 
                                                     `${approvedDocs} of ${totalDocs} documents approved`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                    {Math.round(documentsProgress)}%
                                                </p>
                                                <p className="text-xs text-blue-500 dark:text-blue-400">Complete</p>
                                            </div>
                                            <div className="w-16 h-16">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        className="text-blue-200 dark:text-blue-800"
                                                    />
                                                    <circle
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="none"
                                                        strokeDasharray={`${documentsProgress * 2.51} 251`}
                                                        className="text-blue-600 dark:text-blue-400 transition-all duration-1000"
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents Grid */}
                            <div className="grid gap-4">
                                {documentUploads.map(({ requirement, upload }, index) => {
                                    const docStatusInfo = upload ? getStatusInfo(upload.status) : { color: 'gray', icon: File, variant: 'outline' as const };
                                    const DocIcon = docStatusInfo.icon;

                                    return (
                                        <Card key={requirement.id} className="hover:shadow-md transition-all duration-300">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-muted rounded-xl flex-shrink-0">
                                                            <FileText className="h-6 w-6 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold mb-1">{requirement.name}</h3>
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                {requirement.description}
                                                            </p>
                                                            
                                                            {upload ? (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <DocIcon className={`h-4 w-4 ${
                                                                            docStatusInfo.color === 'green' ? 'text-green-600' :
                                                                            docStatusInfo.color === 'red' ? 'text-red-600' :
                                                                            docStatusInfo.color === 'blue' ? 'text-blue-600' :
                                                                            'text-gray-600'
                                                                        }`} />
                                                                        <Badge variant={docStatusInfo.variant}>
                                                                            {formatStatus(upload.status)}
                                                                        </Badge>
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {new Date(upload.uploaded_at).toLocaleDateString()}
                                                                        </span>
                                                                    </div>
                                                                    
                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <File className="h-3 w-3" />
                                                                        {upload.original_filename}
                                                                    </div>

                                                                    {upload.rejection_reason && (
                                                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                                            <div className="flex items-start gap-2">
                                                                                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                                                                                        Rejection Reason
                                                                                    </p>
                                                                                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                                                                        {upload.rejection_reason}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <AlertTriangle className="h-4 w-4" />
                                                                    Not uploaded yet
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    {(application.status === 'draft' || 
                                                      (application.status === 'documents_rejected' && upload?.status.startsWith('rejected_'))) && (
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                onClick={() => {
                                                                    openUploadDialog(requirement);
                                                                    setStartHighlightingUploads(false); // Turn off highlight on interaction
                                                                }}
                                                                size="sm"
                                                                variant={upload ? "outline" : "default"}
                                                                className={startHighlightingUploads && (!upload || upload.status.startsWith('rejected_')) ? 'animate-pulse ring-2 ring-primary ring-offset-2' : ''}
                                                            >
                                                                <Upload className="h-4 w-4 mr-2" />
                                                                {upload ? 'Replace' : 'Upload'}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            {/* Submit Application */}
                            {canSubmit && (
                                <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                                    <CardContent className="p-6">
                                        <div className="text-center space-y-4">
                                            <div className="flex justify-center">
                                                <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-full">
                                                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">
                                                    Ready to Submit!
                                                </h3>
                                                <p className="text-green-600 dark:text-green-400 mb-4">
                                                    All required documents have been uploaded. Review everything once more, then submit your application.
                                                </p>
                                            </div>
                                            <Button 
                                                onClick={submitApplication}
                                                size="lg"
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Send className="h-5 w-5 mr-2" />
                                                Submit Application
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="timeline" className="space-y-6">
                            <TimelineView application={application} />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Upload Dialog */}
                {selectedRequirement && (
                    <DocumentUploadDialog
                        open={showUploadDialog}
                        onOpenChange={setShowUploadDialog}
                        requirement={selectedRequirement}
                        applicationId={application.id}
                        existingUpload={documentUploads.find(doc => 
                            doc.requirement.id === selectedRequirement.id
                        )?.upload || null}
                    />
                )}
            </div>
        </AppLayout>
    );
}

// Timeline Component
const TimelineView: React.FC<{ application: ScholarshipApplication }> = ({ application }) => {
    const getStepStatus = (stepId: string) => {
        const currentStatus = application.status;
        
        switch (stepId) {
            case 'created':
                return 'completed';
            case 'submitted':
                if (application.submitted_at) return 'completed';
                if (currentStatus === 'draft') return 'current';
                return 'pending';
            case 'under_review':
                if (['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(currentStatus)) return 'completed';
                if (currentStatus === 'documents_under_review') return 'current';
                if (currentStatus.startsWith('rejected')) return 'failed';
                return 'pending';
            case 'approved':
                if (['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(currentStatus)) return 'completed';
                if (currentStatus === 'documents_rejected') return 'failed';
                return 'pending';
            case 'eligibility':
                if (['eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(currentStatus)) return 'completed';
                if (currentStatus === 'documents_approved') return 'current';
                return 'pending';
            case 'enrolled':
                if (['enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(currentStatus)) return 'completed';
                if (currentStatus === 'eligibility_verified') return 'current';
                return 'pending';
            case 'service':
                if (['service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(currentStatus)) return 'completed';
                if (['enrolled', 'service_pending'].includes(currentStatus)) return 'current';
                return 'pending';
            case 'disbursement':
                if (['disbursement_processed', 'completed'].includes(currentStatus)) return 'completed';
                if (currentStatus === 'disbursement_pending') return 'current';
                return 'pending';
            default:
                return 'pending';
        }
    };

    const timelineSteps = [
        {
            id: 'created',
            title: 'Application Created',
            description: 'Your scholarship application journey begins here.',
            details: 'Application form initialized and ready for document uploads.',
            date: application.created_at,
            icon: FileText,
            color: 'blue'
        },
        {
            id: 'submitted',
            title: 'Documents Submitted',
            description: 'All required documents have been uploaded and submitted.',
            details: 'Your application package is complete and ready for our review team.',
            date: application.submitted_at,
            icon: Upload,
            color: 'indigo'
        },
        {
            id: 'under_review',
            title: 'Under Review',
            description: 'Our team is carefully reviewing your submitted documents.',
            details: 'Document verification and initial eligibility assessment in progress.',
            date: null,
            icon: Eye,
            color: 'amber'
        },
        {
            id: 'approved',
            title: 'Documents Approved',
            description: 'All your documents have been verified and approved.',
            details: 'Great news! Your documentation meets all our requirements.',
            date: application.reviewed_at,
            icon: CheckCircle2,
            color: 'green'
        },
        {
            id: 'eligibility',
            title: 'Eligibility Verified',
            description: 'Your eligibility for the scholarship has been confirmed.',
            details: 'Congratulations! You meet all the scholarship criteria.',
            date: null,
            icon: Star,
            color: 'purple'
        },
        {
            id: 'enrolled',
            title: 'Enrollment Complete',
            description: 'You have been officially enrolled in the scholarship program.',
            details: 'Welcome aboard! Time to begin your community service requirement.',
            date: null,
            icon: Rocket,
            color: 'pink'
        },
        {
            id: 'service',
            title: 'Community Service',
            description: 'Complete your required community service hours.',
            details: 'Track your progress and log your meaningful community contributions.',
            date: null,
            icon: Heart,
            color: 'rose'
        },
        {
            id: 'disbursement',
            title: 'Scholarship Awarded',
            description: 'Congratulations! Your scholarship has been disbursed.',
            details: 'Funds have been processed and your journey is complete.',
            date: null,
            icon: Award,
            color: 'emerald'
        }
    ];

    const currentStepIndex = timelineSteps.findIndex(step => getStepStatus(step.id) === 'current');
    const completedSteps = timelineSteps.filter(step => getStepStatus(step.id) === 'completed').length;
    const totalSteps = timelineSteps.length;
    const timelineProgress = (completedSteps / totalSteps) * 100;

    return (
        <div className="space-y-6">
            {/* Timeline Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                                <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                                    Application Journey
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    {currentStepIndex >= 0 ? `Currently at step ${currentStepIndex + 1} of ${totalSteps}` : 
                                     `${completedSteps} of ${totalSteps} steps completed`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                    {Math.round(timelineProgress)}%
                                </p>
                                <p className="text-xs text-blue-500 dark:text-blue-400">Progress</p>
                            </div>
                            <div className="w-16 h-16">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-blue-200 dark:text-blue-800"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${timelineProgress * 2.51} 251`}
                                        className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-out-expo"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline Steps */}
            <Card>
                <CardContent className="p-6">
                    <div className="relative">
                        {/* Progress Line */}
                        <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border"></div>
                        <div 
                            className="absolute left-6 top-6 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 transition-all duration-1000 ease-out-expo"
                            style={{ height: `${Math.min(timelineProgress, 100)}%` }}
                        ></div>

                        <div className="space-y-8">
                            {timelineSteps.map((step, index) => {
                                const status = getStepStatus(step.id);
                                const StepIcon = step.icon;
                                const isLast = index === timelineSteps.length - 1;

                                return (
                                    <div key={step.id} className="relative flex gap-4 group">
                                        {/* Step Icon */}
                                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                            status === 'completed' 
                                                ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-200 text-white shadow-lg shadow-green-500/25' 
                                                : status === 'current' 
                                                    ? `bg-gradient-to-br from-${step.color}-400 to-${step.color}-500 border-${step.color}-200 text-white shadow-lg shadow-${step.color}-500/25 animate-pulse-subtle` 
                                                    : status === 'failed' 
                                                        ? 'bg-gradient-to-br from-red-400 to-red-500 border-red-200 text-white shadow-lg shadow-red-500/25' 
                                                        : 'bg-muted border-border text-muted-foreground'
                                        }`}>
                                            <StepIcon className="h-5 w-5" />
                                        </div>

                                        {/* Step Content */}
                                        <div className={`flex-1 pb-8 transition-all duration-300 ${
                                            status === 'current' ? 'scale-105' : ''
                                        }`}>
                                            <Card className={`hover:shadow-md transition-all duration-300 ${
                                                status === 'completed' 
                                                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                                                    : status === 'current' 
                                                        ? `bg-${step.color}-50 border-${step.color}-200 dark:bg-${step.color}-900/20 dark:border-${step.color}-800` 
                                                        : status === 'failed' 
                                                            ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                                                            : 'hover:bg-muted/50'
                                            }`}>
                                                <CardContent className="p-4">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <h3 className="font-semibold text-lg">{step.title}</h3>
                                                                {status === 'completed' && (
                                                                    <Badge className="bg-green-100 text-green-700 border-green-300 dark:bg-green-900/50 dark:text-green-300">
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                        Complete
                                                                    </Badge>
                                                                )}
                                                                {status === 'current' && (
                                                                    <Badge className={`bg-${step.color}-100 text-${step.color}-700 border-${step.color}-300 dark:bg-${step.color}-900/50 dark:text-${step.color}-300`}>
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                        Current
                                                                    </Badge>
                                                                )}
                                                                {status === 'failed' && (
                                                                    <Badge variant="destructive">
                                                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                                                        Action Needed
                                                                    </Badge>
                                                                )}
                                                                {status === 'pending' && (
                                                                    <Badge variant="outline">
                                                                        Upcoming
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-muted-foreground mb-2">
                                                                {step.description}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground/80">
                                                                {step.details}
                                                            </p>
                                                        </div>

                                                        {step.date && (
                                                            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 rounded-lg p-2">
                                                                <Calendar className="h-4 w-4" />
                                                                <div className="text-right">
                                                                    <p className="font-medium">
                                                                        {new Date(step.date).toLocaleDateString(undefined, {
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </p>
                                                                    <p className="text-xs">
                                                                        {new Date(step.date).getFullYear()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Special action for current step */}
                                                    {status === 'current' && step.id === 'service' && (
                                                        <div className="mt-4 pt-3 border-t border-border">
                                                            <Button asChild size="sm" className="w-full sm:w-auto">
                                                                <Link href={route('student.community-service.dashboard', { application: application.id })}>
                                                                    <Timer className="h-4 w-4 mr-2" />
                                                                    Start Community Service
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline Summary */}
            <Card className="bg-gradient-to-r from-primary/5 to-transparent border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg mt-0.5">
                            <Info className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h4 className="font-medium text-primary mb-2">Timeline Overview</h4>
                            <p className="text-sm text-muted-foreground">
                                This timeline shows your complete scholarship application journey. Each step represents 
                                a milestone in the process, from initial application to final award disbursement. 
                                You can track your progress and see what comes next at each stage.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Document Upload Dialog
const DocumentUploadDialog: React.FC<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    requirement: DocumentRequirement;
    applicationId: number;
    existingUpload: DocumentUpload | null;
}> = ({ open, onOpenChange, requirement, applicationId, existingUpload }) => {
    const { data, setData, post, processing, progress, reset } = useForm({
        document_requirement_id: requirement.id,
        document: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('student.applications.documents.upload', applicationId), {
            onSuccess: () => {
                toast.success('Document uploaded successfully!');
                onOpenChange(false);
                reset();
            },
            onError: () => {
                toast.error('Failed to upload document. Please try again.');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        {existingUpload ? 'Replace Document' : 'Upload Document'}
                    </DialogTitle>
                    <DialogDescription>
                        {requirement.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            {requirement.description}
                        </p>
                    </div>

                    {existingUpload && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <File className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Current File</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {existingUpload.original_filename}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="document">Select New File</Label>
                            <Input
                                id="document"
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => setData('document', e.target.files?.[0] || null)}
                                disabled={processing}
                                required
                                className="mt-1"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Accepts PDF, JPG, JPEG, or PNG files (max 10MB)
                            </p>
                        </div>

                        {progress && progress.percentage !== undefined && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Uploading...</span>
                                    <span>{Math.round(progress.percentage)}%</span>
                                </div>
                                <Progress value={progress.percentage} className="h-2" />
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                disabled={processing}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={processing || !data.document}
                                className="flex-1"
                            >
                                {processing ? 'Uploading...' : 'Upload'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};