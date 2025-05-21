import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipApplication, ScholarshipProgram, DocumentUpload, DocumentRequirement } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon, XCircleIcon, 
         ArrowUpIcon, DollarSignIcon, ClockIcon, FileIcon, CheckIcon, 
         AwardIcon, BookOpenIcon, HelpCircleIcon, RocketIcon, StarIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DocumentUploadItem {
  requirement: DocumentRequirement;
  upload: DocumentUpload | null;
}

interface ApplicationShowProps {
  application: ScholarshipApplication;
  scholarship: ScholarshipProgram;
  documentUploads: DocumentUploadItem[];
  canSubmit: boolean;
}

export default function Show({ 
  application, 
  scholarship, 
  documentUploads,
  canSubmit 
}: ApplicationShowProps) {
  const [activeUploadId, setActiveUploadId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Set loaded to true after initial render to trigger animations
    setLoaded(true);
  }, []);
  
  // Helper function to format status display
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };
  
  // Helper function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'approved'].includes(status)) {
      return 'success';
    }
    if (['documents_rejected', 'rejected', 'rejected_invalid', 'rejected_incomplete', 'rejected_incorrect_format', 'rejected_unreadable', 'rejected_other'].includes(status)) {
      return 'destructive';
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review', 'pending_review'].includes(status)) {
      return 'warning';
    }
    return 'secondary';
  };
  
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    if (['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified', 'approved'].includes(status)) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    if (['documents_rejected', 'rejected', 'rejected_invalid', 'rejected_incomplete', 'rejected_incorrect_format', 'rejected_unreadable', 'rejected_other'].includes(status)) {
      return <XCircleIcon className="h-5 w-5 text-destructive" />;
    }
    if (['disbursement_pending', 'service_pending', 'documents_under_review', 'pending_review'].includes(status)) {
      return <ClockIcon className="h-5 w-5 text-amber-500" />;
    }
    return <FileTextIcon className="h-5 w-5 text-muted-foreground" />;
  };
  
  // Get fun status description for students
  const getStatusDescription = (status: string) => {
    if (['completed', 'disbursement_processed'].includes(status)) {
      return "Congratulations! Your scholarship has been awarded! 🎉";
    }
    if (['service_completed'].includes(status)) {
      return "Great job completing your community service! Disbursement is next.";
    }
    if (['enrolled'].includes(status)) {
      return "You're in! Time to complete community service hours.";
    }
    if (['eligibility_verified'].includes(status)) {
      return "You've been selected! Final enrollment process is underway.";
    }
    if (['documents_approved'].includes(status)) {
      return "Your documents look great! We're verifying your eligibility.";
    }
    if (['documents_rejected'].includes(status)) {
      return "Oops! There's an issue with your documents. Please check and update them.";
    }
    if (['documents_under_review'].includes(status)) {
      return "We're reviewing your documents. Hang tight!";
    }
    if (['submitted', 'documents_pending'].includes(status)) {
      return "Application received! We'll review your documents soon.";
    }
    if (['draft'].includes(status)) {
      return "Let's finish your application by uploading all required documents.";
    }
    return "Your application is being processed.";
  };
  
  // Calculate progress based on application status
  const calculateProgress = () => {
    const statuses = [
      'draft', 'submitted', 'documents_pending', 'documents_under_review', 'documents_approved',
      'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 
      'disbursement_pending', 'disbursement_processed', 'completed'
    ];
    const index = statuses.indexOf(application.status);
    if (index === -1) return 0;
    return Math.round((index / (statuses.length - 1)) * 100);
  };
  
  const applicationProgress = calculateProgress();
  
  // Get emoji for status to make it more friendly
  const getStatusEmoji = (status: string) => {
    if (['completed', 'disbursement_processed'].includes(status)) {
      return "🎓";
    }
    if (['service_completed', 'documents_approved', 'eligibility_verified'].includes(status)) {
      return "✅";
    }
    if (['enrolled'].includes(status)) {
      return "🚀";
    }
    if (['documents_under_review', 'pending_review', 'service_pending', 'disbursement_pending'].includes(status)) {
      return "⏳";
    }
    if (['documents_rejected', 'rejected'].includes(status)) {
      return "❗";
    }
    return "📝";
  };
  
  const submitApplication = () => {
    router.post(route('student.applications.submit', application.id));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Applications', href: route('student.applications.index') },
    { title: 'Application Details' }
  ];
  
  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Application Details" />
      
      <TooltipProvider>
        <motion.div 
          className="max-w-6xl mx-auto space-y-8" 
          variants={containerVariants}
          initial="hidden"
          animate={loaded ? "visible" : "hidden"}
        >
          {/* Application Header - Fun student-friendly design */}
          <motion.div variants={itemVariants} className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/10 rounded-xl blur-3xl opacity-50 transform -translate-y-1/2"></div>
            <div className="relative rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground shadow-lg overflow-hidden">
              {/* Wave background elements */}
              <div className="absolute top-0 left-0 right-0 h-24 overflow-hidden opacity-20">
                <svg className="absolute bottom-0 w-full h-16" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,272C960,277,1056,267,1152,240C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 z-10 relative">
                <div className="flex items-start gap-4">
                  <motion.div 
                    className="hidden sm:flex h-16 w-16 rounded-full bg-white/30 backdrop-blur-md items-center justify-center flex-shrink-0 border-2 border-white/50 shadow-lg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", delay: 0.3 }}
                  >
                    <span className="text-2xl">{getStatusEmoji(application.status)}</span>
                  </motion.div>
                  <div>
                    <motion.h1 
                      className="text-2xl md:text-3xl font-bold tracking-tight"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {scholarship.name}
                    </motion.h1>
                    <motion.p 
                      className="text-primary-foreground/90 text-lg"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {scholarship.semester} | {scholarship.academic_year}
                    </motion.p>
                    <motion.div 
                      className="flex flex-wrap items-center mt-3 gap-2"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Badge className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border-white/20 text-sm px-3 py-1 shadow-sm">
                        <DollarSignIcon className="h-3.5 w-3.5 mr-1" />
                        ${scholarship.per_student_budget.toLocaleString()}
                      </Badge>
                      <Badge className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 border-white/20 text-sm px-3 py-1 shadow-sm">
                        <FileTextIcon className="h-3.5 w-3.5 mr-1" />
                        #{application.id}
                      </Badge>
                    </motion.div>
                  </div>
                </div>

                <motion.div 
                  className="flex flex-col gap-3"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="p-3 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(application.status)}
                      <Badge className="text-sm px-3 py-1" variant={getStatusBadgeVariant(application.status) as any}>
                        {formatStatus(application.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-white/90 mb-2">{getStatusDescription(application.status)}</p>
                    <div className="w-full">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span>Application Progress</span>
                        <span>{applicationProgress}%</span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={applicationProgress} 
                          className="h-2 bg-white/20" 
                          indicatorClassName="bg-white relative overflow-hidden"
                        />
                        {/* Animated progress glow effect */}
                        <div 
                          className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent to-white/60 w-20 animate-shimmer"
                          style={{ width: `${applicationProgress * 0.9}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        
          {/* Main Content Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="mb-6 w-full grid grid-cols-3 lg:w-auto lg:inline-flex bg-card/50 backdrop-blur-sm border border-border shadow-sm rounded-xl p-1 overflow-hidden">
                <TabsTrigger value="overview" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-lg transition-all">
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="documents" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-lg transition-all">
                  <FileIcon className="h-4 w-4 mr-2" />
                  Documents
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-lg transition-all">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>
          
              <TabsContent value="overview" className="space-y-6">
                {/* Status Card - Simplified & Visual */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div 
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-700"></div>
                    <div className="p-6 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <AwardIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Scholarship Details</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <motion.div 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border gap-4"
                          whileHover={{ y: -2, transition: { duration: 0.2 } }}
                        >
                          <div className="flex items-center gap-3">
                            <DollarSignIcon className="h-6 w-6 text-green-500" />
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground">Award Amount</h4>
                              <p className="font-semibold text-lg">${scholarship.per_student_budget.toLocaleString()}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="font-medium py-1.5">
                            {scholarship.academic_year}
                          </Badge>
                        </motion.div>
                        
                        <motion.div 
                          className="p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border border-primary/20 gap-3"
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                              <BookOpenIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-primary/80 mb-1">About This Scholarship</h4>
                              <p className="text-sm">{scholarship.description || "This is a scholarship program offered for eligible students during the specified academic year."}</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    variants={itemVariants}
                    className="group relative overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700"></div>
                    <div className="p-6 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileTextIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium">Application Status</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <motion.div 
                          className="flex flex-col p-4 rounded-xl"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          style={{
                            backgroundColor: 
                              ['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified'].includes(application.status) 
                                ? 'rgba(34, 197, 94, 0.1)' // green
                                : ['documents_rejected', 'rejected'].includes(application.status) 
                                  ? 'rgba(239, 68, 68, 0.1)' // red
                                  : 'rgba(59, 130, 246, 0.1)', // blue
                            borderColor: 
                              ['completed', 'disbursement_processed', 'service_completed', 'documents_approved', 'eligibility_verified'].includes(application.status) 
                                ? 'rgba(34, 197, 94, 0.2)' 
                                : ['documents_rejected', 'rejected'].includes(application.status) 
                                  ? 'rgba(239, 68, 68, 0.2)' 
                                  : 'rgba(59, 130, 246, 0.2)',
                          }}
                          className="border"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(application.status)}
                            <p className="font-semibold">{formatStatus(application.status)}</p>
                          </div>
                          <p className="text-sm">{getStatusDescription(application.status)}</p>
                        </motion.div>
                        
                        {(application.submitted_at || application.reviewed_at) && (
                          <div className="border-t border-border mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {application.submitted_at && (
                              <motion.div 
                                className="flex items-start gap-3"
                                whileHover={{ x: 2 }}
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-500/20">
                                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Submission Date</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <div>
                                  <h4 className="text-xs font-medium text-muted-foreground">Submitted</h4>
                                  <p className="font-medium">{new Date(application.submitted_at).toLocaleDateString(undefined, { 
                                    year: 'numeric', month: 'short', day: 'numeric' 
                                  })}</p>
                                </div>
                              </motion.div>
                            )}
                            
                            {application.reviewed_at && (
                              <motion.div 
                                className="flex items-start gap-3"
                                whileHover={{ x: 2 }}
                              >
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-500/20">
                                        <CheckIcon className="h-4 w-4 text-green-500" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Review Date</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                                <div>
                                  <h4 className="text-xs font-medium text-muted-foreground">Reviewed</h4>
                                  <p className="font-medium">{new Date(application.reviewed_at).toLocaleDateString(undefined, { 
                                    year: 'numeric', month: 'short', day: 'numeric' 
                                  })}</p>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {application.admin_notes && (
                        <motion.div 
                          className="mt-6 pt-4 border-t border-border"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-500/20 flex-shrink-0 mt-0.5">
                              <HelpCircleIcon className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium mb-1">Admin Notes</h4>
                              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                                <p className="text-sm">{application.admin_notes}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    {application.status === 'enrolled' && (
                      <div className="px-6 pb-6 mt-2">
                        <Button asChild className="w-full" size="lg">
                          <Link href={route('student.community-service.create', application.id)}>
                            <FileTextIcon className="h-4 w-4 mr-2" />
                            Submit Community Service Report
                          </Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                </div>
        
              </TabsContent>
          
              <TabsContent value="documents" className="space-y-6">
                {/* Document Uploads Card with modern UI */}
                <motion.div variants={itemVariants}>
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full mt-0.5">
                        <FileTextIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {application.status === 'draft' ? (
                            'Complete Your Application'
                          ) : application.status === 'submitted' || application.status === 'documents_pending' ? (
                            'Documents Awaiting Review'
                          ) : application.status === 'documents_under_review' ? (
                            'Documents Under Review'
                          ) : application.status === 'documents_rejected' ? (
                            'Document Issues Found'
                          ) : (
                            'Documents Processed'
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {application.status === 'draft' ? (
                            'Upload all required documents below to submit your application.'
                          ) : application.status === 'submitted' || application.status === 'documents_pending' ? (
                            'Your documents are waiting for our team to review them.'
                          ) : application.status === 'documents_under_review' ? (
                            'Our team is currently reviewing your submitted documents.'
                          ) : application.status === 'documents_rejected' ? (
                            'One or more documents need your attention. Please check them below.'
                          ) : (
                            'All your documents have been processed successfully.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    {documentUploads.map(({ requirement, upload }, index) => (
                      <motion.div 
                        key={requirement.id} 
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: 0.1 * index }}
                        className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                        whileHover={{ y: -2 }}
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <FileIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-base">{requirement.name}</h3>
                                  <p className="text-xs text-muted-foreground">{requirement.description}</p>
                                </div>
                              </div>
                              
                              {/* Status Badge with enhanced visualization */}
                              {upload && (
                                <div className="mt-4 p-3 rounded-lg" style={{
                                  backgroundColor: 
                                    ['completed', 'approved', 'documents_approved'].includes(upload.status) 
                                      ? 'rgba(34, 197, 94, 0.1)' // green
                                      : ['rejected', 'documents_rejected', 'rejected_invalid', 'rejected_incomplete', 'rejected_incorrect_format', 'rejected_unreadable', 'rejected_other'].includes(upload.status) 
                                        ? 'rgba(239, 68, 68, 0.1)' // red
                                        : 'rgba(59, 130, 246, 0.1)', // blue
                                  borderColor: 
                                    ['completed', 'approved', 'documents_approved'].includes(upload.status) 
                                      ? 'rgba(34, 197, 94, 0.2)' 
                                      : ['rejected', 'documents_rejected', 'rejected_invalid', 'rejected_incomplete', 'rejected_incorrect_format', 'rejected_unreadable', 'rejected_other'].includes(upload.status) 
                                        ? 'rgba(239, 68, 68, 0.2)' 
                                        : 'rgba(59, 130, 246, 0.2)',
                                }} className="border">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <div className="flex items-center gap-1.5">
                                      {getStatusIcon(upload.status)}
                                      <Badge variant={getStatusBadgeVariant(upload.status) as any} className="px-2.5 py-1">
                                        {formatStatus(upload.status)}
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      Uploaded on {new Date(upload.uploaded_at).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              )}
                              
                              {upload?.rejection_reason && (
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-3 p-3 bg-destructive/10 rounded-md border border-destructive/20 text-sm text-destructive"
                                >
                                  <div className="flex items-start gap-2">
                                    <AlertCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-medium">Rejection Reason:</span>
                                      <p className="mt-1">{upload.rejection_reason}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                              
                              {/* Show file name if uploaded */}
                              {upload?.original_filename && (
                                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-muted">
                                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div>
                                      <span className="text-xs text-muted-foreground">File Name:</span>
                                      <p className="font-medium text-sm">{upload.original_filename}</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Upload Button/Form */}
                            {(application.status === 'draft' || application.status === 'documents_rejected') && (
                              <div className="flex-shrink-0">
                                <DocumentUploadForm 
                                  applicationId={application.id}
                                  requirementId={requirement.id}
                                  isActive={activeUploadId === requirement.id}
                                  onActiveChange={(isActive) => setActiveUploadId(isActive ? requirement.id : null)}
                                  existingFileName={upload?.original_filename}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {canSubmit && (
                    <motion.div 
                      className="mt-8 pt-6 border-t border-border"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="w-full rounded-xl border border-primary/30 bg-gradient-to-r from-primary/5 to-transparent p-5 mb-6">
                        <div className="flex items-start gap-4">
                          <div className="rounded-full p-3 bg-primary/10">
                            <CheckCircleIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-lg mb-1">Ready to Submit</h4>
                            <p className="text-muted-foreground">
                              Please review all your documents before submitting. Once submitted, your application will be reviewed by our team.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex justify-center"
                      >
                        <Button 
                          onClick={submitApplication} 
                          className="px-8 py-6 text-lg shadow-md" 
                          size="lg"
                        >
                          <ArrowUpIcon className="h-5 w-5 mr-2" />
                          Submit Application
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
          
              <TabsContent value="timeline" className="space-y-6">
                {/* Application Timeline Card - Animated & Visual */}
                <motion.div variants={itemVariants}>
                  <div className="mb-5 flex justify-center">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 text-sm rounded-full">
                      <ClockIcon className="h-3.5 w-3.5 mr-1.5" />
                      Application Progress Timeline
                    </Badge>
                  </div>
                  
                  <div className="relative max-w-3xl mx-auto bg-card/50 rounded-2xl border border-border p-6 shadow-sm">
                    <div className="relative border-l-2 border-primary/30 ml-6 pl-8 py-2 space-y-12">
                      {/* Step 1: Created */}
                      <motion.div 
                        className="relative" 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className={cn(
                          "absolute -left-[44px] w-10 h-10 flex items-center justify-center rounded-full shadow-md",
                          application.status === 'draft' 
                            ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/20" 
                            : "bg-primary/10 text-primary"
                        )}>
                          <FileTextIcon className="h-5 w-5" />
                        </div>
                        <div className={cn(
                          "rounded-xl p-4",
                          application.status === 'draft' ? "bg-primary/5 border border-primary/20" : ""  
                        )}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">Application Started</h3>
                            {application.status === 'draft' && (
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Current Step</Badge>
                            )}  
                          </div>
                          <p className="text-muted-foreground mt-1">
                            Your application has been created and is waiting for you to upload required documents.
                          </p>
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                            {new Date(application.created_at).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'short', day: 'numeric'
                            })}
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Step 2: Submitted */}
                      <motion.div 
                        className="relative" 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className={cn(
                          "absolute -left-[44px] w-10 h-10 flex items-center justify-center rounded-full shadow-md",
                          ['submitted', 'documents_pending', 'documents_under_review', 'documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(application.status) 
                            ? "bg-gradient-to-br from-primary to-blue-600 text-white ring-4 ring-primary/20" 
                            : application.status === 'documents_rejected' 
                              ? "bg-gradient-to-br from-red-500 to-red-600 text-white ring-4 ring-red-500/20" 
                              : "bg-muted/80 text-muted-foreground"
                        )}>
                          <ArrowUpIcon className="h-5 w-5" />
                        </div>
                        <div className={cn(
                          "rounded-xl p-4",
                          ['submitted', 'documents_pending'].includes(application.status) 
                            ? "bg-primary/5 border border-primary/20" 
                            : application.status === 'documents_rejected' 
                              ? "bg-red-500/5 border border-red-500/20" 
                              : ""
                        )}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">Documents Submitted</h3>
                            {['submitted', 'documents_pending'].includes(application.status) && (
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Current Step</Badge>
                            )}
                            {application.status === 'documents_rejected' && (
                              <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20">Action Needed</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {application.submitted_at 
                              ? "All required documents have been submitted and are awaiting review by our team." 
                              : "This step is pending completion of document uploads."}
                          </p>
                          {application.submitted_at && (
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                              {new Date(application.submitted_at).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Step 3: Documents Reviewed */}
                      <motion.div 
                        className="relative" 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className={cn(
                          "absolute -left-[44px] w-10 h-10 flex items-center justify-center rounded-full shadow-md",
                          ['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(application.status) 
                            ? "bg-gradient-to-br from-green-500 to-green-600 text-white ring-4 ring-green-500/20" 
                            : application.status === 'documents_under_review' 
                              ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white ring-4 ring-amber-500/20" 
                              : "bg-muted/80 text-muted-foreground"
                        )}>
                          <CheckCircleIcon className="h-5 w-5" />
                        </div>
                        <div className={cn(
                          "rounded-xl p-4",
                          application.status === 'documents_under_review' 
                            ? "bg-amber-500/5 border border-amber-500/20" 
                            : ['documents_approved', 'eligibility_verified'].includes(application.status) 
                              ? "bg-green-500/5 border border-green-500/20" 
                              : ""
                        )}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">Document Review</h3>
                            {application.status === 'documents_under_review' && (
                              <Badge variant="outline" className="bg-amber-500/5 text-amber-500 border-amber-500/20">In Progress</Badge>
                            )}
                            {['documents_approved', 'eligibility_verified'].includes(application.status) && (
                              <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20">Completed</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {['documents_approved', 'eligibility_verified', 'enrolled', 'service_pending', 'service_completed', 'disbursement_pending', 'disbursement_processed', 'completed'].includes(application.status) 
                              ? "All your documents have been reviewed and approved!" 
                              : application.status === 'documents_under_review' 
                                ? "Your documents are currently being reviewed by our team." 
                                : "This step will occur after documents are submitted."}
                          </p>
                          {application.reviewed_at && (
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-green-500/70" />
                              {new Date(application.reviewed_at).toLocaleDateString(undefined, {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                      
                      {/* Step 4: Final Award */}
                      <motion.div 
                        className="relative" 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className={cn(
                          "absolute -left-[44px] w-10 h-10 flex items-center justify-center rounded-full shadow-md",
                          ['completed', 'disbursement_processed'].includes(application.status) 
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white ring-4 ring-green-500/20" 
                            : "bg-muted/80 text-muted-foreground"
                        )}>
                          <DollarSignIcon className="h-5 w-5" />
                        </div>
                        <div className={cn(
                          "rounded-xl p-4",
                          ['completed', 'disbursement_processed'].includes(application.status) 
                            ? "bg-green-500/5 border border-green-500/20" 
                            : ""
                        )}>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-lg">Scholarship Awarded</h3>
                            {['completed', 'disbursement_processed'].includes(application.status) && (
                              <Badge variant="outline" className="bg-green-500/5 text-green-500 border-green-500/20">Complete</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {['completed', 'disbursement_processed'].includes(application.status) 
                              ? "Congratulations! Your scholarship has been awarded and funds disbursed." 
                              : "This is the final step in your scholarship application process."}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Animated decoration element */}
                  <div className="relative h-24 mt-8 overflow-hidden">
                    <div className="absolute w-full opacity-10">
                      <svg className="w-full" viewBox="0 0 1440 100" xmlns="http://www.w3.org/2000/svg">
                        <motion.path 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.5, duration: 2, ease: "easeInOut" }}
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="4"
                          strokeDasharray="10,20"
                          d="M0,32L60,26.7C120,21,240,11,360,21.3C480,32,600,64,720,64C840,64,960,32,1080,21.3C1200,11,1320,21,1380,26.7L1440,32L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </TooltipProvider>
    </AppLayout>
  );
}

interface DocumentUploadFormProps {
  applicationId: number;
  requirementId: number;
  isActive: boolean;
  onActiveChange: (isActive: boolean) => void;
  existingFileName: string | undefined;
}

function DocumentUploadForm({ 
  applicationId, 
  requirementId, 
  isActive, 
  onActiveChange,
  existingFileName 
}: DocumentUploadFormProps) {
  const { data, setData, post, processing, progress } = useForm({
    document_requirement_id: requirementId,
    document: null as File | null,
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setData('document', e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('student.applications.documents.upload', applicationId), {
      onSuccess: () => {
        onActiveChange(false);
      },
    });
  };
  
  if (!isActive) {
    return (
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button 
          variant="outline" 
          onClick={() => onActiveChange(true)}
          className="flex items-center gap-2 shadow-sm"
          size="sm"
        >
          <ArrowUpIcon className="h-4 w-4" />
          {existingFileName ? 'Replace Document' : 'Upload Document'}
        </Button>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <form onSubmit={handleSubmit} className="w-full sm:w-auto rounded-xl border border-border p-5 bg-card shadow-sm">
        <div className="space-y-4">
          <motion.div 
            className="space-y-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Label htmlFor={`document-${requirementId}`} className="font-medium flex items-center gap-1.5">
              <FileIcon className="h-3.5 w-3.5 text-primary" />
              Select File to Upload
            </Label>
            <div className="relative mt-1.5">
              <Input
                id={`document-${requirementId}`}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                disabled={processing}
                required
                className="bg-card/50 border-primary/20 cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1.5 italic">
              <FileIcon className="h-3 w-3 text-muted-foreground/70" />
              Accepts PDF, JPG, JPEG, or PNG files (maximum 10MB)
            </p>
          </motion.div>
          
          {progress && (
            <motion.div 
              className="w-full mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="mb-1.5 flex justify-between items-center text-xs">
                <span className="text-primary font-medium">Uploading...</span>
                <span className="text-muted-foreground">{Math.round(progress.percentage)}% complete</span>
              </div>
              <div className="w-full bg-muted/70 rounded-full h-2.5 overflow-hidden">
                <motion.div 
                  className="bg-primary h-full rounded-full relative overflow-hidden" 
                  style={{ width: `${progress.percentage}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.percentage}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent animate-shimmer"></div>
                </motion.div>
              </div>
            </motion.div>
          )}
          
          <motion.div 
            className="flex items-center gap-3 pt-2"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              type="submit" 
              disabled={processing || !data.document}
              className="flex items-center gap-1.5 shadow-sm"
              size="default"
            >
              {processing ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block mr-1"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <ArrowUpIcon className="h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onActiveChange(false)}
              disabled={processing}
              size="sm"
              className="text-sm"
            >
              Cancel
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  );
}