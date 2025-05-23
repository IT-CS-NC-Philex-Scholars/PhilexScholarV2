import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    BookOpenCheck,
    CalendarClock,
    DollarSign,
    FileCheck2,
    HelpCircle,
    ListChecks,
    PieChart as PieChartIcon,
    PlusCircle,
    TrendingUp,
    Users,
    UsersRound,
} from 'lucide-react';

// Example imports for Recharts - you'll need to npm install recharts
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DashboardProps {
    stats: {
        totalStudents: number;
        studentsWithProfiles: number;
        activeScholarships: number;
        pendingApplications: number;
        applicationStats: Record<string, number>;
        scholarshipsNearingDeadline: number;
        studentDemographicsBySchoolType: Record<string, number>;
        totalDisbursedAmount: number;
        totalPendingDisbursementAmount: number;
        pendingCommunityServiceReports: number;
        popularPrograms: Array<{ id: number; name: string; scholarship_applications_count: number }>;
    };
    recentApplications: ScholarshipApplication[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin Dashboard' }];

// Define colors for charts (customize as needed)
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#FA8072', '#FFDA77'];

export default function Dashboard({ stats, recentApplications }: DashboardProps) {
    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }); // Adjust currency as needed
    };

    const totalApplications = Object.values(stats.applicationStats).reduce((sum, count) => sum + count, 0);
    const applicationSuccessRate = totalApplications > 0 ? Math.round(((stats.applicationStats['enrolled'] || 0) / totalApplications) * 100) : 0;

    const applicationStatusChartData = Object.entries(stats.applicationStats)
        .map(([status, count]) => ({
            name: formatStatus(status),
            value: count,
        }))
        .filter((item) => item.value > 0);

    const studentDemographicsChartData = Object.entries(stats.studentDemographicsBySchoolType)
        .map(([type, count]) => ({
            name: type === '' || type === null ? 'Unknown' : formatStatus(type),
            count: count,
        }))
        .filter((item) => item.count > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="flex flex-col space-y-6 p-4 md:p-6">
                {/* Dashboard Header with Summary */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold tracking-tight">Scholarship Administration</h1>
                            <p className="text-muted-foreground">Welcome to the administration dashboard. Here's an overview of your scholarship programs.</p>
                        </div>
                        <div className="flex flex-wrap gap-2 self-end">
                            <Button asChild variant="default" className="gap-2">
                                <Link href={route('admin.scholarships.create')}><PlusCircle className="h-4 w-4" /> New Scholarship</Link>
                            </Button>
                            <Button asChild variant="outline" className="gap-2">
                                <Link href={route('admin.applications.index')}><FileCheck2 className="h-4 w-4" /> Review Applications</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Content - Two Column Layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Main reporting area */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* KPI Cards - Now in a horizontal scrollable row on mobile */}
                        <div className="flex overflow-x-auto pb-2 gap-4 scrollbar-thin scrollbar-thumb-gray-300">
                            <Card className="min-w-[200px] flex-1">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <Users className="text-primary h-5 w-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stats.totalStudents}</div>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                        <div className="bg-green-100 text-green-800 rounded-full px-2 py-0.5 mr-2">
                                            {stats.studentsWithProfiles}
                                        </div>
                                        with completed profiles
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="min-w-[200px] flex-1">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium">Active Scholarships</CardTitle>
                                        <div className="bg-blue-100 p-2 rounded-full">
                                            <BookOpenCheck className="text-blue-600 h-5 w-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{stats.activeScholarships}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Available scholarship programs
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="min-w-[200px] flex-1">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium">Application Success</CardTitle>
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <TrendingUp className="text-green-600 h-5 w-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{applicationSuccessRate}%</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {totalApplications} total applications
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="min-w-[200px] flex-1">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-sm font-medium">Financial</CardTitle>
                                        <div className="bg-purple-100 p-2 rounded-full">
                                            <DollarSign className="text-purple-600 h-5 w-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{formatCurrency(stats.totalDisbursedAmount)}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        Total disbursed amount
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Priority Tasks Card */}
                        <Card className="border-l-4 border-l-yellow-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    Priority Actions
                                </CardTitle>
                                <CardDescription>Items requiring your immediate attention</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-4 bg-yellow-50/50">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <CalendarClock className="text-yellow-600 h-5 w-5" />
                                                <h3 className="font-medium">Scholarships Nearing Deadline</h3>
                                            </div>
                                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                {stats.scholarshipsNearingDeadline}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">Scholarships closing within 7 days</p>
                                    </div>
                                    
                                    <div className="border rounded-lg p-4 bg-blue-50/50">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <UsersRound className="text-blue-600 h-5 w-5" />
                                                <h3 className="font-medium">Pending Service Reports</h3>
                                            </div>
                                            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                                {stats.pendingCommunityServiceReports}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">Community service reports awaiting review</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Application Status Visualization */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <PieChartIcon className="text-primary h-5 w-5" />
                                            Application Status Breakdown
                                        </CardTitle>
                                        <CardDescription>Distribution of applications by current status</CardDescription>
                                    </div>
                                    <div className="text-sm font-medium">{totalApplications} Total</div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {applicationStatusChartData.length > 0 ? (
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        <div className="w-full md:w-1/2">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={applicationStatusChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={100}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                        stroke="hsl(var(--background))"
                                                        strokeWidth={2}
                                                    >
                                                        {applicationStatusChartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'hsl(var(--background))',
                                                            borderColor: 'hsl(var(--border))',
                                                            borderRadius: 'hsl(var(--radius))',
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <div className="grid grid-cols-1 gap-2">
                                                {applicationStatusChartData.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full" 
                                                                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                                            ></div>
                                                            <span className="font-medium">{item.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted-foreground">{item.value}</span>
                                                            <span className="text-xs text-muted-foreground">({((item.value / totalApplications) * 100).toFixed(1)}%)</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-muted-foreground py-4 text-center text-sm">No application data for chart.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Applications Table */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <div>
                                    <CardTitle>Recent Applications</CardTitle>
                                    <CardDescription>Latest scholarship applications submitted</CardDescription>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={route('admin.applications.index')}>View All</Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                {recentApplications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <HelpCircle className="text-muted-foreground mb-4 h-12 w-12" />
                                        <p className="text-muted-foreground text-lg font-medium">No recent applications found.</p>
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

                    {/* Right Column - Secondary information */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Financial Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="text-primary h-5 w-5" />
                                    Financial Overview
                                </CardTitle>
                                <CardDescription>Financial distribution and current state</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-green-100">
                                    <div className="text-sm text-muted-foreground">Total Disbursed</div>
                                    <div className="text-2xl font-bold text-green-700">{formatCurrency(stats.totalDisbursedAmount)}</div>
                                </div>
                                
                                <div className="p-4 rounded-lg border bg-gradient-to-r from-orange-50 to-orange-100">
                                    <div className="text-sm text-muted-foreground">Pending Disbursement</div>
                                    <div className="text-2xl font-bold text-orange-700">{formatCurrency(stats.totalPendingDisbursementAmount)}</div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span>Total Amount:</span>
                                        <span>
                                            {formatCurrency(stats.totalDisbursedAmount + stats.totalPendingDisbursementAmount)}
                                        </span>
                                    </div>
                                </div>
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
                                    <div className="space-y-4">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart
                                                data={studentDemographicsChartData}
                                                layout="vertical"
                                                margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                <XAxis
                                                    type="number"
                                                    fontSize={10}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    stroke="hsl(var(--muted-foreground))"
                                                />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    fontSize={10}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    stroke="hsl(var(--muted-foreground))"
                                                    width={80}
                                                />
                                                <Tooltip
                                                    cursor={{ fill: 'hsl(var(--muted))' }}
                                                    contentStyle={{
                                                        backgroundColor: 'hsl(var(--background))',
                                                        borderColor: 'hsl(var(--border))',
                                                        borderRadius: 'hsl(var(--radius))',
                                                    }}
                                                />
                                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                        
                                        <div className="space-y-2">
                                            {studentDemographicsChartData.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="font-medium">{item.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline">{item.count}</Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            ({((item.count / stats.totalStudents) * 100).toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground py-4 text-center text-sm">No demographic data available.</p>
                                )}
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
                                    <div className="space-y-3">
                                        {stats.popularPrograms.map((program, index) => (
                                            <div key={program.id} className="flex items-center gap-3 p-3 rounded-lg border">
                                                <div className="bg-primary/10 text-primary flex items-center justify-center w-8 h-8 rounded-full font-bold">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{program.name}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {program.scholarship_applications_count} applications
                                                    </div>
                                                </div>
                                                <Badge variant="secondary">
                                                    {((program.scholarship_applications_count / totalApplications) * 100).toFixed(0)}%
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground py-4 text-center text-sm">No program data available.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Actions Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Administrative Actions</CardTitle>
                                <CardDescription>Quick access to common tasks</CardDescription>
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
                                <Button asChild variant="outline" className="w-full justify-start gap-2">
                                    <Link href={route('admin.applications.index')}>
                                        <FileCheck2 className="h-4 w-4" /> Review Applications
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
