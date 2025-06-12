import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExternalLinkIcon, UserIcon, CheckCircleIcon, AlertTriangleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface UserOAuthInfoProps {
    user: User;
    showAvatar?: boolean;
    showBadges?: boolean;
    compact?: boolean;
}

export default function UserOAuthInfo({ 
    user, 
    showAvatar = true, 
    showBadges = true, 
    compact = false 
}: UserOAuthInfoProps) {
    const getOAuthProfileUrl = () => {
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

    const getProviderName = () => {
        if (user.provider === 'google') return 'Google';
        if (user.provider === 'facebook') return 'Facebook';
        return user.provider ? user.provider.charAt(0).toUpperCase() + user.provider.slice(1) : 'OAuth';
    };

    const getProviderIcon = () => {
        if (user.provider === 'google') {
            return (
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            );
        } else {
            return (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            );
        }
    };

    const getProviderColor = () => {
        if (user.provider === 'google') return 'bg-red-600';
        if (user.provider === 'facebook') return 'bg-blue-600';
        return 'bg-gray-600';
    };

    const isOAuthUser = !!user.provider;
    const hasOAuthData = user.facebook_id || user.facebook_avatar || user.facebook_profile_url || user.provider;
    const oauthUrl = getOAuthProfileUrl();

    if (!hasOAuthData && !isOAuthUser) {
        return compact ? (
            <span className="text-xs text-muted-foreground">No OAuth data</span>
        ) : (
            <div className="text-sm text-muted-foreground">No OAuth profile connected</div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {showAvatar && user.facebook_avatar && (
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={user.facebook_avatar} alt={`${getProviderName()} profile`} />
                        <AvatarFallback className="text-xs">{getProviderName().substring(0, 2)}</AvatarFallback>
                    </Avatar>
                )}
                
                <div className="flex items-center gap-2">
                    {showBadges && isOAuthUser && (
                        <Badge variant="secondary" className={`text-xs ${user.provider === 'google' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}`}>
                            {getProviderName()}
                        </Badge>
                    )}
                    
                    {oauthUrl && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        asChild
                                    >
                                        <a 
                                            href={oauthUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLinkIcon className="w-3 h-3" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Open {getProviderName()} Profile</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${getProviderColor()} flex items-center justify-center`}>
                    {getProviderIcon()}
                </div>
                <div className="flex-1">
                    <p className="font-medium text-sm">{getProviderName()} Profile</p>
                    <p className="text-xs text-muted-foreground">
                        {isOAuthUser ? 'OAuth Login User' : 'Connected Profile'}
                    </p>
                </div>
                {showBadges && (
                    <div className="flex items-center gap-2">
                        {isOAuthUser && (
                            <Badge variant="secondary" className={user.provider === 'google' ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'}>
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                OAuth
                            </Badge>
                        )}
                        {user.facebook_avatar && !user.avatar && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                                <AlertTriangleIcon className="w-3 h-3 mr-1" />
                                Unused Avatar
                            </Badge>
                        )}
                    </div>
                )}
            </div>

            <div className="grid gap-3">
                {showAvatar && user.facebook_avatar && (
                    <div className="flex items-center gap-3 p-2 rounded bg-muted/50">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src={user.facebook_avatar} alt={`${getProviderName()} profile picture`} />
                            <AvatarFallback>
                                <UserIcon className="w-5 h-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="text-sm font-medium">Profile Picture</p>
                            <p className="text-xs text-muted-foreground">
                                {user.avatar ? "Available but not used" : "Could be used as avatar"}
                            </p>
                        </div>
                    </div>
                )}

                {(user.facebook_id || user.provider_id) && (
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div>
                            <p className="text-sm font-medium">{getProviderName()} ID</p>
                            <p className="text-xs text-muted-foreground font-mono">
                                {user.provider === 'facebook' ? user.facebook_id : user.provider_id}
                            </p>
                        </div>
                    </div>
                )}

                {oauthUrl && (
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Profile URL</p>
                            <p className="text-xs text-muted-foreground truncate">{oauthUrl}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="ml-2"
                        >
                            <a 
                                href={oauthUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                <ExternalLinkIcon className="w-4 h-4" />
                                Visit
                            </a>
                        </Button>
                    </div>
                )}

                {user.provider && (
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div>
                            <p className="text-sm font-medium">Login Provider</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="capitalize text-xs">
                                    {getProviderName()}
                                </Badge>
                                {user.provider_id && (
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {user.provider_id}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
