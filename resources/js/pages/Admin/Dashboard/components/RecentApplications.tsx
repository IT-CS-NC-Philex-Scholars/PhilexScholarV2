import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ScholarshipApplication } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import relativeTime from 'dayjs/plugin/relativeTime';
import dayjs from 'dayjs';

dayjs.extend(relativeTime);

const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

interface RecentApplicationsProps {
    recentApplications: ScholarshipApplication[];
}

export default function RecentApplications({ recentApplications }: RecentApplicationsProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center">
                <div className="grid gap-2">
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>A list of the most recent applications.</CardDescription>
                </div>
                <Button asChild size="sm" className="ml-auto gap-1">
                    <Link href={route('admin.applications.index')}>
                        View All
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Scholarship</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>
                                <span className="sr-only">Date</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentApplications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell>
                                    <div className="font-medium">
                                        {application.student_profile.user.name}
                                    </div>
                                    <div className="hidden text-sm text-muted-foreground md:inline">
                                        {application.student_profile.user.email}
                                    </div>
                                </TableCell>
                                <TableCell>{application.scholarship_program.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {formatStatus(application.status)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                    {dayjs(application.created_at).fromNow()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 