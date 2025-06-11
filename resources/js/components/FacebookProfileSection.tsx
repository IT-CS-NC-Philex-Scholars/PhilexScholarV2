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

interface FacebookProfileSectionProps {
    user: User;
    onAvatarUpdate?: () => void;
}

export default function FacebookProfileSection({ user, onAvatarUpdate }: FacebookProfileSectionProps) {
    const [isApplyingAvatar, setIsApplyingAvatar] = useState(false);

    const handleApplyFacebookAvatar = async () => {
        if (!user.facebook_avatar) {
            toast.error("No Facebook avatar available");
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
            toast.error("Failed to apply Facebook avatar");
            console.error('Error applying Facebook avatar:', error);
        } finally {
            setIsApplyingAvatar(false);
        }
    };

    const getFacebookProfileUrl = () => {
        if (user.facebook_profile_url) {
            return user.facebook_profile_url;
        }
        if (user.facebook_id) {
            return `https://facebook.com/${user.facebook_id}`;
        }
        return null;
    };

    const isFacebookUser = user.provider === 'facebook';
    const hasFacebookData = user.facebook_id || user.facebook_avatar || user.facebook_profile_url;
    const canUseFacebookAvatar = user.facebook_avatar && !user.avatar;
    const facebookUrl = getFacebookProfileUrl();

    if (!hasFacebookData && !isFacebookUser) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </div>
                        <div>
                            <CardTitle className="text-lg">Facebook Profile</CardTitle>
                            <CardDescription>
                                {isFacebookUser ? 'Connected via Facebook Login' : 'Facebook account information'}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isFacebookUser && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                OAuth Connected
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {/* Facebook Avatar Section */}
                {user.facebook_avatar && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Facebook Profile Picture</h4>
                            {canUseFacebookAvatar && (
                                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900 dark:text-orange-300">
                                    <AlertCircleIcon className="w-3 h-3 mr-1" />
                                    Not Applied
                                </Badge>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <Avatar className="w-16 h-16">
                                <AvatarImage src={user.facebook_avatar} alt="Facebook profile picture" />
                                <AvatarFallback>
                                    <UserIcon className="w-8 h-8" />
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    {user.avatar 
                                        ? "Facebook profile picture is available but not currently used as your avatar."
                                        : "You can use this as your profile picture."
                                    }
                                </p>
                                
                                {user.facebook_avatar && (
                                    <Button
                                        variant={canUseFacebookAvatar ? "default" : "outline"}
                                        size="sm"
                                        onClick={handleApplyFacebookAvatar}
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

                {user.facebook_avatar && (user.facebook_id || facebookUrl) && (
                    <Separator />
                )}

                {/* Facebook Profile Link Section */}
                {(user.facebook_id || facebookUrl) && (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium">Facebook Profile</h4>
                        
                        <div className="space-y-3">
                            {user.facebook_id && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Facebook ID</p>
                                            <p className="text-xs text-muted-foreground">{user.facebook_id}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {facebookUrl && (
                                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <ExternalLinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Profile Link</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{facebookUrl}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                    >
                                        <a 
                                            href={facebookUrl} 
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
                                    {user.provider}
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
