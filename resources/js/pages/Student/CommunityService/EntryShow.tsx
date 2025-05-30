import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout'; // Student-facing layout
import { BreadcrumbItem, CommunityServiceEntry as CommunityServiceEntryType, ScholarshipApplication, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format, parseISO } from 'date-fns';
import {
  CalendarDays,
  Clock,
  Camera,
  FileText,
  Download,
  ArrowLeft,
  Lightbulb,
  AlertCircle,
  Hourglass,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';

interface CommunityServiceEntryShowProps {
  application: ScholarshipApplication;
  scholarship: ScholarshipProgram;
  entry: CommunityServiceEntryType;
}

// Helper to format date strings
const formatDate = (dateString?: string | null, dateFormat = 'PPP') => { // PPP for long date format e.g. "July 2nd, 2024"
  if (!dateString) return 'N/A';
  try {
    return format(parseISO(dateString), dateFormat);
  } catch (error) {
    return 'Invalid Date';
  }
};

// Helper to format time strings
const formatTime = (timeString?: string | null, timeFormat = 'p') => { // p for localized time format e.g. "1:30 PM"
  if (!timeString) return 'N/A';
  try {
    // Assuming time is in "HH:mm:ss" or "HH:mm"
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, timeFormat);
  } catch (error) {
    return 'Invalid Time';
  }
};

export default function EntryShow({
  application,
  // scholarship, // scholarship prop not directly used in this refined version, but good to have for context
  entry,
}: CommunityServiceEntryShowProps) {
  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' => {
    if (status === 'approved') return 'default'; // Typically green
    if (status === 'completed' ) return 'default'; // Can also be green or blueish
    if (status === 'rejected') return 'destructive';
    if (status === 'in_progress') return 'warning'; // Typically yellow/orange
    return 'secondary'; // Default for other statuses
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const calculateDuration = () => {
    if (!entry.time_out || entry.status === 'in_progress') return 'In Progress';
    try {
      const timeIn = parseISO(`2000-01-01T${entry.time_in}`);
      const timeOut = parseISO(`2000-01-01T${entry.time_out}`);
      const diffMs = timeOut.getTime() - timeIn.getTime();

      if (diffMs < 0) return 'Invalid times';

      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0 && minutes === 0) return entry.hours_completed > 0 ? `${entry.hours_completed.toFixed(2)}h (from total)` : '0m';
      
      let durationString = '';
      if (hours > 0) durationString += `${hours}h `;
      if (minutes > 0 || hours === 0) durationString += `${minutes}m`;
      
      return durationString.trim();
    } catch (e) {
      // If parsing fails, fallback to hours_completed
      return entry.hours_completed > 0 ? `${entry.hours_completed.toFixed(2)}h` : 'Error';
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Applications', href: route('student.applications.index') },
    { title: 'Application Details', href: route('student.applications.show', application.id) },
    { title: 'Community Service', href: route('student.community-service.create', application.id) },
    { title: `Entry - ${formatDate(entry.service_date, 'MMM d')}` }
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'approved') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'rejected') return <XCircle className="h-5 w-5 text-red-500" />;
    if (status === 'in_progress') return <Hourglass className="h-5 w-5 text-yellow-500" />;
    if (status === 'completed') return <CheckCircle2 className="h-5 w-5 text-blue-500" />; // "completed" but pending approval
    return <Info className="h-5 w-5 text-gray-500" />;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Service Entry - ${formatDate(entry.service_date, 'MMM d, yyyy')}`} />

      <div className="container mx-auto max-w-3xl py-8 px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden shadow-lg">
          <CardHeader className="bg-muted/30 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                  {getStatusIcon(entry.status)}
                  Service Entry Details
                </CardTitle>
                <CardDescription className="mt-1">
                  On {formatDate(entry.service_date, 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </div>
              <Badge variant={getStatusBadgeVariant(entry.status)} className="px-3 py-1 text-sm self-start sm:self-center">
                {formatStatus(entry.status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Time & Duration Section */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                <Clock className="h-5 w-5" />
                Time & Duration
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-4 bg-card">
                  <CardDescription className="text-sm mb-1">Time In</CardDescription>
                  <CardTitle className="text-xl">{formatTime(entry.time_in)}</CardTitle>
                </Card>
                <Card className="p-4 bg-card">
                  <CardDescription className="text-sm mb-1">Time Out</CardDescription>
                  <CardTitle className="text-xl">{entry.time_out ? formatTime(entry.time_out) : 'In Progress'}</CardTitle>
                </Card>
                <Card className="p-4 bg-card">
                  <CardDescription className="text-sm mb-1">Calculated Duration</CardDescription>
                  <CardTitle className="text-xl">{calculateDuration()}</CardTitle>
                </Card>
              </div>
            </section>
            
            <Separator />

            {/* Hours Completed Display - more prominent */}
            {entry.hours_completed > 0 && (
                 <section>
                    <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-primary">
                        <Hourglass className="h-5 w-5" />
                        Hours Logged
                    </h2>
                    <div className={`p-4 rounded-lg border ${
                        entry.status === 'approved' ? 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700' :
                        entry.status === 'rejected' ? 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700' :
                        'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
                    }`}>
                        <p className={`text-3xl font-bold ${
                            entry.status === 'approved' ? 'text-green-600 dark:text-green-300' :
                            entry.status === 'rejected' ? 'text-red-600 dark:text-red-300' :
                            'text-blue-600 dark:text-blue-300'
                        }`}>
                        {entry.hours_completed.toFixed(2)} hours
                        </p>
                        <p className={`text-sm mt-1 ${
                             entry.status === 'approved' ? 'text-green-700 dark:text-green-400' :
                             entry.status === 'rejected' ? 'text-red-700 dark:text-red-400' :
                             'text-blue-700 dark:text-blue-400'
                        }`}>
                            This is the official number of hours recorded for this entry.
                        </p>
                    </div>
                 </section>
            )}
            
            {entry.hours_completed > 0 && <Separator />}


            {/* Task Description Section */}
            <section>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                Task Description
              </h2>
              <div className="bg-muted/50 p-4 rounded-lg border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.task_description}</p>
              </div>
            </section>

            {/* Lessons Learned Section */}
            {entry.lessons_learned && (
              <>
                <Separator />
                <section>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                    <Lightbulb className="h-5 w-5" />
                    Lessons Learned
                  </h2>
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{entry.lessons_learned}</p>
                  </div>
                </section>
              </>
            )}

            {/* Photos Section */}
            {entry.photos && entry.photos.length > 0 && (
              <>
                <Separator />
                <section>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-primary">
                    <Camera className="h-5 w-5" />
                    Photos ({entry.photos.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {entry.photos.map((photoName, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={route('student.community-service.download-photo', [application.id, entry.id, photoName])}
                          alt={`Service photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border bg-muted"
                          onError={(e) => (e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNCA0QzIuODk1NDMgNCAyIDQuODk1NDMgMiA2VjE4QzIgMTkuMTA0NiAyLjg5NTQzIDIwIDQgMjBIMjBDMjEuMTA0NiAyMCAyMiAxOS4xMDQ2IDIyIDE4VjZDMTggMTQuMTE0MSAxMy44NjExIDE0IDExIDExQzguMTM4OTQgMTQgNCA5Ljg4NTkgNCA0WiIgZmlsbD0iI2UxZTRlYiIvPjxwYXRoIGQ9Ik0xOS41IDhDOS41IDggNy41IDEyIDExLjUgMTJDMTMuNSAxMy41IDE5LjUgMTAuNSAxOS41IDhaIiBmaWxsPSIjYmZjM2MyIi8+PC9zdmc+")} // Basic placeholder
                        />
                        <a
                          href={route('student.community-service.download-photo', [application.id, entry.id, photoName])}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <Download className="h-6 w-6 text-white" />
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Admin Notes Section */}
            {entry.admin_notes && (
              <>
                <Separator />
                <section>
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    Admin Feedback
                  </h2>
                  <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-destructive/90">{entry.admin_notes}</p>
                  </div>
                </section>
              </>
            )}
          </CardContent>

          <Separator />

          <CardFooter className="p-6 bg-muted/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground space-y-1 text-center sm:text-left">
                <p>Entry ID: {entry.id}</p>
                <p>Created: {formatDate(entry.created_at, 'PPpp')}</p>
                <p>Last Updated: {formatDate(entry.updated_at, 'PPpp')}</p>
            </div>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}