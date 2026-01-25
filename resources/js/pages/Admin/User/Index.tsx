import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User as UserType } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Edit, MoreHorizontal, PlusCircle, Search, Shield, ShieldAlert, Trash2, UserCog } from 'lucide-react';
import { useState } from 'react';
import UserForm from './UserForm';

interface UserIndexProps {
    users: {
        data: (UserType & { role: string; created_at: string; avatar?: string })[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        role?: string;
    };
}

export default function UserIndex({ users, filters }: UserIndexProps) {
    const { auth } = usePage().props as any;
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        role: filters.role || 'all',
    });

    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<(UserType & { role: string }) | null>(null);
    const [impersonatingUser, setImpersonatingUser] = useState<UserType | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserType | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin Dashboard',
            href: route('admin.dashboard'),
        },
        { title: 'Users' },
    ];

    const searchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        get(route('admin.users.index'), { preserveState: true });
    };

    const handleRoleChange = (value: string) => {
        setData('role', value);
        // Trigger filter immediately
        router.get(route('admin.users.index'), { search: data.search, role: value }, { preserveState: true });
    };

    const confirmImpersonation = () => {
        if (impersonatingUser) {
            router.post(route('admin.users.impersonate', impersonatingUser.id));
        }
    };

    const confirmDelete = () => {
        if (deletingUser) {
            router.delete(route('admin.users.destroy', deletingUser.id), {
                onSuccess: () => setDeletingUser(null),
            });
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />
            <div className="container mx-auto space-y-6 px-4 py-6">
                <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Users</h1>
                        <p className="text-muted-foreground">Manage accounts, roles, and permissions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setEditingUser(null);
                                setSheetOpen(true);
                            }}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    {/* Search & Filter */}
                    <div className="flex w-full max-w-2xl flex-1 gap-2 md:w-auto">
                        <div className="relative flex-1">
                            <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                            <form onSubmit={searchSubmit}>
                                <Input
                                    placeholder="Search by name or email..."
                                    className="w-full pl-9"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                />
                            </form>
                        </div>
                        <Select value={data.role} onValueChange={handleRoleChange}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admins</SelectItem>
                                <SelectItem value="student">Students</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-muted-foreground text-sm">
                        Total Users: <span className="text-foreground font-medium">{users.total}</span>
                    </div>
                </div>

                {/* Users list */}
                <Card>
                    <CardContent className="p-0">
                        {users.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Shield className="text-muted-foreground mb-4 h-12 w-12 opacity-50" />
                                <h3 className="mb-1 text-lg font-semibold">No Users Found</h3>
                                <p className="text-muted-foreground max-w-sm">
                                    No users match your search criteria. Try adjusting your filters or search terms.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead className="w-[250px]">User</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Joined</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id} className="group">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={user.avatar} />
                                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{user.name}</span>
                                                            <span className="text-muted-foreground text-xs">{user.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                                                        className="capitalize shadow-none"
                                                    >
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">{user.created_at}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {user.id !== auth.user.id && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="text-muted-foreground h-8 w-8 hover:bg-orange-50 hover:text-orange-600"
                                                                onClick={() => setImpersonatingUser(user)}
                                                                title={`Impersonate ${user.name}`}
                                                            >
                                                                <UserCog className="h-4 w-4" />
                                                            </Button>
                                                        )}

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
                                                                >
                                                                    <span className="sr-only">Open menu</span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                <DropdownMenuItem
                                                                    onClick={() => {
                                                                        setEditingUser(user);
                                                                        setSheetOpen(true);
                                                                    }}
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit Details
                                                                </DropdownMenuItem>
                                                                {user.id !== auth.user.id && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => setDeletingUser(user)}
                                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete Account
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-muted-foreground text-sm">
                            Showing {users.data.length} of {users.total} results
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled={users.current_page <= 1} asChild={users.current_page > 1}>
                                {users.current_page > 1 ? (
                                    <Link href={route('admin.users.index', { page: users.current_page - 1, ...filters })}>Previous</Link>
                                ) : (
                                    <span>Previous</span>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={users.current_page >= users.last_page}
                                asChild={users.current_page < users.last_page}
                            >
                                {users.current_page < users.last_page ? (
                                    <Link href={route('admin.users.index', { page: users.current_page + 1, ...filters })}>Next</Link>
                                ) : (
                                    <span>Next</span>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent side="right" className="w-full p-0 sm:max-w-lg">
                    <UserForm close={() => setSheetOpen(false)} user={editingUser} />
                </SheetContent>
            </Sheet>

            {/* Impersonation Dialog */}
            <AlertDialog open={!!impersonatingUser} onOpenChange={(open) => !open && setImpersonatingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="mb-2 flex items-center gap-3 text-orange-600">
                            <div className="rounded-full bg-orange-100 p-2">
                                <ShieldAlert className="h-5 w-5" />
                            </div>
                            <AlertDialogTitle>Enter Impersonation Mode?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription className="text-base">
                            You are about to switch to <strong>{impersonatingUser?.name}'s</strong> account.
                            <br />
                            <br />
                            <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                                <li>You will see the system exactly as they do.</li>
                                <li>All actions will be logged as performed by you on their behalf.</li>
                                <li>You can exit anytime using the banner at the top.</li>
                            </ul>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmImpersonation} className="bg-orange-600 text-white hover:bg-orange-700">
                            Start Impersonating
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Dialog */}
            <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete <strong>{deletingUser?.name}</strong>? This action cannot be undone and will
                            remove all associated data including applications and documents.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
