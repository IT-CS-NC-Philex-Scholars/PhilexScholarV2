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

interface UserFacebookInfoProps {
    user: User;
    showAvatar?: boolean;
    showBadges?: boolean;
    compact?: boolean;
}

export default function UserFacebookInfo({ 
    user, 
    showAvatar = true, 
    showBadges = true, 
    compact = false 
}: UserFacebookInfoProps) {
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
    const facebookUrl = getFacebookProfileUrl();

    if (!hasFacebookData && !isFacebookUser) {
        return compact ? (
            <span className="text-xs text-muted-foreground">No Facebook data</span>
        ) : (
            <div className="text-sm text-muted-foreground">No Facebook profile connected</div>
        );
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                {showAvatar && user.facebook_avatar && (
                    <Avatar className="w-6 h-6">
                        <AvatarImage src={user.facebook_avatar} alt="Facebook profile" />
                        <AvatarFallback className="text-xs">FB</AvatarFallback>
                    </Avatar>
                )}
                
                <div className="flex items-center gap-2">
                    {showBadges && isFacebookUser && (
                        <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            FB User
                        </Badge>
                    )}
                    
                    {facebookUrl && (
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
                                            href={facebookUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            <ExternalLinkIcon className="w-3 h-3" />
                                        </a>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Open Facebook Profile</p>
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
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="font-medium text-sm">Facebook Profile</p>
                    <p className="text-xs text-muted-foreground">
                        {isFacebookUser ? 'OAuth Login User' : 'Connected Profile'}
                    </p>
                </div>
                {showBadges && (
                    <div className="flex items-center gap-2">
                        {isFacebookUser && (
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
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
                            <AvatarImage src={user.facebook_avatar} alt="Facebook profile picture" />
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

                {user.facebook_id && (
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div>
                            <p className="text-sm font-medium">Facebook ID</p>
                            <p className="text-xs text-muted-foreground font-mono">{user.facebook_id}</p>
                        </div>
                    </div>
                )}

                {facebookUrl && (
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">Profile URL</p>
                            <p className="text-xs text-muted-foreground truncate">{facebookUrl}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="ml-2"
                        >
                            <a 
                                href={facebookUrl} 
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
                                    {user.provider}
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
