import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CourseData, SchoolData } from '@/types';
import { useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, CheckCircle2, ChevronRight, ChevronsUpDown, GraduationCap, MapPin, Phone, School, Sparkles, User } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface OnboardingWizardProps {
    user: any;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    allSchoolData: SchoolData[];
    allCourseData?: CourseData[];
}

const steps = [
    { id: 'welcome', title: 'Welcome', icon: Sparkles },
    { id: 'personal', title: 'Personal Info', icon: User },
    { id: 'academic', title: 'Academic Info', icon: GraduationCap },
    { id: 'review', title: 'Review', icon: CheckCircle2 },
];

export default function OnboardingWizard({ user, open, onOpenChange, allSchoolData, allCourseData = [] }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(0);
    const [openSchoolCombobox, setOpenSchoolCombobox] = useState(false);
    const [isManualSchool, setIsManualSchool] = useState(false);
    const [openCourseCombobox, setOpenCourseCombobox] = useState(false);
    const [isManualCourse, setIsManualCourse] = useState(false);

    const { data, setData, patch, processing, errors } = useForm({
        address: '',
        city: '',
        state: '',
        zip_code: '',
        phone_number: '',
        school_type: 'high_school',
        school_level: '',
        school_name: '',
        course: '',
        onboarding: true,
    });

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setDirection(1);
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(currentStep - 1);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('student.profile.update'), {
            onSuccess: () => {
                // If using a modal, we might want to manually close or rely on props
                // If redirected to dashboard, Inertia handles the page reload/visit.
                // onOpenChange?.(false);
            },
            onError: (err) => {
                console.error('Profile update failed', err);
                toast.error('Failed to update profile. Please check the fields.');

                // Determine which step has errors and navigate there
                const hasPersonalErrors = ['address', 'city', 'state', 'zip_code', 'phone_number'].some((field) => err[field]);
                const hasAcademicErrors = ['school_type', 'school_level', 'school_name', 'course'].some((field) => err[field]);

                if (hasPersonalErrors) {
                    setDirection(-1);
                    setCurrentStep(1); // Go to Personal Info
                } else if (hasAcademicErrors) {
                    setDirection(-1);
                    setCurrentStep(2); // Go to Academic Info
                }
            },
        });
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 50 : -50,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 50 : -50,
            opacity: 0,
        }),
    };

    const schoolLevelOptions =
        data.school_type === 'high_school'
            ? ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
            : ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];

    const filteredSchools = allSchoolData.filter((s) => s.school_type === data.school_type);
    const filteredCourses = allCourseData || []; // Assuming allCourseData is passed down

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-background overflow-hidden border-none p-0 shadow-2xl sm:max-w-2xl" hideCloseIcon={true}>
                {/* Header / Progress Section */}
                <div className="bg-primary/5 border-b p-4">
                    <DialogHeader className="mb-4">
                        <DialogTitle className="sr-only">Student Onboarding</DialogTitle>
                        <DialogDescription className="sr-only">Complete your profile to get matched with scholarships.</DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-between px-2">
                        {steps.map((step, index) => (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-1">
                                <motion.div
                                    initial={false}
                                    animate={{
                                        backgroundColor: index <= currentStep ? 'var(--primary)' : 'var(--muted)',
                                        color: index <= currentStep ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                                        scale: index === currentStep ? 1.1 : 1,
                                    }}
                                    className={cn(
                                        'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-500',
                                        index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                                    )}
                                >
                                    <step.icon className="h-4 w-4" />
                                </motion.div>
                                <span
                                    className={cn(
                                        'hidden text-[10px] font-medium sm:block',
                                        index <= currentStep ? 'text-primary' : 'text-muted-foreground',
                                    )}
                                >
                                    {step.title}
                                </span>
                            </div>
                        ))}
                        {/* Progress Bar Background */}
                        <div className="bg-muted absolute top-8 left-0 -z-0 hidden h-0.5 w-full sm:block" />
                    </div>
                    <div className="bg-muted mt-4 h-1 w-full overflow-hidden rounded-full">
                        <motion.div
                            className="bg-primary h-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeInOut' }}
                        />
                    </div>
                </div>

                <form onSubmit={submit} className="flex h-full max-h-[70vh] flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={currentStep}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: 'spring', stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                                className="h-full w-full"
                            >
                                {currentStep === 0 && (
                                    <div className="flex h-full flex-col items-center justify-center space-y-6 py-4 text-center">
                                        <div className="bg-primary/10 animate-pulse-slow flex h-24 w-24 items-center justify-center rounded-full">
                                            <Sparkles className="text-primary h-12 w-12" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-bold tracking-tight">Welcome, {user.name}!</h2>
                                            <p className="text-muted-foreground mx-auto max-w-md">
                                                We're excited to help you find scholarships. Let's set up your profile in just a few steps to match
                                                you with the best opportunities.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <div className="mb-6 space-y-2">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <User className="text-primary h-5 w-5" /> Personal Details
                                            </h3>
                                            <p className="text-muted-foreground text-sm">We need your contact information for applications.</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Street Address</Label>
                                                <div className="relative">
                                                    <MapPin className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                                                    <Input
                                                        id="address"
                                                        placeholder="123 Main St"
                                                        className="pl-9"
                                                        value={data.address}
                                                        onChange={(e) => setData('address', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                {errors.address && <p className="text-destructive text-xs">{errors.address}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    placeholder="City"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    required
                                                />
                                                {errors.city && <p className="text-destructive text-xs">{errors.city}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State / Province</Label>
                                                <Input
                                                    id="state"
                                                    placeholder="Province"
                                                    value={data.state}
                                                    onChange={(e) => setData('state', e.target.value)}
                                                    required
                                                />
                                                {errors.state && <p className="text-destructive text-xs">{errors.state}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="zip_code">Zip Code</Label>
                                                <Input
                                                    id="zip_code"
                                                    placeholder="1234"
                                                    value={data.zip_code}
                                                    onChange={(e) => setData('zip_code', e.target.value)}
                                                    required
                                                />
                                                {errors.zip_code && <p className="text-destructive text-xs">{errors.zip_code}</p>}
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label htmlFor="phone_number">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
                                                    <Input
                                                        id="phone_number"
                                                        placeholder="0912 345 6789"
                                                        value={data.phone_number}
                                                        onChange={(e) => setData('phone_number', e.target.value)}
                                                        required
                                                        className="pl-9"
                                                    />
                                                </div>
                                                {errors.phone_number && <p className="text-destructive text-xs">{errors.phone_number}</p>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <div className="mb-6 space-y-2">
                                            <h3 className="flex items-center gap-2 text-lg font-semibold">
                                                <GraduationCap className="text-primary h-5 w-5" /> Academic Information
                                            </h3>
                                            <p className="text-muted-foreground text-sm">This helps us verify your eligibility.</p>
                                        </div>

                                        {/* School Type Selection */}
                                        <div className="space-y-3">
                                            <Label className="text-base">Current Level</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div
                                                    onClick={() => setData('school_type', 'high_school')}
                                                    className={cn(
                                                        'hover:bg-muted/50 relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
                                                        data.school_type === 'high_school'
                                                            ? 'border-primary bg-primary/5 ring-primary/20 ring-1'
                                                            : 'border-muted bg-background hover:border-primary/50',
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            'rounded-full p-2',
                                                            data.school_type === 'high_school' ? 'bg-primary text-primary-foreground' : 'bg-muted',
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
                                                        'hover:bg-muted/50 relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all',
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
                                                                            setIsManualSchool(true);
                                                                        }}
                                                                    >
                                                                        Request to add school
                                                                    </Button>
                                                                </div>
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {filteredSchools.map((school) => (
                                                                    <CommandItem
                                                                        key={school.school_name} // Using school_name as key/value since id might not be unique if duplicate names exist (though distinct() used)
                                                                        value={school.school_name}
                                                                        onSelect={() => {
                                                                            setData('school_name', school.school_name);
                                                                            setOpenSchoolCombobox(false);
                                                                        }}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                'mr-2 h-4 w-4',
                                                                                data.school_name === school.school_name ? 'opacity-100' : 'opacity-0',
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

                                            {errors.school_name && <p className="text-destructive text-xs">{errors.school_name}</p>}
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
                                            {errors.school_level && <p className="text-destructive text-xs">{errors.school_level}</p>}
                                        </div>

                                        {/* Course Input - Conditional for College */}
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
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="flex h-full flex-col items-center justify-center space-y-6 py-4 text-center">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold">You're All Set!</h2>
                                            <p className="text-muted-foreground">
                                                Your profile is ready. Click "Finish" to save your details and see available scholarships matched to
                                                you.
                                            </p>
                                        </div>

                                        <div className="bg-muted/50 w-full max-w-sm space-y-2 rounded-lg p-4 text-left text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">School:</span>
                                                <span className="font-medium">{data.school_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Location:</span>
                                                <span className="font-medium">
                                                    {data.city}, {data.state}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="bg-muted/5 mt-auto flex justify-between border-t p-6">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 0 || processing}
                            className={cn(currentStep === 0 && 'invisible')}
                        >
                            Back
                        </Button>

                        {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={nextStep} disabled={processing}>
                                {currentStep === 0 ? "Let's Get Started" : 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="submit" disabled={processing} className="bg-green-600 text-white hover:bg-green-700">
                                {processing ? 'Saving...' : 'Finish & Find Scholarships'}
                            </Button>
                        )}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
