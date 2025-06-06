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
    Search,
    X,
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
    scholarship_application: {
        id: number;
        student_profile: {
            id: number; // Added for completeness
            user: {
                name: string;
                email: string;
            };
        };
        scholarship_program: {
            id: number; // Added for completeness
            name: string;
        };
    } | null;
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
    scholarship_program?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
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
    { value: 'all', label: 'All Statuses' },
    { value: 'pending_review', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    {
        value: 'rejected',
        label: 'Rejected',
        subStatuses: [
            { value: 'rejected_insufficient_hours', label: 'Insufficient Hours' },
            { value: 'rejected_incomplete_documentation', label: 'Incomplete Docs' },
            { value: 'rejected_other', label: 'Other Reasons' },
        ],
    },
];

const reportTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'tracked', label: 'Tracked Hours' },
    { value: 'pdf_upload', label: 'PDF Upload' },
];

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (status === 'approved') return 'default';
    if (status === 'pending_review') return 'outline';
    if (status && status.startsWith('rejected')) return 'destructive';
    return 'secondary';
};

const formatReportStatus = (status: string): string => {
    for (const option of reportStatusOptions) {
        if (option.value === status) return option.label;
        if (option.subStatuses) {
            const subStatus = option.subStatuses.find((sub) => sub.value === status);
            if (subStatus) return `Rejected (${subStatus.label})`;
        }
    }
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatReportType = (type: string): string => {
    const option = reportTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function Index({ reports, stats, scholarshipPrograms, filters, auth }: IndexProps) {
    const [selectedReportIds, setSelectedReportIds] = useState<number[]>([]);
    const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
    const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | ''>('');

    useEffect(() => {
        console.log('Reports data from server:', reports);
    }, [reports]);

    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        status: filters.status || 'all',
        report_type: filters.report_type || 'all',
        scholarship_program: filters.scholarship_program || 'all',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        sort: filters.sort || 'submitted_at',
        direction: filters.direction || 'desc',
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

    const handleFilterChange = (key: keyof typeof data, value: string) => {
        setData(key, value);
    };

    useEffect(() => {
        const queryParams: Partial<Filters> = { ...data };
        // Clean up empty or 'all' params to not pollute the URL
        (Object.keys(queryParams) as Array<keyof typeof queryParams>).forEach((key) => {
            if (queryParams[key] === '' || queryParams[key] === 'all') {
                delete queryParams[key];
            }
        });

        // Debounce requests
        const timeout = setTimeout(() => {
            router.get(route('admin.community-service.index'), queryParams as any, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [data]);

    const handleSort = (column: string) => {
        const newDirection = data.sort === column && data.direction === 'asc' ? 'desc' : 'asc';
        setData((prevData) => ({ ...prevData, sort: column, direction: newDirection }));
    };

    const resetFilters = () => {
        setData({
            search: '',
            status: 'all',
            report_type: 'all',
            scholarship_program: 'all',
            date_from: '',
            date_to: '',
            sort: 'submitted_at',
            direction: 'desc',
        });
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        setSelectedReportIds(checked === true ? reports.data.map((report) => report.id) : []);
    };

    const handleRowSelect = (reportId: number, checked: boolean) => {
        setSelectedReportIds((prev) => (checked ? [...prev, reportId] : prev.filter((id) => id !== reportId)));
    };

    const openBulkActionModal = (action: 'approve' | 'reject') => {
        setBulkActionType(action);
        setIsBulkActionModalOpen(true);
        setBulkActionFormData('action', action);
    };

    const processBulkAction = (e: React.FormEvent) => {
        e.preventDefault();
        submitBulkAction(route('admin.community-service.bulk-update-reports'), {
            onSuccess: () => {
                setIsBulkActionModalOpen(false);
                setSelectedReportIds([]);
                toast.success(`Successfully processed ${bulkActionForm.report_ids.length} reports.`);
            },
            onError: () => {
                toast.error('An error occurred. Please check the form for details.');
            },
            preserveScroll: true,
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
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium'>{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold'>{value}</div>
                {description && <p className='text-xs text-muted-foreground'>{description}</p>}
            </CardContent>
        </Card>
    );

    return (
        <AppLayout
            header={
                <div className='flex items-center justify-between'>
                    <h2 className='text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200'>
                        Community Service Reports
                    </h2>
                    <div className='flex items-center space-x-2'>
                        <Button
                            variant='outline'
                            onClick={() => router.get(route('admin.community-service.index'), {}, { preserveScroll: true, preserveState: false })}
                        >
                            <RefreshCw className='mr-2 h-4 w-4' />
                            Refresh
                        </Button>
                        <Button
                            variant='outline'
                            asChild
                        >
                            <Link href={route('admin.community-service.export', data as any)}>
                                <Download className='mr-2 h-4 w-4' />
                                Export
                            </Link>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title='Community Service Reports' />

            <div className='space-y-6 p-4 md:p-6'>
                {/* Stats Section */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    <StatCard
                        title='Pending Review'
                        value={stats.pending_review}
                        icon={<Clock className='h-4 w-4 text-muted-foreground' />}
                        description='Reports awaiting admin action'
                    />
                    <StatCard
                        title='Approved Total'
                        value={stats.approved}
                        icon={<CheckCircle2 className='h-4 w-4 text-muted-foreground' />}
                        description='All-time approved reports'
                    />
                    <StatCard
                        title='Total Hours Approved'
                        value={`${stats.total_hours_approved.toFixed(2)} hrs`}
                        icon={<BarChart3 className='h-4 w-4 text-muted-foreground' />}
                        description='Total all-time rendered hours'
                    />
                    <StatCard
                        title='Rejected Total'
                        value={stats.rejected}
                        icon={<XCircle className='h-4 w-4 text-muted-foreground' />}
                        description='All-time rejected reports'
                        cardClassName='text-destructive'
                    />
                </div>

                {/* Filter and Search Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search Reports</CardTitle>
                        <CardDescription>
                            Use the filters below to find specific reports. Results will update automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6'>
                            <div className='col-span-full xl:col-span-2'>
                                <Label htmlFor='search'>Search Student or Program</Label>
                                <div className='relative'>
                                    <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                                    <Input
                                        id='search'
                                        type='search'
                                        placeholder='Search by name, email...'
                                        className='w-full pl-8'
                                        value={data.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='status'>Status</Label>
                                <Select value={data.status} onValueChange={(value) => handleFilterChange('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Filter by status' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportStatusOptions.map((option) =>
                                            option.subStatuses ? (
                                                <React.Fragment key={option.value}>
                                                    <SelectItem value={option.value} className='font-bold'>
                                                        {option.label}
                                                    </SelectItem>
                                                    {option.subStatuses.map((sub) => (
                                                        <SelectItem key={sub.value} value={sub.value} className='pl-6'>
                                                            {sub.label}
                                                        </SelectItem>
                                                    ))}
                                                </React.Fragment>
                                            ) : (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor='report_type'>Report Type</Label>
                                <Select
                                    value={data.report_type}
                                    onValueChange={(value) => handleFilterChange('report_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Filter by type' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {reportTypeOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor='scholarship_program'>Scholarship Program</Label>
                                <Select
                                    value={data.scholarship_program}
                                    onValueChange={(value) => handleFilterChange('scholarship_program', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder='Filter by program' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='all'>All Programs</SelectItem>
                                        {scholarshipPrograms.map((program) => (
                                            <SelectItem key={program.id} value={String(program.id)}>
                                                {program.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='flex items-end'>
                                <Button variant='outline' onClick={resetFilters} className='w-full'>
                                    <X className='mr-2 h-4 w-4' />
                                    Reset Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <div>
                                <CardTitle>Report Submissions</CardTitle>
                                <CardDescription>
                                    Showing {reports.from}-{reports.to} of {reports.total} reports.
                                </CardDescription>
                            </div>
                            {selectedReportIds.length > 0 && (
                                <div className='flex items-center space-x-2'>
                                    <span className='text-sm text-muted-foreground'>
                                        {selectedReportIds.length} selected
                                    </span>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => openBulkActionModal('approve')}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant='destructive'
                                        size='sm'
                                        onClick={() => openBulkActionModal('reject')}
                                    >
                                        Reject
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-x-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className='w-[40px]'>
                                            <Checkbox
                                                checked={
                                                    reports.data.length > 0 &&
                                                    selectedReportIds.length === reports.data.length
                                                        ? true
                                                        : selectedReportIds.length > 0
                                                          ? 'indeterminate'
                                                          : false
                                                }
                                                onCheckedChange={handleSelectAll}
                                                aria-label='Select all'
                                            />
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant='ghost'
                                                onClick={() => handleSort('student_name')}
                                                className='px-0'
                                            >
                                                Student
                                                <ArrowUpDown className='ml-2 h-4 w-4' />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant='ghost'
                                                onClick={() => handleSort('scholarship_program')}
                                                className='px-0'
                                            >
                                                Program
                                                <ArrowUpDown className='ml-2 h-4 w-4' />
                                            </Button>
                                        </TableHead>
                                        <TableHead className='text-center'>Report Type</TableHead>
                                        <TableHead className='text-center'>Hours / Days</TableHead>
                                        <TableHead>
                                            <Button
                                                variant='ghost'
                                                onClick={() => handleSort('status')}
                                                className='px-0'
                                            >
                                                Status
                                                <ArrowUpDown className='ml-2 h-4 w-4' />
                                            </Button>
                                        </TableHead>
                                        <TableHead>
                                            <Button
                                                variant='ghost'
                                                onClick={() => handleSort('submitted_at')}
                                                className='px-0'
                                            >
                                                Submitted
                                                <ArrowUpDown className='ml-2 h-4 w-4' />
                                            </Button>
                                        </TableHead>
                                        <TableHead className='text-right'>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reports.data.length > 0 ? (
                                        reports.data.map((report) => (
                                            <TableRow
                                                key={report.id}
                                                data-state={selectedReportIds.includes(report.id) && 'selected'}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedReportIds.includes(report.id)}
                                                        onCheckedChange={(checked) => handleRowSelect(report.id, !!checked)}
                                                        aria-label={`Select report ${report.id}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className='font-medium'>
                                                        {report.scholarship_application?.student_profile?.user?.name ?? (
                                                            <span className='text-destructive'>No Student Data</span>
                                                        )}
                                                    </div>
                                                    <div className='text-sm text-muted-foreground'>
                                                        {report.scholarship_application?.student_profile?.user?.email ?? ''}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {report.scholarship_application?.scholarship_program?.name ?? (
                                                        <span className='text-destructive'>No Program</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    {formatReportType(report.report_type)}
                                                </TableCell>
                                                <TableCell className='text-center'>
                                                    <div className='font-semibold'>{report.total_hours} hrs</div>
                                                    <div className='text-xs text-muted-foreground'>
                                                        {report.days_completed} days
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(report.status)}>
                                                        {formatReportStatus(report.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div>{formatDate(report.submitted_at)}</div>
                                                    <div className='text-sm text-muted-foreground'>
                                                        {getDaysAgo(report.submitted_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className='text-right'>
                                                    <Link
                                                        href={route('admin.community-service.show', report.id)}
                                                        className='inline-flex items-center rounded-md p-2 text-sm font-medium hover:bg-accent'
                                                        title='View Details'
                                                    >
                                                        <Eye className='h-5 w-5' />
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className='h-24 text-center'>
                                                No reports found matching your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className='flex w-full items-center justify-between'>
                            <div className='text-sm text-muted-foreground'>
                                {selectedReportIds.length} of {reports.total} row(s) selected.
                            </div>
                            {/* Pagination */}
                            <div className='flex items-center space-x-2'>
                                {reports.links.map((link, index) =>
                                    link.url ? (
                                        <Button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, {}, { preserveScroll: true, replace: true });
                                                }
                                            }}
                                            size='sm'
                                            variant={link.active ? 'default' : 'outline'}
                                            disabled={processing}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <Button
                                            key={index}
                                            size='sm'
                                            variant='outline'
                                            disabled
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ),
                                )}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Bulk Action Confirmation Modal */}
            <AlertDialog open={isBulkActionModalOpen} onOpenChange={setIsBulkActionModalOpen}>
                <AlertDialogContent>
                    <form onSubmit={processBulkAction}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will
                                <span className='font-semibold text-foreground'>
                                    {bulkActionType === 'approve' ? ' APPROVE ' : ' REJECT '}
                                </span>
                                <span className='font-bold text-foreground'>{selectedReportIds.length}</span> report(s).
                                Student(s) will be notified.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        {bulkActionType === 'reject' && (
                            <div className='my-4'>
                                <Label htmlFor='rejection_reason'>Rejection Reason (Required)</Label>
                                <Textarea
                                    id='rejection_reason'
                                    value={bulkActionForm.rejection_reason}
                                    onChange={(e) => setBulkActionFormData('rejection_reason', e.target.value)}
                                    placeholder='Provide a clear reason for rejection...'
                                    required
                                />
                                {bulkActionErrors.rejection_reason && (
                                    <p className='mt-1 text-sm text-destructive'>
                                        {bulkActionErrors.rejection_reason}
                                    </p>
                                )}
                            </div>
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => resetBulkActionForm('rejection_reason')}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction type='submit' disabled={bulkProcessing}>
                                {bulkProcessing ? 'Processing...' : 'Confirm'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
