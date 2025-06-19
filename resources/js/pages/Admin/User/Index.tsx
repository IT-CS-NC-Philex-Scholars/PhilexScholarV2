import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { User as UserType, BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Shield } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import UserForm from './UserForm';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface UserIndexProps {
  users: {
    data: (UserType & { role: string })[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  filters: {
    search?: string;
  };
}

export default function UserIndex({ users, filters }: UserIndexProps) {
  const { data, setData, get, processing } = useForm({
    search: filters.search || '',
  });

  // Only table view
  const [isMobile, setIsMobile] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(UserType & { role: string }) | null>(null);

  // Remove viewMode handling

  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'Admin Dashboard',
      href: route('admin.dashboard'),
    },
    { title: 'Users' },
  ];

  const searchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    get(route('admin.users.index'));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Users Management" />
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <h1 className="mb-1 text-2xl font-bold md:text-3xl">Users</h1>
            <p className="text-muted-foreground">Manage application users and their roles</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setEditingUser(null);
                setSheetOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create User</span>
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>Search Users</CardTitle>
            <CardDescription>Find users by name or email</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={searchSubmit} className="relative max-w-md">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={data.search}
                onChange={(e) => setData('search', e.target.value)}
              />
            </form>
          </CardContent>
        </Card>

        {/* Users list */}
        {users.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Shield className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-1 text-lg font-semibold">No Users Found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'secondary' : 'outline'} className="text-xs">
                            {user.role === 'admin' ? 'Admin' : 'Student'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => { setEditingUser(user); setSheetOpen(true); }}>
                              Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {users.last_page > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">
              Showing {users.data.length} of {users.total} users
            </div>
            <div className="flex gap-2">
              {users.current_page > 1 && (
                <Button asChild variant="outline" size="sm">
                  <Link href={route('admin.users.index', { page: users.current_page - 1, ...filters })}>Previous</Link>
                </Button>
              )}
              {users.current_page < users.last_page && (
                <Button asChild variant="outline" size="sm">
                  <Link href={route('admin.users.index', { page: users.current_page + 1, ...filters })}>Next</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="p-0 w-full sm:max-w-lg">
          <UserForm close={() => setSheetOpen(false)} user={editingUser} />
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
