import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Keep for ApplicationsSection internal tabs
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // For QuickActionsCard disabled button tooltip
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, ScholarshipApplication, ScholarshipProgram, SchoolData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircleIcon,
    ArrowRightIcon,
    AwardIcon,
    BarChart3,
    BellIcon,
    BriefcaseIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    FileUp,
    FileWarning,
    GraduationCapIcon,
    LayoutDashboardIcon,
    ListChecks,
    MailCheck,
    SearchIcon,
    Send as SendIconLucide,
    SparklesIcon,
    TargetIcon,
    TrendingUpIcon,
    UserCircle2,
    UserIcon,
} from 'lucide-react'; // Existing icons
import React, { useEffect, useMemo, useState } from 'react'; // Ensure React is imported for JSX, added useMemo
import OnboardingStepsCard, { OnboardingStep } from './components/OnboardingStepsCard'; // Import the new component and its type
import OnboardingWizard from './components/OnboardingWizard';

interface DashboardProps {
    hasProfile: boolean;
    applications: ScholarshipApplication[];
    recommendedScholarships?: ScholarshipProgram[];
    allSchoolData?: SchoolData[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Student Dashboard' }];

// ... (keep helpers getStatusColor, getStatusIcon, getApplicationProgress) ...
const getStatusColor = (status: string): string => {
    if (['documents_approved', 'eligibility_verified', 'enrolled', 'service_completed', 'completed', 'disbursement_processed'].includes(status)) {
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
    if (['draft', 'submitted', 'documents_pending', 'documents_under_review', 'service_pending', 'disbursement_pending'].includes(status)) {
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
};

const getStatusIcon = (status: string) => {
    if (['completed', 'disbursement_processed'].includes(status)) {
        return <CheckCircleIcon className="h-4 w-4" />;
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
        return <AlertCircleIcon className="h-4 w-4" />;
    }
    return <ClockIcon className="h-4 w-4" />;
};

const getApplicationProgress = (status: string): number => {
    const statuses = [
        'draft',
        'submitted',
        'documents_pending',
        'documents_under_review',
        'documents_approved',
        'eligibility_verified',
        'enrolled',
        'service_pending',
        'service_completed',
        'disbursement_pending',
        'disbursement_processed',
        'completed',
    ];
    const index = statuses.indexOf(status);
    if (index === -1) return 0;
    return Math.round((index / (statuses.length - 1)) * 100);
};

// ... (QuickActionsCard, DashboardHeader, DashboardNav, UpcomingDeadlinesCard, QuickStatsCard, ApplicationsSection, ScholarshipsSection) ...

interface QuickActionsCardProps {
    setActiveSection: (section: string) => void;
    hasProfile: boolean;
    isLoaded: boolean;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ setActiveSection, hasProfile, isLoaded }) => {
    // ... existing code ...
    const actions = [
        {
            title: 'Find New Scholarships',
            description: 'Discover opportunities tailored for you.',
            icon: SearchIcon,
            action: () => setActiveSection('scholarships'),
            buttonVariant: 'default' as const,
            className: 'bg-primary hover:bg-primary/90 text-primary-foreground',
            disabled: !hasProfile,
            tooltip: !hasProfile ? 'Complete your profile to find scholarships' : 'Search for available scholarships',
        },
        {
            title: 'View My Applications',
            description: 'Track your progress and manage submissions.',
            icon: BriefcaseIcon,
            action: () => setActiveSection('applications'),
            buttonVariant: 'default' as const,
            className: 'bg-green-600 hover:bg-green-700 text-white',
            disabled: false,
            tooltip: 'Check the status of your applications',
        },
    ];

    return (
        <Card
            className={cn(
                'shadow-md transition-all duration-500 ease-out hover:shadow-lg',
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                'delay-100',
            )}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <TargetIcon className="text-primary h-6 w-6" />
                    What would you like to do?
                </CardTitle>
                {!hasProfile && (
                    <CardDescription className="text-amber-600 dark:text-amber-500">
                        Complete your profile to access all features, including applying for scholarships.
                    </CardDescription>
                )}
                {hasProfile && <CardDescription>Choose an action to continue your scholarship journey.</CardDescription>}
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {actions.map((item) => (
                    <TooltipProvider key={item.title} delayDuration={100}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    onClick={item.action}
                                    disabled={item.disabled}
                                    variant={item.buttonVariant}
                                    className={cn(
                                        'dark:focus:ring-offset-background group flex h-auto w-full flex-col items-start justify-start p-4 text-left shadow-lg transition-all duration-300 ease-out hover:shadow-xl focus:ring-2 focus:ring-offset-2',
                                        item.className,
                                        item.disabled ? 'cursor-not-allowed opacity-70' : 'hover:scale-[1.02] active:scale-[0.98]',
                                    )}
                                >
                                    <div className="mb-2 flex items-center">
                                        <item.icon
                                            className={cn(
                                                'mr-3 h-7 w-7 opacity-90 transition-transform duration-300 group-hover:scale-110',
                                                item.disabled && 'opacity-50',
                                            )}
                                        />
                                        <span className="text-lg leading-tight font-semibold">{item.title}</span>
                                    </div>
                                    <p className={cn('text-sm opacity-90', item.disabled && 'opacity-60')}>{item.description}</p>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.tooltip}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </CardContent>
        </Card>
    );
};

interface DashboardHeaderProps {
    user: any;
    overallProgress: number;
    isLoaded: boolean;
    hasProfile: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, overallProgress, isLoaded, hasProfile }) => {
    return (
        <div
            className={cn(
                'relative mb-6 overflow-hidden rounded-xl shadow-lg md:mb-8',
                'from-primary via-primary/90 to-accent bg-gradient-to-br',
                'text-primary-foreground p-4 transition-all duration-700 ease-in-out md:p-6',
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
        >
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>
                <div className="absolute top-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-4">
                    <Avatar
                        className={cn(
                            'border-primary-foreground h-16 w-16 border-2 shadow-lg ring-4 ring-white/20',
                            'transition-all duration-500 ease-out',
                            isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
                        )}
                    >
                        <AvatarImage src={user.avatar_url || '/default-avatar.png'} alt={user.name} />
                        <AvatarFallback className="bg-accent text-accent-foreground text-lg">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div
                        className={cn(
                            'transition-all delay-100 duration-500 ease-out',
                            isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
                        )}
                    >
                        <h1 className="text-2xl font-bold md:text-3xl">Welcome, {user.name.split(' ')[0]}!</h1>
                        <p className="text-primary-foreground/90">Let's continue your scholarship journey.</p>
                    </div>
                </div>
                <div
                    className={cn(
                        'flex items-center gap-2 transition-all delay-150 duration-500 ease-out',
                        isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                    )}
                >
                    <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30 transition-all duration-300 hover:scale-105"
                    >
                        <Link href={route('student.profile.edit')}>
                            <UserIcon className="mr-2 h-4 w-4" /> My Profile
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30 transition-all duration-300 hover:scale-105"
                    >
                        <Link href="#">
                            {' '}
                            {/* Replace with actual notifications link if available */}
                            <BellIcon className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            {!hasProfile && (
                <div
                    className={cn(
                        'mt-4 flex items-center gap-2 rounded-md border border-yellow-500/30 bg-yellow-500/20 p-3 text-sm text-yellow-700 dark:text-yellow-300',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                >
                    <AlertCircleIcon className="h-5 w-5" />
                    <span>Please complete your profile to apply for scholarships.</span>
                    <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="ml-auto border-yellow-400 bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                    >
                        <Link href={route('student.profile.edit')}>Complete Profile</Link>
                    </Button>
                </div>
            )}

            <div
                className={cn(
                    'bg-primary-foreground/10 mt-6 rounded-lg p-4 backdrop-blur-sm',
                    'transition-all delay-200 duration-500 ease-out',
                    isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                )}
            >
                <div className="mb-2 flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                        <SparklesIcon className="h-4 w-4" /> Your Scholarship Journey
                    </span>
                    <span className="font-semibold">{overallProgress}% Complete</span>
                </div>
                <div className="bg-primary-foreground/20 h-3 w-full overflow-hidden rounded-full shadow-inner">
                    <div
                        className="bg-primary-foreground ease-out-expo relative h-full overflow-hidden rounded-full transition-all duration-1000"
                        style={{ width: `${overallProgress}%` }}
                    >
                        <div className="animate-shimmer-slow absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface DashboardNavProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    isLoaded: boolean;
}

const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboardIcon },
    { id: 'applications', label: 'My Applications', icon: BriefcaseIcon },
    { id: 'scholarships', label: 'Find Scholarships', icon: SearchIcon },
];

const DashboardNav: React.FC<DashboardNavProps> = ({ activeSection, setActiveSection, isLoaded }) => {
    return (
        <div
            className={cn(
                'mb-6 flex flex-wrap items-center gap-2',
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                'transition-all delay-300 duration-500 ease-out',
            )}
        >
            {navItems.map((item, index) => (
                <Button
                    key={item.id}
                    variant={activeSection === item.id ? 'default' : 'outline'}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                        'flex items-center gap-2 shadow-sm transition-all duration-300 ease-out hover:shadow-md',
                        activeSection === item.id ? 'ring-primary dark:ring-offset-background ring-2 ring-offset-2' : 'hover:bg-muted/50',
                        isLoaded ? 'scale-100 opacity-100' : 'scale-90 opacity-0',
                        `transition-delay-${index * 100}`,
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                </Button>
            ))}
        </div>
    );
};

interface UpcomingDeadlinesCardProps {
    deadlines: ScholarshipApplication[];
    isLoaded: boolean;
}

const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({ deadlines, isLoaded }) => {
    if (!deadlines || deadlines.length === 0) {
        return (
            <Card
                className={cn(
                    'transition-all duration-500 ease-out',
                    isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                    'bg-muted/30',
                )}
            >
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarIcon className="text-primary h-5 w-5" /> Upcoming Deadlines
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No upcoming deadlines at the moment. Great job!</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                'shadow-sm transition-all duration-500 ease-out hover:shadow-lg',
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarIcon className="text-primary h-5 w-5" /> Upcoming Deadlines
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {deadlines.map((app, index) => (
                    <div key={app.id} className={cn('bg-card hover:bg-muted/50 rounded-md border p-3 transition-all', `delay-${index * 100}`)}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h4 className="text-sm font-semibold">{(app as any).scholarship?.title}</h4>
                                <p className="text-muted-foreground text-xs">
                                    Apply by: {new Date((app as any).scholarship?.deadline).toLocaleDateString()}
                                </p>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80 -mt-1 -mr-2">
                                <Link href={route('student.applications.show', app.id)}>
                                    <ArrowRightIcon className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

interface QuickStatsCardProps {
    applications: ScholarshipApplication[];
    isLoaded: boolean;
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ applications, isLoaded }) => {
    const stats = [
        {
            title: 'Active Applications',
            value: applications.filter((app) =>
                [
                    'draft',
                    'submitted',
                    'documents_pending',
                    'documents_under_review',
                    'documents_approved',
                    'eligibility_verified',
                    'enrolled',
                    'service_pending',
                ].includes(app.status),
            ).length,
            icon: ListChecks,
            color: 'text-blue-500',
        },
        {
            title: 'Scholarships Won',
            value: applications.filter((app) =>
                ['service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status),
            ).length,
            icon: AwardIcon,
            color: 'text-green-500',
        },
        {
            title: 'Pending Tasks',
            value: applications.filter((app) => ['documents_pending', 'service_pending'].includes(app.status)).length,
            icon: FileWarning,
            color: 'text-yellow-500',
        },
    ];

    return (
        <Card
            className={cn(
                'shadow-sm transition-all duration-500 ease-out hover:shadow-lg',
                isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
        >
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="text-primary h-5 w-5" /> Quick Stats
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {stats.map((stat, index) => (
                    <div key={stat.title} className={cn('bg-card hover:bg-muted/50 rounded-md border p-3 transition-all', `delay-${index * 100}`)}>
                        <div className="flex items-center justify-between">
                            <div className={cn('bg-primary/10 rounded-full p-2', stat.color.replace('text-', 'bg-'))}>
                                <stat.icon className={cn('h-5 w-5', stat.color)} />
                            </div>
                            <span className="text-2xl font-bold">{stat.value}</span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">{stat.title}</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

interface OverviewSectionProps {
    applications: ScholarshipApplication[];
    auth: any;
    hasProfile: boolean;
    isLoaded: boolean;
    setActiveSection: (section: string) => void;
    onboardingSteps: OnboardingStep[];
    upcomingDeadlines: ScholarshipApplication[];
    recommendedScholarships?: ScholarshipProgram[];
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
    applications,
    auth,
    hasProfile,
    isLoaded,
    setActiveSection,
    onboardingSteps,
    upcomingDeadlines,
    recommendedScholarships,
}) => {
    return (
        <div className={cn('space-y-6 md:space-y-8', isLoaded ? 'opacity-100' : 'opacity-0', 'transition-opacity delay-400 duration-500')}>
            {recommendedScholarships && recommendedScholarships.length > 0 && (
                <div className="space-y-4">
                    <h2 className="flex items-center gap-2 text-lg font-semibold">
                        <SparklesIcon className="h-5 w-5 text-yellow-500" /> Recommended for You
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {recommendedScholarships.map((scholarship) => (
                            <Card
                                key={scholarship.id}
                                className="border-primary/20 from-card to-primary/5 bg-gradient-to-br transition-all hover:shadow-lg"
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">{scholarship.name}</CardTitle>
                                    <CardDescription className="line-clamp-2 text-xs">{scholarship.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-1 pb-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Amount:</span>
                                        <span className="font-semibold text-green-600">₱{scholarship.per_student_budget?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Deadline:</span>
                                        <span>{new Date(scholarship.application_deadline).toLocaleDateString()}</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button size="sm" className="w-full" asChild>
                                        <Link href={route('student.scholarships.show', scholarship.id)}>View Details</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {onboardingSteps.length > 0 && <OnboardingStepsCard steps={onboardingSteps} isLoaded={isLoaded} />}

            <QuickActionsCard setActiveSection={setActiveSection} hasProfile={hasProfile} isLoaded={isLoaded} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                <QuickStatsCard applications={applications} isLoaded={isLoaded} />
                <UpcomingDeadlinesCard deadlines={upcomingDeadlines} isLoaded={isLoaded} />
            </div>
        </div>
    );
};

// ... (ApplicationsSection, ScholarshipsSection) ...
interface ApplicationsSectionProps {
    applications: ScholarshipApplication[];
    getStatusColor: (status: string) => string;
    getStatusIcon: (status: string) => React.ReactNode;
    getApplicationProgress: (status: string) => number;
    isLoaded: boolean;
    auth: any;
}

const ApplicationsSection: React.FC<ApplicationsSectionProps> = ({
    applications,
    getStatusColor,
    getStatusIcon,
    getApplicationProgress,
    isLoaded,
    auth,
}) => {
    const pendingApplications = applications.filter((app) =>
        ['draft', 'submitted', 'documents_pending', 'documents_under_review'].includes(app.status),
    );
    const activeApplications = applications.filter((app) =>
        ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed'].includes(app.status),
    );
    const completedApplications = applications.filter((app) => ['disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status));
    const rejectedApplications = applications.filter((app) => ['documents_rejected', 'rejected'].includes(app.status));

    const applicationTabs = [
        { name: 'Pending', data: pendingApplications, icon: ClockIcon },
        { name: 'Active', data: activeApplications, icon: TrendingUpIcon },
        { name: 'Completed', data: completedApplications, icon: CheckCircleIcon },
        { name: 'Rejected', data: rejectedApplications, icon: AlertCircleIcon },
    ];

    return (
        <div className={cn('transition-all duration-500 ease-out', isLoaded ? 'opacity-100' : 'opacity-0')}>
            <Tabs defaultValue="Pending" className="w-full">
                <TabsList className="mb-4 grid h-auto w-full grid-cols-2 md:grid-cols-4">
                    {applicationTabs.map((tab) => (
                        <TabsTrigger
                            key={tab.name}
                            value={tab.name}
                            className="flex items-center gap-2 py-2 text-xs data-[state=active]:shadow-md sm:text-sm"
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.name} ({tab.data.length})
                        </TabsTrigger>
                    ))}
                </TabsList>
                {applicationTabs.map((tab) => (
                    <TabsContent key={tab.name} value={tab.name}>
                        {tab.data.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {tab.data.map((app) => (
                                    <Card key={app.id} className="shadow-sm transition-shadow hover:shadow-md">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <CardTitle className="text-base md:text-lg">{(app as any).scholarship?.title}</CardTitle>
                                                <Badge
                                                    variant="outline"
                                                    className={cn('text-xs whitespace-nowrap capitalize', getStatusColor(app.status))}
                                                >
                                                    {getStatusIcon(app.status)}
                                                    <span className="ml-1.5">{app.status.replace(/_/g, ' ')}</span>
                                                </Badge>
                                            </div>
                                            <CardDescription className="text-xs">
                                                Applied on: {new Date((app as any).created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="text-xs">
                                                <p>
                                                    Amount:{' '}
                                                    <span className="font-semibold text-green-600">
                                                        ${(app as any).scholarship?.amount?.toLocaleString()}
                                                    </span>
                                                </p>
                                                <p>
                                                    Deadline:{' '}
                                                    <span className="font-semibold">
                                                        {new Date((app as any).scholarship?.deadline).toLocaleDateString()}
                                                    </span>
                                                </p>
                                            </div>
                                            <div>
                                                <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                                                    <span>Progress</span>
                                                    <span>{getApplicationProgress(app.status)}%</span>
                                                </div>
                                                <Progress value={getApplicationProgress(app.status)} className="h-2" />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end">
                                            <Button asChild size="sm" variant="default">
                                                <Link href={route('student.applications.show', app.id)}>
                                                    View Details <ArrowRightIcon className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center">
                                <BriefcaseIcon className="text-muted-foreground/50 mx-auto h-12 w-12" />
                                <p className="text-muted-foreground mt-2">No applications in this category.</p>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

const ScholarshipsSection: React.FC<{ isLoaded: boolean }> = ({ isLoaded }) => {
    return (
        <div className={cn('transition-all duration-500 ease-out', isLoaded ? 'opacity-100' : 'opacity-0')}>
            <Card className="shadow-sm transition-shadow hover:shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SearchIcon className="text-primary h-5 w-5" /> Find New Scholarships
                    </CardTitle>
                    <CardDescription>Explore and apply for scholarships that match your profile.</CardDescription>
                </CardHeader>
                <CardContent className="py-10 text-center">
                    <GraduationCapIcon className="text-muted-foreground/50 mx-auto h-16 w-16" />
                    <p className="text-muted-foreground mt-4 text-lg">Ready to find your next opportunity?</p>
                    <Button asChild size="lg" className="mt-6">
                        <Link href={route('student.scholarships.index')}>Browse Scholarships</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ hasProfile, applications, recommendedScholarships, allSchoolData }) => {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const [isLoaded, setIsLoaded] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    useEffect(() => {
        setIsLoaded(true);
        const hash = window.location.hash.replace('#', '');
        if (hash && ['overview', 'applications', 'scholarships'].includes(hash)) {
            setActiveSection(hash);
        }
    }, []);

    const overallProgress =
        applications.length > 0
            ? Math.round(applications.reduce((sum, app) => sum + getApplicationProgress(app.status), 0) / applications.length)
            : 0;

    // Upcoming deadlines (first 3 applications that are draft/submitted)
    const upcomingDeadlines = applications
        .filter((app) => ['draft', 'submitted'].includes(app.status) && new Date((app as any).scholarship?.deadline) > new Date())
        .sort((a, b) => new Date((a as any).scholarship?.deadline).getTime() - new Date((b as any).scholarship?.deadline).getTime())
        .slice(0, 3);

    // Define onboarding steps
    const onboardingSteps = useMemo(
        () => [
            {
                id: 'complete_profile',
                title: 'Complete Your Profile',
                description: 'Fill in your personal details to get started.',
                icon: UserCircle2,
                isCompleted: hasProfile,
                ctaLink: route('student.profile.edit'),
                ctaText: 'Go to Profile',
            },
            {
                id: 'verify_email',
                title: 'Verify Your Email',
                description: 'Ensure your email is verified to receive important updates.',
                icon: MailCheck,
                isCompleted: !!user?.email_verified_at,
                ctaText: user?.email_verified_at ? 'Verified' : 'Verify Email',
            },
            {
                id: 'upload_documents',
                title: 'Upload Required Documents',
                description: 'Submit necessary documents for your applications.',
                icon: FileUp,
                isCompleted: applications.some((app) =>
                    ['documents_approved', 'eligibility_verified', 'enrolled', 'service_completed', 'completed', 'disbursement_processed'].includes(
                        app.status,
                    ),
                ),
                ctaLink: route('student.applications.index'),
                ctaText: 'Manage Documents',
            },
            {
                id: 'submit_application',
                title: 'Submit Your First Application',
                description: 'Apply for a scholarship to kickstart your journey.',
                icon: SendIconLucide,
                isCompleted: applications.some((app) => app.status !== 'draft'),
                action: () => setActiveSection('scholarships'),
                ctaText: 'Find Scholarships',
            },
        ],
        [hasProfile, user, applications, setActiveSection],
    );

    // Render Onboarding Wizard if profile is missing
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Dashboard" />

            <OnboardingWizard user={user} open={!hasProfile} allSchoolData={allSchoolData || []} />

            <div className="container mx-auto p-2 pb-20 sm:p-4 md:p-6 md:pb-6">
                <DashboardHeader user={auth.user} overallProgress={overallProgress} isLoaded={isLoaded} hasProfile={hasProfile} />

                <div className="mt-0 flex flex-col gap-6 md:mt-6 lg:flex-row">
                    <main className={cn('flex-1 transition-all duration-500 ease-out', isLoaded ? 'opacity-100' : 'opacity-0')}>
                        <DashboardNav
                            activeSection={activeSection}
                            setActiveSection={(section) => {
                                setActiveSection(section);
                                window.location.hash = section;
                            }}
                            isLoaded={isLoaded}
                        />

                        <div className="mt-4">
                            {activeSection === 'overview' && (
                                <OverviewSection
                                    applications={applications}
                                    auth={auth}
                                    isLoaded={isLoaded}
                                    setActiveSection={setActiveSection}
                                    hasProfile={hasProfile}
                                    onboardingSteps={onboardingSteps}
                                    upcomingDeadlines={upcomingDeadlines}
                                    recommendedScholarships={recommendedScholarships}
                                />
                            )}
                            {activeSection === 'applications' && (
                                <ApplicationsSection
                                    applications={applications}
                                    getStatusColor={getStatusColor}
                                    getStatusIcon={getStatusIcon}
                                    getApplicationProgress={getApplicationProgress}
                                    isLoaded={isLoaded}
                                    auth={auth}
                                />
                            )}
                            {activeSection === 'scholarships' && <ScholarshipsSection isLoaded={isLoaded} />}
                        </div>
                    </main>

                    <aside className="w-full space-y-6 self-start lg:sticky lg:top-20 lg:w-[340px] xl:w-[380px]">
                        <UpcomingDeadlinesCard deadlines={upcomingDeadlines} isLoaded={isLoaded} />
                        <QuickStatsCard applications={applications} isLoaded={isLoaded} />
                    </aside>
                </div>
            </div>
        </AppLayout>
    );
};

export default Dashboard;
