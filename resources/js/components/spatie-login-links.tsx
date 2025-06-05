import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface LoginLinkData {
    email: string;
    key: number;
    guard?: string | null;
    redirect_url?: string;
    user_attributes?: object;
    user_model?: string | null;
}

interface LoginLink {
    id: number;
    name: string;
    email: string;
    role: string;
    label: string;
    loginData: LoginLinkData;
}

interface SpatieLoginLinksProps {
    loginLinks: LoginLink[];
    className?: string;
}

export default function SpatieLoginLinks({ loginLinks, className = '' }: SpatieLoginLinksProps) {
    const handleQuickLogin = (loginData: LoginLinkData) => {
        router.post(route('loginLinkLogin'), {
            email: loginData.email,
            key: loginData.key.toString(),
            guard: loginData.guard || '',
            redirect_url: loginData.redirect_url || '',
            user_attributes: JSON.stringify(loginData.user_attributes || {}),
            user_model: loginData.user_model || '',
        });
    };

    if (!loginLinks || loginLinks.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="border-t pt-4">
                <p className="text-muted-foreground mb-3 text-center text-sm">
                    Quick Login with Spatie (Development Only)
                </p>
                <div className="grid grid-cols-1 gap-2">
                    {loginLinks.map((link) => (
                        <Button
                            key={link.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickLogin(link.loginData)}
                            className="text-xs justify-start"
                        >
                            <span className="flex items-center gap-2">
                                <span
                                    className={`inline-block w-2 h-2 rounded-full ${
                                        link.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}
                                />
                                {link.label}
                            </span>
                        </Button>
                    ))}
                </div>
                <div className="mt-3 text-xs text-muted-foreground text-center">
                    Powered by Spatie Laravel Login Link
                </div>
            </div>
        </div>
    );
}
