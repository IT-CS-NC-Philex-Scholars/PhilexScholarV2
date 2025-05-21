import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User, StudentProfile, ScholarshipApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  School,
  GraduationCap,
  Calendar,
  Award,
  FileText,
  Clock,
  CalendarIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ClipboardList
} from 'lucide-react';

interface StudentShowProps {
  student: User & {
    studentProfile?: StudentProfile;
  };
  applications: {
    all: ScholarshipApplication[];
    pending: ScholarshipApplication[];
    active: ScholarshipApplication[];
    completed: ScholarshipApplication[];
    rejected: ScholarshipApplication[];
  };
}

export default function Show({ student, applications }: StudentShowProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Students', href: route('admin.students.index') },
    { title: student.name }
  ];
  
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
  
  // Get status icon based on application status
  const getStatusIcon = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'enrolled'].includes(status)) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
      return <XCircle className="h-4 w-4 text-destructive" />;
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review', 'submitted'].includes(status)) {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Student: ${student.name}`} />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Student Profile Section */}
          <div className="w-full md:w-1/3 space-y-6">
            <Card>
              <CardContent className="p-0">
                {/* Student Header */}
                <div className="flex flex-col items-center pt-6 pb-4 border-b text-center">
                  <Avatar className="h-24 w-24 border-4 border-primary/10 mb-3">
                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-3xl">
                      {student.name.charAt(0)}
                    </div>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{student.name}</h2>
                  <div className="flex items-center text-muted-foreground">
                    <Mail className="h-4 w-4 mr-1" />
                    <span>{student.email}</span>
                  </div>
                  
                  {student.studentProfile && (
                    <Badge className="mt-3" variant="outline">
                      {student.studentProfile.school_type === 'high_school' ? 'High School Student' : 'College Student'}
                    </Badge>
                  )}
                </div>
                
                {/* Student Details */}
                {student.studentProfile ? (
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Personal Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <UserIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Student ID</p>
                            <p className="text-sm text-muted-foreground">{student.studentProfile.student_id || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Phone Number</p>
                            <p className="text-sm text-muted-foreground">{student.studentProfile.phone_number || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">Address</p>
                            <p className="text-sm text-muted-foreground">
                              {[student.studentProfile.address, student.studentProfile.city, student.studentProfile.state, student.studentProfile.zip_code]
                                .filter(Boolean)
                                .join(', ') || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Academic Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <School className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">School</p>
                            <p className="text-sm text-muted-foreground">{student.studentProfile.school_name || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">School Level</p>
                            <p className="text-sm text-muted-foreground">{student.studentProfile.school_level || 'Not provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Award className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm font-medium">GPA</p>
                            <p className="text-sm text-muted-foreground">{student.studentProfile.gpa || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-bold">{applications.all.length}</p>
                          <p className="text-xs text-muted-foreground">Total Applications</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-bold">{applications.completed.length}</p>
                          <p className="text-xs text-muted-foreground">Approved</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-1">Profile Not Completed</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      This student hasn't completed their profile information yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Applications Section */}
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="all" className="w-full">
              <div className="relative overflow-auto mb-6">
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <div className="flex p-1 w-max min-w-full">
                    <TabsList>
                      <TabsTrigger value="all" className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" /> All Applications ({applications.all.length})
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> Pending ({applications.pending.length})
                      </TabsTrigger>
                      <TabsTrigger value="active" className="flex items-center gap-1">
                        <Award className="h-4 w-4" /> Active ({applications.active.length})
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Completed ({applications.completed.length})
                      </TabsTrigger>
                      <TabsTrigger value="rejected" className="flex items-center gap-1">
                        <XCircle className="h-4 w-4" /> Rejected ({applications.rejected.length})
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </ScrollArea>
              </div>
              
              {/* Render applications for each tab */}
              {['all', 'pending', 'active', 'completed', 'rejected'].map((tabValue) => (
                <TabsContent key={tabValue} value={tabValue} className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {tabValue === 'all' ? 'All Applications' :
                         tabValue === 'pending' ? 'Pending Applications' :
                         tabValue === 'active' ? 'Active Applications' :
                         tabValue === 'completed' ? 'Completed Applications' :
                         'Rejected Applications'}
                      </CardTitle>
                      <CardDescription>
                        {tabValue === 'all' ? 'All scholarship applications submitted by this student' :
                         tabValue === 'pending' ? 'Applications awaiting review or document verification' :
                         tabValue === 'active' ? 'Applications that are currently in progress' :
                         tabValue === 'completed' ? 'Successfully completed scholarship applications' :
                         'Applications that were rejected or discontinued'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {applications[tabValue as keyof typeof applications].length === 0 ? (
                        <div className="text-center border rounded-lg p-6 bg-muted/5">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                          <h3 className="text-lg font-semibold mb-1">No Applications Found</h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            {tabValue === 'all' ? 'This student hasn\'t submitted any scholarship applications yet.' :
                             tabValue === 'pending' ? 'No pending applications at this time.' :
                             tabValue === 'active' ? 'No active scholarships at this time.' :
                             tabValue === 'completed' ? 'No completed scholarship applications yet.' :
                             'No rejected applications at this time.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applications[tabValue as keyof typeof applications].map((application) => (
                            <Card key={application.id} className="overflow-hidden border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(application.status)}
                                      <h3 className="font-semibold">
                                        {application.scholarshipProgram?.name || 'Scholarship'}
                                      </h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
                                      <Badge variant={getStatusBadgeVariant(application.status)}>
                                        {formatStatus(application.status)}
                                      </Badge>
                                      {application.scholarshipProgram && (
                                        <div className="flex items-center">
                                          <span className="mx-2">•</span>
                                          <span>{application.scholarshipProgram.semester} {application.scholarshipProgram.academic_year}</span>
                                        </div>
                                      )}
                                      {application.submitted_at && (
                                        <div className="flex items-center">
                                          <span className="mx-2">•</span>
                                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                                          <span>Submitted {new Date(application.submitted_at).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button asChild size="sm">
                                    <Link href={route('admin.applications.show', application.id)}>Review Application</Link>
                                  </Button>
                                </div>
                                
                                {/* Show documents if any */}
                                {application.documentUploads && application.documentUploads.length > 0 && (
                                  <div className="mt-4 pt-3 border-t">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                      Documents ({application.documentUploads.length}): 
                                      {application.documentUploads.filter(doc => doc.status === 'approved').length} approved, 
                                      {application.documentUploads.filter(doc => doc.status !== 'approved').length} pending/rejected
                                    </p>
                                  </div>
                                )}
                                
                                {/* Show disbursements if any */}
                                {application.disbursements && application.disbursements.length > 0 && (
                                  <div className="mt-2 pt-2 border-t">
                                    <p className="text-xs font-medium text-muted-foreground">
                                      Total disbursed: ${application.disbursements.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}