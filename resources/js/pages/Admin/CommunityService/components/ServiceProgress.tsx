import { Progress } from '@/components/ui/progress';
import React from 'react';

interface ServiceProgressProps {
  completedHours: number;
  totalRequiredHours: number;
  progressPercentage: number;
}

export default function ServiceProgress({ completedHours, totalRequiredHours, progressPercentage }: ServiceProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Service Progress</span>
        <span className="text-muted-foreground">{completedHours}/{totalRequiredHours} hours</span>
      </div>
      <Progress value={progressPercentage} className="h-3" />
      <p className="text-xs text-muted-foreground">
        {progressPercentage >= 100 ? '✅ Requirement completed!' : `${(totalRequiredHours - completedHours).toFixed(1)} hours remaining`}
      </p>
    </div>
  );
} 