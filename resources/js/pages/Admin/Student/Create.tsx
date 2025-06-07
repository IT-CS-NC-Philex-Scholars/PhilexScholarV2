import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'; // Assuming cmdk is aliased or installed as ui/command
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone_number: string;
  school_type: 'high_school' | 'college' | '';
  school_level: string;
  school_name: string;
  student_id_number: string;
  gpa: string;
}

const highSchools = [
  { value: 'Central High School', label: 'Central High School' },
  { value: 'Northwood High', label: 'Northwood High' },
  { value: 'Lincoln High School', label: 'Lincoln High School' },
  { value: 'Westview High', label: 'Westview High' },
  { value: 'Riverdale High', label: 'Riverdale High' },
];

const colleges = [
  { value: 'State University', label: 'State University' },
  { value: 'City College', label: 'City College' },
  { value: 'Community College of Alameda', label: 'Community College of Alameda' },
  { value: 'University of California, Berkeley', label: 'University of California, Berkeley' },
  { value: 'Stanford University', label: 'Stanford University' },
];

interface SchoolOption {
  value: string;
  label: string;
}

interface BreadcrumbItem {
  title: string;
  href?: string;
}

export default function CreateStudentProfile() {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [availableSchools, setAvailableSchools] = useState<SchoolOption[]>([]);
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone_number: '',
    school_type: '',
    school_level: '',
    school_name: '',
    student_id_number: '',
    gpa: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    post(route('admin.students.store'), {
      onSuccess: () => reset(),
    });
  };

  useEffect(() => {
    let newSchools: SchoolOption[] = [];
    if (data.school_type === 'high_school') {
      newSchools = highSchools;
    } else if (data.school_type === 'college') {
      newSchools = colleges;
    }
    setAvailableSchools(newSchools);
  }, [data.school_type]);

  useEffect(() => {
    // If school_type changes, and the current school_name is not in the new list of availableSchools,
    // we don't necessarily want to clear it if we allow custom input.
    // The admin might have typed a custom school for that school_type.
    // However, if school_type becomes empty, then school_name should also clear.
    if (!data.school_type) {
        setData('school_name', '');
    }
  }, [data.school_type, setData]);

  // Define breadcrumbs inside the component
  const breadcrumbsData: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Students', href: route('admin.students.index') },
    { title: 'Create New Student' },
  ];

  return (
    <AppLayout
      title="Create Student Profile"
      breadcrumbs={breadcrumbsData}
    >
      <Head title="Create Student Profile" />

      <div className="py-12">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto sm:px-6 lg:px-8 space-y-8">
          {/* Section 1: Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Basic identity details for the student.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={data.first_name}
                    onChange={(e) => setData('first_name', e.target.value)}
                    className="mt-1 block w-full"
                    required
                  />
                  {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={data.last_name}
                    onChange={(e) => setData('last_name', e.target.value)}
                    className="mt-1 block w-full"
                    required
                  />
                  {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  className="mt-1 block w-full"
                  required
                  placeholder="student@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Contact & Address */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Address</CardTitle>
              <CardDescription>How to reach the student and their primary address.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={data.phone_number}
                  onChange={(e) => setData('phone_number', e.target.value)}
                  className="mt-1 block w-full"
                  required
                  placeholder="(555) 123-4567"
                />
                {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
              </div>
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  className="mt-1 block w-full"
                  required
                  placeholder="123 Main St"
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={data.city}
                    onChange={(e) => setData('city', e.target.value)}
                    className="mt-1 block w-full"
                    required
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Label htmlFor="state">State / Province</Label>
                  <Input
                    id="state"
                    name="state"
                    value={data.state}
                    onChange={(e) => setData('state', e.target.value)}
                    className="mt-1 block w-full"
                    required
                  />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>
                <div>
                  <Label htmlFor="zip_code">ZIP / Postal Code</Label>
                  <Input
                    id="zip_code"
                    name="zip_code"
                    value={data.zip_code}
                    onChange={(e) => setData('zip_code', e.target.value)}
                    className="mt-1 block w-full"
                    required
                  />
                  {errors.zip_code && <p className="text-xs text-red-500 mt-1">{errors.zip_code}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Details about the student's current or most recent schooling.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="school_type">School Type</Label>
                  <Select
                    value={data.school_type}
                    onValueChange={(value: 'high_school' | 'college') => {
                      setData('school_type', value);
                    }}
                  >
                    <SelectTrigger className="mt-1 block w-full">
                      <SelectValue placeholder="Select school type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.school_type && <p className="text-xs text-red-500 mt-1">{errors.school_type}</p>}
                </div>
                <div>
                  <Label htmlFor="school_level">School Level</Label>
                  <Input
                    id="school_level"
                    name="school_level"
                    value={data.school_level}
                    onChange={(e) => setData('school_level', e.target.value)}
                    className="mt-1 block w-full"
                    required
                    placeholder="e.g., Grade 11, Sophomore"
                  />
                  {errors.school_level && <p className="text-xs text-red-500 mt-1">{errors.school_level}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="school_name">School Name</Label>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={popoverOpen}
                      className="w-full justify-between mt-1 h-10 px-3 py-2 text-sm rounded-md border border-input bg-background items-center"
                      disabled={!data.school_type}
                    >
                      <span className="truncate">
                        {data.school_name || 'Select or type school...'}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command
                      filter={(value, search) => {
                        const school = availableSchools.find(s => s.value.toLowerCase() === value.toLowerCase());
                        if (school) return school.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                        return 0;
                      }}
                    >
                      <CommandInput
                        placeholder="Search or type school..."
                        value={data.school_name}
                        onValueChange={(value) => setData('school_name', value)}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {data.school_type
                            ? (availableSchools.length === 0 ? 'No predefined schools. Type to add custom.' : 'No matching school. Type to add custom.')
                            : 'Please select a school type first.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {availableSchools.map((school) => (
                            <CommandItem
                              key={school.value}
                              value={school.value}
                              onSelect={(currentValue) => {
                                setData('school_name', currentValue);
                                setPopoverOpen(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${data.school_name === school.value ? 'opacity-100' : 'opacity-0'}`}
                              />
                              {school.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {errors.school_name && <p className="text-xs text-red-500 mt-1">{errors.school_name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="student_id_number">Student ID Number (Optional)</Label>
                  <Input
                    id="student_id_number"
                    name="student_id_number"
                    value={data.student_id_number}
                    onChange={(e) => setData('student_id_number', e.target.value)}
                    className="mt-1 block w-full"
                  />
                  {errors.student_id_number && <p className="text-xs text-red-500 mt-1">{errors.student_id_number}</p>}
                </div>
                <div>
                  <Label htmlFor="gpa">GPA (Optional)</Label>
                  <Input
                    id="gpa"
                    name="gpa"
                    type="text" // Changed from number to text
                    value={data.gpa}
                    onChange={(e) => setData('gpa', e.target.value)}
                    className="mt-1 block w-full"
                    placeholder="e.g., 3.75 or 88%" // Updated placeholder
                  />
                  {errors.gpa && <p className="text-xs text-red-500 mt-1">{errors.gpa}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end mt-6">
            <Button type="submit" disabled={processing} size="lg">
              Create Student Profile
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
