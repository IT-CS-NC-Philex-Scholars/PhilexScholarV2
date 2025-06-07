import * as React from "react"
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen, Folder, LayoutGrid, FileText, Award, User, Users, Settings, Home, Timer, CheckCircle,
    Search, Database, FileEdit // Added for new sections
} from 'lucide-react';
import AppLogo from './app-logo';

// NOTE: Ensure these components exist or create them similar to NavMain
import { NavDocuments } from "@/components/nav-documents"; 
import { NavSecondary } from "@/components/nav-secondary";

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
        title: 'Community Service',
        href: '#', // Will be dynamically set based on active application
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
        title: 'Community Service',
        href: route('admin.community-service.index'),
        icon: CheckCircle,
    },
    {
        title: 'Students',
        href: route('admin.students.index'),
        icon: Users,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

const documentNavItems: NavItem[] = [
    { title: "Data Library", href: "#", icon: Database },
    { title: "Reports", href: "#", icon: FileText },
    { title: "Word Assistant", href: "#", icon: FileEdit },
];

const secondaryNavItems: NavItem[] = [
    { title: "Settings", href: "/settings", icon: Settings },
    { title: "Get Help", href: "#", icon: BookOpen },
    { title: "Search", href: "#", icon: Search },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const page = usePage();
    const pageProps = page.props as {
        auth?: { user?: { role?: string; [key: string]: any } };
        application?: { id?: string | number; [key: string]: any }; // For current application context
        [key: string]: any;
    };
    const user = pageProps.auth?.user;
    const currentApplication = pageProps.application; // Store for use in nav item logic
    
    // Determine which navigation items to use based on user role
    let navItems: NavItem[];

    if (user?.role === 'admin') {
        navItems = adminNavItems;
    } else {
        // Student navigation: Make a deep copy to allow modification for dynamic links
        navItems = studentNavItems.map(item => ({ ...item })); 
        const communityServiceItem = navItems.find(item => item.title === 'Community Service');
        
        if (communityServiceItem) {
            // If a specific application context (e.g., viewing an application or its CS dashboard)
            // is available via pageProps.application, link "Community Service" to that specific application.
            // Otherwise, link to the "My Applications" page, so the student can select one.
            if (currentApplication && typeof currentApplication.id !== 'undefined' && String(currentApplication.id).trim().length > 0) {
                communityServiceItem.href = route('student.community-service.create', currentApplication.id);
            } else {
                communityServiceItem.href = route('student.applications.index');
            }
        }
    }
    
    // Get dashboard link based on user role
    const dashboardLink = user?.role === 'admin' ? route('admin.dashboard') : route('student.dashboard');
    
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <Link href={dashboardLink} prefetch className="flex items-center gap-2">
                                <AppLogo />
                                {/* <span className="text-base font-semibold">Acme Inc.</span> */}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={navItems} />
                {/* <NavDocuments items={documentNavItems} /> */}
                <NavSecondary items={secondaryNavItems} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
