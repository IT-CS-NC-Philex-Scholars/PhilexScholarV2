import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CommunityServiceReport, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CommunityServiceShowProps {
  application: ScholarshipApplication;
  scholarship: ScholarshipProgram;
  report: CommunityServiceReport;
}

export default function Show({ application, scholarship, report }: CommunityServiceShowProps) {
  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    if (['approved'].includes(status)) {
      return 'success';
    }
    if (['rejected_insufficient_hours', 'rejected_incomplete_documentation', 'rejected_other'].includes(status)) {
      return 'destructive';
    }
    if (['pending_review'].includes(status)) {
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
    { title: 'My Applications', href: route('student.applications.index') },
    { title: 'Application Details', href: route('student.applications.show', application.id) },
    { title: 'Community Service', href: route('student.community-service.create', application.id) },
    { title: 'Report Details' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Service Report Details" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Community Service Report</CardTitle>
                <CardDescription>
                  for {scholarship.name}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(report.status) as any}>
                {formatStatus(report.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Days Completed</h3>
              <p className="font-semibold">{report.days_completed} {report.days_completed === 1 ? 'Day' : 'Days'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted Date</h3>
              <p className="font-semibold">{new Date(report.submitted_at).toLocaleDateString()}</p>
            </div>
            
            {report.reviewed_at && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Reviewed Date</h3>
                <p className="font-semibold">{new Date(report.reviewed_at).toLocaleDateString()}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <div className="p-4 rounded-lg bg-muted">
                <p className="whitespace-pre-line">{report.description}</p>
              </div>
            </div>
            
            {report.rejection_reason && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Rejection Reason</h3>
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
                  <p>{report.rejection_reason}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href={route('student.community-service.create', application.id)}>Back to Service Reports</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}