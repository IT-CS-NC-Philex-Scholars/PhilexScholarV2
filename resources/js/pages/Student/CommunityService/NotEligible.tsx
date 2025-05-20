import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NotEligibleProps {
  application: ScholarshipApplication;
  scholarship: ScholarshipProgram;
}

export default function NotEligible({ application, scholarship }: NotEligibleProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Applications', href: route('student.applications.index') },
    { title: 'Application Details', href: route('student.applications.show', application.id) },
    { title: 'Community Service' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Community Service" />
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Not Eligible for Community Service</CardTitle>
            <CardDescription>
              This application is not currently eligible for community service reporting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              You can submit community service reports once your application has been approved and you've been enrolled in the scholarship program.
            </p>
            <p className="text-sm text-muted-foreground">
              Current application status: <span className="font-medium capitalize">{application.status.replace(/_/g, ' ')}</span>
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href={route('student.applications.show', application.id)}>Return to Application</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}