import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteProfileModal } from '@/components/CompleteProfileModal';

interface DashboardProps {
  hasProfile: boolean;
  applications: ScholarshipApplication[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Student Dashboard' }
];

export default function Dashboard({ hasProfile, applications }: DashboardProps) {
  const { auth } = usePage().props as any;
  
  // Get applications grouped by status
  const pendingApplications = applications.filter(app => 
    ['draft', 'submitted', 'documents_pending', 'documents_under_review'].includes(app.status)
  );
  
  const activeApplications = applications.filter(app => 
    ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed'].includes(app.status)
  );
  
  const completedApplications = applications.filter(app => 
    ['disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status)
  );
  
  const rejectedApplications = applications.filter(app => 
    ['documents_rejected', 'rejected'].includes(app.status)
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Student Dashboard" />
      
      {/* Profile completion modal that automatically shows when hasProfile is false */}
      <CompleteProfileModal hasProfile={hasProfile} />
      
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        {/* Profile Completion Alert */}
        {!hasProfile && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-orange-700 dark:text-orange-300">Complete Your Profile</CardTitle>
              <CardDescription className="text-orange-600 dark:text-orange-400">You need to complete your profile before applying for scholarships.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                asChild 
                className="bg-orange-600 hover:bg-orange-700 text-white" 
                id="profile-alert-button"
              >
                <Link href={route('student.profile.edit')}>Complete Profile</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Quick Actions Grid */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Find Scholarships</CardTitle>
              <CardDescription>Browse available programs</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Button asChild variant="outline" className="w-full">
                <Link href={route('student.scholarships.index')}>Browse Scholarships</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Applications</CardTitle>
              <CardDescription>Manage your applications</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Button asChild variant="outline" className="w-full">
                <Link href={route('student.applications.index')}>View Applications</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">My Profile</CardTitle>
              <CardDescription>Update your information</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Button asChild variant="outline" className="w-full">
                <Link href={route('student.profile.edit')}>Edit Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Application Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Application Summary</CardTitle>
            <CardDescription>Overview of your scholarship applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold">{pendingApplications.length}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Active</div>
                <div className="text-2xl font-bold">{activeApplications.length}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold">{completedApplications.length}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium text-muted-foreground">Rejected</div>
                <div className="text-2xl font-bold">{rejectedApplications.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Recent Applications */}
        {applications.length > 0 && (
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Your most recent scholarship applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications.slice(0, 3).map(application => (
                  <div key={application.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h4 className="font-semibold">{application.scholarshipProgram?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{application.status.replace(/_/g, ' ')}</span>
                      </p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={route('student.applications.show', application.id)}>View</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            {applications.length > 3 && (
              <div className="px-6 pb-6">
                <Button asChild variant="outline" className="w-full">
                  <Link href={route('student.applications.index')}>View All Applications</Link>
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </AppLayout>
  );
}