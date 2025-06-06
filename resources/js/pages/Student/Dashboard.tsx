import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Keep for ApplicationsSection internal tabs
import { CompleteProfileModal } from '@/components/CompleteProfileModal';
import {
  CalendarIcon, GraduationCapIcon, FileTextIcon, UserIcon, 
  ClockIcon, CheckCircleIcon, AlertCircleIcon, BookOpenIcon,
  HomeIcon, TrendingUpIcon, AwardIcon, BellIcon, DollarSignIcon,
  ChevronRightIcon, SearchIcon, MapPinIcon, BadgeIcon, CircleIcon,
  LayoutDashboardIcon, BriefcaseIcon, SparklesIcon, StarIcon, PlusIcon, ArrowRightIcon,
  ListChecks, ThumbsUp, Eye, MessageSquare, FileWarning, BarChart3, TargetIcon, // Added TargetIcon
} from 'lucide-react'; // Existing icons
import { UserCircle2, MailCheck, FileUp, Send as SendIconLucide } from 'lucide-react'; // Icons for onboarding steps, renamed Send to SendIconLucide
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useEffect, useMemo, useState } from 'react'; // Ensure React is imported for JSX, added useMemo
import { cn } from '@/lib/utils';
import OnboardingStepsCard, { OnboardingStep } from './components/OnboardingStepsCard'; // Import the new component and its type
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // For QuickActionsCard disabled button tooltip

interface DashboardProps {
  hasProfile: boolean;
  applications: ScholarshipApplication[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Student Dashboard' }
];

// Helper function to get status color (can be moved or kept)
const getStatusColor = (status: string): string => {
  if (['documents_approved', 'eligibility_verified', 'enrolled', 'service_completed', 'completed', 'disbursement_processed'].includes(status)) {
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
  }
  if (['draft', 'submitted', 'documents_pending', 'documents_under_review', 'service_pending', 'disbursement_pending'].includes(status)) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }
  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
};

// Helper function to get status icon (can be moved or kept)
const getStatusIcon = (status: string) => {
  if (['completed', 'disbursement_processed'].includes(status)) {
    return <CheckCircleIcon className="h-4 w-4" />;
  }
  if (['documents_rejected', 'rejected'].includes(status)) {
    return <AlertCircleIcon className="h-4 w-4" />;
  }
  return <ClockIcon className="h-4 w-4" />;
};

// Helper function to calculate application progress (can be moved or kept)
const getApplicationProgress = (status: string): number => {
  const statuses = [
    'draft', 'submitted', 'documents_pending', 'documents_under_review', 'documents_approved',
    'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 
    'disbursement_pending', 'disbursement_processed', 'completed'
  ];
  const index = statuses.indexOf(status);
  if (index === -1) return 0;
  return Math.round((index / (statuses.length - 1)) * 100);
};

// --- New Dashboard Components ---

interface QuickActionsCardProps {
  setActiveSection: (section: string) => void;
  hasProfile: boolean;
  isLoaded: boolean;
}

const QuickActionsCard: React.FC<QuickActionsCardProps> = ({ setActiveSection, hasProfile, isLoaded }) => {
  const actions = [
    {
      title: "Find New Scholarships",
      description: "Discover opportunities tailored for you.",
      icon: SearchIcon,
      action: () => setActiveSection('scholarships'),
      buttonVariant: 'default' as const,
      className: "bg-primary hover:bg-primary/90 text-primary-foreground",
      disabled: !hasProfile,
      tooltip: !hasProfile ? "Complete your profile to find scholarships" : "Search for available scholarships"
    },
    {
      title: "View My Applications",
      description: "Track your progress and manage submissions.",
      icon: BriefcaseIcon,
      action: () => setActiveSection('applications'),
      buttonVariant: 'default' as const,
      className: "bg-green-600 hover:bg-green-700 text-white",
      disabled: false,
      tooltip: "Check the status of your applications"
    },
  ];

  return (
    <Card className={cn("transition-all duration-500 ease-out shadow-md hover:shadow-lg", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4", "delay-100")}>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TargetIcon className="h-6 w-6 text-primary" />
          What would you like to do?
        </CardTitle>
        {!hasProfile && (
          <CardDescription className="text-amber-600 dark:text-amber-500">
            Complete your profile to access all features, including applying for scholarships.
          </CardDescription>
        )}
        {hasProfile && (
            <CardDescription>Choose an action to continue your scholarship journey.</CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((item) => (
          <TooltipProvider key={item.title} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={item.action}
                  disabled={item.disabled}
                  variant={item.buttonVariant}
                  className={cn(
                    "w-full h-auto p-4 text-left flex flex-col items-start justify-start shadow-lg hover:shadow-xl focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background transition-all duration-300 ease-out group",
                    item.className,
                    item.disabled ? "cursor-not-allowed opacity-70" : "hover:scale-[1.02] active:scale-[0.98]",
                  )}
                >
                  <div className="flex items-center mb-2">
                    <item.icon className={cn("h-7 w-7 mr-3 opacity-90 transition-transform duration-300 group-hover:scale-110", item.disabled && "opacity-50")} />
                    <span className="text-lg font-semibold leading-tight">{item.title}</span>
                  </div>
                  <p className={cn("text-sm opacity-90", item.disabled && "opacity-60")}>{item.description}</p>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </CardContent>
      {!hasProfile && (
        <CardFooter className="flex-col items-start gap-2 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
                Your profile is incomplete. This might limit your access to certain features.
            </p>
            <Button asChild variant="secondary" size="sm">
                <Link href={route('student.profile.edit')} className="font-semibold">
                    Complete Profile Now <ArrowRightIcon className="inline h-4 w-4 ml-1.5"/>
                </Link>
            </Button>
        </CardFooter>
      )}
    </Card>
  );
};

// --- Original Dashboard Components (may need minor adjustments if any) ---

interface DashboardHeaderProps {
  user: any;
  overallProgress: number;
  isLoaded: boolean;
  hasProfile: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, overallProgress, isLoaded, hasProfile }) => {
  return (
    <div className={cn("mb-6 md:mb-8 rounded-xl relative overflow-hidden shadow-lg",
              "bg-gradient-to-br from-primary via-primary/90 to-accent",
              "p-4 md:p-6 text-primary-foreground transition-all duration-700 ease-in-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/20 blur-3xl"></div>
        <div className="absolute top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-2xl"></div>
      </div>
      
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className={cn("h-16 w-16 border-2 border-primary-foreground ring-4 ring-white/20 shadow-lg",
                          "transition-all duration-500 ease-out",
                          isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-90")}>
            <AvatarImage src={user.avatar_url || "/default-avatar.png"} alt={user.name} />
            <AvatarFallback className="text-lg bg-accent text-accent-foreground">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className={cn("transition-all duration-500 delay-100 ease-out",
                        isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4")}>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome, {user.name.split(' ')[0]}!</h1>
            <p className="text-primary-foreground/90">Let's continue your scholarship journey.</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-2 transition-all duration-500 delay-150 ease-out",
                       isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <Button asChild size="sm" variant="secondary" 
                  className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 
                           hover:bg-primary-foreground/30 hover:scale-105 transition-all duration-300">
            <Link href={route('student.profile.edit')}>
              <UserIcon className="h-4 w-4 mr-2" /> My Profile
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary" 
                  className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 
                           hover:bg-primary-foreground/30 hover:scale-105 transition-all duration-300">
            <Link href="#"> {/* Replace with actual notifications link if available */}
              <BellIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
      
      {!hasProfile && (
          <div className={cn("mt-4 p-3 rounded-md bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/30 flex items-center gap-2 text-sm",
           isLoaded ? "opacity-100" : "opacity-0")}>
            <AlertCircleIcon className="h-5 w-5"/>
            <span>Please complete your profile to apply for scholarships.</span>
             <Button asChild size="sm" variant="outline" className="ml-auto bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-400">
                <Link href={route('student.profile.edit')}>Complete Profile</Link>
             </Button>
          </div>
      )}

      <div className={cn("mt-6 rounded-lg bg-primary-foreground/10 p-4 backdrop-blur-sm",
                   "transition-all duration-500 delay-200 ease-out",
                   isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium flex items-center gap-1.5">
            <SparklesIcon className="h-4 w-4" /> Your Scholarship Journey
          </span>
          <span className="font-semibold">{overallProgress}% Complete</span>
        </div>
        <div className="h-3 w-full bg-primary-foreground/20 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-primary-foreground rounded-full transition-all duration-1000 ease-out-expo relative overflow-hidden" 
            style={{ width: `${overallProgress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer-slow"></div>
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
    <div className={cn("mb-6 flex flex-wrap items-center gap-2",
                   isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                   "transition-all duration-500 delay-300 ease-out")}>
      {navItems.map((item, index) => (
        <Button 
          key={item.id}
          variant={activeSection === item.id ? "default" : "outline"}
          onClick={() => setActiveSection(item.id)}
          className={cn("transition-all duration-300 ease-out flex items-center gap-2 shadow-sm hover:shadow-md",
                      activeSection === item.id ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-background" : "hover:bg-muted/50",
                      isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-90",
                      `transition-delay-${index * 100}`
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
  deadlines: ScholarshipApplication[]; // Assuming deadlines are derived from applications
  isLoaded: boolean;
}

const UpcomingDeadlinesCard: React.FC<UpcomingDeadlinesCardProps> = ({ deadlines, isLoaded }) => {
  if (!deadlines || deadlines.length === 0) {
    return (
      <Card className={cn("transition-all duration-500 ease-out", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4", "bg-muted/30")}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" /> Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No upcoming deadlines at the moment. Great job!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-500 ease-out shadow-sm hover:shadow-lg", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><CalendarIcon className="h-5 w-5 text-primary" /> Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deadlines.map((app, index) => (
          <div key={app.id} className={cn("p-3 rounded-md border bg-card hover:bg-muted/50 transition-all", `delay-${index*100}`)}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-sm">{(app as any).scholarship?.title}</h4>
                    <p className="text-xs text-muted-foreground">Apply by: {new Date((app as any).scholarship?.deadline).toLocaleDateString()}</p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary/80 -mr-2 -mt-1">
                    <Link href={route('student.applications.show', app.id)}><ArrowRightIcon className="h-4 w-4" /></Link>
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
    { title: 'Active Applications', value: applications.filter(app => ['draft', 'submitted', 'documents_pending', 'documents_under_review', 'documents_approved', 'eligibility_verified', 'enrolled', 'service_pending'].includes(app.status)).length, icon: ListChecks, color: 'text-blue-500' },
    { title: 'Scholarships Won', value: applications.filter(app => ['service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status)).length, icon: AwardIcon, color: 'text-green-500' },
    { title: 'Pending Tasks', value: applications.filter(app => ['documents_pending', 'service_pending'].includes(app.status)).length, icon: FileWarning, color: 'text-yellow-500' },
  ];

  return (
    <Card className={cn("transition-all duration-500 ease-out shadow-sm hover:shadow-lg", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.title} className={cn("p-3 rounded-md border bg-card hover:bg-muted/50 transition-all", `delay-${index*100}`)}>
            <div className="flex items-center justify-between">
              <div className={cn("p-2 rounded-full bg-primary/10", stat.color.replace('text-', 'bg-'))}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{stat.title}</p>
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
  onboardingSteps: OnboardingStep[]; // Added prop for onboarding steps
  upcomingDeadlines: ScholarshipApplication[]; // Added prop for upcoming deadlines
}

const OverviewSection: React.FC<OverviewSectionProps> = ({
  applications, auth, hasProfile, isLoaded, setActiveSection, onboardingSteps, upcomingDeadlines
}) => {
  return (
    <div className={cn("space-y-6 md:space-y-8", isLoaded ? "opacity-100" : "opacity-0", "transition-opacity duration-500 delay-400")}>
      {onboardingSteps.length > 0 && (
        <OnboardingStepsCard steps={onboardingSteps} isLoaded={isLoaded} />
      )}

      <QuickActionsCard
        setActiveSection={setActiveSection}
        hasProfile={hasProfile}
        isLoaded={isLoaded} 
      />

      {/* Stats and Deadlines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <QuickStatsCard applications={applications} isLoaded={isLoaded} />
        <UpcomingDeadlinesCard deadlines={upcomingDeadlines} isLoaded={isLoaded} />
      </div>
    </div>
  );
};

interface ApplicationsSectionProps {
  applications: ScholarshipApplication[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode; 
  getApplicationProgress: (status: string) => number;
  isLoaded: boolean;
  auth: any;
}

const ApplicationsSection: React.FC<ApplicationsSectionProps> = ({ applications, getStatusColor, getStatusIcon, getApplicationProgress, isLoaded, auth }) => {
  const pendingApplications = applications.filter(app => 
    ['draft', 'submitted', 'documents_pending', 'documents_under_review'].includes(app.status)
  );
  const activeApplications = applications.filter(app => 
    ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed'].includes(app.status)
  );
  const completedApplications = applications.filter(app => 
    ['disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status)
  );
  const rejectedApplications = applications.filter(app => 
    ['documents_rejected', 'rejected'].includes(app.status)
  );

  const applicationTabs = [
    { name: 'Pending', data: pendingApplications, icon: ClockIcon },
    { name: 'Active', data: activeApplications, icon: TrendingUpIcon },
    { name: 'Completed', data: completedApplications, icon: CheckCircleIcon },
    { name: 'Rejected', data: rejectedApplications, icon: AlertCircleIcon },
  ];

  return (
    <div className={cn("transition-all duration-500 ease-out", isLoaded ? "opacity-100" : "opacity-0")}>
      <Tabs defaultValue="Pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4 h-auto">
          {applicationTabs.map(tab => (
            <TabsTrigger key={tab.name} value={tab.name} className="py-2 data-[state=active]:shadow-md flex items-center gap-2 text-xs sm:text-sm">
              <tab.icon className="h-4 w-4" />
              {tab.name} ({tab.data.length})
            </TabsTrigger>
          ))}
        </TabsList>
        {applicationTabs.map(tab => (
          <TabsContent key={tab.name} value={tab.name}>
            {tab.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tab.data.map((app) => (
                  <Card key={app.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base md:text-lg">{(app as any).scholarship?.title}</CardTitle>
                        <Badge variant="outline" className={cn("whitespace-nowrap text-xs capitalize", getStatusColor(app.status))}>
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
                        <p>Amount: <span className="font-semibold text-green-600">${(app as any).scholarship?.amount?.toLocaleString()}</span></p>
                        <p>Deadline: <span className="font-semibold">{new Date((app as any).scholarship?.deadline).toLocaleDateString()}</span></p>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{getApplicationProgress(app.status)}%</span>
                        </div>
                        <Progress value={getApplicationProgress(app.status)} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button asChild size="sm" variant="default">
                        <Link href={route('student.applications.show', app.id)}>View Details <ArrowRightIcon className="h-4 w-4 ml-2"/></Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No applications in this category.</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const ScholarshipsSection: React.FC<{isLoaded: boolean}> = ({isLoaded}) => {
  return (
    <div className={cn("transition-all duration-500 ease-out", isLoaded ? "opacity-100" : "opacity-0")}>
      <Card className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><SearchIcon className="h-5 w-5 text-primary"/> Find New Scholarships</CardTitle>
          <CardDescription>Explore and apply for scholarships that match your profile.</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-10">
            <GraduationCapIcon className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <p className="mt-4 text-lg text-muted-foreground">Ready to find your next opportunity?</p>
            <Button asChild size="lg" className="mt-6">
                <Link href={route('student.scholarships.index')}>Browse Scholarships</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Main Dashboard Component ---

const Dashboard: React.FC<DashboardProps> = ({ hasProfile, applications }) => {
  const { auth } = usePage().props as any;
  
  const overallProgress = applications.length > 0 
    ? Math.round(applications.reduce((sum, app) => sum + getApplicationProgress(app.status), 0) / applications.length)
    : 0;

  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  
  useEffect(() => {
    setIsLoaded(true);
    const hash = window.location.hash.replace('#', '');
    if (hash && ['overview', 'applications', 'scholarships'].includes(hash)) {
      setActiveSection(hash);
    }
  }, []);

  // Upcoming deadlines (first 3 applications that are draft/submitted)
  const upcomingDeadlines = applications
    .filter(app => ['draft', 'submitted'].includes(app.status) && new Date((app as any).scholarship?.deadline) > new Date())
    .sort((a,b) => new Date((a as any).scholarship?.deadline).getTime() - new Date((b as any).scholarship?.deadline).getTime())
    .slice(0, 3);

  const user = auth.user;

  // Define onboarding steps
  const onboardingSteps = useMemo(() => [
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
      // ctaLink: user?.email_verified_at ? undefined : route('verification.notice'), // Example: Link to verification notice if not verified
      ctaText: user?.email_verified_at ? 'Verified' : 'Verify Email',
    },
    {
      id: 'upload_documents',
      title: 'Upload Required Documents',
      description: 'Submit necessary documents for your applications.',
      icon: FileUp,
      // Simplified logic: assumes if any application is past 'documents_under_review', some docs are likely handled.
      // A more robust check might involve a specific user flag or document count.
      isCompleted: applications.some(app => 
        ['documents_approved', 'eligibility_verified', 'enrolled', 'service_completed', 'completed', 'disbursement_processed'].includes(app.status)
      ),
      // Link to the applications page, or a specific document upload page if available.
      ctaLink: route('student.applications.index'), 
      ctaText: 'Manage Documents',
    },
    {
      id: 'submit_application',
      title: 'Submit Your First Application',
      description: 'Apply for a scholarship to kickstart your journey.',
      icon: SendIconLucide, // Use the renamed icon
      isCompleted: applications.some(app => app.status !== 'draft'),
      action: () => setActiveSection('scholarships'), 
      ctaText: 'Find Scholarships',
    },
  ], [hasProfile, user, applications, setActiveSection]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Student Dashboard" />
      <CompleteProfileModal hasProfile={hasProfile} />

      <div className="container mx-auto p-2 sm:p-4 md:p-6 pb-20 md:pb-6">
        <DashboardHeader 
          user={auth.user} 
          overallProgress={overallProgress} 
          isLoaded={isLoaded} 
          hasProfile={hasProfile}
        />

        <div className="flex flex-col lg:flex-row gap-6 mt-0 md:mt-6">
          {/* Main Content Area */}
          <main className={cn("flex-1 transition-all duration-500 ease-out", isLoaded ? "opacity-100" : "opacity-0")}>
            <DashboardNav 
              activeSection={activeSection} 
              setActiveSection={(section) => {
                setActiveSection(section);
                window.location.hash = section; // Update hash for deep linking
              }} 
              isLoaded={isLoaded} 
            />
            
            {/* Dynamically render content based on activeSection */}
            <div className="mt-4">
                {activeSection === 'overview' && 
                    <OverviewSection applications={applications} auth={auth} isLoaded={isLoaded} setActiveSection={setActiveSection} hasProfile={hasProfile} onboardingSteps={onboardingSteps} upcomingDeadlines={upcomingDeadlines} />}
                {activeSection === 'applications' && 
                    <ApplicationsSection 
                        applications={applications} 
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                        getApplicationProgress={getApplicationProgress}
                        isLoaded={isLoaded}
                        auth={auth}
                    />}
                {activeSection === 'scholarships' && 
                    <ScholarshipsSection isLoaded={isLoaded} />}
            </div>
          </main>

          {/* Sidebar (Contextual Info) - visible on lg screens and up */}
          <aside className="w-full lg:w-[340px] xl:w-[380px] space-y-6 lg:sticky lg:top-20 self-start">
            <UpcomingDeadlinesCard deadlines={upcomingDeadlines} isLoaded={isLoaded} />
            <QuickStatsCard applications={applications} isLoaded={isLoaded} />
            {!hasProfile && (
                 <Card className={cn("transition-all duration-500 delay-300 ease-out bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-700",
                       isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                        <AlertCircleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300">Action Required</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-yellow-600 dark:text-yellow-400/90">
                            Your profile is incomplete. Completing it will allow you to apply for scholarships and get better recommendations.
                        </CardDescription>
                    </CardContent>
                    <CardFooter>
                        <Button asChild variant="default" className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-50">
                            <Link href={route('student.profile.edit')}>Complete Your Profile</Link>
                        </Button>
                    </CardFooter>
                </Card>
            )}
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;