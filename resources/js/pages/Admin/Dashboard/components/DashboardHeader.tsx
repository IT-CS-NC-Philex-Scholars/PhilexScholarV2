import { BreadcrumbItem } from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScholarshipProgram } from '@/types';
import { router } from '@inertiajs/react';

interface DashboardHeaderProps {
    scholarshipPrograms: Array<{ id: number; name: string }>;
    filters: {
        scholarship_id: number | null;
        search: string | null;
    };
}

export default function DashboardHeader({ scholarshipPrograms, filters }: DashboardHeaderProps) {
    const handleScholarshipFilterChange = (scholarshipId: string) => {
        const url = route('admin.dashboard');
        const data: Record<string, string | undefined> = {
            search: filters.search || undefined,
        };

        if (scholarshipId !== 'all') {
            data.scholarship_id = scholarshipId;
        }

        router.get(url, data, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    An overview of scholarship programs, applications, and student engagement.
                </p>
            </div>
            <div>
                <Select
                    onValueChange={handleScholarshipFilterChange}
                    value={filters.scholarship_id?.toString() || 'all'}
                >
                    <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Filter by Scholarship..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Scholarships</SelectItem>
                        {scholarshipPrograms.map((program) => (
                            <SelectItem key={program.id} value={program.id.toString()}>
                                {program.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
} 