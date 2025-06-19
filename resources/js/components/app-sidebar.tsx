import * as React from "react"
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen, LayoutGrid, FileText, Award, User, Users, Settings, Timer, CheckCircle,
    Search, Bell, HelpCircle, Shield
} from 'lucide-react';
import AppLogo from './app-logo';
import { NavSecondary } from "@/components/nav-secondary";

// Get student navigation items
const getStudentNavItems = (currentApplication?: any): NavItem[] => [
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
        title: 'Community Service',
        href: currentApplication?.id
            ? route('student.community-service.create', currentApplication.id)
            : route('student.applications.index'),
        icon: Timer,
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
        title: 'Scholarships',
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
        href: route('admin.students.index'),
        icon: Users,
    },
    {
        title: 'Users',
        href: route('admin.users.index'),
        icon: Shield,
    }
];

// Support and settings items
const getSupportNavItems = (userRole?: string): NavItem[] => [
    {
        title: 'Settings',
        href: route('profile.edit'),
        icon: Settings,
    },

    {
        title: 'Help & Support',
        href: '#help',
        icon: HelpCircle,
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const page = usePage();
    const pageProps = page.props as {
        auth?: { user?: { role?: string;[key: string]: any } };
        application?: { id?: string | number;[key: string]: any };
        [key: string]: any;
    };

    const user = pageProps.auth?.user;
    const currentApplication = pageProps.application;

    // Get navigation items based on user role
    const mainNavItems = React.useMemo(() => {
        if (user?.role === 'admin') {
            return adminNavItems;
        } else {
            return getStudentNavItems(currentApplication);
        }
    }, [user?.role, currentApplication]);

    const supportNavItems = React.useMemo(() => {
        return getSupportNavItems(user?.role);
    }, [user?.role]);

    // Get dashboard link based on user role
    const dashboardLink = user?.role === 'admin' ? route('admin.dashboard') : route('student.dashboard');

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <Link
                                href={dashboardLink}
                                prefetch
                                className="flex items-center gap-2 transition-colors"
                            >
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="flex flex-col gap-0">
                <div className="flex-1">
                    <NavMain items={mainNavItems} />
                </div>
                <div className="mt-auto pt-4 border-t border-sidebar-border">
                    <NavSecondary items={supportNavItems} />
                </div>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border">
                <NavUser />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
