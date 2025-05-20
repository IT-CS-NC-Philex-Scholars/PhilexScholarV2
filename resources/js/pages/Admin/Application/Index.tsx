import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApplicationsIndexProps {
  applications: {
    data: ScholarshipApplication[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    status?: string;
    scholarship_id?: string;
  };
}

export default function Index({ applications, filters }: ApplicationsIndexProps) {
  const { data, setData, get } = useForm({
    status: filters.status || 'all',
    scholarship_id: filters.scholarship_id || 'all',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Applications' }
  ];
  
  // Format status for display
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
  
  // Handle filter changes
  const applyFilters = () => {
    get(route('admin.applications.index'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Scholarship Applications" />
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Scholarship Applications</h1>
        </div>
        
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Applications</CardTitle>
            <CardDescription>Narrow down the list of applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/3">
                <label className="text-sm font-medium mb-1 block">Status</label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="documents_pending">Documents Pending</SelectItem>
                    <SelectItem value="documents_under_review">Under Review</SelectItem>
                    <SelectItem value="documents_approved">Documents Approved</SelectItem>
                    <SelectItem value="documents_rejected">Documents Rejected</SelectItem>
                    <SelectItem value="eligibility_verified">Eligibility Verified</SelectItem>
                    <SelectItem value="enrolled">Enrolled</SelectItem>
                    <SelectItem value="service_pending">Service Pending</SelectItem>
                    <SelectItem value="service_completed">Service Completed</SelectItem>
                    <SelectItem value="disbursement_pending">Disbursement Pending</SelectItem>
                    <SelectItem value="disbursement_processed">Disbursement Processed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {applications.data.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Applications Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No scholarship applications match your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Student</th>
                    <th className="py-3 px-4 text-left font-medium">Scholarship</th>
                    <th className="py-3 px-4 text-left font-medium">Status</th>
                    <th className="py-3 px-4 text-left font-medium">Submitted</th>
                    <th className="py-3 px-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.data.map((application) => (
                    <tr key={application.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{application.studentProfile?.user?.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div>{application.scholarshipProgram?.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {application.scholarshipProgram?.semester} | {application.scholarshipProgram?.academic_year}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusBadgeVariant(application.status) as any}>
                          {formatStatus(application.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Not submitted'}
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
            
            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {applications.data.length} of {applications.total} applications
              </div>
              <div className="flex gap-2">
                {applications.current_page > 1 && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={route('admin.applications.index', { page: applications.current_page - 1, ...filters })}>Previous</Link>
                  </Button>
                )}
                {applications.current_page < applications.last_page && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={route('admin.applications.index', { page: applications.current_page + 1, ...filters })}>Next</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}