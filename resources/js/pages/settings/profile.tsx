import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircleIcon, UserIcon, MailIcon, SaveIcon, ShieldIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
}

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;
    const [saveAnimation, setSaveAnimation] = useState(false);

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setSaveAnimation(true);

        patch(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => {
                setTimeout(() => setSaveAnimation(false), 2000);
            },
        });
    };

    // Define animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 120, damping: 14 }
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            
            <SettingsLayout>
                <motion.div 
                    className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 pb-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <Card className="bg-card border-border shadow-sm overflow-hidden">
                            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary/90 to-primary/70 overflow-hidden">
                                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            
                            <div className="px-4 sm:px-6 pb-5 -mt-12 relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background rounded-full shadow-md">
                                        <AvatarFallback className="text-xl sm:text-2xl font-semibold bg-primary text-primary-foreground">
                                            {getInitials(data.name)}
                                        </AvatarFallback>
                                        {/* Add AvatarImage when you have user images */}
                                    </Avatar>
                                    
                                    <div className="space-y-1 pt-2 sm:pt-0">
                                        <h2 className="text-xl sm:text-2xl font-bold truncate">{data.name}</h2>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm text-muted-foreground">{data.email}</p>
                                            {auth.user.email_verified_at && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Badge variant="outline" className="px-1.5 py-0 h-5 text-xs bg-green-500/10 text-green-600 border-green-500/20 flex items-center gap-0.5">
                                                                <CheckCircleIcon className="h-3 w-3" />
                                                                <span>Verified</span>
                                                            </Badge>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">Email verified on {new Date(auth.user.email_verified_at).toLocaleDateString()}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
                        <div className="md:col-span-2 space-y-6">
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-5 w-5 text-primary/70" />
                                        <CardTitle className="text-lg">Profile Information</CardTitle>
                                    </div>
                                    <CardDescription>Update your personal information and contact details</CardDescription>
                                </CardHeader>
                                
                                <CardContent>
                                    <form onSubmit={submit} className="space-y-5">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name" className="flex items-center gap-1.5">
                                                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                Name
                                            </Label>

                                            <Input
                                                id="name"
                                                className="mt-1 block w-full"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                required
                                                autoComplete="name"
                                                placeholder="Full name"
                                            />

                                            <InputError className="mt-1" message={errors.name} />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email" className="flex items-center gap-1.5">
                                                <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                Email address
                                            </Label>

                                            <Input
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                required
                                                autoComplete="username"
                                                placeholder="Email address"
                                            />

                                            <InputError className="mt-1" message={errors.email} />
                                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 text-amber-800 dark:text-amber-200">
                                <div className="flex items-start gap-2">
                                    <ShieldIcon className="h-5 w-5 text-amber-500 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Email verification required</p>
                                        <p className="text-xs mt-1 text-amber-700 dark:text-amber-300">
                                            Your email address is unverified.{' '}
                                            <Link
                                                href={route('verification.send')}
                                                method="post"
                                                as="button"
                                                className="font-medium underline decoration-amber-400 underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                                            >
                                                Click here to resend verification email
                                            </Link>
                                        </p>

                                        {status === 'verification-link-sent' && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="mt-2 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800"
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircleIcon className="h-3.5 w-3.5" />
                                                    A new verification link has been sent to your email address
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 pt-2">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button 
                                    disabled={processing} 
                                    className="flex items-center gap-1.5"
                                    size="sm"
                                >
                                    <SaveIcon className="h-4 w-4" /> Save Changes
                                </Button>
                            </motion.div>

                            <AnimatePresence>
                                {recentlySuccessful && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                    >
                                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 flex items-center gap-1">
                                            <CheckCircleIcon className="h-3 w-3" />
                                            Profile saved successfully
                                        </Badge>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div>
                            <Card className="bg-card border-border">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Account Actions</CardTitle>
                                    <CardDescription>Manage your account settings</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <DeleteUser />
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </motion.div>
            </SettingsLayout>
        </AppLayout>
    );
}
