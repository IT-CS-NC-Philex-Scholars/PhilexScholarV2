import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User, StudentProfile } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar } from '@/components/ui/avatar';
import { Search, GraduationCap, User as UserIcon, Users, Mail, School } from 'lucide-react';

interface StudentIndexProps {
  students: {
    data: (User & { studentProfile?: StudentProfile })[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
    filter_school_type?: string;
  };
}

export default function Index({ students, filters }: StudentIndexProps) {
  const { data, setData, get, processing } = useForm({
    search: filters.search || '',
    filter_school_type: filters.filter_school_type || 'all',
  });

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin Dashboard', href: route('admin.dashboard') },
    { title: 'Students' }
  ];
  
  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    get(route('admin.students.index'));
  };
  
  // Handle filter changes
  const applyFilters = () => {
    get(route('admin.students.index'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Students Management" />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Students</h1>
            <p className="text-muted-foreground">
              Manage and view all student accounts and their scholarship applications
            </p>
          </div>
        </div>
        
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find specific students or filter by criteria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search by name, email, or student ID..."
                      className="pl-8"
                      value={data.search}
                      onChange={(e) => setData('search', e.target.value)}
                    />
                  </div>
                </form>
              </div>
              
              <div className="w-full md:w-1/4">
                <Select
                  value={data.filter_school_type}
                  onValueChange={(value) => {
                    setData('filter_school_type', value);
                    setTimeout(() => applyFilters(), 100);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="School Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All School Types</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Button 
                  type="button" 
                  onClick={applyFilters} 
                  disabled={processing}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Students List */}
        {students.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-1">No Students Found</h3>
              <p className="text-muted-foreground text-center max-w-md">
                No students match your search criteria. Try adjusting your filters or search terms.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.data.map((student) => (
              <Card key={student.id} className="overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-primary">
                <CardContent className="p-0">
                  <div className="flex items-center p-4 gap-4 border-b bg-muted/20">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                        {student.name.charAt(0)}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{student.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 mr-1" />
                        <span className="truncate">{student.email}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    {student.studentProfile ? (
                      <>
                        <div className="grid grid-cols-2 gap-y-3 mb-4">
                          <div className="flex items-center gap-1.5">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">ID: <span className="font-medium">{student.studentProfile.student_id || 'Not set'}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">GPA: <span className="font-medium">{student.studentProfile.gpa || 'Not set'}</span></span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <School className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">{student.studentProfile.school_name || 'School not set'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant={student.studentProfile.school_type === 'high_school' ? 'outline' : 'secondary'}>
                            {student.studentProfile.school_type === 'high_school' ? 'High School' : 'College'}
                          </Badge>
                          <Button asChild size="sm">
                            <Link href={route('admin.students.show', student.id)}>View Profile</Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-3 text-center">
                        <p className="text-sm text-muted-foreground mb-3">Student profile not yet completed</p>
                        <Button asChild size="sm">
                          <Link href={route('admin.students.show', student.id)}>View Profile</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {students.last_page > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {students.data.length} of {students.total} students
            </div>
            <div className="flex gap-2">
              {students.current_page > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link href={route('admin.students.index', { page: students.current_page - 1, ...filters })}>Previous</Link>
                </Button>
              )}
              {students.current_page < students.last_page && (
                <Button asChild variant="outline" size="sm">
                  <Link href={route('admin.students.index', { page: students.current_page + 1, ...filters })}>Next</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}