import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

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

  let icon: React.ReactNode = null;
  let iconBg = '';
  let title = '';
  let description = '';
  let content: React.ReactNode = null;
  let action: React.ReactNode = null;
  let whatsNext: React.ReactNode = null;

  if (application.status === 'service_completed') {
    icon = <CheckCircle2 className="w-12 h-12 text-green-500" />;
    iconBg = 'bg-green-50';
    title = 'Community Service Complete!';
    description = 'Congratulations! You have finished your community service requirements.';
    content = (
      <>
        <p className="text-base text-green-700 font-medium mb-2">
          Thank you for your dedication and hard work!
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Your next step is to wait while your scholarship tuition or allowance is being processed. We'll notify you as soon as it's available for claiming.
        </p>
      </>
    );
    whatsNext = (
      <div className="mt-4 p-3 rounded-md bg-green-100 text-green-800 text-sm">
        <strong>What's next?</strong> Keep an eye on your notifications for updates about your scholarship disbursement.
      </div>
    );
    action = (
      <Button asChild className="w-full mt-4" variant="success">
        <Link href={route('student.applications.show', application.id)}>View My Application</Link>
      </Button>
    );
  } else if (application.status !== 'enrolled' && application.status !== 'service_pending') {
    icon = <AlertTriangle className="w-12 h-12 text-yellow-500" />;
    iconBg = 'bg-yellow-50';
    title = 'Apply for a Scholarship';
    description = 'You need to be enrolled in a scholarship program to start community service.';
    content = (
      <>
        <p className="text-base text-yellow-700 font-medium mb-2">
          Ready to make a difference? Apply for a scholarship to unlock community service opportunities!
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Current application status: <span className="font-semibold capitalize">{application.status.replace(/_/g, ' ')}</span>
        </p>
      </>
    );
    whatsNext = (
      <div className="mt-4 p-3 rounded-md bg-yellow-100 text-yellow-800 text-sm">
        <strong>What's next?</strong> Explore available scholarships and submit your application. Once approved, you'll be able to participate in community service.
      </div>
    );
    action = (
      <Button asChild className="w-full mt-4" variant="default">
        <Link href={route('student.scholarships.index')}>Browse Scholarships</Link>
      </Button>
    );
  } else {
    icon = <Info className="w-12 h-12 text-blue-500" />;
    iconBg = 'bg-blue-50';
    title = 'Not Eligible Yet';
    description = 'Your application is not yet eligible for community service reporting.';
    content = (
      <>
        <p className="text-base text-blue-700 font-medium mb-2">
          Once your application is approved and you're enrolled, you'll be able to submit community service reports.
        </p>
        <p className="text-sm text-muted-foreground mb-4">
          Current application status: <span className="font-semibold capitalize">{application.status.replace(/_/g, ' ')}</span>
        </p>
      </>
    );
    whatsNext = (
      <div className="mt-4 p-3 rounded-md bg-blue-100 text-blue-800 text-sm">
        <strong>What's next?</strong> Check back soon or monitor your notifications for updates on your application status.
      </div>
    );
    action = (
      <Button asChild className="w-full mt-4" variant="outline">
        <Link href={route('student.applications.show', application.id)}>Back to My Application</Link>
      </Button>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Community Service" />
      <div className="max-w-md mx-auto py-10">
        <Card className="shadow-xl border-0">
          <div className={`flex flex-col items-center justify-center py-6 ${iconBg} rounded-t-lg`}>
            {icon}
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold mb-1">{title}</CardTitle>
            <CardDescription className="text-base mb-2">{description}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {content}
            {whatsNext}
          </CardContent>
          <CardFooter>
            {action}
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}