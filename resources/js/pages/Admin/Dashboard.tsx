import AppLayout from '@/layouts/app-layout';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from '@/components/ui/breadcrumb';
import { Head, router } from '@inertiajs/react';
import * as React from 'react';
import { ScholarshipApplication, type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import DashboardHeader from './Dashboard/components/DashboardHeader';
import ActionItems from './Dashboard/components/ActionItems';
import RecentApplications from './Dashboard/components/RecentApplications';
import ApplicationPipeline from './Dashboard/components/ApplicationPipeline';
import StudentDemographics from './Dashboard/components/StudentDemographics';
import ApplicationTrends from './Dashboard/components/ApplicationTrends';
import FinancialSnapshot from './Dashboard/components/FinancialSnapshot';
import PopularPrograms from './Dashboard/components/PopularPrograms';

interface DashboardProps {
    stats: {
        totalStudents: number;
        studentsWithProfiles: number;
        activeScholarships: number;
        pendingApplications: number;
        applicationStats: Record<string, number>;
        scholarshipsNearingDeadline: number;
        studentDemographicsBySchoolName: Record<string, number>;
        totalBudget: number;
        totalDisbursedAmount: number;
        totalPendingDisbursementAmount: number;
        pendingCommunityServiceReports: number;
        popularPrograms: Array<{ id: number; name: string; scholarship_applications_count: number }>;
        applicationTrends: Array<{ date: string; 'New Applications': number }>;
    };
    recentApplications: ScholarshipApplication[];
    scholarshipPrograms: Array<{ id: number; name: string }>;
    filters: {
        scholarship_id: number | null;
        search: string | null;
    };
}

const breadcrumbs: BreadcrumbItemType[] = [{ title: 'Admin Dashboard', href: route('admin.dashboard') }];

export default function Dashboard({ stats, recentApplications, scholarshipPrograms, filters }: DashboardProps) {
    const [chartColors, setChartColors] = React.useState({
        border: '',
        mutedForeground: '',
        background: '',
        primary: '',
        muted: '',
        radius: '',
    });

    React.useEffect(() => {
        const getChartColors = () => {
            const rootStyle = window.getComputedStyle(document.documentElement);
            setChartColors({
                border: rootStyle.getPropertyValue('--border').trim(),
                mutedForeground: rootStyle.getPropertyValue('--muted-foreground').trim(),
                background: rootStyle.getPropertyValue('--background').trim(),
                primary: rootStyle.getPropertyValue('--primary').trim(),
                muted: rootStyle.getPropertyValue('--muted').trim(),
                radius: rootStyle.getPropertyValue('--radius').trim(),
            });
        };

        getChartColors();

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    mutation.target === document.documentElement
                ) {
                    getChartColors();
                    break;
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true });

        return () => observer.disconnect();
    }, []);

    // This search logic is not used in any of the new components, but I will leave it here for now.
    // If you need search functionality for the recent applications, we can add it.
    const [search, setSearch] = React.useState(filters.search || '');

    React.useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timeout = setTimeout(() => {
            const url = route('admin.dashboard');
            const data: Record<string, string | number | undefined> = {
                search: search || undefined,
            };

            if (filters.scholarship_id) {
                data.scholarship_id = filters.scholarship_id;
            }

            router.get(url, data, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, filters]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col space-y-6 p-4 md:p-6">
                <DashboardHeader scholarshipPrograms={scholarshipPrograms} filters={filters} />
                <ActionItems stats={stats} />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <ApplicationTrends stats={stats} />
                        <RecentApplications recentApplications={recentApplications} />
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <ApplicationPipeline stats={stats} />
                        <FinancialSnapshot stats={stats} />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <StudentDemographics stats={stats} />
                    <PopularPrograms stats={stats} />
                </div>
            </div>
        </AppLayout>
    );
}