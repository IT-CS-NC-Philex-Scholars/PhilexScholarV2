import * as React from "react"
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
    items,
    ...props
}: {
    items: NavItem[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    const page = usePage();

    return (
        <SidebarGroup {...props}>
            <SidebarGroupLabel className="text-xs text-sidebar-foreground/70">
                Support
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={item.href === page.url}
                                size="sm"
                            >
                                {item.href.startsWith('#') ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Handle help or other actions
                                            if (item.href === '#help') {
                                                // Could open a help modal or redirect to help center
                                                console.log('Help clicked');
                                            }
                                        }}
                                        className="w-full"
                                    >
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </button>
                                ) : (
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon className="h-4 w-4" />}
                                        <span>{item.title}</span>
                                    </Link>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
