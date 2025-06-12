import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ExternalLinkIcon, ImageIcon, UserIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { router } from '@inertiajs/react';
import { toast } from "sonner";

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    facebook_id?: string;
    facebook_avatar?: string;
    facebook_profile_url?: string;
    provider?: string;
    provider_id?: string;
    provider_data?: any;
}

interface OAuthProfileSectionProps {
    user: User;
    onAvatarUpdate?: () => void;
}

export default function OAuthProfileSection({ user, onAvatarUpdate }: OAuthProfileSectionProps) {
    const [isApplyingAvatar, setIsApplyingAvatar] = useState(false);

    const handleApplyOAuthAvatar = async () => {
        if (!user.facebook_avatar) {
            toast.error("No OAuth avatar available");
            return;
        }

        setIsApplyingAvatar(true);
        
        try {
            const response = await fetch('/profile/apply-facebook-avatar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                onAvatarUpdate?.();
                // Refresh page to update avatar
                router.reload({ only: ['user'] });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Failed to apply OAuth avatar");
            console.error('Error applying OAuth avatar:', error);
        } finally {
            setIsApplyingAvatar(false);
        }
    };

    const getProviderIcon = () => {
        if (user.provider === 'google') {
            return (
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            );
        } else if (user.provider === 'facebook') {
            return (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            );
        }
        return <UserIcon className="w-5 h-5 text-white" />;
    };

    const getProviderColor = () => {
        if (user.provider === 'google') {
            return 'bg-red-600';
        } else if (user.provider === 'facebook') {
            return 'bg-blue-600';
        }
        return 'bg-gray-600';
    };

    const getProviderName = () => {
        if (user.provider === 'google') {
            return 'Google';
        } else if (user.provider === 'facebook') {
            return 'Facebook';
        }
        return user.provider ? user.provider.charAt(0).toUpperCase() + user.provider.slice(1) : 'OAuth';
    };

    const getProfileUrl = () => {
        if (user.provider === 'facebook') {
            if (user.facebook_profile_url) {
                return user.facebook_profile_url;
            }
            if (user.facebook_id) {
                return `https://facebook.com/${user.facebook_id}`;
            }
        }
        return null;
    };

    const isOAuthUser = !!user.provider;
    const hasOAuthData = user.facebook_id || user.facebook_avatar || user.facebook_profile_url || user.provider;
    const canUseOAuthAvatar = user.facebook_avatar && !user.avatar;
    const profileUrl = getProfileUrl();

    if (!hasOAuthData && !isOAuthUser) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${getProviderColor()} flex items-center justify-center`}>
                            {getProviderIcon()}
                        </div>
                        <div>
                            <CardTitle className="text-lg">{getProviderName()} Profile</CardTitle>
                            <CardDescription>
                                {isOAuthUser ? `Connected via ${getProviderName()} Login` : `${getProviderName()} account information`}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOAuthUser && (
                            <Badge variant="secondary" className={user.provider === 'google' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                OAuth Connected
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* OAuth Avatar Section */}
                {user.facebook_avatar && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">{getProviderName()} Profile Picture</h4>
                            {canUseOAuthAvatar && (
                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900 dark:text-orange-300">
                                    <AlertCircleIcon className="w-3 h-3 mr-1" />
                                    Not Applied
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={user.facebook_avatar} alt={`${getProviderName()} profile picture`} />
                                <AvatarFallback>
                                    <UserIcon className="w-8 h-8" />
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {user.avatar 
                                        ? `${getProviderName()} profile picture is available but not currently used as your avatar.`
                                        : "You can use this as your profile picture."
                                    }
                                </p>
                                
                                {user.facebook_avatar && (
                                    <Button
                                        variant={canUseOAuthAvatar ? "default" : "outline"}
                                        size="sm"
                                        onClick={handleApplyOAuthAvatar}
                                        disabled={isApplyingAvatar}
                                        className="w-fit"
                                    >
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        {isApplyingAvatar 
                                            ? "Applying..." 
                                            : user.avatar 
                                                ? "Replace Current Avatar" 
                                                : "Use as Profile Picture"
                                        }
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {user.facebook_avatar && (user.facebook_id || profileUrl || user.provider_id) && (
                    <Separator />
                )}

                {/* Profile Information Section */}
                {(user.facebook_id || profileUrl || user.provider_id) && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">{getProviderName()} Profile Information</h4>
                        
                        <div className="space-y-3">
                            {user.provider_id && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${getProviderColor()}/20 flex items-center justify-center`}>
                                            <UserIcon className={`w-4 h-4 ${user.provider === 'google' ? 'text-red-600' : 'text-blue-600'}`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{getProviderName()} ID</p>
                                            <p className="text-xs text-muted-foreground">{user.provider_id}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {profileUrl && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full ${getProviderColor()}/20 flex items-center justify-center`}>
                                            <ExternalLinkIcon className={`w-4 h-4 ${user.provider === 'google' ? 'text-red-600' : 'text-blue-600'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Profile Link</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{profileUrl}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a 
                                            href={profileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2"
                                        >
                                            <ExternalLinkIcon className="w-4 h-4" />
                                            Visit Profile
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Provider Information */}
                {user.provider && (
                    <>
                        <Separator />
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Login Provider</h4>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="capitalize">
                                    {getProviderName()}
                                </Badge>
                                {user.provider_id && (
                                    <span className="text-xs text-muted-foreground">
                                        ID: {user.provider_id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
