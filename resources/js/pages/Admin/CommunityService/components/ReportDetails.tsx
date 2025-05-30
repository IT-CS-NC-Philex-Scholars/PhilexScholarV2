import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, BookOpen, AlertTriangle } from 'lucide-react';
import React from 'react';

interface ReportDetailsProps {
  submittedAt: string;
  reviewedAt?: string;
  reportType: string;
  daysCompleted: number;
  description: string;
  rejectionReason?: string;
  formatDate: (date: string) => string;
  formatStatus: (status: string) => string;
}

export default function ReportDetails({
  submittedAt,
  reviewedAt,
  reportType,
  daysCompleted,
  description,
  rejectionReason,
  formatDate,
  formatStatus,
}: ReportDetailsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Report Information
          </CardTitle>
          <CardDescription>Submission details and timeline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Submitted</h4>
              <p className="font-medium">{formatDate(submittedAt)}</p>
            </div>
            {reviewedAt && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Reviewed</h4>
                <p className="font-medium">{formatDate(reviewedAt)}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
              <Badge variant="outline" className="mt-1">{formatStatus(reportType)}</Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Days</h4>
              <p className="text-lg font-bold">{daysCompleted}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            Service Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{description}</p>
          </div>
        </CardContent>
      </Card>
      {rejectionReason && (
        <Card className="border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Rejection Reason
            </CardTitle>
            <CardDescription>Feedback provided for report rejection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white/70 dark:bg-gray-800/70 border border-red-200/50 rounded-xl p-4">
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{rejectionReason}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 