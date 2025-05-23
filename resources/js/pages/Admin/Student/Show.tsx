import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, ScholarshipApplication, StudentProfile, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Briefcase,
    Building,
    CalendarDays,
    CheckCircle2,
    ClipboardList,
    Clock,
    DollarSign,
    ExternalLink,
    FileCheck,
    FileText,
    GraduationCap,
    Hash,
    MapPin,
    Phone,
    School,
    XCircle,
} from 'lucide-react';

interface StudentShowProps {
    student: User & {
        studentProfile?: StudentProfile;
    };
    applications: {
        all: ScholarshipApplication[];
        pending: ScholarshipApplication[];
        active: ScholarshipApplication[];
        completed: ScholarshipApplication[];
        rejected: ScholarshipApplication[];
    };
}

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null; children?: React.ReactNode }> = ({
    icon: Icon,
    label,
    value,
    children,
}) => (
    <div className="flex items-start space-x-3 py-2">
        <Icon className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
            <p className="text-foreground text-sm font-medium">{label}</p>
            {value && <p className="text-muted-foreground text-sm">{value}</p>}
            {children && <div className="text-muted-foreground text-sm">{children}</div>}
        </div>
    </div>
);

export default function Show({ student, applications }: StudentShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Students', href: route('admin.students.index') },
        { title: student.name },
    ];

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getStatusConfig = (
        status: string,
    ): { variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: React.ElementType; colorClass: string } => {
        if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'enrolled'].includes(status)) {
            return { variant: 'default', icon: CheckCircle2, colorClass: 'text-green-600 dark:text-green-500' };
        }
        if (['documents_rejected', 'rejected'].includes(status)) {
            return { variant: 'destructive', icon: XCircle, colorClass: 'text-red-600 dark:text-red-500' };
        }
        if (['disbursement_pending', 'service_pending', 'documents_under_review', 'submitted'].includes(status)) {
            return { variant: 'outline', icon: Clock, colorClass: 'text-amber-600 dark:text-amber-500' };
        }
        return { variant: 'secondary', icon: AlertCircle, colorClass: 'text-gray-600 dark:text-gray-400' };
    };

    const profile = student.studentProfile;

    const applicationTabs = [
        { value: 'all', label: 'All', icon: ClipboardList, data: applications.all },
        { value: 'pending', label: 'Pending', icon: Clock, data: applications.pending },
        { value: 'active', label: 'Active', icon: Briefcase, data: applications.active },
        { value: 'completed', label: 'Completed', icon: CheckCircle2, data: applications.completed },
        { value: 'rejected', label: 'Rejected', icon: XCircle, data: applications.rejected },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Student: ${student.name}`} />

            <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={route('admin.students.index')}
                        className="text-primary hover:text-primary/80 mb-4 inline-flex items-center text-sm font-medium"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Students List
                    </Link>
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{student.name}</h1>
                            <p className="text-muted-foreground text-sm">{student.email}</p>
                        </div>
                        {profile && (
                            <Badge variant="outline" className="text-sm">
                                {profile.school_type === 'high_school' ? 'High School Student' : 'College Student'}
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    {/* Student Profile Section (Left on Desktop) */}
                    <div className="space-y-6 lg:col-span-4">
                        <Card className="overflow-hidden">
                            <CardHeader className="bg-muted/30 p-0">
                                <div className="flex flex-col items-center p-6 text-center">
                                    <Avatar className="border-background mb-3 h-28 w-28 border-4 shadow-sm">
                                        <AvatarFallback className="bg-primary/10 text-primary text-4xl font-semibold">
                                            {student.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {/* Name and email are now in page header */}
                                </div>
                            </CardHeader>
                            <CardContent className="divide-border divide-y p-4 sm:p-6">
                                {!profile ? (
                                    <div className="py-8 text-center">
                                        <AlertCircle className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
                                        <h3 className="mb-1 text-lg font-semibold">Profile Not Completed</h3>
                                        <p className="text-muted-foreground text-sm">This student hasn't completed their profile information yet.</p>
                                    </div>
                                ) : (
                                    <>
                                        <section className="pb-4">
                                            <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">Personal Information</h3>
                                            <InfoRow icon={Hash} label="Student ID" value={profile.student_id} />
                                            <InfoRow icon={Phone} label="Phone Number" value={profile.phone_number} />
                                            <InfoRow icon={MapPin} label="Address">
                                                <p>{profile.address}</p>
                                                <p>
                                                    {profile.city}, {profile.state} {profile.zip_code}
                                                </p>
                                            </InfoRow>
                                        </section>

                                        <section className="py-4">
                                            <h3 className="text-muted-foreground mb-2 text-xs font-semibold uppercase">Academic Information</h3>
                                            <InfoRow icon={Building} label="School" value={profile.school_name} />
                                            <InfoRow icon={School} label="School Level" value={profile.school_level} />
                                            <InfoRow icon={GraduationCap} label="GPA" value={profile.gpa?.toFixed(2)} />
                                        </section>

                                        <section className="pt-4">
                                            <h3 className="text-muted-foreground mb-3 text-xs font-semibold uppercase">Application Summary</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-card rounded-lg border p-3 text-center">
                                                    <p className="text-2xl font-bold">{applications.all.length}</p>
                                                    <p className="text-muted-foreground text-xs">Total Applications</p>
                                                </div>
                                                <div className="bg-card rounded-lg border p-3 text-center">
                                                    <p className="text-2xl font-bold text-green-600">{applications.completed.length}</p>
                                                    <p className="text-muted-foreground text-xs">Approved</p>
                                                </div>
                                            </div>
                                        </section>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Applications Section (Right on Desktop) */}
                    <div className="lg:col-span-8">
                        <Tabs defaultValue="all" className="w-full">
                            <div className="mb-4">
                                <ScrollArea className="w-full rounded-md border whitespace-nowrap">
                                    <TabsList className="flex h-auto w-max min-w-full p-1">
                                        {applicationTabs.map((tab) => (
                                            <TabsTrigger
                                                key={tab.value}
                                                value={tab.value}
                                                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-auto flex-1 px-3 py-1.5 sm:flex-none"
                                            >
                                                <tab.icon className="mr-1.5 h-4 w-4" /> {tab.label} ({tab.data.length})
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                    <ScrollBar orientation="horizontal" />
                                </ScrollArea>
                            </div>

                            {applicationTabs.map((tab) => (
                                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>{tab.label} Applications</CardTitle>
                                            <CardDescription>
                                                {tab.value === 'all'
                                                    ? 'All scholarship applications submitted by this student'
                                                    : `Applications that are currently ${tab.label.toLowerCase()}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {tab.data.length === 0 ? (
                                                <div className="bg-muted/30 rounded-lg border p-8 text-center">
                                                    <FileText className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
                                                    <h3 className="mb-2 text-xl font-semibold">No Applications Found</h3>
                                                    <p className="text-muted-foreground mx-auto max-w-md">
                                                        This student has no {tab.label.toLowerCase()} applications at this time.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {tab.data.map((app) => {
                                                        const statusConfig = getStatusConfig(app.status);
                                                        const docsCount = app.documentUploads?.length || 0;
                                                        const approvedDocsCount =
                                                            app.documentUploads?.filter((doc) => doc.status === 'approved').length || 0;
                                                        const totalDisbursed = app.disbursements?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;

                                                        return (
                                                            <Card key={app.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                                                                <CardContent
                                                                    className={cn(
                                                                        'border-l-4 p-4 sm:p-5',
                                                                        statusConfig.variant === 'default' && 'border-green-500',
                                                                        statusConfig.variant === 'destructive' && 'border-red-500',
                                                                        statusConfig.variant === 'outline' && 'border-amber-500',
                                                                        statusConfig.variant === 'secondary' && 'border-gray-500',
                                                                    )}
                                                                >
                                                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                                                        <div className="flex-1 space-y-1.5">
                                                                            <h3 className="text-primary text-lg leading-tight font-semibold hover:underline">
                                                                                <Link href={route('admin.applications.show', app.id)}>
                                                                                    {app.scholarshipProgram?.name || 'Unnamed Scholarship'}
                                                                                </Link>
                                                                            </h3>
                                                                            <div className="text-muted-foreground flex items-center text-sm">
                                                                                <statusConfig.icon
                                                                                    className={cn(
                                                                                        'mr-1.5 h-4 w-4 flex-shrink-0',
                                                                                        statusConfig.colorClass,
                                                                                    )}
                                                                                />
                                                                                <Badge variant={statusConfig.variant} className="mr-2 capitalize">
                                                                                    {formatStatus(app.status)}
                                                                                </Badge>
                                                                                {app.scholarshipProgram && (
                                                                                    <span className="hidden sm:inline">
                                                                                        • {app.scholarshipProgram.semester}{' '}
                                                                                        {app.scholarshipProgram.academic_year}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                            {app.submitted_at && (
                                                                                <div className="text-muted-foreground flex items-center text-xs">
                                                                                    <CalendarDays className="mr-1.5 h-3.5 w-3.5 flex-shrink-0" />
                                                                                    <span>
                                                                                        Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <Button
                                                                            asChild
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="mt-2 flex-shrink-0 sm:mt-0"
                                                                        >
                                                                            <Link href={route('admin.applications.show', app.id)}>
                                                                                Review <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                                                                            </Link>
                                                                        </Button>
                                                                    </div>

                                                                    {(docsCount > 0 || totalDisbursed > 0) && <Separator className="my-3 sm:my-4" />}

                                                                    <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
                                                                        {docsCount > 0 && (
                                                                            <div className="text-muted-foreground flex items-center">
                                                                                <FileCheck className="mr-1.5 h-4 w-4 flex-shrink-0 text-sky-600" />
                                                                                <span>
                                                                                    Documents: {approvedDocsCount} / {docsCount} approved
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {totalDisbursed > 0 && (
                                                                            <div className="text-muted-foreground flex items-center">
                                                                                <DollarSign className="mr-1.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                                                                                <span>Disbursed: ${totalDisbursed.toLocaleString()}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
