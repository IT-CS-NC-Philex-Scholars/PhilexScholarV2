import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  TrendingUp,
  CalendarDays,
  Timer,
  BarChart3,
  Activity,
  ArrowRight,
  Eye,
  FileText,
  UserCheck,
  Settings2,
  ListChecks,
  Hourglass,
  LineChart,
  PieChart,
  Target,
  ExternalLink
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';

// Interfaces (ensure these match your backend data structure)
interface User {
  name: string;
}

interface StudentProfile {
  user: User;
}

interface ScholarshipProgram {
  name: string;
}

interface ScholarshipApplication {
  studentProfile: StudentProfile;
  scholarshipProgram: ScholarshipProgram;
}

interface UrgentReport {
  id: number;
  status: string;
  submitted_at: string;
  total_hours: number;
  scholarshipApplication: ScholarshipApplication;
}

interface MonthlySubmission {
  month: string; // e.g., "Jan 2024"
  count: number;
  approved: number;
}

interface DashboardProps {
  quickStats: {
    pending_review: number;
    approved_today: number;
    total_hours_this_month: number;
    active_sessions: number; // For "in_progress" entries
  };
  urgentReports: UrgentReport[];
  performanceMetrics: {
    avg_review_time_hours: number;
    approval_rate: number; // Percentage
    monthly_submissions: MonthlySubmission[];
  };
  auth: { user: { id: number; name: string; email: string } }; // Admin user, might not be used by AppLayout directly
}

// Helper Functions
const formatDate = (dateString?: string | null, dateFormat = 'MMM d, yyyy') => {
  if (!dateString) return 'N/A';
  try { return format(parseISO(dateString), dateFormat); }
  catch (error) { return 'Invalid Date'; }
};

const getDaysAgo = (dateString?: string | null): number => {
  if (!dateString) return 0;
  try { return differenceInDays(new Date(), parseISO(dateString)); }
  catch { return 0; }
};


export default function Dashboard({
  quickStats,
  urgentReports,
  performanceMetrics,
  auth, // auth might not be directly used by AppLayout, but keep it in props for now
}: DashboardProps) {

  const dashboardBreadcrumbs: BreadcrumbItem[] = [
    // Assuming a general admin dashboard exists. Adjust if not.
    // { title: 'Admin', href: route('admin.dashboard') }, 
    { title: 'Community Service Dashboard' }
  ];

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description?: string; link?: string; linkText?: string; className?: string }> =
    ({ title, value, icon, description, link, linkText, className }) => (
      <Card className={`flex flex-col ${className}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className="text-muted-foreground">{icon}</div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="text-3xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        </CardContent>
        {link && linkText && (
          <CardFooter>
            <Button size="sm" variant="outline" asChild className="w-full">
              <Link href={link} className="flex items-center justify-center gap-1">
                {linkText} <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  
  const QuickActionCard: React.FC<{ title: string; description: string; icon: React.ReactNode; href: string; count?: number; countLabel?: string;}> =
    ({ title, description, icon, href, count, countLabel }) => (
      <Link href={href} className="block hover:no-underline">
        <Card className="h-full hover:bg-muted/50 transition-colors p-6 flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                {icon}
            </div>
            <CardTitle className="text-base font-semibold mb-1">{title}</CardTitle>
            <CardDescription className="text-xs">{description}</CardDescription>
            {typeof count !== 'undefined' && countLabel && (
                <Badge variant="secondary" className="mt-2">{count} {countLabel}</Badge>
            )}
        </Card>
      </Link>
    );


  return (
    <AppLayout breadcrumbs={dashboardBreadcrumbs}>
      <Head title="CS Dashboard" />
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Community Service Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Overview of student community service activities and admin performance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href={route('admin.community-service.entries')}>
                  <Timer className="h-4 w-4 mr-2" />
                  Manage Entries
                </Link>
              </Button>
              <Button asChild>
                <Link href={route('admin.community-service.index')}>
                  <ListChecks className="h-4 w-4 mr-2" />
                  Manage Reports
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Pending Review"
              value={quickStats.pending_review}
              icon={<Hourglass className="h-5 w-5" />}
              description="Reports awaiting admin action."
              link={route('admin.community-service.index', { status: 'pending_review' })}
              linkText="View Pending"
            />
            <StatCard
              title="Approved Today"
              value={quickStats.approved_today}
              icon={<CheckCircle2 className="h-5 w-5" />}
              description="Reports approved so far today."
            />
            <StatCard
              title="Hours This Month"
              value={quickStats.total_hours_this_month.toLocaleString()}
              icon={<BarChart3 className="h-5 w-5" />}
              description="Total approved hours this month."
            />
            <StatCard
              title="Active Sessions"
              value={quickStats.active_sessions}
              icon={<Activity className="h-5 w-5" />}
              description="Students currently tracking time."
              link={route('admin.community-service.entries', { status: 'in_progress' })}
              linkText="View Active"
            />
          </div>

          {/* Main Content Grid: Urgent Reports & Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Urgent Reports */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Urgent Reports
                        </CardTitle>
                        <CardDescription>Reports pending review for an extended period.</CardDescription>
                    </div>
                    <Button asChild variant="secondary" size="sm">
                         <Link href={route('admin.community-service.index', { status: 'pending_review', sort_by: 'submitted_at', sort_direction: 'asc' })}>
                            View All Urgent <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                {urgentReports.length > 0 ? (
                  <div className="space-y-3">
                    {urgentReports.map((report) => (
                      <Link key={report.id} href={route('admin.community-service.show', report.id)} className="block hover:no-underline">
                        <div className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/50 transition-colors bg-card">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="font-semibold text-sm truncate">
                                {report.scholarshipApplication?.studentProfile?.user?.name || 'Unknown Student'}
                              </h4>
                              <Badge variant="warning" className="text-xs whitespace-nowrap">
                                {getDaysAgo(report.submitted_at)} days pending
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {report.scholarshipApplication?.scholarshipProgram?.name || 'Unknown Program'}
                              <span className="mx-1">&bull;</span>
                              {report.total_hours} hours
                            </p>
                          </div>
                          <Eye className="h-4 w-4 text-muted-foreground ml-2 shrink-0" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <UserCheck className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold text-md">All Caught Up!</h3>
                    <p className="text-sm text-muted-foreground">No reports are currently marked as urgent.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
                <CardDescription>Key indicators of review efficiency.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Avg. Review Time</span>
                    <span className="text-xl font-bold text-primary">
                      {Math.round(performanceMetrics.avg_review_time_hours || 0)}h
                    </span>
                  </div>
                  <Progress value={Math.max(0, 100 - (performanceMetrics.avg_review_time_hours / 48 * 100))} className="h-2" /> 
                  {/* Higher value is better (closer to 0 hours) */}
                  <p className="text-xs text-muted-foreground mt-1">Target: &lt; 24 hours</p>
                </div>
                <Separator />
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-muted-foreground">Approval Rate</span>
                    <span className="text-xl font-bold text-green-600">
                      {performanceMetrics.approval_rate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={performanceMetrics.approval_rate} className="h-2 [&>div]:bg-green-500" />
                  <p className="text-xs text-muted-foreground mt-1">Based on reviewed reports.</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Monthly Submissions (Last 3)</h4>
                  <div className="space-y-1.5">
                    {performanceMetrics.monthly_submissions.slice(-3).map((monthData, index) => (
                      <div key={index} className="text-xs">
                        <div className="flex justify-between items-center">
                           <span className="text-muted-foreground">{monthData.month}</span>
                           <span className="font-medium">{monthData.count} total ({monthData.approved} approved)</span>
                        </div>
                        <Progress value={(monthData.approved / Math.max(1, monthData.count)) * 100} className="h-1.5 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions Section */}
           <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" /> Quick Actions</CardTitle>
                <CardDescription>Jump to common administrative tasks.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickActionCard 
                        title="Review Pending Reports" 
                        description="Address reports needing review."
                        icon={<Hourglass className="h-6 w-6" />}
                        href={route('admin.community-service.index', { status: 'pending_review' })}
                        count={quickStats.pending_review}
                        countLabel="reports"
                    />
                    <QuickActionCard 
                        title="Manage All Entries" 
                        description="View and update individual time entries."
                        icon={<Timer className="h-6 w-6" />}
                        href={route('admin.community-service.entries')}
                    />
                    <QuickActionCard 
                        title="Export Data" 
                        description="Generate CSV exports of reports or entries."
                        icon={<Download className="h-6 w-6" />}
                        href={route('admin.community-service.export')} // Assuming a general export page or specific parameters needed
                    />
                     <QuickActionCard 
                        title="View All Reports" 
                        description="Browse the complete history of reports."
                        icon={<FileText className="h-6 w-6" />}
                        href={route('admin.community-service.index')}
                    />
                </div>
            </CardContent>
           </Card>

        </div>
      </div>
    </AppLayout>
  );
}