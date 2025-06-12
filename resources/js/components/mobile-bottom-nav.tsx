import * as React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import {
    LayoutGrid,
    Award,
    FileText,
    Timer,
    User,
    Users,
    Settings,
    Bell,
    HelpCircle
} from 'lucide-react';

// Get student navigation items for mobile
const getStudentMobileNavItems = (currentApplication?: any): NavItem[] => [
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
        title: 'Applications',
        href: route('student.applications.index'),
        icon: FileText,
    },
    {
        title: 'Service',
        href: currentApplication?.id
            ? route('student.community-service.create', currentApplication.id)
            : route('student.applications.index'),
        icon: Timer,
    },
    {
        title: 'Profile',
        href: route('student.profile.edit'),
        icon: User,
    },
];

// Get admin navigation items for mobile
const adminMobileNavItems: NavItem[] = [
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
        title: 'Settings',
        href: route('profile.edit'),
        icon: Settings,
    },
];

interface MobileBottomNavProps {
    className?: string;
}

export function MobileBottomNav({ className }: MobileBottomNavProps) {
    const page = usePage();
    const pageProps = page.props as {
        auth?: { user?: { role?: string;[key: string]: any } };
        application?: { id?: string | number;[key: string]: any };
        [key: string]: any;
    };

    const user = pageProps.auth?.user;
    const currentApplication = pageProps.application;

    // Get navigation items based on user role
    const navItems = React.useMemo(() => {
        if (user?.role === 'admin') {
            return adminMobileNavItems;
        } else {
            return getStudentMobileNavItems(currentApplication);
        }
    }, [user?.role, currentApplication]);

    // Don't show on desktop
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
        const handleResize = () => {
            setIsVisible(window.innerWidth < 768); // Hide on md and above
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 md:hidden",
                    "bg-background/95 backdrop-blur-lg border-t border-border",
                    "pb-safe", // For iOS safe area
                    className
                )}
            >
                <div className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item, index) => {
                        const isActive = item.href === page.url ||
                            (item.href !== '/' && page.url.startsWith(item.href));

                        return (
                            <motion.div
                                key={item.title}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    delay: index * 0.1,
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 25
                                }}
                                className="relative flex-1"
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    className={cn(
                                        "flex flex-col items-center justify-center p-2 rounded-lg",
                                        "text-xs font-medium transition-all duration-200",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        "active:scale-95",
                                        "min-h-[60px] gap-1",
                                        isActive
                                            ? "text-primary bg-primary/10"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    <div className="relative">
                                        <item.icon
                                            className={cn(
                                                "h-5 w-5 transition-all duration-200",
                                                isActive ? "scale-110" : "scale-100"
                                            )}
                                        />
                                        {/* Active indicator */}
                                        <AnimatePresence>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0 }}
                                                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <span
                                        className={cn(
                                            "truncate max-w-full transition-all duration-200",
                                            isActive ? "font-semibold" : "font-normal"
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>


            </motion.nav>
        </AnimatePresence>
    );
}
