import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { differenceInDays, format, parseISO } from 'date-fns';
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    BarChart3,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    ListFilter,
    RefreshCw,
    TrendingUp,
    XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Interfaces (from existing file, adjusted for clarity if needed)
interface Report {
    id: number;
    status: string;
    report_type: string;
    days_completed: number;
    total_hours: number;
    submitted_at: string;
    reviewed_at?: string;
    description: string; // Kept for potential tooltips, though not directly in table
    scholarshipApplication: {
        id: number;
        studentProfile: {
            id: number; // Added for completeness
            user: {
                name: string;
                email: string;
            };
        };
        scholarshipProgram: {
            id: number; // Added for completeness
            name: string;
        };
    };
}

interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

interface PaginatedReports {
    data: Report[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Stats {
    pending_review: number;
    approved: number;
    rejected: number;
    total: number;
    total_hours_approved: number;
    // total_days_approved: number; // This seems redundant if hours are tracked
    this_week_submissions: number; // Renamed for clarity
    this_month_submissions: number; // Renamed for clarity
    avg_processing_time_hours: string; // Assuming this might come as formatted string or number of hours
}

interface ScholarshipProgram {
    id: number;
    name: string;
}

interface Filters {
    status?: string;
    report_type?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    scholarship_program_id?: string; // Changed to id
    sort_by?: string; // Renamed for clarity
    sort_direction?: 'asc' | 'desc'; // Renamed for clarity
}

interface IndexProps {
    reports: PaginatedReports;
    stats: Stats;
    scholarshipPrograms: ScholarshipProgram[];
    filters: Filters;
    auth: { user: { id: number; name: string; email: string } }; // Keep for potential future use, AppLayout might not need it directly
}

// Helper Functions
const formatDate = (dateString?: string | null, dateFormat = 'MMM d, yyyy') => {
    if (!dateString) return 'N/A';
    try {
        return format(parseISO(dateString), dateFormat);
    } catch (error) {
        return 'Invalid Date';
    }
};

const getDaysAgo = (dateString?: string | null): string => {
    if (!dateString) return 'N/A';
    try {
        const days = differenceInDays(new Date(), parseISO(dateString));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    } catch (error) {
        return 'Invalid Date';
    }
};

const reportStatusOptions = [
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected_guidelines', label: 'Rejected (Guidelines)' },
    { value: 'rejected_incomplete', label: 'Rejected (Incomplete)' },
    { value: 'rejected_other', label: 'Rejected (Other)' },
];

const reportTypeOptions = [
    { value: 'tracked', label: 'Tracked Hours' },
    { value: 'pdf_upload', label: 'PDF Upload' },
];

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' => {
    if (status === 'approved') return 'default'; // Greenish in shadcn default theme
    if (status === 'pending_review') return 'warning'; // Orangish/Yellowish
    if (status && status.startsWith('rejected')) return 'destructive';
    return 'secondary';
};

const formatReportStatus = (status: string): string => {
    const option = reportStatusOptions.find((opt) => opt.value === status);
    return option ? option.label : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatReportType = (type: string): string => {
    const option = reportTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function Index({ reports, stats, scholarshipPrograms, filters, auth }: IndexProps) {
    const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
    const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | ''>('');

    const reportsIndexBreadcrumbs: BreadcrumbItem[] = [
        { title: 'Community Service Dashboard', href: route('admin.community-service.dashboard') },
        { title: 'All Reports' },
    ];

    const {
        data: filterForm,
        setData: setFilterFormData,
        get: applyFilters,
        processing: filterProcessing,
    } = useForm<Filters>({
        search: filters.search || '',
        status: filters.status || 'all_statuses',
        report_type: filters.report_type || 'all_types',
        scholarship_program_id: filters.scholarship_program_id || 'all_programs',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        sort_by: filters.sort_by || 'submitted_at',
        sort_direction: filters.sort_direction || 'desc',
    });

    const {
        data: bulkActionForm,
        setData: setBulkActionFormData,
        post: submitBulkAction,
        processing: bulkProcessing,
        errors: bulkActionErrors,
        reset: resetBulkActionForm,
    } = useForm({
        report_ids: [] as number[],
        action: '',
        rejection_reason: '',
    });

    useEffect(() => {
        setBulkActionFormData('report_ids', selectedReportIds);
    }, [selectedReportIds]);

    const handleFilterSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        applyFilters(route('admin.community-service.index'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setIsFilterSheetOpen(false),
        });
    };

    const handleSort = (column: string) => {
        const newDirection = filterForm.sort_by === column && filterForm.sort_direction === 'asc' ? 'desc' : 'asc';
        setFilterFormData((prev) => ({ ...prev, sort_by: column, sort_direction: newDirection }));
        // Auto-apply sort
        // Need to use a timeout or useEffect to apply filters after state update
        // For simplicity, direct call (might have stale data if not careful, but useForm handles it)
        router.get(
            route('admin.community-service.index'),
            {
                ...filterForm, // Pass current form data
                sort_by: column,
                sort_direction: newDirection,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilters = () => {
        router.get(
            route('admin.community-service.index'),
            {},
            {
                onSuccess: () => {
                    setFilterFormData({
                        search: '',
                        status: '',
                        report_type: '',
                        scholarship_program_id: '',
                        date_from: '',
                        date_to: '',
                        sort_by: 'submitted_at',
                        sort_direction: 'desc',
                    });
                    setIsFilterSheetOpen(false);
                },
            },
        );
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            setSelectedReportIds(reports.data.map((r) => r.id));
        } else {
            setSelectedReportIds([]);
        }
    };

    const handleRowSelect = (reportId: number, checked: boolean) => {
        setSelectedReportIds((prev) => (checked ? [...prev, reportId] : prev.filter((id) => id !== reportId)));
    };

    const openBulkActionModal = (action: 'approve' | 'reject') => {
        setBulkActionType(action);
        setBulkActionFormData('action', action);
        setIsBulkActionModalOpen(true);
    };

    const processBulkAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (bulkActionType === 'reject' && !bulkActionForm.rejection_reason) {
            toast.error('Rejection reason is required for bulk rejection.');
            return;
        }
        submitBulkAction(route('admin.community-service.reports.bulk-update'), {
            // Ensure this route exists
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Reports ${bulkActionType}ed successfully.`);
                setSelectedReportIds([]);
                setIsBulkActionModalOpen(false);
                resetBulkActionForm();
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join(' ');
                toast.error(`Failed to ${bulkActionType} reports. ${errorMessages}`);
            },
        });
    };

    const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description?: string; cardClassName?: string }> = ({
        title,
        value,
        icon,
        description,
        cardClassName,
    }) => (
        <Card className={cardClassName}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-muted-foreground text-xs">{description}</p>}
            </CardContent>
        </Card>
    );

    const allSelectedOnPage = reports.data.length > 0 && selectedReportIds.length === reports.data.length;
    const isIndeterminate = selectedReportIds.length > 0 && selectedReportIds.length < reports.data.length;

    return (
        <AppLayout breadcrumbs={reportsIndexBreadcrumbs}>
            <Head title="Community Service Reports" />
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* Header & Actions */}
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-foreground text-3xl font-bold tracking-tight">Community Service Reports</h1>
                            <p className="text-muted-foreground">Review and manage student community service submissions.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="gap-1.5">
                                        <ListFilter className="h-4 w-4" />
                                        Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-md">
                                    <SheetHeader>
                                        <SheetTitle>Filter Reports</SheetTitle>
                                        <SheetDescription>Refine the list of reports based on criteria.</SheetDescription>
                                    </SheetHeader>
                                    <form onSubmit={handleFilterSubmit} className="flex h-full flex-col">
                                        <div className="flex-grow space-y-6 overflow-y-auto p-6">
                                            <div>
                                                <Label htmlFor="search-filter">Search</Label>
                                                <Input
                                                    id="search-filter"
                                                    placeholder="Student, email, program..."
                                                    value={filterForm.search}
                                                    onChange={(e) => setFilterFormData('search', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-muted-foreground text-sm font-medium">Filter by Category</h4>
                                                <div>
                                                    <Label htmlFor="status-filter">Status</Label>
                                                    <Select value={filterForm.status} onValueChange={(val) => setFilterFormData('status', val)}>
                                                        <SelectTrigger id="status-filter">
                                                            <SelectValue placeholder="All Statuses" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all_statuses">All Statuses</SelectItem>
                                                            {reportStatusOptions.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="report-type-filter">Report Type</Label>
                                                    <Select
                                                        value={filterForm.report_type}
                                                        onValueChange={(val) => setFilterFormData('report_type', val)}
                                                    >
                                                        <SelectTrigger id="report-type-filter">
                                                            <SelectValue placeholder="All Types" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="all_types">All Types</SelectItem>
                                                            {reportTypeOptions.map((opt) => (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="program-filter">Scholarship Program</Label>
                                                    <Select
                                                        value={filterForm.scholarship_program_id}
                                                        onValueChange={(val) => setFilterFormData('scholarship_program_id', val)}
                                                    >
                                                        <SelectTrigger id="program-filter">
                                                            <SelectValue placeholder="All Programs" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value={'all_programs'}>All Programs</SelectItem>
                                                            {scholarshipPrograms
                                                                .filter((p) => String(p.id) !== '')
                                                                .map((p) => (
                                                                    <SelectItem key={p.id} value={String(p.id)}>
                                                                        {p.name}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="text-muted-foreground text-sm font-medium">Filter by Submission Date</h4>
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <Label htmlFor="date-from-filter">From</Label>
                                                        <Input
                                                            id="date-from-filter"
                                                            type="date"
                                                            value={filterForm.date_from}
                                                            onChange={(e) => setFilterFormData('date_from', e.target.value)}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="date-to-filter">To</Label>
                                                        <Input
                                                            id="date-to-filter"
                                                            type="date"
                                                            value={filterForm.date_to}
                                                            onChange={(e) => setFilterFormData('date_to', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <SheetFooter className="mt-auto gap-2 border-t p-6">
                                            <Button type="button" variant="outline" onClick={resetFilters} disabled={filterProcessing}>
                                                Reset
                                            </Button>
                                            <Button type="submit" disabled={filterProcessing}>
                                                {filterProcessing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                                Apply Filters
                                            </Button>
                                        </SheetFooter>
                                    </form>
                                </SheetContent>
                            </Sheet>
                            <Button variant="outline" asChild className="gap-1.5">
                                <Link href={route('admin.community-service.export', filterForm)}>
                                    <Download className="h-4 w-4" />
                                    Export
                                </Link>
                            </Button>
                            <Button asChild className="gap-1.5">
                                <Link href={route('admin.community-service.dashboard')}>
                                    <BarChart3 className="h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <StatCard
                            title="Pending Review"
                            value={stats.pending_review}
                            icon={<Clock className="text-muted-foreground h-4 w-4" />}
                            description="Reports awaiting action"
                            cardClassName="xl:col-span-2"
                        />
                        <StatCard
                            title="Approved"
                            value={stats.approved}
                            icon={<CheckCircle2 className="text-muted-foreground h-4 w-4" />}
                            description="Total approved reports"
                        />
                        <StatCard
                            title="Rejected"
                            value={stats.rejected}
                            icon={<XCircle className="text-muted-foreground h-4 w-4" />}
                            description="Total rejected reports"
                        />
                        <StatCard
                            title="Submissions (Week)"
                            value={stats.this_week_submissions}
                            icon={<TrendingUp className="text-muted-foreground h-4 w-4" />}
                            description="New reports this week"
                        />
                        <StatCard
                            title="Avg. Review Time"
                            value={stats.avg_processing_time_hours}
                            icon={<Activity className="text-muted-foreground h-4 w-4" />}
                            description="Average hours to review"
                        />
                    </div>

                    {/* Bulk Actions Bar */}
                    {selectedReportIds.length > 0 && (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-between gap-4 p-4 sm:flex-row">
                                <div className="text-sm font-medium">
                                    {selectedReportIds.length} report{selectedReportIds.length !== 1 ? 's' : ''} selected.
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => openBulkActionModal('approve')}>
                                        Approve Selected
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => openBulkActionModal('reject')}>
                                        Reject Selected
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setSelectedReportIds([])}>
                                        Clear Selection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reports Table Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Reports ({reports.total})</CardTitle>
                            <CardDescription>
                                Displaying {reports.from}-{reports.to} of {reports.total} reports.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <Checkbox
                                                checked={allSelectedOnPage || (isIndeterminate ? 'indeterminate' : false)}
                                                onCheckedChange={handleSelectAll}
                                                aria-label="Select all reports on this page"
                                            />
                                        </TableHead>
                                        <TableHead
                                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleSort('student_name')}
                                        >
                                            Student / Program
                                            {filterForm.sort_by === 'student_name' && <ArrowUpDown className="ml-2 inline h-3 w-3" />}
                                        </TableHead>
                                        <TableHead
                                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            Status
                                            {filterForm.sort_by === 'status' && <ArrowUpDown className="ml-2 inline h-3 w-3" />}
                                        </TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead
                                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                                            onClick={() => handleSort('submitted_at')}
                                        >
                                            Submitted
                                            {filterForm.sort_by === 'submitted_at' && <ArrowUpDown className="ml-2 inline h-3 w-3" />}
                                        </TableHead>
                                        <TableHead className="w-[100px] text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.data.length > 0 ? (
                                        reports.data.map((report) => (
                                            <TableRow key={report.id} data-state={selectedReportIds.includes(report.id) ? 'selected' : undefined}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedReportIds.includes(report.id)}
                                                        onCheckedChange={(checked) => handleRowSelect(report.id, !!checked)}
                                                        aria-label={`Select report ${report.id}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {report.scholarshipApplication?.studentProfile?.user?.name || 'Unknown Student'}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {report.scholarshipApplication?.scholarshipProgram?.name || 'Unknown Program'}
                                                    </div>
                                                    <div className="text-muted-foreground/70 text-xs">
                                                        {report.scholarshipApplication?.studentProfile?.user?.email || 'No email'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(report.status)}>{formatReportStatus(report.status)}</Badge>
                                                    {report.status === 'pending_review' &&
                                                        differenceInDays(new Date(), parseISO(report.submitted_at)) > 3 && (
                                                            <div className="text-destructive mt-1 flex items-center gap-1 text-xs">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Urgent
                                                            </div>
                                                        )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="whitespace-nowrap">
                                                        {formatReportType(report.report_type)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{report.total_hours}</TableCell>
                                                <TableCell>
                                                    <div>{formatDate(report.submitted_at)}</div>
                                                    <div className="text-muted-foreground text-xs">{getDaysAgo(report.submitted_at)}</div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button asChild variant="ghost" size="icon">
                                                        <Link href={route('admin.community-service.show', report.id)}>
                                                            <Eye className="h-4 w-4" />
                                                            <span className="sr-only">View Report</span>
                                                        </Link>
                                                    </Button>
                                                    {/* Add more actions in a DropdownMenu if needed */}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No reports found. Try adjusting your filters.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {reports.data.length > 0 && (
                            <CardFooter className="flex items-center justify-between border-t pt-6">
                                <div className="text-muted-foreground text-sm">
                                    {selectedReportIds.length} of {reports.total} row(s) selected.
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                reports.links.find((link) => link.label.includes('Previous'))?.url || '',
                                                {},
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                        disabled={!reports.links.find((link) => link.label.includes('Previous'))?.url || filterProcessing}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-muted-foreground text-sm">
                                        Page {reports.current_page} of {reports.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                reports.links.find((link) => link.label.includes('Next'))?.url || '',
                                                {},
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                        disabled={!reports.links.find((link) => link.label.includes('Next'))?.url || filterProcessing}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>

            {/* Bulk Action Confirmation Dialog */}
            <AlertDialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{bulkActionType === 'approve' ? 'Bulk Approve Reports' : 'Bulk Reject Reports'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to {bulkActionType} {selectedReportIds.length} report
                            {selectedReportIds.length !== 1 ? 's' : ''}.{bulkActionType === 'reject' && ' Please provide a reason.'} This action
                            cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {bulkActionType === 'reject' && (
                        <div className="space-y-1 py-2">
                            <Label htmlFor="bulk_rejection_reason">Rejection Reason</Label>
                            <Textarea
                                id="bulk_rejection_reason"
                                value={bulkActionForm.rejection_reason}
                                onChange={(e) => setBulkActionFormData('rejection_reason', e.target.value)}
                                placeholder="Provide a common reason for rejecting these reports..."
                                rows={3}
                            />
                            {bulkActionErrors.rejection_reason && <p className="text-destructive text-sm">{bulkActionErrors.rejection_reason}</p>}
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => resetBulkActionForm()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={processBulkAction}
                            disabled={bulkProcessing || (bulkActionType === 'reject' && !bulkActionForm.rejection_reason)}
                            className={bulkActionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                        >
                            {bulkProcessing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm {bulkActionType === 'approve' ? 'Approval' : 'Rejection'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
