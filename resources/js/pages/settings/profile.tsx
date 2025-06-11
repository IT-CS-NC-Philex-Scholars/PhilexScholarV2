// @ts-ignore - Ignoring type errors for SharedData
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircleIcon, UserIcon, MailIcon, SaveIcon, ShieldIcon, CameraIcon, RefreshCwIcon, SettingsIcon, KeyIcon, BellIcon, MenuIcon } from 'lucide-react';
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
    const [isHovered, setIsHovered] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    // Enhanced animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                staggerChildren: 0.08,
                delayChildren: 0.05,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1] // Custom ease curve for smoother animation
            }
        },
        exit: {
            opacity: 0,
            transition: {
                staggerChildren: 0.05,
                staggerDirection: -1,
            }
        }
    };
    
    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { 
                type: "spring", 
                stiffness: 120, 
                damping: 14,
                mass: 0.8
            }
        },
        exit: {
            y: 8,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { 
            opacity: 1, 
            height: 'auto',
            transition: { duration: 0.3, ease: 'easeOut' }
        }
    };

    const profileImageVariants = {
        initial: { scale: 1, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
        hover: { 
            scale: 1.03, 
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
            transition: { duration: 0.3, ease: 'easeOut' }
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
                className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 pb-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div 
                        variants={itemVariants}
                        className="relative mx-auto max-w-4xl"
                    >
                        <Card className="bg-gradient-to-br from-background to-background/95 border-0 overflow-hidden rounded-xl shadow-lg">
                            <div className="relative h-40 sm:h-48 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 overflow-hidden group cursor-pointer" onClick={() => document.getElementById('cover-upload')?.click()}>
                                {auth.user.cover_image ? (
                                    <img 
                                        src={`/storage/${auth.user.cover_image}`} 
                                        alt="Cover" 
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0.6, scale: 1 }}
                                        animate={{ 
                                            opacity: 1,
                                            scale: 1.05,
                                            transition: { duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }
                                        }}
                                        className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxwYXRoIGQ9Ik0gMCAxMCBMIDIwIDEwIiBzdHJva2U9IiNmZmZmZmYxNSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3BhdHRlcm4pIi8+PC9zdmc+')]"></motion.div>
                                )}
                                
                                {/* Cover image upload overlay */}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <CameraIcon className="h-8 w-8 mx-auto mb-2" />
                                        <p className="text-sm font-medium">Change Cover</p>
                                    </div>
                                </div>
                                
                                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background/80 via-background/30 to-transparent"></div>
                                
                                {/* Hidden file input for cover */}
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
                                            
                                            router.post(route('profile.upload-cover'), formData, {
                                                forceFormData: true,
                                                preserveScroll: true,
                                            });
                                        }
                                    }}
                                />
                            </div>
                            
                            <div className="px-6 sm:px-8 pb-6 -mt-16 relative z-10">
                                <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                                    <motion.div
                                        className="relative group"
                                        onHoverStart={() => setIsHovered(true)}
                                        onHoverEnd={() => setIsHovered(false)}
                                        variants={profileImageVariants}
                                        initial="initial"
                                        whileHover="hover"
                                    >
                                        <Avatar className="h-28 w-28 sm:h-32 sm:w-32 border-4 border-background rounded-full shadow-xl">
                                            {auth.user.avatar && (
                                                <AvatarImage src={`/storage/${auth.user.avatar}`} alt={data.name} />
                                            )}
                                            <AvatarFallback className="text-2xl sm:text-3xl font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                                {getInitials(data.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <motion.div 
                                            className="absolute bottom-1 right-1 p-1.5 rounded-full bg-background shadow-md opacity-0 group-hover:opacity-100 cursor-pointer"
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={isHovered ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                        >
                                            <CameraIcon className="h-4 w-4 text-primary" />
                                        </motion.div>
                                        
                                        {/* Hidden file input for avatar */}
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
                                                    
                                                    router.post(route('profile.upload-avatar'), formData, {
                                                        forceFormData: true,
                                                        preserveScroll: true,
                                                    });
                                                }
                                            }}
                                        />
                                    </motion.div>
                                    
                                    <div className="space-y-2 pt-2 sm:pt-0">
                                        <motion.h2 
                                            className="text-2xl sm:text-3xl font-bold tracking-tight"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.5 }}
                                        >
                                            {data.name}
                                        </motion.h2>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <motion.p 
                                                className="text-sm text-muted-foreground"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3, duration: 0.5 }}
                                            >
                                                {data.email}
                                            </motion.p>
                                            {auth.user.email_verified_at && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.4, duration: 0.4 }}
                                                >
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge variant="outline" className="px-2 py-0.5 h-6 text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex items-center gap-1">
                                                                    <CheckCircleIcon className="h-3 w-3" />
                                                                    <span>Verified</span>
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className="text-xs">Email verified on {new Date(auth.user.email_verified_at).toLocaleDateString()}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </motion.div>
                                            )}
                                                 
                                                     {auth.user.facebook_avatar && (
                                                 <motion.div
                                                     initial={{ opacity: 0, x: -5 }}
                                                     animate={{ opacity: 1, x: 0 }}
                                                     transition={{ delay: 0.5, duration: 0.4 }}
                                                 >
                                                     <TooltipProvider>
                                                         <Tooltip>
                                                             <TooltipTrigger asChild>
                                                                 <Button
                                                                     variant="outline"
                                                                     size="sm"
                                                                     className="h-6 px-2 text-xs bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"
                                                                     onClick={() => {
                                                                         router.post(route('profile.use-facebook-avatar'), {}, {
                                                                             preserveScroll: true
                                                                         });
                                                                     }}
                                                                 >
                                                                     <svg className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
                                                                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                                     </svg>
                                                                     Use Facebook Avatar
                                                                 </Button>
                                                             </TooltipTrigger>
                                                             <TooltipContent>
                                                                 <p className="text-xs">Use your Facebook profile picture</p>
                                                             </TooltipContent>
                                                         </Tooltip>
                                                     </TooltipProvider>
                                                 </motion.div>
                                             )}
                                        </div>
                                        
                                        {auth.user.facebook_profile_url && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6, duration: 0.4 }}
                                                className="pt-2"
                                            >
                                                <a
                                                    href={auth.user.facebook_profile_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                                                >
                                                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                    </svg>
                                                    View Facebook Profile
                                                </a>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="space-y-10">
                        <div className="space-y-8">
                            <motion.div 
                                variants={itemVariants}
                                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                            >
                                <Card className="bg-background border shadow-md overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg">
                                    <CardHeader className="pb-4 border-b">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-full bg-primary/10">
                                                <UserIcon className="h-5 w-5 text-primary" />
                                            </div>
                                            <CardTitle className="text-xl">Profile Information</CardTitle>
                                        </div>
                                        <CardDescription className="mt-1.5">Update your personal information and contact details</CardDescription>
                                    </CardHeader>
                                    
                                    <CardContent className="pt-6">
                                        <form onSubmit={submit} className="space-y-6">
                                            <motion.div 
                                                className="grid gap-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <Label htmlFor="name" className="flex items-center gap-1.5 text-sm font-medium">
                                                    <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                    Name
                                                </Label>

                                                <Input
                                                    id="name"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    required
                                                    autoComplete="name"
                                                    placeholder="Full name"
                                                />

                                                <InputError className="mt-1" message={errors.name} />
                                            </motion.div>

                                            <motion.div 
                                                className="grid gap-3"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <Label htmlFor="email" className="flex items-center gap-1.5 text-sm font-medium">
                                                    <MailIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                                    Email address
                                                </Label>

                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    required
                                                    autoComplete="username"
                                                    placeholder="Email address"
                                                />

                                                <InputError className="mt-1" message={errors.email} />
                                            </motion.div>

                                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.4 }}
                                                    className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 text-amber-800 dark:text-amber-200"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-800/40 mt-0.5">
                                                            <ShieldIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium">Email verification required</p>
                                                            <p className="text-xs mt-1.5 text-amber-700 dark:text-amber-300">
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
                                                                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                                                    className="mt-3 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2.5 rounded-lg border border-green-100 dark:border-green-800"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <CheckCircleIcon className="h-4 w-4" />
                                                                        A new verification link has been sent to your email address
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <motion.div 
                                                className="flex items-center gap-4 pt-2"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                            >
                                                <motion.div 
                                                    whileHover={{ scale: 1.03 }} 
                                                    whileTap={{ scale: 0.97 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                                >
                                                    <Button 
                                                        disabled={processing} 
                                                        className="flex items-center gap-2 px-5 py-2 h-10 bg-gradient-to-r from-primary to-primary-400 hover:from-primary-600 hover:to-primary-500 shadow-md hover:shadow-lg transition-all duration-300"
                                                        type="submit"
                                                    >
                                                        {saveAnimation ? (
                                                            <motion.div 
                                                                animate={{ rotate: 360 }} 
                                                                transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                                                            >
                                                                <RefreshCwIcon className="h-4 w-4" />
                                                            </motion.div>
                                                        ) : (
                                                            <SaveIcon className="h-4 w-4" />
                                                        )}
                                                        Save Changes
                                                    </Button>
                                                </motion.div>

                                                <AnimatePresence>
                                                    {recentlySuccessful && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, x: -10, y: 0 }}
                                                            animate={{ opacity: 1, x: 0, y: 0 }}
                                                            exit={{ opacity: 0, x: 10 }}
                                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                                        >
                                                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 py-1.5 px-3 flex items-center gap-1.5 shadow-sm">
                                                                <CheckCircleIcon className="h-4 w-4" />
                                                                Profile saved successfully
                                                            </Badge>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                        
                        <motion.div 
                            variants={itemVariants}
                            whileHover={{ y: -4, transition: { duration: 0.3 } }}
                        >
                            <Card className="bg-background border shadow-md overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg">
                                <CardHeader className="pb-4 border-b">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-full bg-purple-500/10">
                                            <CameraIcon className="h-5 w-5 text-purple-500" />
                                        </div>
                                        <CardTitle className="text-xl">Profile Images</CardTitle>
                                    </div>
                                    <CardDescription className="mt-1.5">Upload and manage your profile avatar and cover image</CardDescription>
                                </CardHeader>
                                
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Avatar Upload Section */}
                                        <motion.div 
                                            className="space-y-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <div className="text-center">
                                                <div className="flex justify-center mb-4">
                                                    <Avatar className="h-20 w-20 border-2 border-border">
                                                        {auth.user.avatar && (
                                                            <AvatarImage src={`/storage/${auth.user.avatar}`} alt={data.name} />
                                                        )}
                                                        <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                                            {getInitials(data.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <h3 className="font-semibold text-sm mb-2">Profile Avatar</h3>
                                                <p className="text-xs text-muted-foreground mb-4">Upload a photo for your profile. Recommended size: 400x400px, Max: 5MB</p>
                                                
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() => document.getElementById('avatar-upload-main')?.click()}
                                                    >
                                                        <CameraIcon className="h-4 w-4 mr-2" />
                                                        {auth.user.avatar ? 'Change Avatar' : 'Upload Avatar'}
                                                    </Button>
                                                    
                                                    {auth.user.facebook_avatar && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"
                                                            onClick={() => {
                                                                router.post(route('profile.use-facebook-avatar'), {}, {
                                                                    preserveScroll: true
                                                                });
                                                            }}
                                                        >
                                                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                                            </svg>
                                                            Use Facebook Avatar
                                                        </Button>
                                                    )}
                                                </div>
                                                
                                                <input
                                                    id="avatar-upload-main"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const formData = new FormData();
                                                            formData.append('avatar', file);
                                                            
                                                            router.post(route('profile.upload-avatar'), formData, {
                                                                forceFormData: true,
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                        
                                        {/* Cover Image Upload Section */}
                                        <motion.div 
                                            className="space-y-4"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <div className="text-center">
                                                <div className="mb-4">
                                                    <div className="aspect-[3/1] w-full max-w-48 mx-auto rounded-lg overflow-hidden border-2 border-border bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                                                        {auth.user.cover_image ? (
                                                            <img 
                                                                src={`/storage/${auth.user.cover_image}`} 
                                                                alt="Cover" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <CameraIcon className="h-6 w-6 text-white/70" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-sm mb-2">Cover Image</h3>
                                                <p className="text-xs text-muted-foreground mb-4">Upload a cover image for your profile. Recommended size: 1200x400px, Max: 10MB</p>
                                                
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => document.getElementById('cover-upload-main')?.click()}
                                                >
                                                    <CameraIcon className="h-4 w-4 mr-2" />
                                                    {auth.user.cover_image ? 'Change Cover' : 'Upload Cover'}
                                                </Button>
                                                
                                                <input
                                                    id="cover-upload-main"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const formData = new FormData();
                                                            formData.append('cover_image', file);
                                                            
                                                            router.post(route('profile.upload-cover'), formData, {
                                                                forceFormData: true,
                                                                preserveScroll: true,
                                                            });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </motion.div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        
                        <motion.div 
                            variants={itemVariants} 
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -4, transition: { duration: 0.3 } }}
                        >
                            <Card className="bg-background border shadow-md overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg">
                                <CardHeader className="pb-4 border-b">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-1.5 rounded-full bg-red-500/10">
                                            <ShieldIcon className="h-5 w-5 text-red-500" />
                                        </div>
                                        <CardTitle className="text-xl">Account Actions</CardTitle>
                                    </div>
                                    <CardDescription className="mt-1.5">Manage your account settings and preferences</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <DeleteUser />
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </SettingsLayout>
        </AppLayout>
    );
}
