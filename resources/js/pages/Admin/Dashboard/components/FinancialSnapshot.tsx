import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-PH', { style: 'currency', currency: 'PHP' });
};

interface FinancialSnapshotProps {
    stats: {
        totalBudget: number;
        totalDisbursedAmount: number;
        totalPendingDisbursementAmount: number;
    };
}

export default function FinancialSnapshot({ stats }: FinancialSnapshotProps) {
    const remainingBudget = stats.totalBudget - stats.totalDisbursedAmount;
    const utilizationRate = stats.totalBudget > 0 ? (stats.totalDisbursedAmount / stats.totalBudget) * 100 : 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Financial Snapshot</CardTitle>
                <CardDescription>Budget allocation and disbursement status.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between">
                        <span>Total Budget</span>
                        <span className="font-medium">{formatCurrency(stats.totalBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Disbursed</span>
                        <span className="font-medium text-green-600">
                            {formatCurrency(stats.totalDisbursedAmount)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="font-medium text-yellow-600">
                            {formatCurrency(stats.totalPendingDisbursementAmount)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Remaining</span>
                        <span className="font-medium">{formatCurrency(remainingBudget)}</span>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Utilization</span>
                            <span>{utilizationRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${utilizationRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 