import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, CourseData, SchoolData, StudentProfile } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { toast, Toaster } from 'sonner';

import {
    BookOpen,
    Building,
    Check,
    CheckCircle2,
    ChevronsUpDown,
    GraduationCap,
    Home,
    MapPin,
    Phone,
    Save,
    School,
    Sparkles,
    User,
} from 'lucide-react';

interface ProfileProps {
    profile: StudentProfile | null;
    allSchoolData: SchoolData[];
    allCourseData: CourseData[];
}

export default function Edit({ profile, allSchoolData, allCourseData = [] }: ProfileProps) {
    const [activeTab, setActiveTab] = useState<string>('personal');
    const [formProgress, setFormProgress] = useState<number>(0);
    const [openSchoolCombobox, setOpenSchoolCombobox] = useState(false);
    const [openCourseCombobox, setOpenCourseCombobox] = useState(false);

    // For manual school entry if needed
    const [isManualSchool, setIsManualSchool] = useState(false);
    const [isManualCourse, setIsManualCourse] = useState(false);

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
        course: profile?.course || '',
    });

    // Calculate form completion progress
    useEffect(() => {
        const totalFields = 9;
        let filledFields = 0;

        if (data.address) filledFields++;
        if (data.city) filledFields++;
        if (data.state) filledFields++;
        if (data.zip_code) filledFields++;
        if (data.phone_number) filledFields++;
        if (data.school_type) filledFields++;
        if (data.school_level) filledFields++;
        if (data.school_name) filledFields++;
        if (data.school_type === 'college' && data.course) filledFields++;
        else if (data.school_type !== 'college') filledFields++; // Consider course optional/filled for non-college

        const progress = Math.round((filledFields / totalFields) * 100);
        setFormProgress(progress);
    }, [data]);

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
                loading: 'Saving your profile...',
                success: 'Profile updated successfully!',
                error: 'Failed to update profile. Please check the form.',
            },
        );
    }

    const schoolLevelOptions =
        data.school_type === 'high_school'
            ? ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
            : ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Student Dashboard', href: route('student.dashboard') }, { title: 'Edit Profile' }];

    const getProgressColor = () => {
        if (formProgress >= 100) return 'bg-emerald-500';
        if (formProgress >= 80) return 'bg-green-500';
        if (formProgress >= 50) return 'bg-blue-500';
        return 'bg-amber-500';
    };

    const getProgressMessage = () => {
        if (formProgress >= 100) return 'Excellent! Your profile is complete.';
        if (formProgress >= 80) return 'Almost there! Just a few more details.';
        if (formProgress >= 50) return 'Good start! Keep going.';
        return "Let's get your profile set up.";
    };

    // Filter schools for combobox
    const filteredSchools = allSchoolData.filter((s) => s.school_type === data.school_type);
    const filteredCourses = allCourseData || [];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Student Profile" />
            <Toaster position="top-right" richColors closeButton />

            <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="from-primary/90 to-primary/70 text-primary-foreground relative overflow-hidden rounded-2xl bg-gradient-to-br shadow-xl"
                >
                    <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
                    <div className="relative flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-10">
                        <div className="max-w-xl space-y-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="border-0 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30">
                                    <Sparkles className="mr-1 h-3 w-3" />
                                    Student Profile
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Tell us about yourself</h1>
                            <p className="text-primary-foreground/80 text-lg">
                                Complete your profile to unlock personalized scholarship matches and opportunities.
                            </p>
                        </div>

                        <div className="w-full rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-md md:w-64">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-sm font-medium">Profile Strength</span>
                                <span className="text-sm font-bold">{formProgress}%</span>
                            </div>
                            <Progress
                                value={formProgress}
                                className="h-2 bg-white/20"
                                indicatorClassName={cn('bg-white transition-all duration-1000')}
                            />
                            <p className="mt-2 text-xs text-white/70">{getProgressMessage()}</p>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="bg-muted/50 grid h-auto w-full grid-cols-2 rounded-xl p-1">
                            <TabsTrigger
                                value="personal"
                                className="data-[state=active]:bg-background data-[state=active]:text-primary rounded-lg py-3 text-sm font-medium transition-all data-[state=active]:shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>Personal Information</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="education"
                                className="data-[state=active]:bg-background data-[state=active]:text-primary rounded-lg py-3 text-sm font-medium transition-all data-[state=active]:shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>Education Details</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>

                        <AnimatePresence mode="wait">
                            {activeTab === 'personal' && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="overflow-hidden border shadow-sm">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Home className="text-primary h-5 w-5" />
                                                Contact Details
                                            </CardTitle>
                                            <CardDescription>
                                                Where can we reach you? This information helps us verify your residency.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid gap-6 p-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Street Address</Label>
                                                <div className="relative">
                                                    <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                                    <Input
                                                        id="address"
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        className="pl-9"
                                                        placeholder="House No., Street Name, Subdivision, Barangay"
                                                    />
                                                </div>
                                                {errors.address && <p className="text-xs text-red-500">{errors.address}</p>}
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">City / Municipality</Label>
                                                    <div className="relative">
                                                        <Building className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                                        <Input
                                                            id="city"
                                                            value={data.city}
                                                            onChange={(e) => setData('city', e.target.value)}
                                                            className="pl-9"
                                                            placeholder="Enter city"
                                                        />
                                                    </div>
                                                    {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">Province</Label>
                                                    <Input
                                                        id="state"
                                                        value={data.state}
                                                        onChange={(e) => setData('state', e.target.value)}
                                                        placeholder="Enter province"
                                                    />
                                                    {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
                                                </div>
                                            </div>

                                            <div className="grid gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="zip_code">Zip Code</Label>
                                                    <Input
                                                        id="zip_code"
                                                        value={data.zip_code}
                                                        onChange={(e) => setData('zip_code', e.target.value)}
                                                        placeholder="e.g. 1000"
                                                    />
                                                    {errors.zip_code && <p className="text-xs text-red-500">{errors.zip_code}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone_number">Mobile Number</Label>
                                                    <div className="relative">
                                                        <Phone className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                                                        <Input
                                                            id="phone_number"
                                                            value={data.phone_number}
                                                            onChange={(e) => setData('phone_number', e.target.value)}
                                                            className="pl-9"
                                                            placeholder="0912 345 6789"
                                                        />
                                                    </div>
                                                    {errors.phone_number && <p className="text-xs text-red-500">{errors.phone_number}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="bg-muted/30 flex items-center justify-between py-4">
                                            <p className="text-muted-foreground text-xs">
                                                <span className="text-red-500">*</span> All fields are required
                                            </p>
                                            <Button type="button" onClick={() => setActiveTab('education')} variant="default">
                                                Next Step
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            )}

                            {activeTab === 'education' && (
                                <motion.div
                                    key="education"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="overflow-hidden border shadow-sm">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <School className="text-primary h-5 w-5" />
                                                Education Details
                                            </CardTitle>
                                            <CardDescription>Tell us about your current educational status.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-8 p-6">
                                            {/* School Type Selection */}
                                            <div className="space-y-3">
                                                <Label className="text-base">Current Level</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div
                                                        onClick={() => setData('school_type', 'high_school')}
                                                        className={cn(
                                                            'hover:bg-muted/50 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                                                            data.school_type === 'high_school'
                                                                ? 'border-primary bg-primary/5 ring-primary/20 ring-1'
                                                                : 'border-muted bg-background hover:border-primary/50',
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'rounded-full p-2',
                                                                data.school_type === 'high_school'
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted',
                                                            )}
                                                        >
                                                            <BookOpen className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">High School</p>
                                                            <p className="text-muted-foreground text-xs">Junior / Senior High</p>
                                                        </div>
                                                        {data.school_type === 'high_school' && (
                                                            <div className="text-primary absolute top-2 right-2">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div
                                                        onClick={() => setData('school_type', 'college')}
                                                        className={cn(
                                                            'hover:bg-muted/50 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                                                            data.school_type === 'college'
                                                                ? 'border-primary bg-primary/5 ring-primary/20 ring-1'
                                                                : 'border-muted bg-background hover:border-primary/50',
                                                        )}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'rounded-full p-2',
                                                                data.school_type === 'college' ? 'bg-primary text-primary-foreground' : 'bg-muted',
                                                            )}
                                                        >
                                                            <GraduationCap className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">College</p>
                                                            <p className="text-muted-foreground text-xs">University / College</p>
                                                        </div>
                                                        {data.school_type === 'college' && (
                                                            <div className="text-primary absolute top-2 right-2">
                                                                <CheckCircle2 className="h-4 w-4" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* School Selection */}
                                            <div className="space-y-2">
                                                <Label>School Name</Label>
                                                <Popover open={openSchoolCombobox} onOpenChange={setOpenSchoolCombobox}>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openSchoolCombobox}
                                                            className="h-12 w-full justify-between text-left font-normal"
                                                        >
                                                            {data.school_name ? (
                                                                <span className="flex items-center gap-2">
                                                                    <School className="text-muted-foreground h-4 w-4" />
                                                                    {data.school_name}
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground">Select your school...</span>
                                                            )}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                        <Command>
                                                            <CommandInput placeholder="Search school..." />
                                                            <CommandList>
                                                                <CommandEmpty>
                                                                    <div className="p-4 text-center">
                                                                        <p className="text-muted-foreground mb-2 text-sm">School not found?</p>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => {
                                                                                setOpenSchoolCombobox(false);
                                                                                // Ideally we would focus an input here, but for now user can just type in the original input if we allowed it.
                                                                                // Since we are replacing the input with this combobox, we need a way to set custom value.
                                                                                // Let's just use the current search value as the school name if they click this.
                                                                                // But CommandInput value isn't easily accessible.
                                                                                // Let's simpler approach: Just allow selecting from list.
                                                                                // If we want manual entry, we can add a "Other" option or similar.
                                                                                // For now, let's assume the list is comprehensive or allow a fallback.
                                                                                toast.info('Please contact support if your school is not listed.');
                                                                            }}
                                                                        >
                                                                            Request to add school
                                                                        </Button>
                                                                    </div>
                                                                </CommandEmpty>
                                                                <CommandGroup>
                                                                    {filteredSchools.map((school) => (
                                                                        <CommandItem
                                                                            key={school.id}
                                                                            value={school.school_name}
                                                                            onSelect={() => {
                                                                                setData('school_name', school.school_name);
                                                                                setOpenSchoolCombobox(false);
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    'mr-2 h-4 w-4',
                                                                                    data.school_name === school.school_name
                                                                                        ? 'opacity-100'
                                                                                        : 'opacity-0',
                                                                                )}
                                                                            />
                                                                            {school.school_name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                {/* Fallback text input if they can't find it - actually let's just add a small note or toggle */}
                                                <div className="text-muted-foreground flex justify-between px-1 text-xs">
                                                    <span>Select from the list</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsManualSchool(!isManualSchool)}
                                                        className="text-primary hover:underline"
                                                    >
                                                        Can't find your school?
                                                    </button>
                                                </div>

                                                {isManualSchool && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="mt-2"
                                                    >
                                                        <Label className="mb-1.5 block text-xs">Enter School Name Manually</Label>
                                                        <Input
                                                            value={data.school_name}
                                                            onChange={(e) => setData('school_name', e.target.value)}
                                                            placeholder="Type your school name here..."
                                                            className="border-amber-200 bg-amber-50 dark:bg-amber-950/10"
                                                        />
                                                    </motion.div>
                                                )}

                                                {errors.school_name && <p className="text-xs text-red-500">{errors.school_name}</p>}
                                            </div>

                                            {/* Grade/Year Level */}
                                            <div className="space-y-2">
                                                <Label>Grade / Year Level</Label>
                                                <Select value={data.school_level} onValueChange={(value) => setData('school_level', value)}>
                                                    <SelectTrigger className="h-12">
                                                        <SelectValue placeholder="Select level" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {schoolLevelOptions.map((option) => (
                                                            <SelectItem key={option} value={option}>
                                                                {option}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.school_level && <p className="text-xs text-red-500">{errors.school_level}</p>}
                                            </div>

                                            {data.school_type === 'college' && (
                                                <div className="space-y-2">
                                                    <Label>Course / Degree Program</Label>
                                                    <Popover open={openCourseCombobox} onOpenChange={setOpenCourseCombobox}>
                                                        <PopoverTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                aria-expanded={openCourseCombobox}
                                                                className="h-12 w-full justify-between text-left font-normal"
                                                            >
                                                                {data.course ? (
                                                                    <span className="flex items-center gap-2">
                                                                        <BookOpen className="text-muted-foreground h-4 w-4" />
                                                                        {data.course}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground">Select your course...</span>
                                                                )}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                            <Command>
                                                                <CommandInput placeholder="Search course..." />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        <div className="p-4 text-center">
                                                                            <p className="text-muted-foreground mb-2 text-sm">Course not found?</p>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => {
                                                                                    setOpenCourseCombobox(false);
                                                                                    setIsManualCourse(true);
                                                                                }}
                                                                            >
                                                                                Request to add course
                                                                            </Button>
                                                                        </div>
                                                                    </CommandEmpty>
                                                                    <CommandGroup>
                                                                        {filteredCourses.map((item) => (
                                                                            <CommandItem
                                                                                key={item.course}
                                                                                value={item.course}
                                                                                onSelect={() => {
                                                                                    setData('course', item.course);
                                                                                    setOpenCourseCombobox(false);
                                                                                }}
                                                                            >
                                                                                <Check
                                                                                    className={cn(
                                                                                        'mr-2 h-4 w-4',
                                                                                        data.course === item.course ? 'opacity-100' : 'opacity-0',
                                                                                    )}
                                                                                />
                                                                                {item.course}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>

                                                    <div className="text-muted-foreground flex justify-between px-1 text-xs">
                                                        <span>Select from the list</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsManualCourse(!isManualCourse)}
                                                            className="text-primary hover:underline"
                                                        >
                                                            Can't find your course?
                                                        </button>
                                                    </div>

                                                    {isManualCourse && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mt-2"
                                                        >
                                                            <Label className="mb-1.5 block text-xs">Enter Course Name Manually</Label>
                                                            <Input
                                                                value={data.course}
                                                                onChange={(e) => setData('course', e.target.value)}
                                                                placeholder="e.g. BS Computer Science"
                                                                className="border-amber-200 bg-amber-50 dark:bg-amber-950/10"
                                                            />
                                                        </motion.div>
                                                    )}

                                                    {errors.course && <p className="text-destructive text-xs">{errors.course}</p>}
                                                </div>
                                            )}

                                            <div className="flex justify-end pt-2">
                                                <Button type="button" variant="outline" onClick={() => setActiveTab('personal')} className="mr-auto">
                                                    Back
                                                </Button>
                                                <Button type="submit" disabled={processing} className="min-w-[120px]">
                                                    {processing ? (
                                                        <span className="flex items-center gap-2">
                                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                            Saving...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <Save className="h-4 w-4" />
                                                            Save Profile
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Tabs>
                </form>
            </div>
        </AppLayout>
    );
}
