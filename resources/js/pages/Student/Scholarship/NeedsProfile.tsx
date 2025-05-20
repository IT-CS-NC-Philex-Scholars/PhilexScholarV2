import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NeedsProfile() {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'Complete Your Profile' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Complete Your Profile" />
      
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              You need to complete your profile before you can view or apply for scholarships.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your profile helps us determine which scholarship programs you are eligible for.
              Please provide your educational information and contact details.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={route('student.profile.edit')}>Go to Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}