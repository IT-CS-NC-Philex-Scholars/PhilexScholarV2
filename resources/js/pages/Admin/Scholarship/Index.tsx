import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ScholarshipIndexProps {
  scholarships: (ScholarshipProgram & { scholarship_applications_count: number })[];
}

export default function Index({ scholarships }: ScholarshipIndexProps) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Scholarship Programs' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Scholarship Programs" />
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Scholarship Programs</h1>
          <Button asChild>
            <Link href={route('admin.scholarships.create')}>Create New Program</Link>
          </Button>
        </div>
        
        {scholarships.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Scholarships Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get started by creating your first scholarship program.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Name</th>
                  <th className="py-3 px-4 text-left font-medium">Budget</th>
                  <th className="py-3 px-4 text-left font-medium">Eligibility</th>
                  <th className="py-3 px-4 text-left font-medium">Deadline</th>
                  <th className="py-3 px-4 text-left font-medium">Applications</th>
                  <th className="py-3 px-4 text-left font-medium">Status</th>
                  <th className="py-3 px-4 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((scholarship) => (
                  <tr key={scholarship.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{scholarship.name}</div>
                      <div className="text-xs text-muted-foreground">{scholarship.semester} | {scholarship.academic_year}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>${scholarship.per_student_budget.toLocaleString()} / student</div>
                      <div className="text-xs text-muted-foreground">Total: ${scholarship.total_budget.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">
                        {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                         scholarship.school_type_eligibility === 'high_school' ? 'High School' : 'College'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(scholarship.application_deadline).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {scholarship.scholarship_applications_count}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={scholarship.active ? 'success' : 'secondary'}>
                        {scholarship.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={route('admin.scholarships.show', scholarship.id)}>View</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline">
                          <Link href={route('admin.scholarships.edit', scholarship.id)}>Edit</Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}