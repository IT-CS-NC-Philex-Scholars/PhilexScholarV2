import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Download } from 'lucide-react';
import { Link } from '@inertiajs/react';
import React from 'react';

interface ReportHeaderProps {
  reportId: number;
  reportStatus: string;
  studentName: string;
  programName: string;
  pdfReportPath?: string;
  onApprove: () => void;
  onReject: () => void;
  canReview: boolean;
}

const getStatusBadgeVariant = (status: string) => {
  if (status === 'approved') return 'default';
  if (status.startsWith('rejected_')) return 'destructive';
  if (status === 'pending_review') return 'secondary';
  return 'outline';
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

export default function ReportHeader({
  reportId,
  reportStatus,
  studentName,
  programName,
  pdfReportPath,
  onApprove,
  onReject,
  canReview,
}: ReportHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl" />
      <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 rounded-3xl p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                <Link href={route('admin.community-service.index')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Reports
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <Badge variant={getStatusBadgeVariant(reportStatus)} className="text-sm px-3 py-1">
                {formatStatus(reportStatus)}
              </Badge>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Community Service Report #{reportId}
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                {studentName} • {programName}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {canReview && (
              <>
                <Button onClick={onApprove} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Report
                </Button>
                <Button variant="destructive" onClick={onReject} className="shadow-lg">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Report
                </Button>
              </>
            )}
            {pdfReportPath && (
              <Button asChild variant="outline" className="shadow-lg">
                <a href={pdfReportPath} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 