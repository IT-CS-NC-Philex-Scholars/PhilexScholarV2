import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApplicationIndexProps {
  applications: ScholarshipApplication[];
}

export default function Index({ applications }: ApplicationIndexProps) {
  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified'].includes(status)) {
      return 'success';
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
      return 'destructive';
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review'].includes(status)) {
      return 'warning';
    }
    return 'secondary';
  };

  // Helper function to format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Applications' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Applications" />
      
      <div className="max-w-5xl mx-auto">
        {applications.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Applications</CardTitle>
              <CardDescription>
                You haven't applied for any scholarships yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href={route('student.scholarships.index')}>Browse Scholarships</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Scholarship Applications</CardTitle>
                <CardDescription>
                  Manage and monitor the status of your scholarship applications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.map(application => (
                    <div 
                      key={application.id} 
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border gap-4"
                    >
                      <div className="space-y-1">
                        <h3 className="font-semibold">
                          {application.scholarshipProgram?.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {application.scholarshipProgram?.semester} | {application.scholarshipProgram?.academic_year}
                        </p>
                        <div className="flex items-center mt-2">
                          <Badge variant={getStatusBadgeVariant(application.status) as any}>
                            {formatStatus(application.status)}
                          </Badge>
                          
                          {application.submitted_at && (
                            <span className="text-xs text-muted-foreground ml-2">
                              Submitted: {new Date(application.submitted_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <Button asChild>
                        <Link href={route('student.applications.show', application.id)}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}