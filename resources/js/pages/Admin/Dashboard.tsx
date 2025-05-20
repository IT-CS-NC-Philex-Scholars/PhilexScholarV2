import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface DashboardProps {
  stats: {
    totalStudents: number;
    studentsWithProfiles: number;
    activeScholarships: number;
    pendingApplications: number;
    applicationStats: Record<string, number>;
  };
  recentApplications: ScholarshipApplication[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Admin Dashboard' }
];

export default function Dashboard({ stats, recentApplications }: DashboardProps) {
  // Format status for display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Admin Dashboard" />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Summary Cards */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.studentsWithProfiles} with completed profiles
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Scholarships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeScholarships}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Available scholarship programs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingApplications}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting review or approval
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Application Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  ((stats.applicationStats['enrolled'] || 0) / 
                  Object.values(stats.applicationStats).reduce((sum, count) => sum + count, 0)) * 100
                )}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Applications that reach enrolled status
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Applications */}
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                The most recent scholarship applications
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={route('admin.applications.index')}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No applications found.</p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map(app => (
                  <div key={app.id} className="flex items-center justify-between border rounded-md p-4">
                    <div>
                      <div className="font-medium">
                        {app.studentProfile?.user?.name} 
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {app.scholarshipProgram?.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Status: {formatStatus(app.status)}
                      </div>
                    </div>
                    <Button asChild size="sm">
                      <Link href={route('admin.applications.show', app.id)}>Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-muted-foreground">
              Showing {recentApplications.length} of {recentApplications.length < 5 ? recentApplications.length : `${recentApplications.length}+`} applications
            </div>
          </CardFooter>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Manage Scholarships</CardTitle>
              <CardDescription>Create and edit scholarship programs</CardDescription>
            </CardHeader>
            <CardFooter>
              <div className="flex gap-2 w-full">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={route('admin.scholarships.index')}>View All</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={route('admin.scholarships.create')}>Create New</Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Review Applications</CardTitle>
              <CardDescription>Process student applications</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={route('admin.applications.index')}>View Applications</Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Statistics</CardTitle>
              <CardDescription>View detailed metrics and reports</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="#">View Reports</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}