import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

import SocialitePlus from '@/components/socialite-plus';
import SpatieLoginLinks from '@/components/spatie-login-links';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    isDevelopment?: boolean;
    loginLinks?: Array<{
        id: number;
        name: string;
        email: string;
        role: string;
        label: string;
        loginData: {
            email: string;
            key: number;
            guard?: string | null;
            redirect_url?: string;
            user_attributes?: object;
            user_model?: string | null;
        };
    }>;
}

interface SocialRegisterProps {
    providersConfig: {
        button_text: string;
        disable_credentials_login: boolean;
        providers: { name: string; icon: 'FacebookIcon' | 'GitHubIcon' | 'GoogleIcon' | 'LinkedInIcon'; branded: boolean }[];
    };
}

export default function Login({ status, canResetPassword, providersConfig, isDevelopment, loginLinks }: LoginProps & SocialRegisterProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const credentialForm = (
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>

            <SocialitePlus
                providersConfig={providersConfig}
                disableCredentialsLogin={providersConfig.disable_credentials_login}
            />

                {/* Spatie Login Links for Testing */}
                {isDevelopment && loginLinks && <SpatieLoginLinks loginLinks={loginLinks} />}

                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>
    );

    const socialOnlyLogin = (
        <div className="flex flex-col gap-6">
            <SocialitePlus
                providersConfig={providersConfig}
                disableCredentialsLogin={providersConfig.disable_credentials_login}
            />
            {isDevelopment && loginLinks && <SpatieLoginLinks loginLinks={loginLinks} />}
        </div>
    );

    return (
        <AuthLayout
            title={providersConfig.disable_credentials_login ? 'Log in with' : 'Log in to your account'}
            description={
                providersConfig.disable_credentials_login
                    ? 'Choose a provider to log in with'
                    : 'Enter your email and password below to log in'
            }
        >
            <Head title="Log in" />

            {providersConfig.disable_credentials_login ? socialOnlyLogin : credentialForm}

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
