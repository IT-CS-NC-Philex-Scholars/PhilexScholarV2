import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, StudentProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProfileProps {
  profile: StudentProfile | null;
}

export default function Edit({ profile }: ProfileProps) {
  const { data, setData, patch, errors, processing } = useForm<StudentProfile>({
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    patch(route('student.profile.update'));
  }

  // Different options based on school type
  const schoolLevelOptions = data.school_type === 'high_school'
    ? ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']
    : ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Student Dashboard', href: route('student.dashboard') },
    { title: 'My Profile' }
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Student Profile" />
      
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information needed for scholarship applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={data.address}
                    onChange={e => setData('address', e.target.value)}
                    required
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={data.city}
                    onChange={e => setData('city', e.target.value)}
                    required
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={data.state}
                    onChange={e => setData('state', e.target.value)}
                    required
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip_code">Zip Code</Label>
                  <Input
                    id="zip_code"
                    value={data.zip_code}
                    onChange={e => setData('zip_code', e.target.value)}
                    required
                  />
                  {errors.zip_code && (
                    <p className="text-sm text-red-600">{errors.zip_code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={data.phone_number}
                  onChange={e => setData('phone_number', e.target.value)}
                  required
                />
                {errors.phone_number && (
                  <p className="text-sm text-red-600">{errors.phone_number}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Educational Information</CardTitle>
              <CardDescription>
                Provide details about your current educational status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="school_type">School Type</Label>
                <Select
                  value={data.school_type}
                  onValueChange={(value: 'high_school' | 'college') => setData('school_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
                {errors.school_type && (
                  <p className="text-sm text-red-600">{errors.school_type}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_level">School Level</Label>
                <Select
                  value={data.school_level}
                  onValueChange={(value) => setData('school_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school level" />
                  </SelectTrigger>
                  <SelectContent>
                    {schoolLevelOptions.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.school_level && (
                  <p className="text-sm text-red-600">{errors.school_level}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="school_name">School Name</Label>
                <Input
                  id="school_name"
                  value={data.school_name}
                  onChange={e => setData('school_name', e.target.value)}
                  required
                />
                {errors.school_name && (
                  <p className="text-sm text-red-600">{errors.school_name}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={processing}>
                {processing ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </AppLayout>
  );
}