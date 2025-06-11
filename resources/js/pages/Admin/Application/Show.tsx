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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import {
    ScholarshipApplication as ApplicationType,
    BreadcrumbItem,
    CommunityServiceReport as CommunityServiceReportTypeBase,
    Disbursement as DisbursementType,
    DocumentRequirement as DocumentRequirementType,
    DocumentUpload as DocumentUploadType,
    ScholarshipProgram as ScholarshipProgramType,
    StudentProfile as StudentProfileType,
    User as UserType,
} from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
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
    Upload,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import {
    Dialog as ShadDialog,
    DialogTrigger as ShadDialogTrigger,
    DialogContent as ShadDialogContent,
    DialogHeader as ShadDialogHeader,
    DialogTitle as ShadDialogTitle,
    DialogDescription as ShadDialogDescription,
    DialogFooter as ShadDialogFooter,
    DialogClose as ShadDialogClose,
} from '@/components/ui/dialog';

// Extend CommunityServiceReportType to allow entries for tracked reports
interface CommunityServiceEntryType {
    id: number;
    status: string;
    service_date: string;
    hours_completed: number;
}

interface CommunityServiceReportType extends CommunityServiceReportTypeBase {
    entries?: CommunityServiceEntryType[];
}

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
    const label = s.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

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
    const [confirmModal, setConfirmModal] = useState<{ open: boolean; reportId?: number; action?: 'approve' | 'reject' }>({ open: false });

    const {
        data: statusForm,
        setData: setStatusFormData,
        patch: patchStatusUpdate,
        processing: statusProcessing,
        errors: statusErrors,
        reset: resetStatusForm,
        recentlySuccessful: statusRecentlySuccessful,
    } = useForm({
        status: application.status || '',
        admin_notes: application.admin_notes || '',
    });

    useEffect(() => {
        if (isStatusModalOpen) {
            setStatusFormData({
                status: application.status || '',
                admin_notes: application.admin_notes || '',
            });
        }
    }, [isStatusModalOpen, application.status, application.admin_notes]);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Applications', href: route('admin.applications.index') },
        { title: 'Application #' + application.id },
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

    const handleStatusUpdateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patchStatusUpdate(route('admin.applications.status.update', application.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsStatusModalOpen(false);
                // Data will be refreshed by Inertia, no need to reset form manually if relying on useEffect
            },
            onError: () => {
                // Errors are automatically handled by useForm and displayed
            },
        });
    };

    const handleApproveReport = (reportId: number) => {
        router.patch(
            route('admin.community-service.update-status', reportId),
            { status: 'approved' },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Report approved successfully.'),
                onError: () => toast.error('Failed to approve report.'),
            }
        );
    };
    const handleRejectReport = (reportId: number) => {
        router.patch(
            route('admin.community-service.update-status', reportId),
            { status: 'rejected_other' },
            {
                preserveScroll: true,
                onSuccess: () => toast.success('Report rejected.'),
                onError: () => toast.error('Failed to reject report.'),
            }
        );
    };

    const FilePreviewDisplay: React.FC<{ upload: DocumentUploadType }> = ({ upload }) => {
        const fileType = getFileType(upload.original_filename);
        const filePath = route('admin.documents.view', upload.id);

        if (fileType === 'image') {
            return (
                <img
                    src={filePath}
                    alt={'Preview of ' + upload.original_filename}
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
        const docForm = useForm({
            status: upload?.status || 'pending_review',
            rejection_reason: upload?.rejection_reason || '',
            _method: 'PATCH',
        });
        const { data, setData, post, processing, errors, reset } = docForm;

        // Admin upload form
        const adminUploadForm = useForm({
            document_file: null as File | null,
            admin_notes: '',
        });

        const [isAdminUploadModalOpen, setIsAdminUploadModalOpen] = useState(false);

        useEffect(() => {
            // Keep form in sync if upload prop changes (e.g., after successful review)
            setData({
                status: upload?.status || 'pending_review',
                rejection_reason: upload?.rejection_reason || '',
                _method: 'PATCH',
            });
        }, [upload?.status, upload?.rejection_reason]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (!upload) return;
            post(route('admin.documents.review', upload.id), {
                // POST is fine due to _method: 'PATCH'
                preserveScroll: true,
                onSuccess: () => {
                    // reset(); // Inertia will re-render with new props, form syncs via useEffect
                },
            });
        };

        const handleAdminUpload = (e: React.FormEvent) => {
            e.preventDefault();
            if (!adminUploadForm.data.document_file) return;

            adminUploadForm.post(route('admin.documents.upload-for-student', { 
                application: application.id, 
                requirement: docReq.id 
            }), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAdminUploadModalOpen(false);
                    adminUploadForm.reset();
                },
            });
        };

        if (!upload) {
            return (
                <div className="space-y-3">
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
                        <div className="flex items-center gap-2">
                            <FileClock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            <p className="dark:text-yellow-300\\ text-sm font-medium text-yellow-700">Document Not Uploaded</p>
                        </div>
                        <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                            This {docReq.is_required ? 'required' : 'optional'} document has not been submitted by the student.
                        </p>
                    </div>
                    
                    <Dialog open={isAdminUploadModalOpen} onOpenChange={setIsAdminUploadModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload for Student
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Upload Document for Student</DialogTitle>
                                <DialogDescription>
                                    Upload this document on behalf of the student (e.g., from hardcopy submission).
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAdminUpload} className="space-y-4">
                                <div>
                                    <Label htmlFor="document_file">Document File</Label>
                                    <Input
                                        id="document_file"
                                        type="file"
                                        onChange={(e) => adminUploadForm.setData('document_file', e.target.files?.[0] || null)}
                                        className="mt-1"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                    {adminUploadForm.errors.document_file && (
                                        <p className="mt-1 text-xs text-red-500">{adminUploadForm.errors.document_file}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="admin_notes">Admin Notes</Label>
                                    <Textarea
                                        id="admin_notes"
                                        value={adminUploadForm.data.admin_notes}
                                        onChange={(e) => adminUploadForm.setData('admin_notes', e.target.value)}
                                        placeholder="Note about this upload (e.g., 'Uploaded from hardcopy submission')"
                                        className="mt-1"
                                    />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={adminUploadForm.processing || !adminUploadForm.data.document_file}>
                                        {adminUploadForm.processing ? 'Uploading...' : 'Upload Document'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        }

        const currentDocStatusConfig = getStatusConfig(upload.status);
        const fileDisplayPath = route('admin.documents.view', upload.id);

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
                    <Dialog open={isAdminUploadModalOpen} onOpenChange={setIsAdminUploadModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Upload className="mr-1.5 h-3.5 w-3.5" />
                                Replace Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Replace Document for Student</DialogTitle>
                                <DialogDescription>
                                    Upload a replacement document on behalf of the student.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAdminUpload} className="space-y-4">
                                <div>
                                    <Label htmlFor="document_file_replace">Document File</Label>
                                    <Input
                                        id="document_file_replace"
                                        type="file"
                                        onChange={(e) => adminUploadForm.setData('document_file', e.target.files?.[0] || null)}
                                        className="mt-1"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                    />
                                    {adminUploadForm.errors.document_file && (
                                        <p className="mt-1 text-xs text-red-500">{adminUploadForm.errors.document_file}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="admin_notes_replace">Admin Notes</Label>
                                    <Textarea
                                        id="admin_notes_replace"
                                        value={adminUploadForm.data.admin_notes}
                                        onChange={(e) => adminUploadForm.setData('admin_notes', e.target.value)}
                                        placeholder="Note about this replacement (e.g., 'Replaced with clearer copy')"
                                        className="mt-1"
                                    />
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={adminUploadForm.processing || !adminUploadForm.data.document_file}>
                                        {adminUploadForm.processing ? 'Uploading...' : 'Replace Document'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Badge variant={currentDocStatusConfig.variant} className="my-2 text-xs whitespace-nowrap capitalize">
                    {React.createElement(currentDocStatusConfig.icon, { className: cn('mr-1 h-3.5 w-3.5', currentDocStatusConfig.colorClass) })}
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

    // Determine if all documents are approved
    const allDocsApproved = documentsWithStatus.length > 0 && documentsWithStatus.every(doc => doc.status === 'approved');

    const renderCommunityServiceReports = () => {
        if (!application.communityServiceReports || application.communityServiceReports.length === 0) return null;
        const pdfReport = application.communityServiceReports.find(r => r.report_type === 'pdf_upload' && r.pdf_report_path);
        if (pdfReport) {
            return (
                <div key={pdfReport.id} className="rounded-md border p-4 mb-4 bg-muted/10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={getStatusConfig(pdfReport.status).variant} className="capitalize">
                                {React.createElement(getStatusConfig(pdfReport.status).icon, { className: getStatusConfig(pdfReport.status).colorClass + ' mr-1 h-4 w-4' })}
                                {getStatusConfig(pdfReport.status).label}
                            </Badge>
                            <span className="font-semibold">Report #{pdfReport.id}</span>
                            <span className="text-xs text-muted-foreground">PDF Upload</span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-green-500 text-green-700" disabled={pdfReport.status === 'approved'} onClick={() => setConfirmModal({ open: true, reportId: pdfReport.id, action: 'approve' })}>
                                Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-700" disabled={pdfReport.status === 'approved'} onClick={() => setConfirmModal({ open: true, reportId: pdfReport.id, action: 'reject' })}>
                                Reject
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                                <a href={route('admin.community-service.reports.download-pdf', { report: pdfReport.id })} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-1" /> Download PDF
                                </a>
                            </Button>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="font-medium">Description:</span> {pdfReport.description}
                    </div>
                </div>
            );
        }
        // If no PDF, show all tracked reports as before
        return application.communityServiceReports.filter(r => r.report_type !== 'pdf_upload').map((report) => {
            const trackedReport = report as CommunityServiceReportType;
            return (
                <div key={report.id} className="rounded-md border p-4 mb-4 bg-muted/10">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <Badge variant={getStatusConfig(report.status).variant} className="capitalize">
                                {React.createElement(getStatusConfig(report.status).icon, { className: getStatusConfig(report.status).colorClass + ' mr-1 h-4 w-4' })}
                                {getStatusConfig(report.status).label}
                            </Badge>
                            <span className="font-semibold">Report #{report.id}</span>
                            <span className="text-xs text-muted-foreground">Tracked Sessions</span>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-green-500 text-green-700" disabled={report.status === 'approved'} onClick={() => setConfirmModal({ open: true, reportId: report.id, action: 'approve' })}>
                                Approve
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-500 text-red-700" disabled={report.status === 'approved'} onClick={() => setConfirmModal({ open: true, reportId: report.id, action: 'reject' })}>
                                Reject
                            </Button>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="font-medium">Description:</span> {report.description}
                    </div>
                    {report.report_type === 'tracked' && (trackedReport.entries?.length ?? 0) > 0 && (
                        <div className="mt-4">
                            <div className="font-semibold mb-2">Service Sessions</div>
                            <div className="space-y-2">
                                {trackedReport.entries?.map((entry: CommunityServiceEntryType) => (
                                    <div key={entry.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded border bg-background">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getStatusConfig(entry.status).variant} className="capitalize">
                                                {React.createElement(getStatusConfig(entry.status).icon, { className: getStatusConfig(entry.status).colorClass + ' mr-1 h-3 w-3' })}
                                                {getStatusConfig(entry.status).label}
                                            </Badge>
                                            <span className="font-medium">Session #{entry.id}</span>
                                            <span className="text-xs text-muted-foreground">{entry.service_date} | {entry.hours_completed}h</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="border-green-500 text-green-700" disabled={entry.status === 'approved'}>
                                                Approve
                                            </Button>
                                            <Button size="sm" variant="outline" className="border-red-500 text-red-700" disabled={entry.status === 'approved'}>
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        });
    };

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
                                {React.createElement(overallStatusConfig.icon, { className: cn('mr-1.5 h-4 w-4', overallStatusConfig.colorClass) })}
                                {overallStatusConfig.label}
                            </Badge>
                            <Dialog
                                open={isStatusModalOpen}
                                onOpenChange={(open) => {
                                    setIsStatusModalOpen(open);
                                    if (open) {
                                        // Reset form data when dialog is opened
                                        setStatusFormData({
                                            status: application.status || '',
                                            admin_notes: application.admin_notes || '',
                                        });
                                    }
                                }}
                            >
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
                                    <form onSubmit={handleStatusUpdateSubmit} className="space-y-4 py-2">
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
                        <Collapsible defaultOpen={!allDocsApproved}>
                            <div className="flex items-center justify-between">
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
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="ml-2">
                                        {allDocsApproved ? 'Show Documents' : 'Hide Documents'}
                                        {allDocsApproved && (
                                            <Badge variant="default" className="ml-2">All Approved</Badge>
                                        )}
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
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
                            </CollapsibleContent>
                        </Collapsible>

                        {application.communityServiceReports && application.communityServiceReports.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-xl">
                                        <Award className="text-primary mr-2 h-6 w-6" />
                                        Community Service Approval
                                    </CardTitle>
                                    <CardDescription>
                                        Review and approve community service reports and sessions submitted by the student.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {renderCommunityServiceReports()}
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

            <ShadDialog open={confirmModal.open} onOpenChange={open => setConfirmModal(c => ({ ...c, open }))}>
                <ShadDialogContent>
                    <ShadDialogHeader>
                        <ShadDialogTitle>
                            {confirmModal.action === 'approve' ? 'Approve Report?' : 'Reject Report?'}
                        </ShadDialogTitle>
                        <ShadDialogDescription>
                            {confirmModal.action === 'approve'
                                ? 'Are you sure you want to approve this community service report?'
                                : 'Are you sure you want to reject this community service report?'}
                        </ShadDialogDescription>
                    </ShadDialogHeader>
                    <ShadDialogFooter>
                        <Button
                            onClick={() => {
                                if (confirmModal.reportId && confirmModal.action === 'approve') handleApproveReport(confirmModal.reportId);
                                if (confirmModal.reportId && confirmModal.action === 'reject') handleRejectReport(confirmModal.reportId);
                                setConfirmModal({ open: false });
                            }}
                            variant={confirmModal.action === 'approve' ? 'default' : 'destructive'}
                        >
                            {confirmModal.action === 'approve' ? 'Approve' : 'Reject'}
                        </Button>
                        <ShadDialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </ShadDialogClose>
                    </ShadDialogFooter>
                </ShadDialogContent>
            </ShadDialog>
        </AppLayout>
    );
}
