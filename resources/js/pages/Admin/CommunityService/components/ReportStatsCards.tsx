import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, XCircle, Activity } from 'lucide-react';
import React from 'react';

interface ReportStatsCardsProps {
  totalHours: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
}

export default function ReportStatsCards({ totalHours, approvedCount, pendingCount, rejectedCount }: ReportStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalHours}</p>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Hours</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">{approvedCount}</p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">Approved</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-orange-200/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-xl">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{pendingCount}</p>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200/50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-xl">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-red-700 dark:text-red-300">{rejectedCount}</p>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 