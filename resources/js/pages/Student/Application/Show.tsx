import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication, ScholarshipProgram, DocumentUpload, DocumentRequirement } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DocumentUploadItem {
  requirement: DocumentRequirement;
  upload: DocumentUpload | null;
}

interface ApplicationShowProps {
  application: ScholarshipApplication;
  scholarship: ScholarshipProgram;
  documentUploads: DocumentUploadItem[];
  canSubmit: boolean;
}

export default function Show({ 
  application, 
  scholarship, 
  documentUploads,
  canSubmit 
}: ApplicationShowProps) {
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  
  // Helper function to format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  
  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'approved'].includes(status)) {
      return 'success';
    }
    if (['documents_rejected', 'rejected', 'rejected_invalid', 'rejected_incomplete', 'rejected_incorrect_format', 'rejected_unreadable', 'rejected_other'].includes(status)) {
      return 'destructive';
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review', 'pending_review'].includes(status)) {
      return 'warning';
    }
    return 'secondary';
  };
  
  const submitApplication = () => {
    router.post(route('student.applications.submit', application.id));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Applications', href: route('student.applications.index') },
    { title: 'Application Details' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Application Details" />
      
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Application Status Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{scholarship.name}</CardTitle>
                <CardDescription>
                  {scholarship.semester} | {scholarship.academic_year}
                </CardDescription>
              </div>
              <Badge className="w-fit" variant={getStatusBadgeVariant(application.status) as any}>
                {formatStatus(application.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Scholarship Amount</h3>
                <p className="font-semibold">${scholarship.per_student_budget.toLocaleString()}</p>
              </div>
              
              {application.submitted_at && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Submitted Date</h3>
                  <p className="font-semibold">{new Date(application.submitted_at).toLocaleDateString()}</p>
                </div>
              )}
              
              {application.reviewed_at && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Reviewed Date</h3>
                  <p className="font-semibold">{new Date(application.reviewed_at).toLocaleDateString()}</p>
                </div>
              )}
              
              {application.admin_notes && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Admin Notes</h3>
                  <p className="p-3 bg-muted rounded-md">{application.admin_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
          
          {application.status === 'enrolled' && (
            <CardFooter className="border-t pt-6">
              <Button asChild className="w-full">
                <Link href={route('student.community-service.create', application.id)}>
                  Submit Community Service Report
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Document Uploads Card */}
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              {application.status === 'draft' ? (
                'Upload all required documents to submit your application.'
              ) : application.status === 'submitted' || application.status === 'documents_pending' ? (
                'Your documents are waiting for review.'
              ) : application.status === 'documents_under_review' ? (
                'Your documents are currently being reviewed.'
              ) : application.status === 'documents_rejected' ? (
                'One or more of your documents were rejected. Please review and resubmit.'
              ) : (
                'All your documents have been processed.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentUploads.map(({ requirement, upload }) => (
                <div key={requirement.id} className="rounded-lg border p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{requirement.name}</h3>
                      <p className="text-sm text-muted-foreground">{requirement.description}</p>
                      
                      {upload && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(upload.status) as any}>
                            {formatStatus(upload.status)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Uploaded: {new Date(upload.uploaded_at).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {upload?.rejection_reason && (
                        <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                          Reason: {upload.rejection_reason}
                        </div>
                      )}
                    </div>
                    
                    {(application.status === 'draft' || application.status === 'documents_rejected') && (
                      <DocumentUploadForm 
                        applicationId={application.id}
                        requirementId={requirement.id}
                        isActive={activeUploadId === requirement.id}
                        onActiveChange={(isActive) => setActiveUploadId(isActive ? requirement.id : null)}
                        existingFileName={upload?.original_filename}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          {canSubmit && (
            <CardFooter className="border-t pt-6">
              <div className="w-full">
                <p className="text-sm text-muted-foreground mb-4 text-center">
                  Please review all your documents before submitting. Once submitted, your application will be reviewed by our team.
                </p>
                <Button onClick={submitApplication} className="w-full">
                  Submit Application
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

interface DocumentUploadFormProps {
  applicationId: number;
  requirementId: number;
  isActive: boolean;
  onActiveChange: (isActive: boolean) => void;
  existingFileName: string | undefined;
}

function DocumentUploadForm({ 
  applicationId, 
  requirementId, 
  isActive, 
  onActiveChange,
  existingFileName 
}: DocumentUploadFormProps) {
  const { data, setData, post, processing, progress } = useForm({
    document_requirement_id: requirementId,
    document: null as File | null,
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('document', e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('student.applications.documents.upload', applicationId), {
      onSuccess: () => {
        onActiveChange(false);
      },
    });
  };
  
  if (!isActive) {
    return (
      <Button 
        variant="outline" 
        onClick={() => onActiveChange(true)}
      >
        {existingFileName ? 'Replace Document' : 'Upload Document'}
      </Button>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="w-full md:w-auto">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`document-${requirementId}`}>Select Document</Label>
          <Input
            id={`document-${requirementId}`}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={processing}
            required
          />
          <p className="text-xs text-muted-foreground">
            Accepts PDF, JPG, JPEG, or PNG (max 10MB)
          </p>
        </div>
        
        {progress && (
          <div className="w-full bg-muted rounded-full h-1.5 mt-2">
            <div 
              className="bg-primary h-1.5 rounded-full" 
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={processing || !data.document}>
            {processing ? 'Uploading...' : 'Upload'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onActiveChange(false)}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}