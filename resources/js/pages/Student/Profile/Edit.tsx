import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'sonner';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, StudentProfile, SchoolData } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// @ts-ignore - Disable implicit any errors for this file
import {
    User, Home, School, Phone, MapPin, Mail, BookOpen,
    GraduationCap, Building, Save, AlertCircle, CheckCircle, HelpCircle, Search, X
} from 'lucide-react';

interface ProfileProps {
    profile: StudentProfile | null;
    allSchoolData: SchoolData[];
}

export default function Edit({ profile, allSchoolData }: ProfileProps) {
    const [activeTab, setActiveTab] = useState<string>('personal');
    const [formProgress, setFormProgress] = useState<number>(0);
    const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false);
    const [schoolSearchValue, setSchoolSearchValue] = useState(profile?.school_name || '');
    const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);

    const { data, setData, patch, errors, processing, reset } = useForm({
        id: profile?.id || 0,
        user_id: profile?.user_id || 0,
        address: profile?.address || '',
        city: profile?.city || '',
        state: profile?.state || '',
        zip_code: profile?.zip_code || '',
        phone_number: profile?.phone_number || '',
        school_type: profile?.school_type || 'high_school',
        school_level: profile?.school_level || '',
        school_name: profile?.school_name || '',
    });

    // Calculate form completion progress
    useEffect(() => {
        // Count filled fields (exclude id and user_id)
        const totalFields = 8; // Total number of form fields
        let filledFields = 0;

        if (data.address) filledFields++;
        if (data.city) filledFields++;
        if (data.state) filledFields++;
        if (data.zip_code) filledFields++;
        if (data.phone_number) filledFields++;
        if (data.school_type) filledFields++;
        if (data.school_level) filledFields++;
        if (data.school_name) filledFields++;

        const progress = Math.round((filledFields / totalFields) * 100);

        setFormProgress(progress);
    }, [data]);

    // Update schoolSearchValue when profile.school_name changes (e.g. after form submission)
    useEffect(() => {
        if (profile?.school_name) {
            setSchoolSearchValue(profile.school_name);
        }
    }, [profile?.school_name]);

    // Filter schools based on search input and school type
    useEffect(() => {
        if (schoolSearchValue.length >= 2) {
            const filtered = allSchoolData
                .filter(school =>
                    school.school_type === data.school_type &&
                    school.school_name.toLowerCase().includes(schoolSearchValue.toLowerCase())
                )
                .slice(0, 8); // Limit to 8 suggestions for mobile friendliness
            setFilteredSchools(filtered);
        } else {
            setFilteredSchools([]);
        }
    }, [schoolSearchValue, data.school_type, allSchoolData]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        toast.promise(
            new Promise<void>((resolve, reject) => {
                patch(route('student.profile.update'), {
                    onSuccess: () => resolve(),
                    onError: () => reject(),
                });
            }),
            {
                loading: 'Saving your profile information...',
                success: 'Your profile has been updated successfully!',
                error: 'There was a problem saving your information. Please try again.',
            }
        );
    }

    // Different options based on school type
    const schoolLevelOptions = data.school_type === 'high_school'
        ? ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
        : ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Student Dashboard', href: route('student.dashboard') },
        { title: 'My Profile' }
    ];

    // Animation variants for staggered animations
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
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

    // Function to render tooltip with help text
    const renderTooltip = (text: string) => (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="ml-1 cursor-help inline-flex">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                    </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                    <p className="text-xs">{text}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    // Get progress color based on completion percentage
    const getProgressColor = () => {
        if (formProgress >= 80) return 'bg-green-500';
        if (formProgress >= 50) return 'bg-blue-500';
        if (formProgress >= 25) return 'bg-amber-500';
        return 'bg-neutral-300';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Student Profile" />
            <Toaster position="top-right" richColors closeButton />

            <motion.div
                className="max-w-5xl mx-auto px-4 py-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Page header with progress */}
                <motion.div variants={itemVariants} className="mb-8">
                    <div className="bg-gradient-to-r from-primary/20 to-transparent rounded-xl p-6">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-2 mb-2">
                                <User className="h-5 w-5 text-primary" />
                                <h1 className="text-xl font-bold">Your Student Profile</h1>
                            </div>
                            <p className="text-muted-foreground mb-4">
                                Complete your profile information to help us match you with the right scholarships. Make sure all the details are accurate and up to date.
                            </p>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Profile Completion</span>
                                    <Badge variant="outline" className="text-xs font-normal">
                                        {formProgress}% Complete
                                    </Badge>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full ${getProgressColor()}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${formProgress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-7 gap-6">

                        {/* Sidebar with navigation tabs */}
                        <motion.div variants={itemVariants} className="md:col-span-2">
                            <div className="sticky top-6">
                                <Card>
                                    <CardContent className="p-3">
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <TabsList className="flex flex-col space-y-1 h-auto">
                                                <TabsTrigger
                                                    value="personal"
                                                    className="w-full justify-start px-3 py-2 h-auto"
                                                >
                                                    <div className="flex items-center gap-2 text-left">
                                                        <Home className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">Contact Info</div>
                                                            <div className="text-xs text-muted-foreground">Address & Phone</div>
                                                        </div>
                                                    </div>
                                                </TabsTrigger>

                                                <TabsTrigger
                                                    value="education"
                                                    className="w-full justify-start px-3 py-2 h-auto"
                                                >
                                                    <div className="flex items-center gap-2 text-left">
                                                        <School className="h-4 w-4" />
                                                        <div>
                                                            <div className="font-medium">Education</div>
                                                            <div className="text-xs text-muted-foreground">School & Grade Level</div>
                                                        </div>
                                                    </div>
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>

                                        {/* Tips section */}
                                        <div className="mt-6 bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 border border-amber-100 dark:border-amber-800/30">
                                            <div className="flex gap-2">
                                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-300">Why this matters</h3>
                                                    <p className="text-xs text-amber-700 dark:text-amber-400">
                                                        Keeping your profile updated helps qualify you for more scholarship opportunities in the Philippines. Many scholarships have specific eligibility requirements based on your location and educational institution.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>

                        {/* Main content area */}
                        <motion.div variants={itemVariants} className="md:col-span-5 space-y-6 mb-22">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                {/* Personal Information Tab */}
                                <TabsContent value="personal" className="space-y-4 mt-0">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-2">
                                                <Home className="h-5 w-5 text-primary/70" />
                                                <CardTitle className="text-lg">Contact Information</CardTitle>
                                            </div>
                                            <CardDescription>
                                                Where can we reach you? This information may be shared with scholarship providers.
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="address" className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                        Street Address
                                                        {renderTooltip('Enter your full street address including barangay and subdivision if applicable.')}
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        placeholder="123 Rizal Avenue, Brgy. San Miguel"
                                                        required
                                                    />
                                                    {errors.address && (
                                                        <div className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {errors.address}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="city" className="flex items-center gap-1.5">
                                                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                                                        City/Municipality
                                                        {renderTooltip('Select your city or municipality')}
                                                    </Label>
                                                    <Input
                                                        id="city"
                                                        value={data.city}
                                                        onChange={(e) => setData('city', e.target.value)}
                                                        placeholder="Select city/municipality"
                                                        required
                                                    />
                                                    {errors.city && (
                                                        <div className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {errors.city}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="state" className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                        Province
                                                        {renderTooltip('Select your province in the Philippines')}
                                                    </Label>
                                                    <Input
                                                        id="state"
                                                        value={data.state}
                                                        onChange={(e) => setData('state', e.target.value)}
                                                        placeholder="Select province (e.g. Benguet, Cebu, Davao)"
                                                        required
                                                    />
                                                    {errors.state && (
                                                        <div className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {errors.state}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="zip_code" className="flex items-center gap-1.5">
                                                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                        Zip Code
                                                    </Label>
                                                    <Input
                                                        id="zip_code"
                                                        value={data.zip_code}
                                                        onChange={(e) => setData('zip_code', e.target.value)}
                                                        placeholder="1000"
                                                        required
                                                    />
                                                    {errors.zip_code && (
                                                        <div className="text-sm text-red-500 flex items-center gap-1">
                                                            <AlertCircle className="h-3.5 w-3.5" />
                                                            {errors.zip_code}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="phone_number" className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                    Phone Number
                                                    {renderTooltip('A mobile number where scholarship providers can contact you. Use format +63 or 09XX for Philippine numbers.')}
                                                </Label>
                                                <Input
                                                    id="phone_number"
                                                    value={data.phone_number}
                                                    onChange={e => setData('phone_number', e.target.value)}
                                                    placeholder="+63 9123456789"
                                                    required
                                                />
                                                {errors.phone_number && (
                                                    <div className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        {errors.phone_number}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        type="button"
                                                        onClick={() => setActiveTab('education')}
                                                        className="flex items-center gap-1"
                                                    >
                                                        Next: Education
                                                        <School className="ml-1 h-4 w-4" />
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Educational Information Tab */}
                                <TabsContent value="education" className="space-y-4 mt-0">
                                    <Card>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="h-5 w-5 text-primary/70" />
                                                <CardTitle className="text-lg">Educational Information</CardTitle>
                                            </div>
                                            <CardDescription>
                                                Tell us about your current educational status. This helps match you with eligible scholarships.
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="school_type" className="flex items-center gap-1.5">
                                                    <School className="h-3.5 w-3.5 text-muted-foreground" />
                                                    School Type
                                                    {renderTooltip('Select whether you are currently attending high school or college.')}
                                                </Label>
                                                <Select
                                                    value={data.school_type}
                                                    onValueChange={(value: 'high_school' | 'college') => setData('school_type', value)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select school type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="high_school">Junior/Senior High School (Grades 7-12)</SelectItem>
                                                        <SelectItem value="college">College / University</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.school_type && (
                                                    <div className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        {errors.school_type}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="school_level" className="flex items-center gap-1.5">
                                                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {data.school_type === 'high_school' ? 'Grade Level' : 'Year Level'}
                                                    {renderTooltip(data.school_type === 'high_school' ?
                                                        'Your current grade level in K-12 (Grades 7-12)' :
                                                        'Your current year level in college/university (1st-6th Year)')}
                                                </Label>
                                                <Select
                                                    value={data.school_level}
                                                    onValueChange={(value) => setData('school_level', value)}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={data.school_type === 'high_school' ?
                                                            "Select your grade level" :
                                                            "Select your year level"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {schoolLevelOptions.map(level => (
                                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.school_level && (
                                                    <div className="text-sm text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        {errors.school_level}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="school_name" className="flex items-center gap-1.5">
                                                    <Building className="h-3.5 w-3.5 text-muted-foreground" />
                                                    School Name
                                                    {renderTooltip('Type your school name. We\'ll show suggestions if available, or you can enter the complete name manually.')}
                                                </Label>
                                                <div className="relative">
                                                    <div className="relative">
                                                        <Input
                                                            id="school_name"
                                                            value={schoolSearchValue}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setSchoolSearchValue(value);
                                                                setData('school_name', value);
                                                                setShowSchoolSuggestions(value.length >= 2);
                                                            }}
                                                            onFocus={() => {
                                                                if (schoolSearchValue.length >= 2) {
                                                                    setShowSchoolSuggestions(true);
                                                                }
                                                            }}
                                                            onBlur={() => {
                                                                // Delay hiding suggestions to allow clicking on them
                                                                setTimeout(() => setShowSchoolSuggestions(false), 200);
                                                            }}
                                                            placeholder="Type your school name..."
                                                            className="pr-8"
                                                            required
                                                        />
                                                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    </div>

                                                    {/* School suggestions dropdown */}
                                                    {showSchoolSuggestions && filteredSchools.length > 0 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                                                        >
                                                            <div className="p-2 text-xs text-muted-foreground border-b">
                                                                <div className="flex items-center gap-1">
                                                                    <School className="h-3 w-3" />
                                                                    Suggested schools
                                                                </div>
                                                            </div>
                                                            {filteredSchools.map((school, index) => (
                                                                <button
                                                                    key={`${school.school_name}-${index}`}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setSchoolSearchValue(school.school_name);
                                                                        setData('school_name', school.school_name);
                                                                        setShowSchoolSuggestions(false);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors border-b border-border last:border-b-0"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                                        <span className="truncate">{school.school_name}</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Helpful hint */}
                                                <div className="text-xs text-muted-foreground flex items-start gap-1.5 mt-2">
                                                    <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="font-medium">Can't find your school?</p>
                                                        <p>No problem! Just type the complete and official name of your school.
                                                            Make sure to include the full name as it appears on your enrollment documents
                                                            (e.g., "Ateneo de Manila University" not just "Ateneo").</p>
                                                    </div>
                                                </div>

                                                {errors.school_name && (
                                                    <div className="text-sm text-red-500 flex items-center gap-1 pt-1">
                                                        <AlertCircle className="h-3.5 w-3.5" />
                                                        {errors.school_name}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-4 flex items-center justify-between">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setActiveTab('personal')}
                                                    className="flex items-center gap-1.5"
                                                >
                                                    <Home className="h-4 w-4" />
                                                    Back to Contact Info
                                                </Button>

                                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                        {processing ? 'Saving...' : 'Save Profile'}
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>
                </form>
            </motion.div>
        </AppLayout>
    );
}