import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/hooks/use-notifications';
import { type BreadcrumbItem } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { LogOut, ShieldAlert } from 'lucide-react';
import { type PropsWithChildren, useEffect } from 'react';
import { toast } from 'sonner';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const page = usePage();
    const { flash, auth } = page.props as any;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const stopImpersonating = () => {
        router.post(route('stop-impersonating'));
    };

    return (
        <NotificationProvider>
            <AppShell variant="sidebar">
                <AppSidebar variant="inset" />
                <AppContent variant="sidebar" className="mb-safe md:mb-0">
                    {auth?.isImpersonating && (
                        <div className="sticky top-0 z-50 w-full border-b border-orange-200 bg-orange-50/95 text-orange-900 backdrop-blur supports-[backdrop-filter]:bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/50 dark:text-orange-100">
                            <div className="flex h-12 items-center justify-between px-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                                        <span className="text-sm font-semibold">Impersonation Active</span>
                                        <span className="hidden text-sm text-orange-700/80 sm:inline dark:text-orange-300/80">•</span>
                                        <span className="text-xs sm:text-sm">
                                            You are viewing as{' '}
                                            <span className="font-medium underline decoration-orange-300/50 underline-offset-4">
                                                {auth.user.name}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 border-orange-200 bg-white/50 text-orange-900 hover:bg-white hover:text-orange-950 dark:border-orange-800 dark:bg-black/20 dark:text-orange-100 dark:hover:bg-black/40"
                                    onClick={stopImpersonating}
                                >
                                    <LogOut className="mr-2 h-3.5 w-3.5" />
                                    Exit
                                </Button>
                            </div>
                        </div>
                    )}
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
                <MobileBottomNav />
            </AppShell>
            <Toaster position="top-right" richColors closeButton />
        </NotificationProvider>
    );
}
