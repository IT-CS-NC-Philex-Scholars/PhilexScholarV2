import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { Toaster } from '@/components/ui/sonner';
import { NotificationProvider } from '@/hooks/use-notifications';
import { type BreadcrumbItem } from '@/types';
import { type PropsWithChildren, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const page = usePage();
    const { flash } = page.props as { flash?: { success?: string; error?: string } };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
            // Clear the flash message from props after displaying to prevent re-showing on component re-renders without a new flash
            // This assumes Inertia doesn't automatically clear it from props client-side, which it usually doesn't for shared props.
            // A more robust way might involve managing a 'messageDisplayed' state if toasts re-appear unexpectedly.
            // For now, we'll rely on Inertia only delivering it once per redirect.
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <NotificationProvider>
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
            <Toaster position="top-right" richColors closeButton />
        </NotificationProvider>
    );
}
