import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CommunityServiceReport, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface CommunityServiceCreateProps {
  application: ScholarshipApplication;
  scholarship: ScholarshipProgram;
  serviceReports: CommunityServiceReport[];
  totalDaysCompleted: number;
  requiredDays: number;
  remainingDays: number;
}

export default function Create({ 
  application,
  scholarship,
  serviceReports,
  totalDaysCompleted,
  requiredDays,
  remainingDays,
}: CommunityServiceCreateProps) {
  const { data, setData, post, errors, processing } = useForm({
    days_completed: 1,
    description: '',
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    post(route('student.community-service.store', application.id));
  }

  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    if (['approved'].includes(status)) {
      return 'success';
    }
    if (['rejected_insufficient_hours', 'rejected_incomplete_documentation', 'rejected_other'].includes(status)) {
      return 'destructive';
    }
    if (['pending_review'].includes(status)) {
      return 'warning';
    }
    return 'secondary';
  };

  // Helper function to format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Applications', href: route('student.applications.index') },
    { title: 'Application Details', href: route('student.applications.show', application.id) },
    { title: 'Community Service Report' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Community Service Report" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>Community Service Progress</CardTitle>
            <CardDescription>
              Track your community service hours for {scholarship.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Required Days</p>
                  <p className="text-2xl font-bold">{requiredDays}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed Days</p>
                  <p className="text-2xl font-bold">{totalDaysCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Days</p>
                  <p className="text-2xl font-bold">{remainingDays}</p>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2.5">
                <div 
                  className="bg-primary h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (totalDaysCompleted / requiredDays) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Service Report Form */}
        {remainingDays > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Submit New Service Report</CardTitle>
              <CardDescription>
                Document your community service activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="days_completed">Days Completed</Label>
                  <Input
                    id="days_completed"
                    type="number"
                    min={1}
                    max={remainingDays}
                    value={data.days_completed}
                    onChange={e => setData('days_completed', parseInt(e.target.value) || 1)}
                    required
                  />
                  {errors.days_completed && (
                    <p className="text-sm text-red-600">{errors.days_completed}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description of Service</Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Provide a detailed description of your community service activities..."
                    value={data.description}
                    onChange={e => setData('description', e.target.value)}
                    required
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Include details such as the organization, your role, activities performed, and outcomes.
                  </p>
                </div>
                
                <Button type="submit" disabled={processing}>
                  {processing ? 'Submitting...' : 'Submit Report'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {/* Previous Reports */}
        {serviceReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Previous Service Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceReports.map(report => (
                  <div key={report.id} className="rounded-lg border p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{report.days_completed} {report.days_completed === 1 ? 'Day' : 'Days'}</h3>
                          <Badge variant={getStatusBadgeVariant(report.status) as any}>
                            {formatStatus(report.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted: {new Date(report.submitted_at).toLocaleDateString()}
                        </p>
                        <div className="mt-3">
                          <p className="text-sm line-clamp-2">{report.description}</p>
                        </div>
                        {report.rejection_reason && (
                          <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                            Reason: {report.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}