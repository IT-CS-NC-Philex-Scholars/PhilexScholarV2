import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types/index.d';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="h-screen flex items-center justify-center">
            <div className="w-full h-full grid lg:grid-cols-2 p-4">
                <div className="max-w-xs m-auto w-full flex flex-col items-center">
                    <Link href={route('home')} className="flex items-center">
                        <AppLogoIcon className="h-9 w-9" />
                    </Link>
                    
                    {title && (
                        <p className="mt-4 text-xl font-bold tracking-tight">{title}</p>
                    )}
                    {description && (
                        <p className="text-muted-foreground text-sm text-balance">{description}</p>
                    )}
                    
                    <div className="w-full mt-8">
                        {children}
                    </div>
                </div>
                <div className="bg-muted hidden lg:block rounded-lg" />
            </div>
        </div>
    );
}
