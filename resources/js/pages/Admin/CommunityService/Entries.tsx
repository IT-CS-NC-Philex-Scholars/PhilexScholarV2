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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { differenceInDays, format, intervalToDuration, parseISO } from 'date-fns';
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    CheckCircle2,
    Clock,
    FileSearch,
    ListFilter,
    MoreHorizontal,
    RefreshCw,
    ThumbsDown,
    ThumbsUp,
    Timer,
    XCircle,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// Interfaces
interface User {
    name: string;
    email: string;
}

interface StudentProfile {
    id: number;
    user: User;
}

interface ScholarshipProgram {
    id: number;
    name: string;
}

interface ScholarshipApplication {
    id: number;
    studentProfile: StudentProfile;
    scholarshipProgram: ScholarshipProgram;
}

interface Entry {
    id: number;
    status: 'in_progress' | 'completed' | 'approved' | 'rejected' | 'pending_review';
    service_date: string;
    time_in: string;
    time_out?: string | null;
    hours_completed: number;
    task_description: string;
    lessons_learned?: string | null;
    photos?: string[] | null;
    admin_notes?: string | null;
    created_at: string;
    updated_at: string;
    scholarshipApplication: ScholarshipApplication;
}

interface PaginationLink {
    url?: string;
    label: string;
    active: boolean;
}

interface PaginatedEntries {
    data: Entry[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Stats {
    in_progress: number;
    pending_review: number; // Assuming 'completed' status means pending review
    approved: number;
    rejected: number;
    total_entries: number;
    total_hours_approved: number;
    total_hours_pending: number;
}

interface Filters {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
    scholarship_program_id?: string;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
}

interface EntriesProps {
    entries: PaginatedEntries;
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

const formatTime = (timeString?: string | null, timeFormat = 'p') => {
    if (!timeString) return 'N/A';
    try {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return format(date, timeFormat);
    } catch (error) {
        return 'Invalid Time';
    }
};

const calculateDuration = (time_in?: string | null, time_out?: string | null, hours_completed?: number): string => {
    if (!time_in) return 'N/A';
    if (!time_out) return 'In Progress';
    try {
        const start = parseISO(`2000-01-01T${time_in}`);
        const end = parseISO(`2000-01-01T${time_out}`);
        if (end < start) return 'Invalid'; // Time out is before time in

        const duration = intervalToDuration({ start, end });
        const parts = [];
        if (duration.hours && duration.hours > 0) parts.push(`${duration.hours}h`);
        if (duration.minutes && duration.minutes > 0) parts.push(`${duration.minutes}m`);
        return parts.length > 0 ? parts.join(' ') : hours_completed ? `${hours_completed.toFixed(1)}h` : '0m';
    } catch (e) {
        return hours_completed ? `${hours_completed.toFixed(1)}h` : 'Error';
    }
};

const entryStatusOptions = [
    { value: 'in_progress', label: 'In Progress' },
    { value: 'pending_review', label: 'Pending Review' }, // 'completed' entries are pending_review
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
];

const getStatusBadgeVariant = (status: Entry['status']): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' => {
    if (status === 'approved') return 'default';
    if (status === 'pending_review' || status === 'completed') return 'warning';
    if (status === 'rejected') return 'destructive';
    if (status === 'in_progress') return 'secondary'; // Or a specific color like blue
    return 'outline';
};

const formatEntryStatus = (status: string): string => {
    const option = entryStatusOptions.find((opt) => opt.value === status);
    // Treat 'completed' as 'Pending Review' for display if it exists as a distinct backend status
    if (status === 'completed') return 'Pending Review';
    return option ? option.label : status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function Entries({ entries, stats, scholarshipPrograms, filters, auth }: EntriesProps) {
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<Entry | null>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject' | ''>('');
    const [approvedHours, setApprovedHours] = useState<number>(stats.total_hours_approved || 0);

    const entriesBreadcrumbs: BreadcrumbItem[] = [
        { title: 'Community Service Dashboard', href: route('admin.community-service.dashboard') },
        { title: 'Service Entries' },
    ];

    const filterForm = useForm<Filters>({
        search: filters.search || '',
        status: filters.status || '',
        scholarship_program_id: filters.scholarship_program_id || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        sort_by: filters.sort_by || 'service_date',
        sort_direction: filters.sort_direction || 'desc',
    });

    const entryActionForm = useForm({
        admin_notes: '',
    });

    const handleFilterSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        filterForm.get(route('admin.community-service.entries'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => setIsFilterSheetOpen(false),
        });
    };

    const handleSort = (column: string) => {
        const newDirection = filterForm.data.sort_by === column && filterForm.data.sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            route('admin.community-service.entries'),
            {
                ...filterForm.data,
                sort_by: column,
                sort_direction: newDirection,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const resetFilters = () => {
        router.get(
            route('admin.community-service.entries'),
            {},
            {
                onSuccess: () => {
                    filterForm.reset();
                    setIsFilterSheetOpen(false);
                },
            },
        );
    };

    const openActionModal = (entry: Entry, type: 'approve' | 'reject') => {
        setCurrentEntry(entry);
        setActionType(type);
        entryActionForm.reset('admin_notes');
        setIsActionModalOpen(true);
    };

    const processEntryAction = () => {
        if (!currentEntry || !actionType) return;

        if (actionType === 'reject' && !entryActionForm.data.admin_notes) {
            toast.error('Admin notes (rejection reason) are required.');
            entryActionForm.setError('admin_notes', 'Admin notes are required for rejection.');
            return;
        }

        const url = route('admin.community-service.entries.update-status', { entry: currentEntry.id });
        const payload = {
            status: actionType,
            admin_notes: actionType === 'reject' ? entryActionForm.data.admin_notes : '',
        };

        router.patch(url, payload, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Entry #${currentEntry.id} ${actionType}d successfully.`);
                setIsActionModalOpen(false);
                setCurrentEntry(null);
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join(' ');
                toast.error(`Failed to ${actionType} entry. ${errorMessages}`);
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

    // If this page is for a specific report, fetch approved hours from backend
    // Otherwise, use stats.total_hours_approved (for all entries)
    // If you want to support per-report, you can add a reportId prop and use it here
    // For now, just fetch the sum for all entries
    // (If you want to filter by report, add a filter and use the same endpoint as in Show.tsx)
    useEffect(() => {
        // If you want to fetch for a specific report, use:
        // axios.get(route('admin.community-service.reports.approved-hours', { report: reportId }))
        //     .then(res => setApprovedHours(res.data.approved_hours))
        //     .catch(() => setApprovedHours(0));
        // For all entries, just use the stats value
        setApprovedHours(stats.total_hours_approved || 0);
    }, [stats.total_hours_approved]);

    return (
        <AppLayout breadcrumbs={entriesBreadcrumbs}>
            <Head title="Manage Service Entries" />
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="space-y-6">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-foreground text-3xl font-bold tracking-tight">Service Entries</h1>
                            <p className="text-muted-foreground">Review individual community service time entries.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="gap-1.5">
                                        <ListFilter className="h-4 w-4" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="sm:max-w-md">
                                    <SheetHeader>
                                        <SheetTitle>Filter Entries</SheetTitle>
                                        <SheetDescription>Refine the list of service entries.</SheetDescription>
                                    </SheetHeader>
                                    <form onSubmit={handleFilterSubmit} className="flex h-full flex-col space-y-4 py-4">
                                        <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                                            <div>
                                                <Label htmlFor="search-filter">Search</Label>
                                                <Input
                                                    id="search-filter"
                                                    placeholder="Student, email, task..."
                                                    value={filterForm.data.search}
                                                    onChange={(e) => filterForm.setData('search', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="status-filter">Status</Label>
                                                <Select value={filterForm.data.status} onValueChange={(val) => filterForm.setData('status', val)}>
                                                    <SelectTrigger id="status-filter">
                                                        <SelectValue placeholder="All Statuses" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">All Statuses</SelectItem>
                                                        {entryStatusOptions.map((opt) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="program-filter-entries">Scholarship Program</Label>
                                                <Select
                                                    value={filterForm.data.scholarship_program_id}
                                                    onValueChange={(val) => filterForm.setData('scholarship_program_id', val)}
                                                >
                                                    <SelectTrigger id="program-filter-entries">
                                                        <SelectValue placeholder="All Programs" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="">All Programs</SelectItem>
                                                        {scholarshipPrograms.map((p) => (
                                                            <SelectItem key={p.id} value={String(p.id)}>
                                                                {p.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label htmlFor="date-from-filter-entries">Service Date From</Label>
                                                <Input
                                                    id="date-from-filter-entries"
                                                    type="date"
                                                    value={filterForm.data.date_from}
                                                    onChange={(e) => filterForm.setData('date_from', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="date-to-filter-entries">Service Date To</Label>
                                                <Input
                                                    id="date-to-filter-entries"
                                                    type="date"
                                                    value={filterForm.data.date_to}
                                                    onChange={(e) => filterForm.setData('date_to', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <SheetFooter className="mt-auto gap-2 border-t pt-4">
                                            <Button type="button" variant="outline" onClick={resetFilters} disabled={filterForm.processing}>
                                                Reset
                                            </Button>
                                            <Button type="submit" disabled={filterForm.processing}>
                                                {filterForm.processing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />} Apply Filters
                                            </Button>
                                        </SheetFooter>
                                    </form>
                                </SheetContent>
                            </Sheet>
                            <Button variant="outline" asChild className="gap-1.5">
                                <Link href={route('admin.community-service.index')}>
                                    <ArrowLeft className="h-4 w-4" /> Back to Reports
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        <StatCard
                            title="In Progress"
                            value={stats.in_progress}
                            icon={<Clock className="text-muted-foreground h-4 w-4" />}
                            cardClassName="xl:col-span-1"
                        />
                        <StatCard
                            title="Pending Review"
                            value={stats.pending_review}
                            icon={<Timer className="text-muted-foreground h-4 w-4" />}
                            cardClassName="xl:col-span-1"
                        />
                        <StatCard
                            title="Approved Entries"
                            value={stats.approved}
                            icon={<CheckCircle2 className="text-muted-foreground h-4 w-4" />}
                            cardClassName="xl:col-span-1"
                        />
                        <StatCard
                            title="Rejected Entries"
                            value={stats.rejected}
                            icon={<XCircle className="text-muted-foreground h-4 w-4" />}
                            cardClassName="xl:col-span-1"
                        />
                        <StatCard
                            title="Approved Hours"
                            value={Number(approvedHours).toFixed(2)}
                            icon={<Activity className="text-muted-foreground h-4 w-4" />}
                            cardClassName="xl:col-span-1"
                        />
                        <StatCard
                            title="Pending Hours"
                            value={stats.total_hours_pending.toFixed(2)}
                            icon={<Hourglass className="text-muted-foreground h-4 w-4" />}
                            cardClassName="xl:col-span-1"
                        />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>All Service Entries ({entries.total})</CardTitle>
                            <CardDescription>
                                Displaying {entries.from}-{entries.to} of {entries.total} entries.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="hover:bg-muted/50 cursor-pointer" onClick={() => handleSort('student_name')}>
                                            Student / Program{' '}
                                            {filterForm.data.sort_by === 'student_name' && <ArrowUpDown className="ml-2 inline h-3 w-3" />}
                                        </TableHead>
                                        <TableHead className="hover:bg-muted/50 cursor-pointer" onClick={() => handleSort('status')}>
                                            Status {filterForm.data.sort_by === 'status' && <ArrowUpDown className="ml-2 inline h-3 w-3" />}
                                        </TableHead>
                                        <TableHead className="hover:bg-muted/50 cursor-pointer" onClick={() => handleSort('service_date')}>
                                            Service Date{' '}
                                            {filterForm.data.sort_by === 'service_date' && <ArrowUpDown className="ml-2 inline h-3 w-3" />}
                                        </TableHead>
                                        <TableHead>Time / Duration</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead>Task (Preview)</TableHead>
                                        <TableHead className="w-[120px] text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.data.length > 0 ? (
                                        entries.data.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {entry.scholarshipApplication?.studentProfile?.user?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        {entry.scholarshipApplication?.scholarshipProgram?.name || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusBadgeVariant(entry.status)}>{formatEntryStatus(entry.status)}</Badge>
                                                    {entry.status === 'pending_review' &&
                                                        differenceInDays(new Date(), parseISO(entry.created_at)) > 2 && (
                                                            <div className="text-destructive mt-1 flex items-center gap-1 text-xs">
                                                                <AlertTriangle className="h-3 w-3" />
                                                                Needs Review
                                                            </div>
                                                        )}
                                                </TableCell>
                                                <TableCell>{formatDate(entry.service_date)}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        {formatTime(entry.time_in)} - {entry.time_out ? formatTime(entry.time_out) : 'Current'}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">
                                                        ({calculateDuration(entry.time_in, entry.time_out, entry.hours_completed)})
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">{entry.hours_completed.toFixed(2)}</TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <p className="truncate text-sm" title={entry.task_description}>
                                                        {entry.task_description}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Actions</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('admin.community-service.entries.show', entry.id)}>
                                                                    <FileSearch className="mr-2 h-4 w-4" /> View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {(entry.status === 'pending_review' ||
                                                                entry.status === 'completed' ||
                                                                entry.status === 'in_progress' ||
                                                                entry.status === 'rejected') && ( // Can approve if pending or rejected
                                                                <DropdownMenuItem
                                                                    onClick={() => openActionModal(entry, 'approve')}
                                                                    className="text-green-600"
                                                                >
                                                                    <ThumbsUp className="mr-2 h-4 w-4" /> Approve
                                                                </DropdownMenuItem>
                                                            )}
                                                            {(entry.status === 'pending_review' ||
                                                                entry.status === 'completed' ||
                                                                entry.status === 'in_progress' ||
                                                                entry.status === 'approved') && ( // Can reject if pending or approved
                                                                <DropdownMenuItem
                                                                    onClick={() => openActionModal(entry, 'reject')}
                                                                    className="text-red-600"
                                                                >
                                                                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No service entries found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                        {entries.data.length > 0 && (
                            <CardFooter className="flex items-center justify-between border-t pt-6">
                                <div className="text-muted-foreground text-sm">
                                    Page {entries.current_page} of {entries.last_page}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                entries.links.find((link) => link.label.includes('Previous'))?.url || '',
                                                {},
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                        disabled={!entries.links.find((link) => link.label.includes('Previous'))?.url || filterForm.processing}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.get(
                                                entries.links.find((link) => link.label.includes('Next'))?.url || '',
                                                {},
                                                { preserveState: true, preserveScroll: true },
                                            )
                                        }
                                        disabled={!entries.links.find((link) => link.label.includes('Next'))?.url || filterForm.processing}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>

            <AlertDialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'} for Entry #{currentEntry?.id}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Student: {currentEntry?.scholarshipApplication?.studentProfile?.user?.name || 'N/A'} <br />
                            Date: {currentEntry ? formatDate(currentEntry.service_date) : 'N/A'} <br />
                            Hours: {currentEntry?.hours_completed.toFixed(2)}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {actionType === 'reject' && (
                        <div className="space-y-1 py-2">
                            <Label htmlFor="admin_notes_modal">Admin Notes / Rejection Reason</Label>
                            <Textarea
                                id="admin_notes_modal"
                                value={entryActionForm.data.admin_notes}
                                onChange={(e) => entryActionForm.setData('admin_notes', e.target.value)}
                                placeholder="Provide reason..."
                                rows={3}
                            />
                            {entryActionForm.errors.admin_notes && <p className="text-destructive text-sm">{entryActionForm.errors.admin_notes}</p>}
                        </div>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCurrentEntry(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={processEntryAction}
                            disabled={entryActionForm.processing || (actionType === 'reject' && !entryActionForm.data.admin_notes)}
                            className={actionType === 'reject' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}
                        >
                            {entryActionForm.processing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
