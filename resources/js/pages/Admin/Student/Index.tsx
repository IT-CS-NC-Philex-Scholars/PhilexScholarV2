import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, StudentProfile, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { GraduationCap, Mail, School, Search, User as UserIcon, Users } from 'lucide-react';

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

    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Admin Dashboard', href: route('admin.dashboard') }, { title: 'Students' }];

    // Handle search submit
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.students.index'));
    };

    // Handle filter changes
    const applyFilters = () => {
        get(route('admin.students.index'));
    };
    // Add these lines for debugging
    console.log('Full students prop received by frontend:', students);
    if (students && students.data) {
        console.log('Students data array:', students.data);
        students.data.forEach((student, index) => {
            console.log(`Student[${index}] ID: ${student.id}`);
            console.log(`  - Has 'studentProfile' (camelCase) key:`, student.hasOwnProperty('studentProfile'));
            console.log(`  - Value of student.studentProfile:`, student.studentProfile);
            console.log(`  - Has 'student_profile' (snake_case) key:`, student.hasOwnProperty('student_profile'));
            console.log(`  - Value of student.student_profile:`, (student as any).student_profile); // Use 'as any' to check snake_case
        });
    }
    // Existing line:
    // {students.data.map((student) => (

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students Management" />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="mb-1 text-2xl font-bold md:text-3xl">Students</h1>
                        <p className="text-muted-foreground">Manage and view all student accounts and their scholarship applications</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle>Search & Filter</CardTitle>
                        <CardDescription>Find specific students or filter by criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row">
                            <div className="flex-1">
                                <form onSubmit={handleSearch}>
                                    <div className="relative">
                                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
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
                                <Button type="button" onClick={applyFilters} disabled={processing}>
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
                            <Users className="text-muted-foreground mb-4 h-12 w-12" />
                            <h3 className="mb-1 text-lg font-semibold">No Students Found</h3>
                            <p className="text-muted-foreground max-w-md text-center">
                                No students match your search criteria. Try adjusting your filters or search terms.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {students.data.map((student) => (
                            <Card key={student.id} className="border-l-primary overflow-hidden border-l-4 transition-shadow hover:shadow-md">
                                <CardContent className="p-0">
                                    <div className="bg-muted/20 flex items-center gap-4 border-b p-4">
                                        <Avatar className="border-primary/20 h-12 w-12 border-2">
                                            <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center rounded-full text-lg font-semibold">
                                                {student.name.charAt(0)}
                                            </div>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-lg font-semibold">{student.name}</h3>
                                            <div className="text-muted-foreground flex items-center text-sm">
                                                <Mail className="mr-1 h-3.5 w-3.5" />
                                                <span className="truncate">{student.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        {student.studentProfile ? (
                                            <>
                                                <div className="mb-4 grid grid-cols-2 gap-y-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <UserIcon className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-sm">
                                                            ID: <span className="font-medium">{student.studentProfile.student_id || 'Not set'}</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <GraduationCap className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-sm">
                                                            GPA: <span className="font-medium">{student.studentProfile.gpa || 'Not set'}</span>
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 flex items-center gap-1.5">
                                                        <School className="text-muted-foreground h-4 w-4" />
                                                        <span className="truncate text-sm">
                                                            {student.studentProfile.school_name || 'School not set'}
                                                        </span>
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
                                                <p className="text-muted-foreground mb-3 text-sm">Student profile not yet created</p>
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
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
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
