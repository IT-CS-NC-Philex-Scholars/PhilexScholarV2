import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompleteProfileModal } from '@/components/CompleteProfileModal';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, FileTextIcon, ClockIcon, CheckCircleIcon, AlertCircleIcon, 
         DollarSignIcon, SearchIcon, BookOpenIcon, AwardIcon, GraduationCapIcon, 
         ChevronRightIcon, StarIcon, School2Icon, FilterIcon, UsersIcon, TimerIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScholarshipIndexProps {
  scholarships: ScholarshipProgram[];
  existingApplicationIds: number[];
  hasProfile: boolean;
}

export default function Index({ scholarships, existingApplicationIds, hasProfile }: ScholarshipIndexProps) {
  const { auth } = usePage().props as any;
  const [loaded, setLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredScholarships, setFilteredScholarships] = useState<ScholarshipProgram[]>(scholarships);
  const [schoolTypeFilter, setSchoolTypeFilter] = useState<string>('all');
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  useEffect(() => {
    // Filter scholarships based on search term and school type
    const filtered = scholarships.filter(scholarship => {
      // Search filter
      const matchesSearch = searchTerm === '' || 
        scholarship.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scholarship.academic_year.toLowerCase().includes(searchTerm.toLowerCase());
      
      // School type filter
      const matchesSchoolType = schoolTypeFilter === 'all' || 
        scholarship.school_type_eligibility === schoolTypeFilter ||
        scholarship.school_type_eligibility === 'both';
      
      return matchesSearch && matchesSchoolType;
    });
    
    setFilteredScholarships(filtered);
  }, [searchTerm, schoolTypeFilter, scholarships]);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'Available Scholarships' }
  ];
  
  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 50, damping: 15 }
    }
  };
  
  // Calculate days left before deadline
  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const differenceInTime = deadlineDate.getTime() - today.getTime();
    const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));
    return differenceInDays;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Available Scholarships" />
      
      {/* Profile completion modal that automatically shows when hasProfile is false */}
      <CompleteProfileModal hasProfile={hasProfile} />
      
      <TooltipProvider>
        <motion.div 
          className="max-w-7xl mx-auto px-4 py-2"
          variants={containerVariants}
          initial="hidden"
          animate={loaded ? "visible" : "hidden"}
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground shadow-md">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCapIcon className="h-6 w-6" />
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Available Scholarships</h1>
                </div>
                <p className="text-primary-foreground/80 max-w-3xl">
                  Browse and apply for scholarship opportunities available to you. Find financial support for your academic journey.
                </p>
                
                {!hasProfile && (
                  <div className="mt-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <div className="flex items-start gap-3">
                      <AlertCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium">Complete Your Profile</h3>
                        <p className="text-sm text-primary-foreground/80">You need to complete your profile before you can apply for scholarships.</p>
                        <Button 
                          size="sm" 
                          className="mt-2 bg-white/20 hover:bg-white/30 text-white" 
                          onClick={() => document.getElementById('complete-profile-button')?.click()}
                        >
                          Complete Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* Filters & Search */}
          <motion.div variants={itemVariants} className="mb-5">
            <div className="p-4 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <SearchIcon className="h-3.5 w-3.5" />
                    Search Scholarships
                  </Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="search" 
                      placeholder="Search by name, description, semester..." 
                      className="pl-9" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-64">
                  <Label htmlFor="schoolType" className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <School2Icon className="h-3.5 w-3.5" />
                    School Type
                  </Label>
                  <Select value={schoolTypeFilter} onValueChange={setSchoolTypeFilter}>
                    <SelectTrigger id="schoolType">
                      <SelectValue placeholder="All School Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All School Types</SelectItem>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Search summary */}
              <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <FilterIcon className="h-3.5 w-3.5" />
                  <span>
                    Showing {filteredScholarships.length} of {scholarships.length} scholarships
                  </span>
                </div>
                
                {(searchTerm || schoolTypeFilter !== 'all') && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 px-2" 
                    onClick={() => {
                      setSearchTerm('');
                      setSchoolTypeFilter('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
          
          {filteredScholarships.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center text-center p-12 bg-card border border-border rounded-xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Scholarships Found</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                {searchTerm || schoolTypeFilter !== 'all' 
                  ? 'No scholarships match your current filters. Try adjusting your search criteria.'
                  : 'There are currently no scholarship programs available for your school type. Please check back later for new opportunities.'}
              </p>
              {(searchTerm || schoolTypeFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSchoolTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-22"
              variants={containerVariants}
            >
              {filteredScholarships.map((scholarship, index) => (
                <motion.div key={scholarship.id} variants={itemVariants} custom={index}>
                  <Card className="flex flex-col h-full overflow-hidden border-border hover:shadow-md transition-all duration-300">
                    {/* Card header with colored banner */}
                    <div className="h-2 w-full bg-primary"></div>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-1.5">
                        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {scholarship.name}
                        </CardTitle>
                        <Badge variant="outline" className="bg-muted/50">
                          {scholarship.school_type_eligibility === 'both' ? 'All Students' : 
                          scholarship.school_type_eligibility === 'high_school' ? 'High School' : 'College'}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {scholarship.semester} | {scholarship.academic_year}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-grow pb-0">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {scholarship.description || "This scholarship program provides financial assistance to eligible students meeting the specified criteria."}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-start gap-1.5">
                            <DollarSignIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-muted-foreground">Award Amount</div>
                              <div className="font-medium">${scholarship.per_student_budget.toLocaleString()}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-1.5">
                            <UsersIcon className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-muted-foreground">Available Slots</div>
                              <div className="font-medium">{scholarship.available_slots}</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-1.5">
                            <StarIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-muted-foreground">Minimum GPA</div>
                              <div className="font-medium">{scholarship.min_gpa}%</div>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-1.5">
                            <TimerIcon className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-muted-foreground">Required Service</div>
                              <div className="font-medium">{scholarship.community_service_days * 8} hours</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-1 pt-3 border-t border-border">
                          <div className="flex items-start gap-1.5">
                            <ClockIcon className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="text-xs text-muted-foreground">Application Deadline</div>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="font-medium">
                                      {new Date(scholarship.application_deadline).toLocaleDateString(undefined, {
                                        year: 'numeric', month: 'short', day: 'numeric'
                                      })}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
                                    <p className="text-xs">
                                      {getDaysUntilDeadline(scholarship.application_deadline) > 0 
                                        ? `${getDaysUntilDeadline(scholarship.application_deadline)} days remaining` 
                                        : 'Deadline has passed'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          
                          {getDaysUntilDeadline(scholarship.application_deadline) <= 7 && getDaysUntilDeadline(scholarship.application_deadline) > 0 && (
                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800 text-xs">
                              Closing Soon!
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="pt-6">
                      {existingApplicationIds.includes(scholarship.id) ? (
                        <div className="w-full p-2.5 bg-muted/50 rounded-lg border border-border flex items-center justify-center gap-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                          <span className="text-sm font-medium">Already Applied</span>
                        </div>
                      ) : !hasProfile ? (
                        <Button 
                          className="w-full"
                          onClick={() => document.getElementById('complete-profile-button')?.click()}
                        >
                          Complete Profile to Apply
                        </Button>
                      ) : (
                        <div className="w-full grid grid-cols-2 gap-2">
                          <Button asChild variant="outline">
                            <Link href={route('student.scholarships.show', scholarship.id)}>
                              <FileTextIcon className="h-4 w-4 mr-1.5" />
                              Details
                            </Link>
                          </Button>
                          <Button asChild>
                            <Link href={route('student.scholarships.show', scholarship.id)}>
                              <AwardIcon className="h-4 w-4 mr-1.5" />
                              Apply Now
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </TooltipProvider>
    </AppLayout>
  );
}