import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, FileText, Award, User, Users, Settings } from 'lucide-react';
import AppLogo from './app-logo';

// Get student navigation items
const studentNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('student.dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Scholarships',
        href: route('student.scholarships.index'),
        icon: Award,
    },
    {
        title: 'My Applications',
        href: route('student.applications.index'),
        icon: FileText,
    },
    {
        title: 'My Profile',
        href: route('student.profile.edit'),
        icon: User,
    },
];

// Get admin navigation items
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
        icon: LayoutGrid,
    },
    {
        title: 'Manage Scholarships',
        href: route('admin.scholarships.index'),
        icon: Award,
    },
    {
        title: 'Applications',
        href: route('admin.applications.index'),
        icon: FileText,
    },
    {
        title: 'Students',
        href: '/admin/students',
        icon: Users,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Help',
        href: '#',
        icon: BookOpen,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    
    // Determine which navigation items to use based on user role
    const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;
    
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={user?.role === 'admin' ? route('admin.dashboard') : route('student.dashboard')} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
