// @ts-ignore - Ignoring type errors for SharedData
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
    CheckCircleIcon, 
    UserIcon, 
    MailIcon, 
    SaveIcon, 
    ShieldIcon, 
    CameraIcon, 
    RefreshCwIcon, 
    AlertTriangleIcon,
    GraduationCapIcon,
    SparklesIcon
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile Settings',
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
    const [isHovered, setIsHovered] = useState(false);

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

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.1,
                duration: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile Settings" />
            
            <SettingsLayout>
                <motion.div 
                    className="space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hero Section - Compact & Friendly */}
                    <motion.div variants={itemVariants} className="relative group rounded-2xl overflow-hidden border border-border shadow-sm bg-card">
                        {/* Cover Image */}
                        <div 
                            className="h-32 sm:h-40 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 relative cursor-pointer overflow-hidden"
                            onClick={() => document.getElementById('cover-upload')?.click()}
                        >
                            {auth.user.cover_image && (
                                <img 
                                    src={`/storage/${auth.user.cover_image}`} 
                                    alt="Cover" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 backdrop-blur-sm">
                                    <CameraIcon className="h-3.5 w-3.5" />
                                    <span>Change Cover</span>
                                </div>
                            </div>
                            <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const formData = new FormData();
                                        formData.append('cover_image', file);
                                        router.post(route('profile.upload-cover'), formData, { forceFormData: true, preserveScroll: true });
                                    }
                                }}
                            />
                        </div>

                        {/* Avatar & Basic Info */}
                        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-10 relative">
                            <div className="relative">
                                <Avatar className="h-24 w-24 sm:h-28 sm:w-28 border-4 border-card shadow-md cursor-pointer group/avatar">
                                    {auth.user.avatar && <AvatarImage src={`/storage/${auth.user.avatar}`} alt={data.name} />}
                                    <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                                        {getInitials(data.name)}
                                    </AvatarFallback>
                                    
                                    {/* Avatar Edit Overlay */}
                                    <div 
                                        className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            document.getElementById('avatar-upload')?.click();
                                        }}
                                    >
                                        <CameraIcon className="h-6 w-6 text-white" />
                                    </div>
                                </Avatar>
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('avatar', file);
                                            router.post(route('profile.upload-avatar'), formData, { forceFormData: true, preserveScroll: true });
                                        }
                                    }}
                                />
                            </div>

                            <div className="flex-1 text-center sm:text-left space-y-1 mt-2 sm:mt-0 sm:pb-2">
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <h2 className="text-2xl font-bold">{data.name}</h2>
                                    {auth.user.email_verified_at && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <CheckCircleIcon className="h-5 w-5 text-blue-500" />
                                                </TooltipTrigger>
                                                <TooltipContent>Verified Student</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-1.5">
                                    <MailIcon className="h-3.5 w-3.5" />
                                    {data.email}
                                </p>
                            </div>

                            {/* Optional: Student Badge or Status */}
                            <div className="hidden sm:block sm:pb-4">
                                <Badge variant="secondary" className="px-3 py-1 flex items-center gap-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                                    <GraduationCapIcon className="h-3.5 w-3.5" />
                                    Scholar
                                </Badge>
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Form */}
                    <motion.div variants={itemVariants}>
                        <Card className="border-none shadow-sm bg-card/50">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <SparklesIcon className="h-5 w-5 text-amber-500" />
                                    Personal Details
                                </CardTitle>
                                <CardDescription>
                                    Manage your identity and how we contact you.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative">
                                                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    className="pl-9"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    required
                                                    placeholder="Your full name"
                                                />
                                            </div>
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <MailIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="pl-9"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    required
                                                    placeholder="your.email@example.com"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    {/* Email Verification Alert */}
                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                                            <AlertTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-medium text-amber-800">Verify your email</h4>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    We need to verify your email address.
                                                    <Link
                                                        href={route('verification.send')}
                                                        method="post"
                                                        as="button"
                                                        className="ml-1 underline font-semibold hover:text-amber-900"
                                                    >
                                                        Resend verification link
                                                    </Link>
                                                </p>
                                                {status === 'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600 flex items-center gap-1">
                                                        <CheckCircleIcon className="h-3.5 w-3.5" />
                                                        Verification link sent!
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Facebook Actions */}
                                    {(auth.user.facebook_avatar || auth.user.facebook_profile_url) && (
                                        <div className="pt-2 border-t flex flex-wrap gap-3">
                                            {auth.user.facebook_avatar && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.post(route('profile.use-facebook-avatar'), {}, { preserveScroll: true })}
                                                    className="text-xs"
                                                >
                                                    <img src="https://www.facebook.com/favicon.ico" alt="FB" className="h-3.5 w-3.5 mr-2" />
                                                    Use FB Avatar
                                                </Button>
                                            )}
                                            {auth.user.facebook_profile_url && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    asChild
                                                    className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <a href={auth.user.facebook_profile_url} target="_blank" rel="noopener noreferrer">
                                                        View FB Profile
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-4">
                                        <AnimatePresence>
                                            {recentlySuccessful && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full"
                                                >
                                                    <CheckCircleIcon className="h-4 w-4" />
                                                    <span>Saved!</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        
                                        <Button 
                                            type="submit" 
                                            disabled={processing}
                                            className="ml-auto min-w-[120px]"
                                        >
                                            {saveAnimation ? (
                                                <RefreshCwIcon className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <SaveIcon className="h-4 w-4 mr-2" />
                                            )}
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Danger Zone */}
                    <motion.div variants={itemVariants}>
                        <div className="mt-12">
                            <h3 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
                                <ShieldIcon className="h-4 w-4" />
                                Danger Zone
                            </h3>
                            <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-6">
                                        <DeleteUser />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>
                </motion.div>
            </SettingsLayout>
        </AppLayout>
    );
}
