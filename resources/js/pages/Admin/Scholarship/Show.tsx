import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
  BreadcrumbItem,
  ScholarshipProgram as ScholarshipProgramType,
  DocumentRequirement as DocumentRequirementType,
  ScholarshipApplication as ScholarshipApplicationType,
  StudentProfile as StudentProfileType,
  User as UserType
} from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button'; 
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CalendarDays,
  DollarSign,
  Users,
  ClipboardList,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  GraduationCap,
  BarChart2,
  BookOpen,
  UserCheck,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ScholarshipShowProps {
  scholarship: ScholarshipProgramType & {
    documentRequirements?: DocumentRequirementType[];
    scholarshipApplications?: (ScholarshipApplicationType & {
      studentProfile?: StudentProfileType & {
        user?: UserType;
      };
    })[];
    scholarship_applications_count?: number;
  };
}

const formatCurrency = (amount: number | string | undefined) => {
  console.log('[formatCurrency] Received amount:', amount, '| typeof amount:', typeof amount);
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  console.log('[formatCurrency] Parsed num:', num, '| typeof num:', typeof num);
  
  const isNumANumber = typeof num === 'number';
  const isNumNaN = isNaN(num as number); // Cast to number for isNaN, as isNaN(null) is false
  console.log('[formatCurrency] isNumANumber:', isNumANumber, '| isNumNaN:', isNumNaN);

  if (!isNumANumber || isNumNaN) {
    console.log('[formatCurrency] Returning N/A due to type or NaN');
    return 'N/A';
  }
  
  console.log('[formatCurrency] Attempting toLocaleString on num:', num);
  try {
    const result = (num as number).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    console.log('[formatCurrency] toLocaleString result:', result);
    return result;
  } catch (e) {
    console.error('[formatCurrency] Error in toLocaleString:', e, 'for num:', num);
    return 'Error'; // Or 'N/A' or some other fallback
  }
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatSchoolType = (type: string | undefined) => {
  if (!type) return 'N/A';
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatGpa = (gpa: string | number | null | undefined): string => {
  if (gpa === null || gpa === undefined) return 'N/A';
  const numGpa = typeof gpa === 'string' ? parseFloat(gpa) : gpa;
  if (isNaN(numGpa)) return 'N/A';
  return numGpa.toFixed(2);
};

const getApplicationStatusConfig = (status: string | undefined): { variant: 'default' | 'destructive' | 'outline' | 'secondary', icon: React.ElementType, colorClass: string } => {
  if (!status) return { variant: 'secondary', icon: AlertCircle, colorClass: 'text-gray-600 dark:text-gray-400' };
  
  status = status.toLowerCase();
  if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'enrolled'].includes(status)) {
    return { variant: 'default', icon: CheckCircle2, colorClass: 'text-green-600 dark:text-green-500' };
  }
  if (['documents_rejected', 'rejected'].includes(status)) {
    return { variant: 'destructive', icon: XCircle, colorClass: 'text-red-600 dark:text-red-500' };
  }
  if (['disbursement_pending', 'service_pending', 'documents_under_review', 'submitted'].includes(status)) {
    return { variant: 'outline', icon: Clock, colorClass: 'text-amber-600 dark:text-amber-500' };
  }
  return { variant: 'secondary', icon: Info, colorClass: 'text-gray-600 dark:text-gray-400' };
};

const formatStatus = (status: string | undefined) => {
  if (!status) return 'N/A';
  return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
};

export default function Show({ scholarship }: ScholarshipShowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Scholarships', href: route('admin.scholarships.index') },
    { title: scholarship.name }
  ];

  const applicationsCount = scholarship.scholarshipApplications?.length ?? 0;
  const totalApplications = scholarship.scholarship_applications_count ?? applicationsCount;


  const stats = [
    { name: 'Total Budget', value: formatCurrency(scholarship.total_budget), icon: DollarSign },
    { name: 'Per Student Budget', value: formatCurrency(scholarship.per_student_budget), icon: DollarSign },
    { name: 'Available Slots', value: scholarship.available_slots, icon: Users },
    { name: 'Applications', value: totalApplications, icon: ClipboardList },
    { name: 'Deadline', value: formatDate(scholarship.application_deadline), icon: CalendarDays },
    { name: 'Status', value: scholarship.active ? 'Active' : 'Inactive', icon: scholarship.active ? CheckCircle2 : XCircle, color: scholarship.active ? 'text-green-500' : 'text-red-500' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Scholarship: ${scholarship.name}`} />

      <div className="container mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <Link
                href={route('admin.scholarships.index')}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to Scholarships
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {scholarship.name}
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                {scholarship.description}
              </p>
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0 flex-shrink-0">
              <Button asChild variant="outline">
                <Link href={route('admin.scholarships.edit', scholarship.id)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Link>
              </Button>
              <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the scholarship program.
                      You cannot delete a scholarship with existing applications.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Link
                        href={route('admin.scholarships.destroy', scholarship.id)}
                        method="delete"
                        as="button"
                        className={cn(buttonVariants({ variant: 'destructive' }))}
                        preserveScroll 
                        onError={(errors) => { 
                          if (Object.keys(errors).length > 0) {
                             // Keep dialog open on error by not changing showDeleteConfirm
                          }
                        }}
                        onSuccess={() => {
                            setShowDeleteConfirm(false); // Close dialog on success
                        }}
                      >
                        Delete
                      </Link>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* Scholarship Details & Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          {stats.map((stat) => (
            <Card key={stat.name} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                <stat.icon className={cn("h-5 w-5 text-muted-foreground", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Eligibility & Requirements */}
            <div className="lg:col-span-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <UserCheck className="h-5 w-5 mr-2 text-primary" />
                            Eligibility Criteria
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>School Type:</span> <Badge variant="outline">{formatSchoolType(scholarship.school_type_eligibility)}</Badge></div>
                        <div className="flex justify-between"><span>Min. GPA:</span> <Badge variant="outline">{formatGpa(scholarship.min_gpa)}</Badge></div>
                        {scholarship.min_units && <div className="flex justify-between"><span>Min. Units:</span> <Badge variant="outline">{scholarship.min_units}</Badge></div>}
                        <div className="flex justify-between"><span>Semester:</span> <Badge variant="outline">{scholarship.semester}</Badge></div>
                        <div className="flex justify-between"><span>Academic Year:</span> <Badge variant="outline">{scholarship.academic_year}</Badge></div>
                        <div className="flex justify-between"><span>Community Service:</span> <Badge variant="outline">{scholarship.community_service_days} days</Badge></div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BookOpen className="h-5 w-5 mr-2 text-primary" />
                            Document Requirements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {scholarship.documentRequirements && scholarship.documentRequirements.length > 0 ? (
                            <ul className="space-y-3">
                            {scholarship.documentRequirements.map((req) => (
                                <li key={req.id} className="text-sm p-3 border rounded-md bg-muted/20">
                                    <div className="flex justify-between items-start">
                                        <span className="font-medium">{req.name}</span>
                                        {req.is_required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                                </li>
                            ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No specific document requirements listed.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Applications */}
            <div className="lg:col-span-8">
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center">
                        <BarChart2 className="h-5 w-5 mr-2 text-primary" />
                        Scholarship Applications ({totalApplications})
                    </CardTitle>
                    <CardDescription>
                        List of students who have applied for this scholarship.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    {scholarship.scholarshipApplications && scholarship.scholarshipApplications.length > 0 ? (
                        <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Applicant</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Submitted At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {scholarship.scholarshipApplications.map((app) => {
                                const statusConfig = getApplicationStatusConfig(app.status);
                                return (
                                <TableRow key={app.id}>
                                    <TableCell className="font-medium whitespace-nowrap">
                                    {app.studentProfile?.user?.name || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">
                                    {app.studentProfile?.user?.email || 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                    <Badge variant={statusConfig.variant} className="capitalize whitespace-nowrap">
                                        <statusConfig.icon className={cn("h-3.5 w-3.5 mr-1.5", statusConfig.colorClass)} />
                                        {formatStatus(app.status)}
                                    </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(app.submitted_at)}</TableCell>
                                    <TableCell className="text-right">
                                    <Button asChild variant="ghost" size="sm">
                                        <Link href={route('admin.applications.show', app.id)}>
                                        <Eye className="h-4 w-4 mr-1" /> View
                                        </Link>
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                        </div>
                    ) : (
                        <div className="text-center py-10 border rounded-md bg-muted/20">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-semibold text-lg">No Applications Yet</p>
                        <p className="text-sm text-muted-foreground">
                            There are currently no applications for this scholarship program.
                        </p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </AppLayout>
  );
}