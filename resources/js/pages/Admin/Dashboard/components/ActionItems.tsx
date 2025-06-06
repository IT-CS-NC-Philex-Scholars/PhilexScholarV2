import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { LucideIcon, FileCheck2, UsersRound, CalendarClock, DollarSign } from 'lucide-react';

interface ActionItem {
    title: string;
    value: string | number;
    description: string;
    href: string;
    icon: LucideIcon;
    color: string;
}

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
};

interface ActionItemsProps {
    stats: {
        pendingApplications: number;
        pendingCommunityServiceReports: number;
        scholarshipsNearingDeadline: number;
        totalPendingDisbursementAmount: number;
    };
}

export default function ActionItems({ stats }: ActionItemsProps) {
    const items: ActionItem[] = [
        {
            title: 'Pending Applications',
            value: stats.pendingApplications,
            description: 'Ready for review',
            href: route('admin.applications.index', { status: 'pending' }),
            icon: FileCheck2,
            color: 'text-blue-600',
        },
        {
            title: 'Pending Service Reports',
            value: stats.pendingCommunityServiceReports,
            description: 'Awaiting approval',
            href: '#', // TODO: Add correct route when available
            icon: UsersRound,
            color: 'text-green-600',
        },
        {
            title: 'Scholarships Nearing Deadline',
            value: stats.scholarshipsNearingDeadline,
            description: 'Closing in the next 7 days',
            href: route('admin.scholarships.index'), // This could be filtered
            icon: CalendarClock,
            color: 'text-yellow-600',
        },
        {
            title: 'Pending Disbursements',
            value: formatCurrency(stats.totalPendingDisbursementAmount),
            description: 'Awaiting payment processing',
            href: '#', // TODO: Add correct route when available
            icon: DollarSign,
            color: 'text-purple-600',
        },
    ];
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
                <Link key={item.title} href={item.href}>
                    <Card className="hover:bg-muted/50 transition-colors h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
} 