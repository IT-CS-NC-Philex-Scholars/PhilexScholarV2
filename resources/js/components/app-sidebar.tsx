import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, FileText, Award, User, Users, Settings, Home } from 'lucide-react';
import AppLogo from './app-logo';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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
        href: route('admin.students.index'),
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
    
    // Animation state for showing the nav
    const [isLoaded, setIsLoaded] = useState(false);
    
    // Active tab state for mobile nav
    const [activeTab, setActiveTab] = useState('');
    
    // Set initial active tab based on current route
    useEffect(() => {
        setIsLoaded(true);
        const pathname = window.location.pathname;
        
        if (pathname.includes('/student/dashboard') || pathname.includes('/admin/dashboard')) {
            setActiveTab('dashboard');
        } else if (pathname.includes('/scholarships')) {
            setActiveTab('scholarships');
        } else if (pathname.includes('/applications')) {
            setActiveTab('applications');
        } else if (pathname.includes('/profile')) {
            setActiveTab('profile');
        }
    }, []);
    
    // Determine which navigation items to use based on user role
    const navItems = user?.role === 'admin' ? adminNavItems : studentNavItems;
    
    // Get dashboard link based on user role
    const dashboardLink = user?.role === 'admin' ? route('admin.dashboard') : route('student.dashboard');
    
    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar collapsible="icon" variant="inset">
                    <SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link href={dashboardLink} prefetch>
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
            </div>
            
            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border shadow-lg z-50 transition-all duration-300">
                <div className={cn("flex justify-around py-2 px-4", 
                              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
                              "transition-all duration-500 ease-out")}>
                    {navItems
                        .filter(item => item.title !== 'My Profile' && item.title !== 'Profile')
                        .map((item) => (
                            <Link 
                                key={item.title.toLowerCase()}
                                href={item.href}
                                className={cn("flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-300",
                                          activeTab === item.title.toLowerCase() ? "text-primary" : "text-muted-foreground")}
                                onClick={() => setActiveTab(item.title.toLowerCase())}
                            >
                                {<item.icon className={cn("h-5 w-5 mb-1 transition-all duration-300", 
                                                 activeTab === item.title.toLowerCase() ? "scale-110" : "scale-100")} />}
                                <span className="text-xs font-medium">{item.title}</span>
                            </Link>
                        ))}
                </div>
            </div>
        </>
    );
}
