import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication, DocumentUpload, CommunityServiceReport } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Download, Eye, FileText } from 'lucide-react';
import { useState } from 'react';

interface ApplicationShowProps {
  application: ScholarshipApplication;
}

export default function Show({ application }: ApplicationShowProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentUpload | null>(null);
  const [selectedReport, setSelectedReport] = useState<CommunityServiceReport | null>(null);
  const [dialogType, setDialogType] = useState<'document' | 'report' | 'status' | 'create_disbursement' | 'edit_disbursement'>('document');
  
  // Disbursement form
  const disbursementForm = useForm({
    id: 0,
    amount: 0,
    payment_method: '',
    reference_number: '',
    disbursement_date: '',
    notes: '',
    status: 'pending',
  });

  const statusForm = useForm({
    status: application.status,
    admin_notes: application.admin_notes || '',
  });

  const documentForm = useForm({
    status: '',
    rejection_reason: '',
  });

  const reportForm = useForm({
    status: '',
    rejection_reason: '',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Applications', href: route('admin.applications.index') },
    { title: `Application #${application.id}` }
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

  const openDocumentReviewDialog = (document: DocumentUpload) => {
    setSelectedDocument(document);
    documentForm.setData('status', '');
    documentForm.setData('rejection_reason', '');
    setDialogType('document');
    setOpenReviewDialog(true);
  };

  const openReportReviewDialog = (report: CommunityServiceReport) => {
    setSelectedReport(report);
    reportForm.setData('status', '');
    reportForm.setData('rejection_reason', '');
    setDialogType('report');
    setOpenReviewDialog(true);
  };

  const openStatusUpdateDialog = () => {
    statusForm.setData('status', application.status);
    statusForm.setData('admin_notes', application.admin_notes || '');
    setDialogType('status');
    setOpenReviewDialog(true);
  };

  const submitDocumentReview = () => {
    if (!selectedDocument) return;
    
    documentForm.post(route('admin.documents.review', selectedDocument.id), {
      onSuccess: () => {
        setOpenReviewDialog(false);
      },
    });
  };

  const submitReportReview = () => {
    if (!selectedReport) return;
    
    reportForm.post(route('admin.service-reports.review', selectedReport.id), {
      onSuccess: () => {
        setOpenReviewDialog(false);
      },
    });
  };

  const updateApplicationStatus = () => {
    statusForm.post(route('admin.applications.status.update', application.id), {
      onSuccess: () => {
        setOpenReviewDialog(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Application #${application.id}`} />
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Application #{application.id}</h1>
            <p className="text-muted-foreground">
              Submitted {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : 'Not submitted'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={openStatusUpdateDialog}>
              Update Status
            </Button>
          </div>
        </div>
        
        {/* Status Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Current Status</CardTitle>
              <Badge variant={getStatusBadgeVariant(application.status) as any} className="text-sm">
                {formatStatus(application.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Admin Notes</h3>
                <p className="text-muted-foreground">
                  {application.admin_notes || 'No notes added'}
                </p>
              </div>
              {application.reviewed_at && (
                <div>
                  <h3 className="font-medium mb-1">Last Reviewed</h3>
                  <p className="text-muted-foreground">
                    {new Date(application.reviewed_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="service">Service Reports</TabsTrigger>
            <TabsTrigger value="disbursements">Disbursements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Student Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Personal Details</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-muted-foreground">Name</dt>
                        <dd>{application.studentProfile?.user?.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Email</dt>
                        <dd>{application.studentProfile?.user?.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Student ID</dt>
                        <dd>{application.studentProfile?.student_id}</dd>
                      </div>
                    </dl>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Academic Information</h3>
                    <dl className="space-y-2">
                      <div>
                        <dt className="text-sm text-muted-foreground">Major</dt>
                        <dd>{application.studentProfile?.major}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Current GPA</dt>
                        <dd>{application.studentProfile?.gpa}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Year Level</dt>
                        <dd>{application.studentProfile?.year_level}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Scholarship Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">{application.scholarshipProgram?.name}</h3>
                    <p className="text-muted-foreground">{application.scholarshipProgram?.description}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm text-muted-foreground">Amount</h4>
                      <p className="font-medium">${application.scholarshipProgram?.amount}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">Academic Year</h4>
                      <p className="font-medium">{application.scholarshipProgram?.academic_year}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-muted-foreground">Semester</h4>
                      <p className="font-medium">{application.scholarshipProgram?.semester}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Document Verification</CardTitle>
                <CardDescription>
                  Review and approve student submitted documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {application.documentUploads && application.documentUploads.length > 0 ? (
                  <div className="space-y-4">
                    {application.documentUploads.map((document) => (
                      <div key={document.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{document.documentRequirement?.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {document.documentRequirement?.description}
                            </p>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={document.status === 'approved' ? 'success' : 
                                  document.status === 'pending' ? 'secondary' : 'destructive'}
                              >
                                {formatStatus(document.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Uploaded: {new Date(document.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {document.rejection_reason && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                                <p className="text-sm text-muted-foreground">{document.rejection_reason}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/storage/${document.file_path}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" /> View
                              </a>
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/storage/${document.file_path}`} download>
                                <Download className="h-4 w-4 mr-1" /> Download
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => openDocumentReviewDialog(document)}
                              disabled={document.status === 'approved'}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No documents have been uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="service" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Community Service Reports</CardTitle>
                <CardDescription>
                  Review student service hour submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {application.communityServiceReports && application.communityServiceReports.length > 0 ? (
                  <div className="space-y-4">
                    {application.communityServiceReports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{report.organization_name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {report.description}
                            </p>
                            <div className="grid grid-cols-2 gap-4 mb-2">
                              <div>
                                <p className="text-sm text-muted-foreground">Hours: <span className="font-medium">{report.hours}</span></p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Date: <span className="font-medium">{new Date(report.service_date).toLocaleDateString()}</span></p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={report.status === 'approved' ? 'success' : 
                                  report.status === 'pending' ? 'secondary' : 'destructive'}
                              >
                                {formatStatus(report.status)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Submitted: {new Date(report.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {report.rejection_reason && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                                <p className="text-sm text-muted-foreground">{report.rejection_reason}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {report.verification_document && (
                              <>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`/storage/${report.verification_document}`} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4 mr-1" /> View Document
                                  </a>
                                </Button>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={`/storage/${report.verification_document}`} download>
                                    <Download className="h-4 w-4 mr-1" /> Download
                                  </a>
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => openReportReviewDialog(report)}
                              disabled={report.status === 'approved'}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No service reports have been submitted yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="disbursements" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>Disbursement History</CardTitle>
                  <CardDescription>
                    Track scholarship payment information
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setDialogType('create_disbursement');
                    disbursementForm.reset();
                    disbursementForm.setData({
                      id: 0,
                      amount: application.scholarshipProgram?.amount || 0,
                      payment_method: '',
                      reference_number: '',
                      disbursement_date: new Date().toISOString().split('T')[0],
                      notes: '',
                      status: 'pending',
                    });
                    setOpenReviewDialog(true);
                  }}
                  disabled={!['documents_approved', 'eligibility_verified', 'enrolled', 'service_completed', 'disbursement_pending'].includes(application.status)}
                >
                  Create Disbursement
                </Button>
              </CardHeader>
              <CardContent>
                {application.disbursements && application.disbursements.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-3 px-4 text-left font-medium">Amount</th>
                          <th className="py-3 px-4 text-left font-medium">Date</th>
                          <th className="py-3 px-4 text-left font-medium">Method</th>
                          <th className="py-3 px-4 text-left font-medium">Status</th>
                          <th className="py-3 px-4 text-left font-medium">Notes</th>
                          <th className="py-3 px-4 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {application.disbursements.map((disbursement) => (
                          <tr key={disbursement.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="font-medium">${disbursement.amount}</div>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(disbursement.disbursement_date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {disbursement.payment_method}
                            </td>
                            <td className="py-3 px-4">
                              <Badge 
                                variant={disbursement.status === 'processed' ? 'success' : 
                                  disbursement.status === 'pending' ? 'warning' : 'secondary'}
                              >
                                {formatStatus(disbursement.status)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                               <div className="max-w-xs truncate">{disbursement.notes || '—'}</div>
                            </td>
                            <td className="py-3 px-4">
                               <Button 
                                 size="sm" 
                                 onClick={() => {
                                   setDialogType('edit_disbursement');
                                   // Set up form with current disbursement data
                                   disbursementForm.setData({
                                     id: disbursement.id,
                                     amount: disbursement.amount,
                                     payment_method: disbursement.payment_method || '',
                                     reference_number: disbursement.reference_number || '',
                                     disbursement_date: new Date(disbursement.disbursement_date).toISOString().split('T')[0],
                                     notes: disbursement.notes || '',
                                     status: disbursement.status,
                                   });
                                   setOpenReviewDialog(true);
                                 }}
                                 variant="outline"
                               >
                                 Edit
                               </Button>
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium text-lg mb-2">No Disbursements Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Once the application is approved, disbursements will be processed and appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onOpenChange={setOpenReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'document' ? 'Review Document' : 
               dialogType === 'report' ? 'Review Service Report' : 
               dialogType === 'create_disbursement' ? 'Create Disbursement' :
               dialogType === 'edit_disbursement' ? 'Edit Disbursement' :
               'Update Application Status'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'document' ? 'Update the status of this document submission' : 
               dialogType === 'report' ? 'Update the status of this service report' :
               dialogType === 'create_disbursement' ? 'Create a new disbursement for this scholarship' :
               dialogType === 'edit_disbursement' ? 'Edit the disbursement details' :
               'Change the overall status of this application'}
            </DialogDescription>
          </DialogHeader>
          
          {dialogType === 'document' && selectedDocument && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="document-status">Status</Label>
                <Select 
                  value={documentForm.data.status} 
                  onValueChange={(value) => documentForm.setData('status', value)}
                >
                  <SelectTrigger id="document-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected_invalid">Rejected: Invalid Document</SelectItem>
                    <SelectItem value="rejected_incomplete">Rejected: Incomplete</SelectItem>
                    <SelectItem value="rejected_incorrect_format">Rejected: Incorrect Format</SelectItem>
                    <SelectItem value="rejected_unreadable">Rejected: Unreadable</SelectItem>
                    <SelectItem value="rejected_other">Rejected: Other Reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {documentForm.data.status && documentForm.data.status.startsWith('rejected') && (
                <div>
                  <Label htmlFor="document-reason">Rejection Reason</Label>
                  <Textarea 
                    id="document-reason" 
                    value={documentForm.data.rejection_reason}
                    onChange={(e) => documentForm.setData('rejection_reason', e.target.value)}
                    placeholder="Explain why this document was rejected"
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
                <Button onClick={submitDocumentReview} disabled={!documentForm.data.status || 
                  (documentForm.data.status.startsWith('rejected') && !documentForm.data.rejection_reason)}>
                  Submit Review
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {dialogType === 'report' && selectedReport && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="report-status">Status</Label>
                <Select 
                  value={reportForm.data.status} 
                  onValueChange={(value) => reportForm.setData('status', value)}
                >
                  <SelectTrigger id="report-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected_insufficient_hours">Rejected: Insufficient Hours</SelectItem>
                    <SelectItem value="rejected_incomplete_documentation">Rejected: Incomplete Documentation</SelectItem>
                    <SelectItem value="rejected_other">Rejected: Other Reason</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {reportForm.data.status && reportForm.data.status.startsWith('rejected') && (
                <div>
                  <Label htmlFor="report-reason">Rejection Reason</Label>
                  <Textarea 
                    id="report-reason" 
                    value={reportForm.data.rejection_reason}
                    onChange={(e) => reportForm.setData('rejection_reason', e.target.value)}
                    placeholder="Explain why this service report was rejected"
                  />
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
                <Button onClick={submitReportReview} disabled={!reportForm.data.status || 
                  (reportForm.data.status.startsWith('rejected') && !reportForm.data.rejection_reason)}>
                  Submit Review
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {dialogType === 'status' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="application-status">Status</Label>
                <Select 
                  value={statusForm.data.status} 
                  onValueChange={(value) => statusForm.setData('status', value)}
                >
                  <SelectTrigger id="application-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="documents_pending">Documents Pending</SelectItem>
                    <SelectItem value="documents_under_review">Documents Under Review</SelectItem>
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
              
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea 
                  id="admin-notes" 
                  value={statusForm.data.admin_notes}
                  onChange={(e) => statusForm.setData('admin_notes', e.target.value)}
                  placeholder="Add notes about this application status change"
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
                <Button onClick={updateApplicationStatus} disabled={!statusForm.data.status}>
                  Update Status
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {(dialogType === 'create_disbursement' || dialogType === 'edit_disbursement') && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="disbursement-amount">Amount ($)</Label>
                <input
                  id="disbursement-amount"
                  type="number"
                  value={disbursementForm.data.amount}
                  onChange={(e) => disbursementForm.setData('amount', parseFloat(e.target.value))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  min="1"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label htmlFor="disbursement-method">Payment Method</Label>
                <Select
                  value={disbursementForm.data.payment_method}
                  onValueChange={(value) => disbursementForm.setData('payment_method', value)}
                >
                  <SelectTrigger id="disbursement-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_to_account">Credit to Student Account</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="disbursement-reference">Reference Number</Label>
                <input
                  id="disbursement-reference"
                  type="text"
                  value={disbursementForm.data.reference_number}
                  onChange={(e) => disbursementForm.setData('reference_number', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Optional reference number"
                />
              </div>
              
              <div>
                <Label htmlFor="disbursement-date">Disbursement Date</Label>
                <input
                  id="disbursement-date"
                  type="date"
                  value={disbursementForm.data.disbursement_date}
                  onChange={(e) => disbursementForm.setData('disbursement_date', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="disbursement-status">Status</Label>
                <Select
                  value={disbursementForm.data.status}
                  onValueChange={(value) => disbursementForm.setData('status', value)}
                >
                  <SelectTrigger id="disbursement-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="disbursement-notes">Notes</Label>
                <Textarea
                  id="disbursement-notes"
                  value={disbursementForm.data.notes}
                  onChange={(e) => disbursementForm.setData('notes', e.target.value)}
                  placeholder="Add notes about this disbursement"
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
                <Button
                  onClick={() => {
                    if (dialogType === 'create_disbursement') {
                      // Create new disbursement
                      disbursementForm.post(route('admin.disbursements.store', application.id), {
                        onSuccess: () => setOpenReviewDialog(false),
                      });
                    } else {
                      // Update existing disbursement
                      disbursementForm.patch(route('admin.disbursements.update', disbursementForm.data.id), {
                        onSuccess: () => setOpenReviewDialog(false),
                      });
                    }
                  }}
                  disabled={!disbursementForm.data.amount || !disbursementForm.data.payment_method || !disbursementForm.data.disbursement_date || !disbursementForm.data.status}
                >
                  {dialogType === 'create_disbursement' ? 'Create Disbursement' : 'Update Disbursement'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}