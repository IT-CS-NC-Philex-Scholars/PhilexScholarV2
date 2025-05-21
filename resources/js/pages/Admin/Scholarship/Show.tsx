import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, DocumentRequirement, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ScholarshipShowProps {
  scholarship: ScholarshipProgram & {
    documentRequirements: DocumentRequirement[];
    scholarshipApplications: (ScholarshipApplication & {
      studentProfile: {
        user: {
          id: number;
          name: string;
          email: string;
        };
      };
    })[];
  };
}

export default function Show({ scholarship }: ScholarshipShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Scholarships', href: route('admin.scholarships.index') },
    { title: scholarship.name }
  ];

  // Get applications by status for stats
  const pendingApplications = scholarship.scholarshipApplications.filter(app => 
    ['submitted', 'documents_pending', 'documents_under_review'].includes(app.status)
  );
  
  const approvedApplications = scholarship.scholarshipApplications.filter(app => 
    ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 
     'disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status)
  );
  
  const rejectedApplications = scholarship.scholarshipApplications.filter(app => 
    ['documents_rejected', 'rejected'].includes(app.status)
  );

  // Format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  // Status badge variant mapping
  const getStatusBadgeVariant = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'enrolled'].includes(status)) {
      return 'success';
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
      return 'destructive';
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review', 'submitted'].includes(status)) {
      return 'warning';
    }
    return 'secondary';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Scholarship: ${scholarship.name}`} />
      
      <div className="p-4 space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{scholarship.name}</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={route('admin.scholarships.edit', scholarship.id)}>Edit Scholarship</Link>
            </Button>
            <Button asChild variant="default">
              <Link href={route('admin.scholarships.index')}>Back to List</Link>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Scholarship Details</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="students">Enrolled Students</TabsTrigger>
          </TabsList>
          
          {/* Scholarship Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Main details card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Scholarship Information</CardTitle>
                  <CardDescription>
                    Details about this scholarship program
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                    <p className="text-sm">{scholarship.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Academic Year</h3>
                      <p className="font-medium">{scholarship.academic_year}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Semester</h3>
                      <p className="font-medium">{scholarship.semester}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Application Deadline</h3>
                      <p className="font-medium">{new Date(scholarship.application_deadline).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <Badge variant={scholarship.active ? 'success' : 'secondary'}>
                        {scholarship.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Budget and Eligibility card */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget & Eligibility</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Award per Student</h3>
                    <p className="text-xl font-bold">${scholarship.per_student_budget.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Budget</h3>
                    <p className="font-medium">${scholarship.total_budget.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Available Slots</h3>
                    <p className="font-medium">{scholarship.available_slots}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">School Type</h3>
                    <Badge variant="outline">
                      {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                      scholarship.school_type_eligibility === 'high_school' ? 'High School' : 'College'}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Minimum GPA</h3>
                    <p className="font-medium">{scholarship.min_gpa}%</p>
                  </div>
                  
                  {scholarship.min_units && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Minimum Units</h3>
                      <p className="font-medium">{scholarship.min_units}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Service Requirement</h3>
                    <p className="font-medium">{scholarship.community_service_days} days</p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Application stats card */}
              <Card className="md:col-span-3">
                <CardHeader>
                  <CardTitle>Application Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Total Applications</div>
                      <div className="text-2xl font-bold">{scholarship.scholarshipApplications.length}</div>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Pending Review</div>
                      <div className="text-2xl font-bold">{pendingApplications.length}</div>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Approved</div>
                      <div className="text-2xl font-bold">{approvedApplications.length}</div>
                    </div>
                    
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Rejected</div>
                      <div className="text-2xl font-bold">{rejectedApplications.length}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Document Requirements Tab */}
          <TabsContent value="requirements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Document Requirements</CardTitle>
                  <CardDescription>
                    Documents that students must submit with their application
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={route('admin.scholarships.edit', scholarship.id)}>Manage Requirements</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {scholarship.documentRequirements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No document requirements defined.</p>
                ) : (
                  <div className="space-y-4">
                    {scholarship.documentRequirements.map(requirement => (
                      <div key={requirement.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{requirement.name}</h3>
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                          </div>
                          <Badge variant={requirement.is_required ? 'default' : 'secondary'}>
                            {requirement.is_required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Enrolled Students Tab */}
          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  Students who have applied to this scholarship program
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scholarship.scholarshipApplications.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No applications found for this scholarship.</p>
                ) : (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="text-left py-3 px-4 font-medium">Student</th>
                          <th className="text-left py-3 px-4 font-medium">Status</th>
                          <th className="text-left py-3 px-4 font-medium">Submitted</th>
                          <th className="text-left py-3 px-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scholarship.scholarshipApplications.map(application => (
                          <tr key={application.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="font-medium">{application.studentProfile.user.name}</div>
                              <div className="text-xs text-muted-foreground">{application.studentProfile.user.email}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={getStatusBadgeVariant(application.status) as any}>
                                {formatStatus(application.status)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              {application.submitted_at ? 
                                new Date(application.submitted_at).toLocaleDateString() : 
                                'Not submitted'}
                            </td>
                            <td className="py-3 px-4">
                              <Button asChild size="sm">
                                <Link href={route('admin.applications.show', application.id)}>Review</Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}