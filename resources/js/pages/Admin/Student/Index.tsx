import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, StudentProfile, User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { GraduationCap, LayoutGrid, List, Mail, School, Search, User as UserIcon, Users, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StudentIndexProps {
    studentProfiles: {
        data: (StudentProfile & { user?: User })[]; // Changed: now array of StudentProfile with optional User
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

export default function Index({ studentProfiles, filters }: StudentIndexProps) { // Changed: students to studentProfiles
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        filter_school_type: filters.filter_school_type || 'all',
    });

    // View mode state - 'cards' or 'table'
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);
            if (mobile && viewMode === 'table') {
                setViewMode('cards');
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, [viewMode]);

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
    // console.log('Full studentProfiles prop:', studentProfiles); // Debugging line, can be removed
    // if (studentProfiles && studentProfiles.data) { // Debugging block, can be removed
    //     studentProfiles.data.forEach((profile, index) => {
    //         console.log(`Profile[${index}] ID: ${profile.id}, User:`, profile.user);
    //     });
    // }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Students Management" />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex-1">
                        <h1 className="mb-1 text-2xl font-bold md:text-3xl">Students</h1>
                        <p className="text-muted-foreground">Manage and view all student accounts and their scholarship applications</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-sm font-medium hidden sm:inline">View:</span>
                            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'cards' | 'table')}>
                                <ToggleGroupItem value="cards" aria-label="Card view" size="sm">
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="ml-1.5 hidden sm:inline">Cards</span>
                                </ToggleGroupItem>
                                {!isMobile && (
                                    <ToggleGroupItem value="table" aria-label="Table view" size="sm">
                                        <List className="h-4 w-4" />
                                        <span className="ml-1.5 hidden sm:inline">Table</span>
                                    </ToggleGroupItem>
                                )}
                            </ToggleGroup>
                        </div>
                        <Button asChild>
                            <Link href={route('admin.students.create')}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Create New Student</span>
                                <span className="sm:hidden">Create</span>
                            </Link>
                        </Button>
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
                {studentProfiles.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <Users className="text-muted-foreground mb-4 h-12 w-12" />
                            <h3 className="mb-1 text-lg font-semibold">No Students Found</h3>
                            <p className="text-muted-foreground max-w-md text-center">
                                No students match your search criteria. Try adjusting your filters or search terms.
                            </p>
                        </CardContent>
                    </Card>
                ) : viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {studentProfiles.data.map((profile) => {
                            const displayName = profile.user ? profile.user.name : `${profile.first_name} ${profile.last_name}`.trim();
                            const displayEmail = profile.user ? profile.user.email : profile.email;
                            const avatarFallback = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

                            return (
                                <Card key={profile.id} className="border-l-primary overflow-hidden border-l-4 shadow-sm transition-shadow hover:shadow-md">
                                    <CardContent className="p-0">
                                        <div className="bg-muted/20 flex items-center gap-4 border-b p-4">
                                            <Avatar className="h-12 w-12 border-primary/20 border-2">
                                                <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center rounded-full text-lg font-semibold">
                                                    {avatarFallback}
                                                </div>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-lg font-semibold">{displayName}</h3>
                                                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                                    <Mail className="mr-1 h-3.5 w-3.5" />
                                                    <span className="truncate">{displayEmail}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            <div className="mb-4 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <UserIcon className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-sm text-muted-foreground">Student ID:</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{profile.student_id || 'Not set'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <GraduationCap className="text-muted-foreground h-4 w-4" />
                                                        <span className="text-sm text-muted-foreground">GPA:</span>
                                                    </div>
                                                    <span className="text-sm font-medium">{profile.gpa || 'Not set'}</span>
                                                </div>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-1.5">
                                                        <School className="text-muted-foreground h-4 w-4 mt-0.5" />
                                                        <span className="text-sm text-muted-foreground">School:</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-right max-w-[60%]">
                                                        {profile.school_name || 'Not set'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <Badge variant={profile.school_type === 'high_school' ? 'outline' : 'secondary'}>
                                                    {profile.school_type === 'high_school' ? 'High School' : 'College'}
                                                </Badge>
                                                {profile.user ? (
                                                    <Button asChild size="sm">
                                                        <Link href={route('admin.students.show', profile.user.id)}>View Profile</Link>
                                                    </Button>
                                                ) : (
                                                    <Badge variant="outline" className="text-xs">
                                                        Unclaimed
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>School</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>GPA</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentProfiles.data.map((profile) => {
                                        const displayName = profile.user ? profile.user.name : `${profile.first_name} ${profile.last_name}`.trim();
                                        const displayEmail = profile.user ? profile.user.email : profile.email;
                                        const avatarFallback = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

                                        return (
                                            <TableRow key={profile.id}>
                                                <TableCell>
                                                    <Avatar className="h-8 w-8">
                                                        <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center rounded-full text-xs font-semibold">
                                                            {avatarFallback}
                                                        </div>
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{displayName}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-muted-foreground">{displayEmail}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono text-sm">{profile.student_id || '-'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-[200px] truncate" title={profile.school_name || 'Not set'}>
                                                        {profile.school_name || '-'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={profile.school_type === 'high_school' ? 'outline' : 'secondary'} className="text-xs">
                                                        {profile.school_type === 'high_school' ? 'High School' : 'College'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{profile.gpa || '-'}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {profile.user ? (
                                                        <Badge variant="default" className="text-xs">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">
                                                            Unclaimed
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {profile.user ? (
                                                        <Button asChild size="sm" variant="outline">
                                                            <Link href={route('admin.students.show', profile.user.id)}>
                                                                View
                                                            </Link>
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" variant="ghost" disabled>
                                                            View
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {studentProfiles.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-muted-foreground text-sm">
                                                        Showing {studentProfiles.data.length} of {studentProfiles.total} students
                        </div>
                        <div className="flex gap-2">
                            {studentProfiles.current_page > 1 && (
                                <Button asChild variant="outline" size="sm">
                                                                        <Link href={route('admin.students.index', { page: studentProfiles.current_page - 1, ...filters })}>Previous</Link>
                                </Button>
                            )}
                            {studentProfiles.current_page < studentProfiles.last_page && (
                                <Button asChild variant="outline" size="sm">
                                                                        <Link href={route('admin.students.index', { page: studentProfiles.current_page + 1, ...filters })}>Next</Link>
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
