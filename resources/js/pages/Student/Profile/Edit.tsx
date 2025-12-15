import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import {
    User, Home, School, Phone, MapPin, Mail, BookOpen,
    GraduationCap, Building, Save, AlertCircle, CheckCircle2, 
    HelpCircle, Search, X, Check, ChevronsUpDown, Sparkles
} from 'lucide-react';

interface ProfileProps {
    profile: StudentProfile | null;
    allSchoolData: SchoolData[];
}

export default function Edit({ profile, allSchoolData }: ProfileProps) {
    const [activeTab, setActiveTab] = useState<string>('personal');
    const [formProgress, setFormProgress] = useState<number>(0);
    const [openSchoolCombobox, setOpenSchoolCombobox] = useState(false);
    
    // For manual school entry if needed
    const [isManualSchool, setIsManualSchool] = useState(false);

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
        const totalFields = 8;
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
            }
        );
    }

    const schoolLevelOptions = data.school_type === 'high_school'
        ? ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
        : ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Student Dashboard', href: route('student.dashboard') },
        { title: 'Edit Profile' }
    ];

    const getProgressColor = () => {
        if (formProgress >= 100) return 'bg-emerald-500';
        if (formProgress >= 80) return 'bg-green-500';
        if (formProgress >= 50) return 'bg-blue-500';
        return 'bg-amber-500';
    };
    
    const getProgressMessage = () => {
        if (formProgress >= 100) return "Excellent! Your profile is complete.";
        if (formProgress >= 80) return "Almost there! Just a few more details.";
        if (formProgress >= 50) return "Good start! Keep going.";
        return "Let's get your profile set up.";
    };

    // Filter schools for combobox
    const filteredSchools = allSchoolData.filter(s => s.school_type === data.school_type);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Student Profile" />
            <Toaster position="top-right" richColors closeButton />

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                
                {/* Hero Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground shadow-xl"
                >
                    <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
                    <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2 max-w-xl">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    Student Profile
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Tell us about yourself</h1>
                            <p className="text-primary-foreground/80 text-lg">
                                Complete your profile to unlock personalized scholarship matches and opportunities.
                            </p>
                        </div>
                        
                        <div className="w-full md:w-64 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Profile Strength</span>
                                <span className="text-sm font-bold">{formProgress}%</span>
                            </div>
                            <Progress value={formProgress} className="h-2 bg-white/20" indicatorClassName={cn("bg-white transition-all duration-1000")} />
                            <p className="text-xs mt-2 text-white/70">
                                {getProgressMessage()}
                            </p>
                        </div>
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl h-auto">
                            <TabsTrigger 
                                value="personal" 
                                className="rounded-lg py-3 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>Personal Information</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="education" 
                                className="rounded-lg py-3 text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
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
                                    <Card className="border shadow-sm overflow-hidden">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Home className="w-5 h-5 text-primary" />
                                                Contact Details
                                            </CardTitle>
                                            <CardDescription>
                                                Where can we reach you? This information helps us verify your residency.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 grid gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="address">Street Address</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">City / Municipality</Label>
                                                    <div className="relative">
                                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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

                                            <div className="grid md:grid-cols-2 gap-6">
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
                                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                                        <CardFooter className="bg-muted/30 py-4 flex justify-between items-center">
                                            <p className="text-xs text-muted-foreground">
                                                <span className="text-red-500">*</span> All fields are required
                                            </p>
                                            <Button 
                                                type="button" 
                                                onClick={() => setActiveTab('education')}
                                                variant="default"
                                            >
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
                                    <Card className="border shadow-sm overflow-hidden">
                                        <CardHeader className="bg-muted/30 pb-4">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <School className="w-5 h-5 text-primary" />
                                                Education Details
                                            </CardTitle>
                                            <CardDescription>
                                                Tell us about your current educational status.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-6 space-y-8">
                                            
                                            {/* School Type Selection */}
                                            <div className="space-y-3">
                                                <Label className="text-base">Current Level</Label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div 
                                                        onClick={() => setData('school_type', 'high_school')}
                                                        className={cn(
                                                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-muted/50 flex flex-col items-center gap-2 text-center",
                                                            data.school_type === 'high_school' 
                                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                                                : "border-muted bg-background hover:border-primary/50"
                                                        )}
                                                    >
                                                        <div className={cn("p-2 rounded-full", data.school_type === 'high_school' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">High School</p>
                                                            <p className="text-xs text-muted-foreground">Junior / Senior High</p>
                                                        </div>
                                                        {data.school_type === 'high_school' && (
                                                            <div className="absolute top-2 right-2 text-primary">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div 
                                                        onClick={() => setData('school_type', 'college')}
                                                        className={cn(
                                                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:bg-muted/50 flex flex-col items-center gap-2 text-center",
                                                            data.school_type === 'college' 
                                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                                                                : "border-muted bg-background hover:border-primary/50"
                                                        )}
                                                    >
                                                        <div className={cn("p-2 rounded-full", data.school_type === 'college' ? "bg-primary text-primary-foreground" : "bg-muted")}>
                                                            <GraduationCap className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">College</p>
                                                            <p className="text-xs text-muted-foreground">University / College</p>
                                                        </div>
                                                        {data.school_type === 'college' && (
                                                            <div className="absolute top-2 right-2 text-primary">
                                                                <CheckCircle2 className="w-4 h-4" />
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
                                                            className="w-full justify-between h-12 text-left font-normal"
                                                        >
                                                            {data.school_name ? (
                                                                <span className="flex items-center gap-2">
                                                                    <School className="w-4 h-4 text-muted-foreground" />
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
                                                                        <p className="text-sm text-muted-foreground mb-2">School not found?</p>
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
                                                                                toast.info("Please contact support if your school is not listed.");
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
                                                                                    "mr-2 h-4 w-4",
                                                                                    data.school_name === school.school_name ? "opacity-100" : "opacity-0"
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
                                                <div className="flex justify-between text-xs text-muted-foreground px-1">
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
                                                        <Label className="text-xs mb-1.5 block">Enter School Name Manually</Label>
                                                        <Input 
                                                            value={data.school_name}
                                                            onChange={(e) => setData('school_name', e.target.value)}
                                                            placeholder="Type your school name here..."
                                                            className="bg-amber-50 dark:bg-amber-950/10 border-amber-200"
                                                        />
                                                    </motion.div>
                                                )}
                                                
                                                {errors.school_name && <p className="text-xs text-red-500">{errors.school_name}</p>}
                                            </div>

                                            {/* Grade/Year Level */}
                                            <div className="space-y-2">
                                                <Label>Grade / Year Level</Label>
                                                <Select
                                                    value={data.school_level}
                                                    onValueChange={(value) => setData('school_level', value)}
                                                >
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

                                            <div className="flex justify-end pt-2">
                                                <Button type="button" variant="outline" onClick={() => setActiveTab('personal')} className="mr-auto">
                                                    Back
                                                </Button>
                                                <Button type="submit" disabled={processing} className="min-w-[120px]">
                                                    {processing ? (
                                                        <span className="flex items-center gap-2">
                                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            Saving...
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <Save className="w-4 h-4" />
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