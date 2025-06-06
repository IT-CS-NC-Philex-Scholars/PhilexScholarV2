import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Trophy } from 'lucide-react';

interface PopularProgramsProps {
    stats: {
        popularPrograms: Array<{ id: number; name: string; scholarship_applications_count: number }>;
    };
}
export default function PopularPrograms({ stats }: PopularProgramsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Most Popular Programs</CardTitle>
                <CardDescription>Top 3 programs by application count.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {stats.popularPrograms.map((program, index) => (
                        <li key={program.id} className="flex items-center gap-4">
                            <div className="bg-muted p-2 rounded-full">
                                <Trophy
                                    className={`h-6 w-6 ${
                                        index === 0
                                            ? 'text-yellow-500'
                                            : index === 1
                                            ? 'text-gray-400'
                                            : 'text-yellow-700'
                                    }`}
                                />
                            </div>
                            <div className="flex-1">
                                <Link
                                    href={route('admin.scholarships.show', program.id)}
                                    className="font-semibold hover:underline"
                                >
                                    {program.name}
                                </Link>
                            </div>
                            <div className="text-lg font-bold">
                                {program.scholarship_applications_count}
                            </div>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
} 