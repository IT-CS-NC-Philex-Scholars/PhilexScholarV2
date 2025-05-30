import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, DocumentRequirement, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteProfileModal } from '@/components/CompleteProfileModal';

interface ScholarshipShowProps {
  scholarship: ScholarshipProgram;
  documentRequirements: DocumentRequirement[];
  existingApplication: ScholarshipApplication | null;
  canApply: boolean;
  hasProfile: boolean;
}

export default function Show({ 
  scholarship, 
  documentRequirements, 
  existingApplication,
  canApply,
  hasProfile
}: ScholarshipShowProps) {
  const { post, processing } = useForm();

  const handleApply = () => {
    post(route('student.scholarships.apply', scholarship.id));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'Scholarships', href: route('student.scholarships.index') },
    { title: scholarship.name }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={scholarship.name} />
      
      {/* Profile completion modal that automatically shows when hasProfile is false */}
      <CompleteProfileModal hasProfile={hasProfile} />
      
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        {/* Header Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">{scholarship.name}</CardTitle>
                <CardDescription>
                  {scholarship.semester} | {scholarship.academic_year}
                </CardDescription>
              </div>
              <Badge variant="outline">
                {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                 scholarship.school_type_eligibility === 'high_school' ? 'High School' : 'College'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <p>{scholarship.description}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            {existingApplication ? (
              <div className="w-full text-center">
                <p className="mb-4 text-sm">You have already applied for this scholarship.</p>
                <Button asChild variant="secondary" className="w-full">
                  <Link href={route('student.applications.show', existingApplication.id)}>
                    View Your Application
                  </Link>
                </Button>
              </div>
            ) : !hasProfile ? (
              <div className="w-full text-center">
                <p className="mb-4 text-sm">
                  You need to complete your profile before you can apply for scholarships.
                </p>
                <Button asChild className="w-full">
                  <Link href={route('student.profile.edit')}>
                    Complete Profile
                  </Link>
                </Button>
              </div>
            ) : canApply ? (
              <div className="w-full text-center">
                <p className="mb-4 text-sm">
                  By applying, you agree to provide all required documentation and meet the eligibility criteria.
                </p>
                <Button onClick={handleApply} disabled={processing} className="w-full">
                  {processing ? 'Processing...' : 'Apply for Scholarship'}
                </Button>
              </div>
            ) : (
              <div className="w-full text-center">
                <p className="text-sm text-muted-foreground">
                  {!scholarship.active ? "This scholarship is no longer active." :
                   new Date(scholarship.application_deadline) < new Date() ? "The application deadline has passed." :
                   scholarship.available_slots <= 0 ? "All available slots have been filled." :
                   "You are not eligible for this scholarship."}
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href={route('student.scholarships.index')}>View Other Scholarships</Link>
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Scholarship Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Award Amount</h3>
                  <p className="text-lg font-semibold">${scholarship.per_student_budget.toLocaleString()}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-muted-foreground">Available Slots</h3>
                  <p className="text-lg font-semibold">{scholarship.available_slots}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-muted-foreground">Application Deadline</h3>
                  <p className="text-lg font-semibold">
                    {new Date(scholarship.application_deadline).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium text-muted-foreground">Eligibility</h3>
                  <p className="font-semibold">
                    {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                     scholarship.school_type_eligibility === 'high_school' ? 'High School Students' : 'College Students'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-muted-foreground">Minimum GPA</h3>
                  <p className="text-lg font-semibold">{scholarship.min_gpa}%</p>
                </div>
                
                {scholarship.school_type_eligibility !== 'high_school' && (
                  <div>
                    <h3 className="font-medium text-muted-foreground">Minimum Units</h3>
                    <p className="text-lg font-semibold">{scholarship.min_units}</p>
                  </div>
                )}
                
                <div>
                  <h3 className="font-medium text-muted-foreground">Community Service Requirement</h3>
                  <p className="text-lg font-semibold">{scholarship.community_service_days * 8} hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements Card */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              The following documents will be needed for your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentRequirements.map(requirement => (
                <div key={requirement.id} className="rounded-lg border p-4">
                  <h3 className="font-semibold">{requirement.name}</h3>
                  <p className="text-sm text-muted-foreground">{requirement.description}</p>
                  {requirement.is_required && (
                    <Badge variant="outline" className="mt-2">Required</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              All documents must be in PDF, JPG, JPEG, or PNG format and no larger than 10MB.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}