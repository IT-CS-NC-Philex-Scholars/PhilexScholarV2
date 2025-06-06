import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, DocumentRequirement, ScholarshipProgram } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ScholarshipEditProps {
  scholarship: ScholarshipProgram & {
    documentRequirements: DocumentRequirement[];
  };
}

export default function Edit({ scholarship }: ScholarshipEditProps) {
  // Safety check if scholarship data is incomplete
  if (!scholarship) {
    return (
      <AppLayout>
        <div className="p-4">
          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Scholarship not found</h2>
            <p className="text-muted-foreground mb-4">The scholarship information could not be loaded.</p>
            <Button asChild>
              <a href={route('admin.scholarships.index')}>Return to Scholarships</a>
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Track requirements being added/edited (adding safety check for undefined documentRequirements)
  const documentRequirements = scholarship.documentRequirements || [];
  const [requirements, setRequirements] = useState<(DocumentRequirement & { isNew?: boolean, isDeleted?: boolean })[]>(
    documentRequirements.map(req => ({ ...req, isNew: false, isDeleted: false }))
  );

  const { data, setData, post, put, errors, processing } = useForm({
    name: scholarship.name || '',
    description: scholarship.description || '',
    total_budget: scholarship.total_budget || 0,
    per_student_budget: scholarship.per_student_budget || 0,
    school_type_eligibility: scholarship.school_type_eligibility || 'both',
    min_gpa: scholarship.min_gpa || 0,
    min_units: scholarship.min_units,
    semester: scholarship.semester || '',
    academic_year: scholarship.academic_year || '',
    application_deadline: scholarship.application_deadline ? 
      new Date(scholarship.application_deadline).toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0],
    community_service_days: scholarship.community_service_days || 0,
    active: scholarship.active ?? true,
    available_slots: scholarship.available_slots || 0, // Add available_slots
    documentRequirements: requirements,
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Scholarships', href: route('admin.scholarships.index') },
    { title: scholarship.name || 'Scholarship', href: route('admin.scholarships.show', scholarship.id) },
    { title: 'Edit' },
  ];

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out deleted requirements and update the form data
    const filteredRequirements = requirements.filter(req => !req.isDeleted);
    setData('documentRequirements', filteredRequirements);
    
    put(route('admin.scholarships.update', scholarship.id), {
      onSuccess: () => {
        // Handle success
      },
    });
  };

  // Add a new document requirement
  const addRequirement = () => {
    const newRequirement = {
      id: Date.now(), // Temporary ID for client-side tracking
      scholarship_program_id: scholarship.id,
      name: '',
      description: '',
      is_required: true,
      isNew: true,
      isDeleted: false,
    };
    
    const updatedRequirements = [...requirements, newRequirement];
    setRequirements(updatedRequirements);
    setData('documentRequirements', updatedRequirements);
  };

  // Update a document requirement
  const updateRequirement = (index: number, field: string, value: any) => {
    const updatedRequirements = [...requirements];
    updatedRequirements[index] = { ...updatedRequirements[index], [field]: value };
    setRequirements(updatedRequirements);
    setData('documentRequirements', updatedRequirements);
  };

  // Mark a requirement for deletion
  const deleteRequirement = (index: number) => {
    const updatedRequirements = [...requirements];
    updatedRequirements[index] = { ...updatedRequirements[index], isDeleted: true };
    setRequirements(updatedRequirements);
    setData('documentRequirements', updatedRequirements.filter(req => !req.isDeleted));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit Scholarship: ${scholarship.name || 'Scholarship'}`} />
      
      <div className="p-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Scholarship Program</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>Basic details about the scholarship program</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Scholarship Name</Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={e => setData('name', e.target.value)}
                  required
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={e => setData('description', e.target.value)}
                  rows={4}
                  required
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={data.semester} onValueChange={value => setData('semester', value)}>
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
                  {errors.semester && <p className="text-sm text-destructive">{errors.semester}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Input
                    id="academic_year"
                    value={data.academic_year}
                    onChange={e => setData('academic_year', e.target.value)}
                    placeholder="YYYY-YYYY"
                    required
                  />
                  {errors.academic_year && <p className="text-sm text-destructive">{errors.academic_year}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="application_deadline">Application Deadline</Label>
                <Input
                  id="application_deadline"
                  type="date"
                  value={data.application_deadline}
                  onChange={e => setData('application_deadline', e.target.value)}
                  required
                />
                {errors.application_deadline && <p className="text-sm text-destructive">{errors.application_deadline}</p>}
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={data.active}
                  onCheckedChange={value => setData('active', value)}
                />
                <Label htmlFor="active">Scholarship is Active</Label>
                {errors.active && <p className="text-sm text-destructive">{errors.active}</p>}
              </div>
            </CardContent>
          </Card>
          
          {/* Budget and Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle>Budget & Eligibility</CardTitle>
              <CardDescription>Financial and eligibility requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_budget">Total Budget ($)</Label>
                  <Input
                    id="total_budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.total_budget}
                    onChange={e => setData('total_budget', parseFloat(e.target.value) || 0)}
                    required
                  />
                  {errors.total_budget && <p className="text-sm text-destructive">{errors.total_budget}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="per_student_budget">Award per Student ($)</Label>
                  <Input
                    id="per_student_budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.per_student_budget}
                    onChange={e => setData('per_student_budget', parseFloat(e.target.value) || 0)}
                    required
                  />
                  {errors.per_student_budget && <p className="text-sm text-destructive">{errors.per_student_budget}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available_slots">Available Slots</Label>
                  <Input
                    id="available_slots"
                    type="number"
                    min="0"
                    value={data.available_slots}
                    onChange={e => setData('available_slots', parseInt(e.target.value) || 0)}
                    required
                  />
                  {errors.available_slots && <p className="text-sm text-destructive">{errors.available_slots}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="school_type_eligibility">School Type Eligibility</Label>
                <Select 
                  value={data.school_type_eligibility} 
                  onValueChange={value => setData('school_type_eligibility', value)}
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
                {errors.school_type_eligibility && <p className="text-sm text-destructive">{errors.school_type_eligibility}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_gpa">Minimum GPA (0-100%)</Label>
                  <Input
                    id="min_gpa"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={data.min_gpa}
                    onChange={e => setData('min_gpa', parseFloat(e.target.value) || 0)}
                    required
                  />
                  {errors.min_gpa && <p className="text-sm text-destructive">{errors.min_gpa}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="min_units">Minimum Units (College Only)</Label>
                  <Input
                    id="min_units"
                    type="number"
                    min="0"
                    value={data.min_units || ''}
                    onChange={e => setData('min_units', e.target.value ? parseInt(e.target.value) : null)}
                    disabled={data.school_type_eligibility === 'high_school'}
                  />
                  {errors.min_units && <p className="text-sm text-destructive">{errors.min_units}</p>}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="community_service_days">Required Community Service Days</Label>
                <Input
                  id="community_service_days"
                  type="number"
                  min="0"
                  value={data.community_service_days}
                  onChange={e => setData('community_service_days', parseInt(e.target.value) || 0)}
                  required
                />
                {errors.community_service_days && <p className="text-sm text-destructive">{errors.community_service_days}</p>}
              </div>
            </CardContent>
          </Card>
          
          {/* Document Requirements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Document Requirements</CardTitle>
                <CardDescription>Required documents for scholarship application</CardDescription>
              </div>
              <Button type="button" onClick={addRequirement} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Requirement
              </Button>
            </CardHeader>
            <CardContent>
              {requirements.filter(req => !req.isDeleted).length === 0 ? (
                <div className="text-center py-4 border rounded-md bg-muted/10">
                  <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">No document requirements. Add at least one requirement.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requirements.map((requirement, index) => !requirement.isDeleted && (
                    <div key={requirement.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-grow mr-4">
                          <Label htmlFor={`req-name-${index}`}>Document Name</Label>
                          <Input
                            id={`req-name-${index}`}
                            value={requirement.name}
                            onChange={e => updateRequirement(index, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <Button 
                          type="button" 
                          onClick={() => deleteRequirement(index)} 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`req-desc-${index}`}>Description</Label>
                        <Textarea
                          id={`req-desc-${index}`}
                          value={requirement.description}
                          onChange={e => updateRequirement(index, 'description', e.target.value)}
                          rows={2}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`req-required-${index}`}
                          checked={requirement.is_required}
                          onCheckedChange={value => updateRequirement(index, 'is_required', value)}
                        />
                        <Label htmlFor={`req-required-${index}`}>Required Document</Label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <a href={route('admin.scholarships.show', scholarship.id)}>Cancel</a>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}