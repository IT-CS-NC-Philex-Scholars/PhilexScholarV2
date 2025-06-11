import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  User,
  Award,
  Calendar,
  Clock,
  Timer,
  Camera,
  Download,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Plus
} from 'lucide-react';

interface CommunityServiceEntryShowProps {
  entry: any;
  application: any;
}

export default function EntryShow({ entry, application }: CommunityServiceEntryShowProps) {
  const [reviewStatus, setReviewStatus] = useState(entry.status);
  const [adminNotes, setAdminNotes] = useState(entry.admin_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateEntryModalOpen, setIsCreateEntryModalOpen] = useState(false);

  // Admin entry creation form
  const [adminEntryForm, setAdminEntryForm] = useState({
    service_date: '',
    time_in: '',
    time_out: '',
    task_description: '',
    lessons_learned: '',
    hours_completed: '',
    admin_notes: '',
  });

  const handleStatusUpdate = () => {
    setIsSubmitting(true);
    
    const data: any = {
      status: reviewStatus,
      admin_notes: adminNotes,
    };

    router.patch(route('admin.community-service.entries.status', entry.id), data, {
      onFinish: () => setIsSubmitting(false),
    });
  };

  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    router.post(route('admin.community-service.create-entry', application.id), adminEntryForm, {
      onSuccess: () => {
        setIsCreateEntryModalOpen(false);
        setAdminEntryForm({
          service_date: '',
          time_in: '',
          time_out: '',
          task_description: '',
          lessons_learned: '',
          hours_completed: '',
          admin_notes: '',
        });
      },
      onFinish: () => setIsSubmitting(false),
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    if (status === 'approved') return 'default';
    if (status === 'rejected') return 'destructive';
    if (status === 'in_progress') return 'secondary';
    if (status === 'completed') return 'outline';
    return 'outline';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const calculateDuration = () => {
    if (!entry.time_out) return 'In Progress';
    
    const timeIn = new Date(`2000-01-01 ${entry.time_in}`);
    const timeOut = new Date(`2000-01-01 ${entry.time_out}`);
    const diffMs = timeOut.getTime() - timeIn.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHours}h ${diffMinutes}m`;
  };

  return (
    <AppLayout>
      <Head title={`Time Entry - ${application.student_profile.user.name}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Entries
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Time Tracking Entry</h1>
              <p className="text-muted-foreground">
                Review detailed time tracking session
              </p>
            </div>
          </div>
          <Dialog open={isCreateEntryModalOpen} onOpenChange={setIsCreateEntryModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Community Service Entry</DialogTitle>
                <DialogDescription>
                  Create a new community service entry on behalf of the student.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEntry} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_date">Service Date</Label>
                    <Input
                      id="service_date"
                      type="date"
                      value={adminEntryForm.service_date}
                      onChange={(e) => setAdminEntryForm(prev => ({ ...prev, service_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours_completed">Hours Completed</Label>
                    <Input
                      id="hours_completed"
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="24"
                      value={adminEntryForm.hours_completed}
                      onChange={(e) => setAdminEntryForm(prev => ({ ...prev, hours_completed: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="time_in">Time In</Label>
                    <Input
                      id="time_in"
                      type="time"
                      value={adminEntryForm.time_in}
                      onChange={(e) => setAdminEntryForm(prev => ({ ...prev, time_in: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="time_out">Time Out</Label>
                    <Input
                      id="time_out"
                      type="time"
                      value={adminEntryForm.time_out}
                      onChange={(e) => setAdminEntryForm(prev => ({ ...prev, time_out: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="task_description">Task Description</Label>
                  <Textarea
                    id="task_description"
                    value={adminEntryForm.task_description}
                    onChange={(e) => setAdminEntryForm(prev => ({ ...prev, task_description: e.target.value }))}
                    placeholder="Describe the community service tasks performed..."
                    required
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="lessons_learned">Lessons Learned (Optional)</Label>
                  <Textarea
                    id="lessons_learned"
                    value={adminEntryForm.lessons_learned}
                    onChange={(e) => setAdminEntryForm(prev => ({ ...prev, lessons_learned: e.target.value }))}
                    placeholder="What did the student learn from this experience?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="admin_notes_create">Admin Notes</Label>
                  <Textarea
                    id="admin_notes_create"
                    value={adminEntryForm.admin_notes}
                    onChange={(e) => setAdminEntryForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                    placeholder="Notes about this entry creation..."
                    rows={2}
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Entry'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-lg">{application.student_profile.user.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-lg">{application.student_profile.user.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">School</Label>
                    <p className="text-lg">{application.student_profile.school_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Scholarship</Label>
                    <p className="text-lg">{application.scholarship_program.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Entry Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5" />
                  Service Entry Details
                </CardTitle>
                <CardDescription>
                  {new Date(entry.service_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Time Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Time In</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">{entry.time_in}</div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Time Out</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">
                      {entry.time_out || 'In Progress'}
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Timer className="h-4 w-4" />
                      <span className="text-sm font-medium">Duration</span>
                    </div>
                    <div className="text-2xl font-bold mt-1">{calculateDuration()}</div>
                  </Card>
                </div>

                {/* Hours Completed */}
                {entry.hours_completed > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Hours Completed
                    </h3>
                    <p className="text-3xl font-bold text-green-600">
                      {entry.hours_completed} hours
                    </p>
                  </div>
                )}

                <Separator />

                {/* Task Description */}
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Task Description
                  </h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="whitespace-pre-wrap">{entry.task_description}</p>
                  </div>
                </div>

                {/* Lessons Learned */}
                {entry.lessons_learned && (
                  <div>
                    <h3 className="font-semibold mb-2">Lessons Learned</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap text-blue-800 dark:text-blue-200">
                        {entry.lessons_learned}
                      </p>
                    </div>
                  </div>
                )}

                {/* Photos */}
                {entry.photos && entry.photos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Photos ({entry.photos.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entry.photos.map((photo: string, index: number) => (
                        <Card key={index} className="p-2">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <Camera className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <div className="mt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => window.open(route('admin.community-service.entries.download-photo', [
                                entry.id, 
                                photo
                              ]))}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Entry Metadata */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Entry Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="ml-2">
                        {new Date(entry.updated_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Review Actions */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <Badge 
                    variant={getStatusBadgeVariant(entry.status)} 
                    className="text-lg py-2 px-4"
                  >
                    {formatStatus(entry.status)}
                  </Badge>
                </div>
                
                {entry.admin_notes && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Admin Notes</span>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {entry.admin_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Review Actions</CardTitle>
                <CardDescription>
                  Update the status of this time entry
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                  <Textarea
                    id="admin_notes"
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this entry review..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleStatusUpdate}
                  disabled={isSubmitting || (reviewStatus === entry.status && adminNotes === (entry.admin_notes || ''))}
                  className="w-full"
                >
                  {isSubmitting ? 'Updating...' : 'Update Entry'}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setReviewStatus('approved');
                    setAdminNotes('Entry approved - service hours verified.');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quick Approve
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setReviewStatus('rejected');
                    setAdminNotes('Please provide more detailed documentation or verification of service activities.');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Quick Reject
                </Button>
              </CardContent>
            </Card>

            {/* Entry Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Entry Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Service Date:</span>
                    <span className="font-medium">{new Date(entry.service_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Period:</span>
                    <span className="font-medium">{entry.time_in} - {entry.time_out || 'Ongoing'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Hours Logged:</span>
                    <span className="font-medium">{entry.hours_completed || 0}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Photos Attached:</span>
                    <span className="font-medium">{entry.photos ? entry.photos.length : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Lessons Recorded:</span>
                    <span className="font-medium">{entry.lessons_learned ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}