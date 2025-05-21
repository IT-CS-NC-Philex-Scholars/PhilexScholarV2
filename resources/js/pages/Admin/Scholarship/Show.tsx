import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, DocumentRequirement, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { CalendarIcon, ClipboardList, FileText, GraduationCap, Users, Award, Banknote, Clock, Bookmark, Calendar } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

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
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Safety check if scholarship data is incomplete
  if (!scholarship) {
    return (
      <AppLayout>
        <div className="p-4">
          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Scholarship not found</h2>
            <p className="text-muted-foreground mb-4">The scholarship information could not be loaded.</p>
            <Button asChild>
              <Link href={route('admin.scholarships.index')}>Return to Scholarships</Link>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Scholarships', href: route('admin.scholarships.index') },
    { title: scholarship.name }
  ];

  // Get applications by status for stats
  const applications = scholarship.scholarshipApplications || [];
  const documentRequirements = scholarship.documentRequirements || [];
  
  const pendingApplications = applications.filter(app => 
    ['submitted', 'documents_pending', 'documents_under_review'].includes(app.status)
  );
  
  const approvedApplications = applications.filter(app => 
    ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 
     'disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status)
  );
  
  const rejectedApplications = applications.filter(app => 
    ['documents_rejected', 'rejected'].includes(app.status)
  );

  // Format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  };

  // Status badge variant mapping
  const getStatusBadgeVariant = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'enrolled'].includes(status)) {
      return 'default';
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
      return 'destructive';
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review', 'submitted'].includes(status)) {
      return 'outline';
    }
    return 'secondary';
  };

  // Filter applications based on activeFilter
  const filteredApplications = activeFilter === 'all' 
    ? applications 
    : applications.filter(app => {
        if (activeFilter === 'pending') {
          return ['submitted', 'documents_pending', 'documents_under_review'].includes(app.status);
        } else if (activeFilter === 'approved') {
          return ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 
                 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status);
        } else if (activeFilter === 'rejected') {
          return ['documents_rejected', 'rejected'].includes(app.status);
        }
        return true;
      });

  // Calculate fill percentage
  const fillPercentage = scholarship.available_slots > 0 
    ? Math.min(100, (approvedApplications.length / scholarship.available_slots) * 100) 
    : 0;
    
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Scholarship: ${scholarship.name}`} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Scholarship Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant={scholarship.active ? 'default' : 'secondary'} className="mb-2">
                  {scholarship.active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="mb-2">
                  {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                    scholarship.school_type_eligibility === 'high_school' ? 'High School' : 'College'}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{scholarship.name}</h1>
              <p className="text-muted-foreground">
                {scholarship.semester} · {scholarship.academic_year}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link href={route('admin.scholarships.edit', scholarship.id)}>
                  <FileText className="mr-2 h-4 w-4" /> Edit Scholarship
                </Link>
              </Button>
              <Button asChild variant="default" className="w-full sm:w-auto">
                <Link href={route('admin.scholarships.index')}>
                  <ClipboardList className="mr-2 h-4 w-4" /> All Scholarships
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="overflow-hidden border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Award Amount</p>
                    <p className="text-2xl font-bold">${scholarship.per_student_budget.toLocaleString()}</p>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-violet-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Applications</p>
                    <p className="text-2xl font-bold">{applications.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {scholarship.available_slots > 0 && 
                        `${approvedApplications.length}/${scholarship.available_slots} slots filled`}
                    </p>
                  </div>
                  <div className="rounded-full bg-violet-500/10 p-2">
                    <Users className="h-5 w-5 text-violet-500" />
                  </div>
                </div>
                {scholarship.available_slots > 0 && (
                  <div className="mt-4">
                    <Progress value={fillPercentage} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Min. Requirements</p>
                    <p className="text-2xl font-bold">{scholarship.min_gpa}% GPA</p>
                    <p className="text-xs text-muted-foreground">
                      {scholarship.community_service_days} service days required
                    </p>
                  </div>
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <GraduationCap className="h-5 w-5 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Deadline</p>
                    <p className="text-2xl font-bold">{new Date(scholarship.application_deadline).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.ceil((new Date(scholarship.application_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                    </p>
                  </div>
                  <div className="rounded-full bg-red-500/10 p-2">
                    <Calendar className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-8">
          <div className="relative overflow-auto">
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex p-1 w-max min-w-full">
                <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-x-auto ">
                  <TabsTrigger value="overview" className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="requirements" className="flex items-center gap-1">
                    <ClipboardList className="h-4 w-4" /> Requirements
                  </TabsTrigger>
                  <TabsTrigger value="applications" className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> Applications
                  </TabsTrigger>
                </TabsList>
              </div>
            </ScrollArea>
          </div>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main details card */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <CardTitle>Scholarship Overview</CardTitle>
                  </div>
                  <CardDescription>Comprehensive details about this scholarship program</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                  </div>
                  
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-4">Key Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <Calendar className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Academic Year</p>
                          <p className="text-sm text-muted-foreground">{scholarship.academic_year}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <Bookmark className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Semester</p>
                          <p className="text-sm text-muted-foreground">{scholarship.semester}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Application Deadline</p>
                          <p className="text-sm text-muted-foreground">{new Date(scholarship.application_deadline).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <GraduationCap className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">School Type</p>
                          <p className="text-sm text-muted-foreground">
                            {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                            scholarship.school_type_eligibility === 'high_school' ? 'High School' : 'College'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <Award className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Minimum GPA</p>
                          <p className="text-sm text-muted-foreground">{scholarship.min_gpa}%</p>
                        </div>
                      </div>
                      
                      {scholarship.min_units && (
                        <div className="flex items-start gap-2">
                          <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                            <Bookmark className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">Minimum Units</p>
                            <p className="text-sm text-muted-foreground">{scholarship.min_units}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <div className="rounded-full bg-primary/10 p-1.5 mt-0.5">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Service Requirement</p>
                          <p className="text-sm text-muted-foreground">{scholarship.community_service_days} days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Budget card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-primary" />
                    <CardTitle>Budget & Allocation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="pb-5 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Award per Student</p>
                    <div className="flex justify-between items-center">
                      <p className="text-2xl font-bold">${scholarship.per_student_budget.toLocaleString()}</p>
                      <Badge variant="outline">Per Recipient</Badge>
                    </div>
                  </div>
                  
                  <div className="pb-5 border-b">
                    <p className="text-sm text-muted-foreground mb-1">Total Budget</p>
                    <p className="text-xl font-semibold">${scholarship.total_budget.toLocaleString()}</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <p className="text-sm font-medium">Enrollment Progress</p>
                      <p className="text-sm font-medium">
                        {approvedApplications.length}/{scholarship.available_slots} slots
                      </p>
                    </div>
                    <Progress value={fillPercentage} className="h-2" />
                    <div className="grid grid-cols-3 mt-4 text-center">
                      <div>
                        <p className="text-sm font-semibold">{applications.length}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{approvedApplications.length}</p>
                        <p className="text-xs text-muted-foreground">Approved</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{pendingApplications.length}</p>
                        <p className="text-xs text-muted-foreground">Pending</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Document Requirements Tab */}
          <TabsContent value="requirements">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    <CardTitle>Document Requirements</CardTitle>
                  </div>
                  <CardDescription>
                    Documents that students must submit with their application
                  </CardDescription>
                </div>
                <Button asChild>
                  <Link href={route('admin.scholarships.edit', scholarship.id)}>Manage Requirements</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {documentRequirements.length === 0 ? (
                  <div className="text-center border rounded-lg p-8 bg-muted/5">
                    <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-1">No Requirements Defined</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-4">
                      This scholarship doesn't have any document requirements yet. Students won't need to upload any documents when applying.                    
                    </p>
                    <Button asChild variant="outline">
                      <Link href={route('admin.scholarships.edit', scholarship.id)}>Add Requirements</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentRequirements.map(requirement => (
                      <Card key={requirement.id} className="overflow-hidden border-t-4 border-t-blue-500">
                        <CardContent className="p-4 pt-5">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold">{requirement.name}</h3>
                            <Badge variant={requirement.is_required ? 'default' : 'secondary'}>
                              {requirement.is_required ? 'Required' : 'Optional'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{requirement.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Applications Tab */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <CardTitle>Student Applications</CardTitle>
                    </div>
                    <CardDescription>
                      Students who have applied to this scholarship program
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={activeFilter === 'all' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setActiveFilter('all')}
                      className="text-xs h-8"
                    >
                      All ({applications.length})
                    </Button>
                    <Button 
                      variant={activeFilter === 'pending' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setActiveFilter('pending')}
                      className="text-xs h-8"
                    >
                      Pending ({pendingApplications.length})
                    </Button>
                    <Button 
                      variant={activeFilter === 'approved' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setActiveFilter('approved')}
                      className="text-xs h-8"
                    >
                      Approved ({approvedApplications.length})
                    </Button>
                    <Button 
                      variant={activeFilter === 'rejected' ? 'default' : 'outline'} 
                      size="sm" 
                      onClick={() => setActiveFilter('rejected')}
                      className="text-xs h-8"
                    >
                      Rejected ({rejectedApplications.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {applications.length === 0 ? (
                  <div className="text-center border rounded-lg p-8 bg-muted/5">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-1">No Applications Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      No students have applied for this scholarship yet. Applications will appear here once students submit them.
                    </p>
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center border rounded-lg p-6 bg-muted/5">
                    <h3 className="font-semibold mb-1">No Matching Applications</h3>
                    <p className="text-muted-foreground">No applications match your current filter. Try another filter or view all applications.</p>
                  </div>
                ) : (
                  <div className="overflow-hidden">
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50 border-b">
                            <th className="text-left py-3 px-4 font-medium">Student</th>
                            <th className="text-left py-3 px-4 font-medium">Status</th>
                            <th className="text-left py-3 px-4 font-medium">Submitted</th>
                            <th className="text-left py-3 px-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {filteredApplications.map(application => (
                            <tr key={application.id} className="hover:bg-muted/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 border bg-muted">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold uppercase text-muted-foreground">
                                      {application.studentProfile?.user?.name?.charAt(0) || '?'}
                                    </div>
                                  </Avatar>
                                  <div>
                                    {application.studentProfile?.user ? (
                                      <>
                                        <div className="font-medium">{application.studentProfile.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{application.studentProfile.user.email}</div>
                                      </>
                                    ) : (
                                      <div className="font-medium text-muted-foreground">Student info unavailable</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant={getStatusBadgeVariant(application.status)}>
                                  {formatStatus(application.status)}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                {application.submitted_at ? (
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span>{new Date(application.submitted_at).toLocaleDateString()}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">Not submitted</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <Button asChild size="sm" className="w-full sm:w-auto">
                                  <Link href={route('admin.applications.show', application.id)}>Review</Link>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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