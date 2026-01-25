import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { DollarSign, FileStack, GraduationCap, Info, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface DocumentRequirementForm {
    id: number;
    name: string;
    description: string;
    is_required: boolean;
}

export default function Create() {
    // Track requirements being added
    const [requirements, setRequirements] = useState<DocumentRequirementForm[]>([]);

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        description: '',
        total_budget: 0,
        per_student_budget: 0,
        school_type_eligibility: 'both' as 'high_school' | 'college' | 'both',
        min_gpa: 0,
        min_units: null as number | null,
        semester: '',
        academic_year: '',
        application_deadline: '',
        community_service_days: 0,
        active: true,
        available_slots: 0,
        document_requirements: [] as DocumentRequirementForm[],
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin Dashboard', href: route('admin.dashboard') },
        { title: 'Scholarships', href: route('admin.scholarships.index') },
        { title: 'Create New' },
    ];

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Sync requirements one last time before submit
        setData('document_requirements', requirements);

        post(route('admin.scholarships.store'), {
            onSuccess: () => {
                // Handle success
            },
        });
    };

    // Add a new document requirement
    const addRequirement = () => {
        const newRequirement = {
            id: Date.now(), // Temporary ID for client-side tracking
            name: '',
            description: '',
            is_required: true,
        };

        const updatedRequirements = [...requirements, newRequirement];
        setRequirements(updatedRequirements);
        setData('document_requirements', updatedRequirements);
    };

    // Update a document requirement
    const updateRequirement = (index: number, field: string, value: any) => {
        const updatedRequirements = [...requirements];
        updatedRequirements[index] = { ...updatedRequirements[index], [field]: value };
        setRequirements(updatedRequirements);
        setData('document_requirements', updatedRequirements);
    };

    // Delete requirement
    const deleteRequirement = (index: number) => {
        const updatedRequirements = [...requirements];
        updatedRequirements.splice(index, 1);
        setRequirements(updatedRequirements);
        setData('document_requirements', updatedRequirements);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create New Scholarship" />

            <div className="container mx-auto max-w-5xl py-6">
                <form onSubmit={handleSubmit}>
                    {/* Header Section */}
                    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight">Create New Scholarship</h1>
                            <p className="text-muted-foreground">Set up a new scholarship program with eligibility criteria and requirements.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" asChild>
                                <a href={route('admin.scholarships.index')}>
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </a>
                            </Button>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Creating...' : 'Create Scholarship'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Sidebar / Status Card (Desktop) */}
                        <div className="order-2 space-y-6 lg:order-2 lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Status & Visibility</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="active" className="text-base font-medium">
                                                Active Status
                                            </Label>
                                            <p className="text-muted-foreground text-xs">
                                                {data.active ? 'Scholarship will be active' : 'Scholarship will be inactive'}
                                            </p>
                                        </div>
                                        <Switch id="active" checked={data.active} onCheckedChange={(value) => setData('active', value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Target Audience</Label>
                                        <div className="flex gap-2">
                                            <Badge variant={data.active ? 'default' : 'secondary'}>{data.active ? 'Active' : 'Draft'}</Badge>
                                            <Badge variant="outline">
                                                {data.school_type_eligibility === 'both'
                                                    ? 'All Students'
                                                    : data.school_type_eligibility === 'college'
                                                      ? 'College'
                                                      : 'High School'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="application_deadline">Application Deadline</Label>
                                            <Input
                                                id="application_deadline"
                                                type="date"
                                                value={data.application_deadline}
                                                onChange={(e) => setData('application_deadline', e.target.value)}
                                                required
                                                className="w-full"
                                            />
                                            {errors.application_deadline && <p className="text-destructive text-sm">{errors.application_deadline}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                                <div className="flex items-start gap-2">
                                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <p>
                                        Make sure all eligibility requirements are clear. Once created, students can immediately start applying if the
                                        status is active.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Tabs */}
                        <div className="order-1 lg:order-1 lg:col-span-2">
                            <Tabs defaultValue="general" className="w-full">
                                <TabsList className="mb-6 w-full justify-start overflow-x-auto">
                                    <TabsTrigger value="general" className="flex-1">
                                        <Info className="mr-2 h-4 w-4" /> General
                                    </TabsTrigger>
                                    <TabsTrigger value="eligibility" className="flex-1">
                                        <GraduationCap className="mr-2 h-4 w-4" /> Eligibility
                                    </TabsTrigger>
                                    <TabsTrigger value="financial" className="flex-1">
                                        <DollarSign className="mr-2 h-4 w-4" /> Financials
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="flex-1">
                                        <FileStack className="mr-2 h-4 w-4" /> Documents
                                    </TabsTrigger>
                                </TabsList>

                                {/* General Tab */}
                                <TabsContent value="general" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Basic Information</CardTitle>
                                            <CardDescription>Set the core details of the scholarship program.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Scholarship Name</Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    placeholder="e.g. Academic Excellence Scholarship"
                                                    required
                                                />
                                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    rows={6}
                                                    placeholder="Describe the scholarship, its purpose, and who should apply..."
                                                    required
                                                    className="resize-none"
                                                />
                                                {errors.description && <p className="text-destructive text-sm">{errors.description}</p>}
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="semester">Semester</Label>
                                                    <Select value={data.semester} onValueChange={(value) => setData('semester', value)}>
                                                        <SelectTrigger id="semester">
                                                            <SelectValue placeholder="Select semester" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1st Semester">1st Semester</SelectItem>
                                                            <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                                                            <SelectItem value="Summer Term">Summer Term</SelectItem>
                                                            <SelectItem value="Annual">Annual</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors.semester && <p className="text-destructive text-sm">{errors.semester}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="academic_year">Academic Year</Label>
                                                    <Input
                                                        id="academic_year"
                                                        value={data.academic_year}
                                                        onChange={(e) => setData('academic_year', e.target.value)}
                                                        placeholder="e.g. 2024-2025"
                                                        required
                                                    />
                                                    {errors.academic_year && <p className="text-destructive text-sm">{errors.academic_year}</p>}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Eligibility Tab */}
                                <TabsContent value="eligibility" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Academic Requirements</CardTitle>
                                            <CardDescription>Define who is eligible to apply for this scholarship.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="school_type_eligibility">Target Audience</Label>
                                                <Select
                                                    value={data.school_type_eligibility}
                                                    onValueChange={(value) =>
                                                        setData('school_type_eligibility', value as 'high_school' | 'college' | 'both')
                                                    }
                                                >
                                                    <SelectTrigger id="school_type_eligibility">
                                                        <SelectValue placeholder="Select eligibility" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="high_school">High School Students</SelectItem>
                                                        <SelectItem value="college">College Students</SelectItem>
                                                        <SelectItem value="both">Both High School and College</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.school_type_eligibility && (
                                                    <p className="text-destructive text-sm">{errors.school_type_eligibility}</p>
                                                )}
                                            </div>

                                            <Separator />

                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="min_gpa">Minimum GPA (%)</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="min_gpa"
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={data.min_gpa}
                                                            onChange={(e) => setData('min_gpa', parseFloat(e.target.value) || 0)}
                                                            required
                                                            className="pl-3"
                                                        />
                                                    </div>
                                                    <p className="text-muted-foreground text-xs">Enter as percentage (e.g., 85 for 85%)</p>
                                                    {errors.min_gpa && <p className="text-destructive text-sm">{errors.min_gpa}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label
                                                        htmlFor="min_units"
                                                        className={data.school_type_eligibility === 'high_school' ? 'text-muted-foreground' : ''}
                                                    >
                                                        Minimum Units
                                                    </Label>
                                                    <Input
                                                        id="min_units"
                                                        type="number"
                                                        min="0"
                                                        value={data.min_units || ''}
                                                        onChange={(e) => setData('min_units', e.target.value ? parseInt(e.target.value) : null)}
                                                        disabled={data.school_type_eligibility === 'high_school'}
                                                        placeholder={
                                                            data.school_type_eligibility === 'high_school' ? 'Not applicable' : 'Required units'
                                                        }
                                                    />
                                                    <p className="text-muted-foreground text-xs">Applicable for college students only</p>
                                                    {errors.min_units && <p className="text-destructive text-sm">{errors.min_units}</p>}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="community_service_days">Required Community Service (Days)</Label>
                                                <Input
                                                    id="community_service_days"
                                                    type="number"
                                                    min="0"
                                                    value={data.community_service_days}
                                                    onChange={(e) => setData('community_service_days', parseInt(e.target.value) || 0)}
                                                    required
                                                />
                                                {errors.community_service_days && (
                                                    <p className="text-destructive text-sm">{errors.community_service_days}</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Financial Tab */}
                                <TabsContent value="financial" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Budget Allocation</CardTitle>
                                            <CardDescription>Manage financial distribution and slot availability.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="total_budget">Total Budget Allocation</Label>
                                                    <div className="relative">
                                                        <span className="text-muted-foreground absolute top-2.5 left-3">$</span>
                                                        <Input
                                                            id="total_budget"
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={data.total_budget}
                                                            onChange={(e) => setData('total_budget', parseFloat(e.target.value) || 0)}
                                                            required
                                                            className="pl-7"
                                                        />
                                                    </div>
                                                    {errors.total_budget && <p className="text-destructive text-sm">{errors.total_budget}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="per_student_budget">Award Amount per Student</Label>
                                                    <div className="relative">
                                                        <span className="text-muted-foreground absolute top-2.5 left-3">$</span>
                                                        <Input
                                                            id="per_student_budget"
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={data.per_student_budget}
                                                            onChange={(e) => setData('per_student_budget', parseFloat(e.target.value) || 0)}
                                                            required
                                                            className="pl-7"
                                                        />
                                                    </div>
                                                    {errors.per_student_budget && (
                                                        <p className="text-destructive text-sm">{errors.per_student_budget}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <Label htmlFor="available_slots">Available Slots</Label>
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        id="available_slots"
                                                        type="number"
                                                        min="0"
                                                        value={data.available_slots}
                                                        onChange={(e) => setData('available_slots', parseInt(e.target.value) || 0)}
                                                        required
                                                        className="max-w-[150px]"
                                                    />
                                                    <p className="text-muted-foreground text-sm">students can receive this scholarship</p>
                                                </div>
                                                {errors.available_slots && <p className="text-destructive text-sm">{errors.available_slots}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Documents Tab */}
                                <TabsContent value="documents" className="mt-0 space-y-6">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <div>
                                                <CardTitle>Document Requirements</CardTitle>
                                                <CardDescription>Define what documents applicants must upload.</CardDescription>
                                            </div>
                                            <Button type="button" onClick={addRequirement} size="sm">
                                                <Plus className="mr-2 h-4 w-4" /> Add Document
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            {requirements.length === 0 ? (
                                                <div className="bg-muted/5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-10">
                                                    <FileStack className="text-muted-foreground mb-3 h-10 w-10" />
                                                    <h3 className="mb-1 text-lg font-medium">No Requirements Added</h3>
                                                    <p className="text-muted-foreground mb-4 text-sm">
                                                        Add at least one document requirement for applicants.
                                                    </p>
                                                    <Button type="button" onClick={addRequirement} variant="outline">
                                                        Add First Requirement
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {requirements.map((requirement, index) => (
                                                        <div
                                                            key={requirement.id}
                                                            className="group bg-card hover:border-primary/50 relative rounded-xl border p-5 transition-colors"
                                                        >
                                                            <div className="absolute top-4 right-4">
                                                                <Button
                                                                    type="button"
                                                                    onClick={() => deleteRequirement(index)}
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-4 pr-10">
                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`req-name-${index}`}>Document Name</Label>
                                                                    <Input
                                                                        id={`req-name-${index}`}
                                                                        value={requirement.name}
                                                                        onChange={(e) => updateRequirement(index, 'name', e.target.value)}
                                                                        placeholder="e.g. Report Card, Certificate of Indigency"
                                                                        required
                                                                        className="font-medium"
                                                                    />
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <Label htmlFor={`req-desc-${index}`}>Description / Instructions</Label>
                                                                    <Textarea
                                                                        id={`req-desc-${index}`}
                                                                        value={requirement.description}
                                                                        onChange={(e) => updateRequirement(index, 'description', e.target.value)}
                                                                        rows={2}
                                                                        placeholder="Provide details on what this document should contain..."
                                                                        required
                                                                        className="resize-none text-sm"
                                                                    />
                                                                </div>

                                                                <div className="flex items-center space-x-2 pt-2">
                                                                    <Switch
                                                                        id={`req-required-${index}`}
                                                                        checked={requirement.is_required}
                                                                        onCheckedChange={(value) => updateRequirement(index, 'is_required', value)}
                                                                    />
                                                                    <Label htmlFor={`req-required-${index}`} className="cursor-pointer">
                                                                        Mandatory Requirement
                                                                    </Label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
