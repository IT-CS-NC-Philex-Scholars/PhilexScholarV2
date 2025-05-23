import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    ScholarshipApplication as ApplicationType,
    BreadcrumbItem,
    CommunityServiceReport as CommunityServiceReportType,
    Disbursement as DisbursementType,
    DocumentRequirement as DocumentRequirementType,
    DocumentUpload as DocumentUploadType,
    ScholarshipProgram as ScholarshipProgramType,
    StudentProfile as StudentProfileType,
    User as UserType,
} from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Award,
    BookOpenText,
    CheckCircle2,
    Clock,
    DollarSign,
    Download,
    Edit3,
    ExternalLink,
    FileClock,
    FileImage,
    FileText as FileTextIconLucide,
    FileType2,
    Info,
    ListChecks,
    MessageSquare,
    XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

interface ApplicationShowProps {
    application: ApplicationType & {
        studentProfile?: StudentProfileType & { user?: UserType };
        scholarshipProgram?: ScholarshipProgramType & {
            documentRequirements?: DocumentRequirementType[];
        };
        documentUploads?: DocumentUploadType[];
        communityServiceReports?: CommunityServiceReportType[];
        disbursements?: DisbursementType[];
    };
    applicationStatuses?: Array<{ value: string; label: string }>;
    documentStatuses?: Array<{ value: string; label: string }>;
}

const formatDate = (dateString?: string | null, includeTime = false) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatCurrency = (amount?: number | string | null) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};

const getStatusConfig = (
    status?: string,
): { variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: React.ElementType; colorClass: string; label: string } => {
    const s = status?.toLowerCase() || 'unknown';
    let label = s.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

    if (
        ['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'enrolled', 'approved'].includes(s)
    ) {
        return { variant: 'default', icon: CheckCircle2, colorClass: 'text-green-600 dark:text-green-500', label };
    }
    if (
        [
            'documents_rejected',
            'rejected',
            'rejected_invalid',
            'rejected_incomplete',
            'rejected_incorrect_format',
            'rejected_unreadable',
            'rejected_other',
            'rejected_insufficient_hours',
            'rejected_incomplete_documentation',
        ].includes(s)
    ) {
        return { variant: 'destructive', icon: XCircle, colorClass: 'text-red-600 dark:text-red-500', label };
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review', 'submitted', 'pending_review'].includes(s)) {
        return { variant: 'outline', icon: Clock, colorClass: 'text-amber-600 dark:text-amber-500', label };
    }
    return {
        variant: 'secondary',
        icon: Info,
        colorClass: 'text-gray-600 dark:text-gray-400',
        label: label === 'Unknown' ? 'Unknown Status' : label,
    };
};

const documentStatusOptionsProvided = [
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected_invalid', label: 'Rejected: Invalid' },
    { value: 'rejected_incomplete', label: 'Rejected: Incomplete' },
    { value: 'rejected_unreadable', label: 'Rejected: Unreadable' },
    { value: 'rejected_other', label: 'Rejected: Other' },
];

const applicationStatusOptionsProvided = [
    { value: 'submitted', label: 'Submitted' },
    { value: 'documents_pending', label: 'Documents Pending' },
    { value: 'documents_under_review', label: 'Documents Under Review' },
    { value: 'documents_approved', label: 'Documents Approved' },
    { value: 'service_pending', label: 'Service Pending' },
    { value: 'service_completed', label: 'Service Completed' },
    { value: 'disbursement_pending', label: 'Disbursement Pending' },
    { value: 'disbursement_processed', label: 'Disbursement Processed' },
    { value: 'enrolled', label: 'Enrolled' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'archived', label: 'Archived' },
];

const getFileType = (filename?: string): 'image' | 'pdf' | 'other' => {
    if (!filename) return 'other';
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'].includes(ext || '')) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
};

export default function Show({
    application,
    applicationStatuses = applicationStatusOptionsProvided,
    documentStatuses = documentStatusOptionsProvided,
}: ApplicationShowProps) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const {
        data: statusForm,
        setData: setStatusFormData,
        post: postStatusUpdate,
        processing: statusProcessing,
        errors: statusErrors,
        reset: resetStatusForm,
    } = useForm({
        status: application.status || '',
        admin_notes: application.admin_notes || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Applications', href: route('admin.applications.index') },
        { title: `Application #${application.id}` },
    ];

    const student = application.studentProfile?.user;
    const studentProfile = application.studentProfile;
    const program = application.scholarshipProgram;

    const allDocumentRequirements = program?.documentRequirements || [];
    const uploadedDocuments = application.documentUploads || [];

    const documentsWithStatus = useMemo(() => {
        return allDocumentRequirements.map((req) => {
            const upload = uploadedDocuments.find((up) => up.document_requirement_id === req.id);
            return {
                requirement: req,
                upload: upload,
                status: upload?.status || 'missing',
            };
        });
    }, [allDocumentRequirements, uploadedDocuments]);

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        postStatusUpdate(route('admin.applications.updateStatus', application.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsStatusModalOpen(false);
            },
        });
    };

    const FilePreviewDisplay: React.FC<{ upload: DocumentUploadType }> = ({ upload }) => {
        const fileType = getFileType(upload.original_filename);
        const filePath = route('admin.documents.view', upload.id); // Use the new route

        if (fileType === 'image') {
            return (
                <img
                    src={filePath}
                    alt={`Preview of ${upload.original_filename}`}
                    className="my-2 h-auto max-h-60 max-w-full rounded-md border shadow-sm md:max-h-80"
                />
            );
        } else if (fileType === 'pdf') {
            return (
                <iframe src={filePath} title={'PDF Preview of ' + upload.original_filename} className="my-2 h-96 w-full rounded-md border shadow-sm">
                    <p className="p-4">Your browser does not support iframes to show PDF. Please use the "Open" or "Download" button.</p>
                </iframe>
            );
        } else {
            return (
                <div className="text-muted-foreground my-2 flex items-center gap-3 rounded-md border bg-slate-50 p-4 dark:bg-slate-800">
                    <FileType2 className="h-8 w-8 flex-shrink-0" />
                    <span>No preview available for this file type. Please use "Open" or "Download".</span>
                </div>
            );
        }
    };

    const DocumentReviewForm: React.FC<{ docReq: DocumentRequirementType; upload?: DocumentUploadType }> = ({ docReq, upload }) => {
        const { data, setData, post, processing, errors, reset } = useForm({
            status: upload?.status || 'pending_review',
            rejection_reason: upload?.rejection_reason || '',
            _method: 'PATCH',
        });

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!upload) return;
            post(route('admin.documents.review', upload.id), {
                preserveScroll: true,
            });
        };

        if (!upload) {
            return (
                <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
                    <div className="flex items-center gap-2">
                        <FileClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <p className="dark:text-yellow-300\\ text-sm font-medium text-yellow-700">Document Not Uploaded</p>
                    </div>
                    <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                        This {docReq.is_required ? 'required' : 'optional'} document has not been submitted by the student.
                    </p>
                </div>
            );
        }

        const currentDocStatusConfig = getStatusConfig(upload.status);
        const fileDisplayPath = route('admin.documents.view', upload.id); // Use new route for display/download links

        return (
            <form onSubmit={handleSubmit} className="bg-muted/20 dark:bg-background space-y-4 rounded-md border p-4 shadow">
                <FilePreviewDisplay upload={upload} />

                <div>
                    <p className="text-md flex items-center font-semibold break-all">
                        {getFileType(upload.original_filename) === 'image' && (
                            <FileImage className="text-muted-foreground mr-1.5 h-4 w-4 flex-shrink-0" />
                        )}
                        {getFileType(upload.original_filename) === 'pdf' && (
                            <FileType2 className="text-muted-foreground mr-1.5 h-4 w-4 flex-shrink-0" />
                        )}
                        {getFileType(upload.original_filename) === 'other' && (
                            <FileTextIconLucide className="text-muted-foreground mr-1.5 h-4 w-4 flex-shrink-0" />
                        )}
                        {upload.original_filename}
                    </p>
                    <p className="text-muted-foreground\\ text-xs">Uploaded: {formatDate(upload.uploaded_at, true)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <a href={fileDisplayPath} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                            Open in New Tab
                        </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <a href={fileDisplayPath} download={upload.original_filename}>
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Download
                        </a>
                    </Button>
                </div>

                <Badge variant={currentDocStatusConfig.variant} className="my-2 text-xs whitespace-nowrap capitalize">
                    <currentDocStatusConfig.icon className={cn('mr-1 h-3.5 w-3.5', currentDocStatusConfig.colorClass)} />
                    Current Status: {currentDocStatusConfig.label}
                </Badge>

                <div className="border-border grid grid-cols-1 items-end gap-3 border-t pt-2 md:grid-cols-2">
                    <div>
                        <label htmlFor={`doc-status-${upload.id}`} className="text-xs font-medium">
                            New Review Status
                        </label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                            <SelectTrigger id={`doc-status-${upload.id}`} className="bg-background mt-1">
                                <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent>
                                {documentStatuses.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.status && <p className="mt-1\\ text-xs text-red-500">{errors.status}</p>}
                    </div>
                    <Button type="submit" disabled={processing} size="sm" className="self-end">
                        {processing ? 'Saving Review...' : 'Save Document Review'}
                    </Button>
                </div>

                {data.status.startsWith('rejected_') && (
                    <div>
                        <label htmlFor={`doc-reason-${upload.id}`} className="text-xs font-medium">
                            Rejection Reason (if applicable)
                        </label>
                        <Textarea
                            id={`doc-reason-${upload.id}`}
                            value={data.rejection_reason}
                            onChange={(e) => setData('rejection_reason', e.target.value)}
                            placeholder="Explain why the document was rejected..."
                            className="bg-background mt-1 min-h-[60px]"
                        />
                        {errors.rejection_reason && <p className="mt-1\\ text-xs text-red-500">{errors.rejection_reason}</p>}
                    </div>
                )}
                {upload.status.startsWith('rejected_') && upload.rejection_reason && data.status === upload.status && (
                    <Alert variant="destructive" className="mt-2 text-xs">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Current Rejection Reason</AlertTitle>
                        <AlertDescription>{upload.rejection_reason}</AlertDescription>
                    </Alert>
                )}
            </form>
        );
    };

    const overallStatusConfig = getStatusConfig(application.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Application #${application.id}`} />

            <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href={route('admin.applications.index')}
                        className="text-primary hover:text-primary/80 mb-3 inline-flex items-center text-sm font-medium"
                    >
                        <ArrowLeft className="mr-1.5 h-4 w-4" />
                        Back to Applications
                    </Link>
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Application Review <span className="text-primary">#{application.id}</span>
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                Submitted by {student?.name || 'N/A'} on {formatDate(application.submitted_at)}
                            </p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                            <Badge variant={overallStatusConfig.variant} className="px-3 py-1.5 text-sm capitalize">
                                <overallStatusConfig.icon className={cn('mr-1.5 h-4 w-4', overallStatusConfig.colorClass)} />
                                {overallStatusConfig.label}
                            </Badge>
                            <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Edit3 className="mr-2 h-4 w-4" />
                                        Update Status
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Update Application Status</DialogTitle>
                                        <DialogDescription>
                                            Change the overall status of this application and add administrative notes.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleStatusUpdate} className="space-y-4 py-2">
                                        <div>
                                            <label htmlFor="application_status" className="mb-1 block text-sm font-medium">
                                                New Status
                                            </label>
                                            <Select value={statusForm.status} onValueChange={(value) => setStatusFormData('status', value)}>
                                                <SelectTrigger id="application_status">
                                                    <SelectValue placeholder="Select new status..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {applicationStatuses.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            {opt.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {statusErrors.status && <p className="mt-1 text-xs text-red-500">{statusErrors.status}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="admin_notes" className="mb-1 block text-sm font-medium">
                                                Admin Notes
                                            </label>
                                            <Textarea
                                                id="admin_notes"
                                                value={statusForm.admin_notes}
                                                onChange={(e) => setStatusFormData('admin_notes', e.target.value)}
                                                placeholder="Add any relevant notes for this status change..."
                                                className="min-h-[100px]"
                                            />
                                            {statusErrors.admin_notes && <p className="mt-1 text-xs text-red-500">{statusErrors.admin_notes}</p>}
                                        </div>
                                        <DialogFooter className="pt-2 sm:justify-start">
                                            <Button type="submit" disabled={statusProcessing}>
                                                {statusProcessing ? 'Updating...' : 'Save Changes'}
                                            </Button>
                                            <DialogClose asChild>
                                                <Button type="button" variant="outline">
                                                    Cancel
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Left Column: Overview */}
                    <div className="space-y-6 lg:col-span-4">
                        <Card>
                            <CardHeader className="flex-row items-center gap-3 space-y-0">
                                <Avatar className="h-12 w-12">
                                    <AvatarFallback>{student?.name?.charAt(0)?.toUpperCase() || 'S'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg">{student?.name || 'Student Information'}</CardTitle>
                                    <CardDescription>{student?.email || 'No email'}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 text-sm">
                                <p>
                                    <span className="font-medium">School:</span> {studentProfile?.school_name || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-medium">Level:</span> {studentProfile?.school_level || 'N/A'} (
                                    {studentProfile?.school_type ? studentProfile.school_type.replace('_', ' ') : 'N/A'})
                                </p>
                                {studentProfile?.student_id && (
                                    <p>
                                        <span className="font-medium">Student ID:</span> {studentProfile.student_id}
                                    </p>
                                )}
                                {studentProfile?.gpa && (
                                    <p>
                                        <span className="font-medium">GPA:</span> {studentProfile.gpa.toFixed(2)}
                                    </p>
                                )}
                                <Button asChild variant="link" className="text-primary mt-2 h-auto px-0">
                                    <Link href={student ? route('admin.students.show', student.id) : '#'}>
                                        View Full Profile <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <BookOpenText className="text-primary mr-2 h-5 w-5" />
                                    Scholarship Program
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <p className="text-base font-semibold">{program?.name || 'N/A'}</p>
                                <p>
                                    <span className="font-medium">Semester:</span> {program?.semester || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-medium">Academic Year:</span> {program?.academic_year || 'N/A'}
                                </p>
                                <p>
                                    <span className="font-medium">Deadline:</span> {formatDate(program?.application_deadline)}
                                </p>
                                <Button asChild variant="link" className="text-primary mt-2 h-auto px-0">
                                    <Link href={program ? route('admin.scholarships.show', program.id) : '#'}>
                                        View Program Details <ExternalLink className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {application.admin_notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <MessageSquare className="text-primary mr-2 h-5 w-5" />
                                        Admin Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="bg-muted/30 rounded-md p-4 text-sm whitespace-pre-wrap">
                                    {application.admin_notes}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: Document Processing & Other Details */}
                    <div className="space-y-6 lg:col-span-8">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-xl">
                                    <ListChecks className="text-primary mr-2 h-6 w-6" />
                                    Document Requirements
                                </CardTitle>
                                <CardDescription>
                                    Review and manage uploaded documents for this application.
                                    {allDocumentRequirements.length === 0 && ' No document requirements for this scholarship program.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {documentsWithStatus.length > 0
                                    ? documentsWithStatus.map(({ requirement, upload }) => (
                                          <div key={requirement.id} className="p-0">
                                              <div className="mb-2">
                                                  <h4 className="text-md flex items-center font-semibold">
                                                      {requirement.name}
                                                      {requirement.is_required && (
                                                          <Badge variant="destructive" className="ml-2 text-xs">
                                                              Required
                                                          </Badge>
                                                      )}
                                                  </h4>
                                                  <p className="text-muted-foreground text-xs">{requirement.description}</p>
                                              </div>
                                              <DocumentReviewForm docReq={requirement} upload={upload} />
                                          </div>
                                      ))
                                    : allDocumentRequirements.length > 0 && (
                                          <p className="text-muted-foreground py-4 text-center text-sm">
                                              No documents have been uploaded by the student yet.
                                          </p>
                                      )}
                            </CardContent>
                        </Card>

                        {application.communityServiceReports && application.communityServiceReports.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-xl">
                                        <Award className="text-primary mr-2 h-6 w-6" />
                                        Community Service
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {application.communityServiceReports.map((report) => (
                                        <div key={report.id} className="rounded-md border p-3">
                                            <p className="font-medium">
                                                {report.organization_name} - {report.hours} hours
                                            </p>
                                            <p className="text-muted-foreground text-sm">{report.description}</p>
                                            <p className="text-muted-foreground text-xs">
                                                Date: {formatDate(report.service_date)} | Status:{' '}
                                                <Badge variant="outline" className="capitalize">
                                                    {getStatusConfig(report.status).label}
                                                </Badge>
                                            </p>
                                            {/* Add review form/modal trigger here if needed for service reports */}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {application.disbursements && application.disbursements.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-xl">
                                        <DollarSign className="text-primary mr-2 h-6 w-6" />
                                        Disbursements
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {application.disbursements.map((dis) => (
                                        <div key={dis.id} className="rounded-md border p-3">
                                            <p className="font-medium">
                                                {formatCurrency(dis.amount)} - {dis.payment_method}
                                            </p>
                                            <p className="text-muted-foreground text-sm">Ref: {dis.reference_number || 'N/A'}</p>
                                            <p className="text-muted-foreground text-xs">
                                                Date: {formatDate(dis.disbursement_date)} | Status:{' '}
                                                <Badge variant="outline" className="capitalize">
                                                    {getStatusConfig(dis.status).label}
                                                </Badge>
                                            </p>
                                            {/* Add review/edit form/modal trigger here if needed for disbursements */}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
