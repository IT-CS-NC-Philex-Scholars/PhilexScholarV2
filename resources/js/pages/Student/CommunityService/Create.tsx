import React, { useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CommunityServiceReport, ScholarshipApplication, ScholarshipProgram } from '@/types';
import Dashboard from './Dashboard';

interface CommunityServiceCreateProps {
  application: ScholarshipApplication;
  scholarship: ScholarshipProgram;
  serviceReports: CommunityServiceReport[];
  serviceEntries: any[];
  totalDaysCompleted: number;
  totalHoursCompleted: number;
  requiredDays: number;
  requiredHours: number;
  remainingDays: number;
  remainingHours: number;
}

export default function Create(props: CommunityServiceCreateProps) {
  // Simply render the new Dashboard component
  return <Dashboard {...props} />;
}