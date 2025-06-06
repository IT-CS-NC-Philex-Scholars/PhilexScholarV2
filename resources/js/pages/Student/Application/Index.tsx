import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, FileTextIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon, 
         ArrowUpIcon, DollarSignIcon, SearchIcon, BookOpenIcon, AwardIcon, 
         XCircleIcon, ChevronRightIcon, InfoIcon, TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// Individual application card component
interface ApplicationCardProps {
  application: ScholarshipApplication;
  index: number;
  getApplicationProgress: (status: string) => number;
  getStatusBadgeVariant: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusMessage: (status: string) => string;
  formatStatus: (status: string) => string;
}

const ApplicationCard = ({ 
  application, 
  index, 
  getApplicationProgress, 
  getStatusBadgeVariant, 
  getStatusIcon,
  getStatusMessage,
  formatStatus 
}: ApplicationCardProps) => {
  const progress = getApplicationProgress(application.status);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, type: "spring", stiffness: 120, damping: 14 }}
      className="group"
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 mb-10">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1">
            <div 
              className="h-full" 
              style={{
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#22c55e' : // green
                              progress >= 50 ? '#3b82f6' : // blue
                              progress > 0 ? '#f59e0b' : // amber
                              '#d1d5db' // gray
              }}
            />
          </div>
          
          <div className="p-3 sm:p-4 md:p-5 mt-1">
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="font-semibold text-base sm:text-lg group-hover:text-primary transition-colors line-clamp-1">
                  {application.scholarship_program?.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {application.scholarship_program?.semester} | {application.scholarship_program?.academic_year}
                </p>
                
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    {getStatusIcon(application.status)}
                    <Badge variant={getStatusBadgeVariant(application.status) as any} className="px-1.5 sm:px-2 py-0.5 text-xs">
                      {formatStatus(application.status)}
                    </Badge>
                  </div>

                  {application.scholarship_program?.community_service_days && application.scholarship_program.community_service_days > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 sm:px-2 py-0.5 rounded-full bg-muted/50 border border-border">
                          <TimerIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {application.scholarship_program.community_service_days * 8} hours service
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Required Community Service</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  
                  {application.submitted_at && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 sm:px-2 py-0.5 rounded-full bg-muted/50 border border-border">
                          <CalendarIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          {new Date(application.submitted_at).toLocaleDateString(undefined, {day: 'numeric', month: 'short', year: 'numeric'})}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Submission Date</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <p className="text-xs sm:text-sm text-muted-foreground">{getStatusMessage(application.status)}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center mt-2 lg:mt-0 lg:self-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-xs text-muted-foreground">Progress:</span>
                  <div className="w-16 sm:w-20 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progress === 100 ? '#22c55e' : // green
                                      progress >= 50 ? '#3b82f6' : // blue
                                      progress > 0 ? '#f59e0b' : // amber
                                      '#d1d5db' // gray
                      }}
                    />
                  </div>
                  <span className="text-xs font-medium">{progress}%</span>
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
                    <Link href={route('student.applications.show', application.id)} className="flex items-center gap-1 sm:gap-1.5">
                      View
                      <ChevronRightIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Empty state component
interface EmptyStateProps {
  message: string;
  description: string;
}

const EmptyState = ({ message, description }: EmptyStateProps) => (
  <div className="bg-card border border-border rounded-xl p-6 sm:p-8 text-center">
    <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-muted rounded-full flex items-center justify-center">
      <InfoIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
    </div>
    <h3 className="text-base sm:text-lg font-medium mb-1">{message}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

interface ApplicationIndexProps {
  applications: ScholarshipApplication[];
}

export default function Index({ applications }: ApplicationIndexProps) {
  const { auth } = usePage().props as any;
  const [loaded, setLoaded] = React.useState(false);
  
  React.useEffect(() => {
    setLoaded(true);
  }, []);
  
  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified'].includes(status)) {
      return 'success';
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
      return 'destructive';
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review'].includes(status)) {
      return 'warning';
    }
    return 'secondary';
  };

  // Helper function to format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified'].includes(status)) {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
      return <XCircleIcon className="h-4 w-4 text-destructive" />;
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review'].includes(status)) {
      return <ClockIcon className="h-4 w-4 text-amber-500" />;
    }
    return <FileTextIcon className="h-4 w-4 text-muted-foreground" />;
  };
  
  // Get a friendly message based on status
  const getStatusMessage = (status: string) => {
    if (['completed', 'disbursement_processed'].includes(status)) {
      return "Scholarship awarded! 🎉";
    }
    if (['service_completed'].includes(status)) {
      return "Community service completed";
    }
    if (['documents_approved', 'eligibility_verified'].includes(status)) {
      return "Documents approved";
    }
    if (['documents_rejected'].includes(status)) {
      return "Action needed: documents rejected";
    }
    if (['documents_under_review'].includes(status)) {
      return "Documents under review";
    }
    if (['submitted', 'documents_pending'].includes(status)) {
      return "Application submitted";
    }
    if (['draft'].includes(status)) {
      return "Draft - continue your application";
    }
    return "Application in progress";
  };
  
  // Calculate progress percentage
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
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 }
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Applications' }
  ];
  
  // Group applications by status for the dashboard view
  const activeApplications = applications.filter(app => 
    ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed'].includes(app.status)
  );
  
  const pendingApplications = applications.filter(app => 
    ['draft', 'submitted', 'documents_pending', 'documents_under_review'].includes(app.status)
  );
  
  const completedApplications = applications.filter(app => 
    ['disbursement_pending', 'disbursement_processed', 'completed'].includes(app.status)
  );
  
  const needAttentionApplications = applications.filter(app => 
    ['documents_rejected', 'rejected'].includes(app.status)
  );

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Applications" />
      
      <TooltipProvider>
        <motion.div 
          className="max-w-6xl mx-auto px-4 sm:px-6 py-2" 
          variants={containerVariants}
          initial="hidden"
          animate={loaded ? "visible" : "hidden"}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
            <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-4 sm:p-6 text-primary-foreground shadow-md">
              <div className="flex flex-col gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  My Applications
                </h1>
                <p className="text-sm sm:text-base text-primary-foreground/80 max-w-3xl">
                  View and manage all your scholarship applications in one place. Track status updates, see progress, and manage your documents.  
                </p>
                
                {applications.length > 0 && (
                  <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm">
                      <span>Total:</span> 
                      <span className="font-semibold">{applications.length}</span>
                    </div>
                    
                    {needAttentionApplications.length > 0 && (
                      <div className="flex items-center gap-1 sm:gap-1.5 bg-red-500/20 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-sm border border-red-500/30">
                        <AlertCircleIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span>{needAttentionApplications.length} need{needAttentionApplications.length === 1 ? 's' : ''} attention</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        
          {applications.length === 0 ? (
            <motion.div variants={itemVariants}>
              <div className="rounded-xl bg-card border border-border p-6 sm:p-8 text-center shadow-sm">
                <div className="mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-primary/5 rounded-full mx-auto flex items-center justify-center">
                  <FileTextIcon className="h-8 w-8 sm:h-10 sm:w-10 text-primary/70" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2">No Applications Yet</h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4 sm:mb-6">
                  You haven't applied for any scholarships yet. Browse available opportunities and start your application journey!  
                </p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button asChild size="lg" className="px-4 sm:px-6 shadow-sm h-10 sm:h-11 text-sm sm:text-base">
                    <Link href={route('student.scholarships.index')}>
                      <SearchIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Browse Scholarships
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-8 mb-22">
              {/* Application Status Summary Cards */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  <Card className="bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950 dark:to-amber-900/30 border-amber-200 dark:border-amber-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4">
                      <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
                        <div className="p-1.5 sm:p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                          <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        Pending
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 sm:pt-1">
                      <div className="text-xl sm:text-3xl font-bold">{pendingApplications.length}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Awaiting review</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4">
                      <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
                        <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                          <FileTextIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        Active
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 sm:pt-1">
                      <div className="text-xl sm:text-3xl font-bold">{activeApplications.length}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">In progress</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100/30 dark:from-green-950 dark:to-green-900/30 border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4">
                      <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
                        <div className="p-1.5 sm:p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                          <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
                        </div>
                        Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 sm:pt-1">
                      <div className="text-xl sm:text-3xl font-bold">{completedApplications.length}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Awarded</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-red-50 to-red-100/30 dark:from-red-950 dark:to-red-900/30 border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4">
                      <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-1.5 sm:gap-2">
                        <div className="p-1.5 sm:p-2 rounded-full bg-red-100 dark:bg-red-900/50">
                          <AlertCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
                        </div>
                        Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 sm:pt-1">
                      <div className="text-xl sm:text-3xl font-bold">{needAttentionApplications.length}</div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Action needed</p>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Applications List */}
              <motion.div variants={itemVariants} className="space-y-4 sm:space-y-6">
                <Tabs defaultValue="all" className="w-full">
                  <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <TabsList className="w-full inline-flex sm:grid sm:grid-cols-5 max-w-md sm:max-w-xl mb-4 sm:mb-6 bg-muted/80 rounded-xl p-1">
                      <TabsTrigger value="all" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                        Pending
                      </TabsTrigger>
                      <TabsTrigger value="active" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                        Active
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                        Completed
                      </TabsTrigger>
                      <TabsTrigger value="attention" className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap">
                        Attention
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="space-y-4">
                    {applications.map((application, index) => (
                      <ApplicationCard 
                        key={application.id} 
                        application={application} 
                        index={index}
                        getApplicationProgress={getApplicationProgress}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        getStatusIcon={getStatusIcon}
                        getStatusMessage={getStatusMessage}
                        formatStatus={formatStatus}
                      />
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="space-y-4">
                    {pendingApplications.length > 0 ? pendingApplications.map((application, index) => (
                      <ApplicationCard 
                        key={application.id} 
                        application={application} 
                        index={index}
                        getApplicationProgress={getApplicationProgress}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        getStatusIcon={getStatusIcon}
                        getStatusMessage={getStatusMessage}
                        formatStatus={formatStatus}
                      />
                    )) : (
                      <EmptyState message="No pending applications" description="You don't have any applications in the pending state." />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="active" className="space-y-4">
                    {activeApplications.length > 0 ? activeApplications.map((application, index) => (
                      <ApplicationCard 
                        key={application.id} 
                        application={application} 
                        index={index}
                        getApplicationProgress={getApplicationProgress}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        getStatusIcon={getStatusIcon}
                        getStatusMessage={getStatusMessage}
                        formatStatus={formatStatus}
                      />
                    )) : (
                      <EmptyState message="No active applications" description="You don't have any applications in the active state." />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed" className="space-y-4">
                    {completedApplications.length > 0 ? completedApplications.map((application, index) => (
                      <ApplicationCard 
                        key={application.id} 
                        application={application} 
                        index={index}
                        getApplicationProgress={getApplicationProgress}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        getStatusIcon={getStatusIcon}
                        getStatusMessage={getStatusMessage}
                        formatStatus={formatStatus}
                      />
                    )) : (
                      <EmptyState message="No completed applications" description="You don't have any applications in the completed state." />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="attention" className="space-y-4">
                    {needAttentionApplications.length > 0 ? needAttentionApplications.map((application, index) => (
                      <ApplicationCard 
                        key={application.id} 
                        application={application} 
                        index={index}
                        getApplicationProgress={getApplicationProgress}
                        getStatusBadgeVariant={getStatusBadgeVariant}
                        getStatusIcon={getStatusIcon}
                        getStatusMessage={getStatusMessage}
                        formatStatus={formatStatus}
                      />
                    )) : (
                      <EmptyState message="No applications need attention" description="All of your applications are progressing normally." />
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          )}
        </motion.div>
      </TooltipProvider>
    </AppLayout>
  );
}