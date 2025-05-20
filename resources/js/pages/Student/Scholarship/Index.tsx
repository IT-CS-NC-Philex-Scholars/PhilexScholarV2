import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteProfileModal } from '@/components/CompleteProfileModal';

interface ScholarshipIndexProps {
  scholarships: ScholarshipProgram[];
  existingApplicationIds: number[];
  hasProfile: boolean;
}

export default function Index({ scholarships, existingApplicationIds, hasProfile }: ScholarshipIndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'Available Scholarships' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Available Scholarships" />
      
      {/* Profile completion modal that automatically shows when hasProfile is false */}
      <CompleteProfileModal hasProfile={hasProfile} />
      
      <div className="max-w-7xl mx-auto p-4">
        {scholarships.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Scholarships Available</CardTitle>
              <CardDescription>
                There are currently no scholarship programs available for your school type.
                Please check back later for new opportunities.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map(scholarship => (
              <Card key={scholarship.id} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{scholarship.name}</CardTitle>
                    <Badge variant="outline">
                      {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                       scholarship.school_type_eligibility === 'high_school' ? 'High School' : 'College'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {scholarship.semester} | {scholarship.academic_year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {scholarship.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Award:</span>{' '}
                        <span className="font-medium">
                          ${scholarship.per_student_budget.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Slots:</span>{' '}
                        <span className="font-medium">
                          {scholarship.available_slots}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Min GPA:</span>{' '}
                        <span className="font-medium">
                          {scholarship.min_gpa}%
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Service:</span>{' '}
                        <span className="font-medium">
                          {scholarship.community_service_days} days
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Deadline:</span>{' '}
                      <span className="font-medium">
                        {new Date(scholarship.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {existingApplicationIds.includes(scholarship.id) ? (
                    <Button variant="outline" className="w-full" disabled>
                      Already Applied
                    </Button>
                  ) : !hasProfile ? (
                    <Button 
                      className="w-full"
                      onClick={() => document.getElementById('complete-profile-button')?.click()}
                    >
                      Complete Profile to Apply
                    </Button>
                  ) : (
                    <div className="w-full grid grid-cols-2 gap-2">
                      <Button asChild variant="outline">
                        <Link href={route('student.scholarships.show', scholarship.id)}>Details</Link>
                      </Button>
                      <Button asChild>
                        <Link href={route('student.scholarships.show', scholarship.id)}>Apply Now</Link>
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}