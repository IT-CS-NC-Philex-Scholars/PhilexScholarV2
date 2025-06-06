import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    CalendarClock,
    ChevronRight,
    DollarSign,
    FileCheck2,
    HelpCircle,
    ListChecks,
    PlusCircle,
    TrendingUp,
    Users,
    UsersRound,
} from 'lucide-react';
import React from 'react';

import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardProps {
    stats: {
        totalStudents: number;
        studentsWithProfiles: number;
        activeScholarships: number;
        pendingApplications: number;
        applicationStats: Record<string, number>;
        scholarshipsNearingDeadline: number;
        studentDemographicsBySchoolType: Record<string, number>;
        totalBudget: number;
        totalDisbursedAmount: number;
        totalPendingDisbursementAmount: number;
        pendingCommunityServiceReports: number;
        popularPrograms: Array<{ id: number; name: string; scholarship_applications_count: number }>;
    };
    recentApplications: ScholarshipApplication[];
    scholarshipPrograms: Array<{ id: number; name: string }>;
    filters: {
        scholarship_id: number | null;
        search: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin Dashboard' }];

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

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    };

    const [search, setSearch] = React.useState(filters.search || '');

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

    const totalApplications = Object.values(stats.applicationStats).reduce((sum, count) => sum + count, 0);

    const approvedCount = (stats.applicationStats['approved'] || 0) + (stats.applicationStats['enrolled'] || 0);
    const enrolledCount = stats.applicationStats['enrolled'] || 0;

    const pipelineData = [
        { name: 'Total Applications', value: totalApplications },
        { name: 'Approved', value: approvedCount, rate: totalApplications > 0 ? Math.round((approvedCount / totalApplications) * 100) : 0 },
        { name: 'Enrolled', value: enrolledCount, rate: approvedCount > 0 ? Math.round((enrolledCount / approvedCount) * 100) : 0 },
    ];
    
    const studentDemographicsChartData = Object.entries(stats.studentDemographicsBySchoolType)
        .map(([type, count]) => ({
            name: type === '' || type === null ? 'Unknown' : formatStatus(type),
            count: count,
        }))
        .filter((item) => item.count > 0);
    
    // Mock data for Application Trends - to be replaced with real data from backend
    const applicationTrendsData = [
        { date: 'Week 1', 'New Applications': 12 },
        { date: 'Week 2', 'New Applications': 19 },
        { date: 'Week 3', 'New Applications': 8 },
        { date: 'Week 4', 'New Applications': 22 },
        { date: 'Week 5', 'New Applications': 15 },
        { date: 'Week 6', 'New Applications': 32 },
        { date: 'Week 7', 'New Applications': 25 },
    ];
    
    const actionItems = [
        {
            title: 'Pending Applications',
            value: stats.pendingApplications,
            description: 'Ready for review',
            href: route('admin.applications.index', { status: 'pending' }),
            icon: FileCheck2,
            color: 'text-blue-600',
        },
        {
            title: 'Pending Service Reports',
            value: stats.pendingCommunityServiceReports,
            description: 'Awaiting approval',
            href: '#', // TODO: Add correct route when available
            icon: UsersRound,
            color: 'text-green-600',
        },
        {
            title: 'Scholarships Nearing Deadline',
            value: stats.scholarshipsNearingDeadline,
            description: 'Closing in the next 7 days',
            href: route('admin.scholarships.index'), // This could be filtered
            icon: CalendarClock,
            color: 'text-yellow-600',
        },
        {
            title: 'Pending Disbursements',
            value: formatCurrency(stats.totalPendingDisbursementAmount),
            description: 'Awaiting payment processing',
            href: '#', // TODO: Add correct route when available
            icon: DollarSign,
            color: 'text-purple-600',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col space-y-6 p-4 md:p-6">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                        <p className="text-muted-foreground">An overview of scholarship programs, applications, and student engagement.</p>
                    </div>
                    <div>
                        <Select onValueChange={handleScholarshipFilterChange} value={filters.scholarship_id?.toString() || 'all'}>
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
                
                {/* Priority Actions Hub */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {actionItems.map((item) => (
                        <Link key={item.title} href={item.href}>
                            <Card className="hover:bg-muted/50 transition-colors h-full">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                                    <item.icon className={`h-5 w-5 ${item.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{item.value}</div>
                                    <p className="text-xs text-muted-foreground">{item.description}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>


                {/* Main Reporting Section */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Application Pipeline Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Pipeline</CardTitle>
                                <CardDescription>A summary of the application funnel from submission to enrollment.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {totalApplications > 0 ? (
                                    <div className="flex items-start justify-between text-center">
                                        {pipelineData.map((stage, index) => (
                                            <React.Fragment key={stage.name}>
                                                <div className="flex-1">
                                                    <p className="text-3xl font-bold">{stage.value}</p>
                                                    <p className="text-sm font-medium text-muted-foreground">{stage.name}</p>
                                                    {index > 0 && (
                                                        <Badge variant="outline" className="mt-2 font-normal">
                                                            {stage.rate}% of {pipelineData[index - 1].name.split(' ')[0]}s
                                                        </Badge>
                                                    )}
                                                </div>
                                                {index < pipelineData.length - 1 && (
                                                    <div className="px-2 pt-2">
                                                        <ChevronRight className="h-8 w-8 text-muted-foreground/50" />
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-muted-foreground py-4 text-center text-sm">No application data to build pipeline.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Application Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Application Volume</CardTitle>
                                <CardDescription>New applications over the last 7 weeks.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={applicationTrendsData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} stroke={chartColors.mutedForeground} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} stroke={chartColors.mutedForeground} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: chartColors.background,
                                                borderColor: chartColors.border,
                                                borderRadius: chartColors.radius,
                                            }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '14px' }}/>
                                        <Line type="monotone" dataKey="New Applications" stroke={chartColors.primary} strokeWidth={2} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Applications Table */}
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
                                <div className='w-full'>
                                    <CardTitle>Recent Applications</CardTitle>
                                    <CardDescription>Latest scholarship applications submitted</CardDescription>
                                </div>
                                <div className="flex w-full sm:w-auto items-center gap-2">
                                    <Input
                                        placeholder="Search student or scholarship..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full sm:w-[250px]"
                                    />
                                    <Button asChild variant="outline" size="sm" className='hidden sm:inline-flex'>
                                        <Link href={route('admin.applications.index')}>View All</Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {recentApplications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <HelpCircle className="text-muted-foreground mb-4 h-12 w-12" />
                                        <p className="text-muted-foreground text-lg font-medium">No recent applications found.</p>
                                        {filters.search && <p className="text-sm text-muted-foreground mt-2">Try adjusting your search.</p>}
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Scholarship</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentApplications.map((app) => (
                                                <TableRow key={app.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{app.studentProfile?.user?.name || 'N/A'}</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            {app.studentProfile?.user?.email || 'N/A'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{app.scholarshipProgram?.name || 'N/A'}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="outline" className="capitalize">
                                                            {formatStatus(app.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button asChild size="sm" variant="outline">
                                                            <Link href={route('admin.applications.show', app.id)}>Review</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                            <CardFooter className="border-t bg-muted/20 py-3">
                                <div className="text-muted-foreground text-sm">
                                    Displaying the {recentApplications.length} most recent applications
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Financial Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="text-primary h-5 w-5" />
                                    Financial Overview
                                </CardTitle>
                                <CardDescription>
                                    {filters.scholarship_id ? 'Budget for the selected scholarship' : 'Budget for all scholarships'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm text-muted-foreground">Total Budget</div>
                                    <div className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>Disbursed</span>
                                        <span>{formatCurrency(stats.totalDisbursedAmount)}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2.5">
                                        <div 
                                            className="bg-primary h-2.5 rounded-full" 
                                            style={{ width: `${stats.totalBudget > 0 ? (stats.totalDisbursedAmount / stats.totalBudget) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Remaining Budget:</span>
                                        <span className="font-bold text-green-600">
                                            {formatCurrency(stats.totalBudget - stats.totalDisbursedAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>Pending Disbursement:</span>
                                        <span>
                                            {formatCurrency(stats.totalPendingDisbursementAmount)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        {/* Popular Programs Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="text-primary h-5 w-5" />
                                    Top Scholarship Programs
                                </CardTitle>
                                <CardDescription>Programs with the most applications</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats.popularPrograms && stats.popularPrograms.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart
                                            data={stats.popularPrograms}
                                            layout="vertical"
                                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                                            <XAxis dataKey="scholarship_applications_count" type="number" fontSize={10} tickLine={false} axisLine={false} stroke={chartColors.mutedForeground} />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                width={120} 
                                                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                                                tick={{ fontSize: 10, fill: chartColors.mutedForeground }} 
                                                tickLine={false} 
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: chartColors.muted }}
                                                contentStyle={{ backgroundColor: chartColors.background, borderColor: chartColors.border, borderRadius: chartColors.radius }}
                                            />
                                            <Bar dataKey="scholarship_applications_count" name="Applications" fill={chartColors.primary} radius={[0, 4, 4, 0]} barSize={12} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-muted-foreground py-4 text-center text-sm">No program data available.</p>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Student Demographics Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="text-primary h-5 w-5" />
                                    Student Demographics
                                </CardTitle>
                                <CardDescription>Distribution by school type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {studentDemographicsChartData.length > 0 ? (
                                    <div>
                                        <ResponsiveContainer width="100%" height={150}>
                                            <BarChart
                                                data={studentDemographicsChartData}
                                                layout="vertical"
                                                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.border} />
                                                <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} stroke={chartColors.mutedForeground} />
                                                <YAxis dataKey="name" type="category" fontSize={10} tickLine={false} axisLine={false} stroke={chartColors.mutedForeground} width={80} />
                                                <Tooltip cursor={{ fill: chartColors.muted }} contentStyle={{ backgroundColor: chartColors.background, borderColor: chartColors.border, borderRadius: chartColors.radius }} />
                                                <Bar dataKey="count" fill={chartColors.primary} radius={[0, 4, 4, 0]} barSize={12} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground py-4 text-center text-sm">No demographic data available.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <Button asChild variant="default" className="w-full justify-start gap-2">
                                    <Link href={route('admin.scholarships.create')}>
                                        <PlusCircle className="h-4 w-4" /> Create New Scholarship
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start gap-2">
                                    <Link href={route('admin.scholarships.index')}>
                                        <ListChecks className="h-4 w-4" /> Manage Scholarships
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="w-full justify-start gap-2" disabled>
                                    <Link href="#">
                                        <BarChart3 className="h-4 w-4" /> View Reports (Soon)
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
