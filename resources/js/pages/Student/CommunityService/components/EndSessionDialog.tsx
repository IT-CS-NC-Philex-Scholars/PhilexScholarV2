import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Timer, AlertTriangle } from 'lucide-react';
import React, { useEffect } from 'react';

interface EndSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data?: any;
    setData?: (field: string, value: any) => void;
    onSubmit?: (e: React.FormEvent) => void;
    onConfirm?: () => void;
    errors?: any;
    processing?: boolean;
    activeEntry?: any;
    elapsedTime?: {
        hours: number;
        minutes: number;
        seconds: number;
    };
    isCancel?: boolean;
}

export default function EndSessionDialog({
    open,
    onOpenChange,
    data,
    setData,
    onSubmit,
    onConfirm,
    errors = {},
    processing = false,
    activeEntry,
    elapsedTime,
    isCancel = false
}: EndSessionDialogProps) {
    // Automatically set current time when dialog opens for complete session
    useEffect(() => {
        if (open && !isCancel && !onConfirm && setData) {
            const now = new Date();
            const currentTime = now.toTimeString().slice(0, 5); // Format as HH:MM
            setData('time_out', currentTime);
        }
    }, [open, isCancel, onConfirm, setData]);

    // Calculate elapsed hours for display
    const elapsedHours = elapsedTime ?
        elapsedTime.hours + (elapsedTime.minutes / 60) + (elapsedTime.seconds / 3600) : 0;

    // Cancel session variant
    if (isCancel || onConfirm) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Cancel Session
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this session? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {activeEntry && elapsedTime && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Session Details:</span>
                                    <span className="text-sm text-muted-foreground">{activeEntry.task_description}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Started at:</span>
                                    <span className="text-sm text-muted-foreground">{activeEntry.time_in}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Time that will be lost:</span>
                                    <span className="text-sm font-mono text-red-700 dark:text-red-300">
                                        {String(elapsedTime.hours).padStart(2, '0')}:
                                        {String(elapsedTime.minutes).padStart(2, '0')}:
                                        {String(elapsedTime.seconds).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Keep Session
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={onConfirm}
                            className="flex-1"
                        >
                            Cancel Session
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    // Complete session variant
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        Complete Session
                    </DialogTitle>
                    <DialogDescription>
                        Finish your community service session and log your hours
                    </DialogDescription>
                </DialogHeader>

                {activeEntry && elapsedTime && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Timer className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700 dark:text-green-300">Current Session</span>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                            {activeEntry.task_description}
                        </p>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                            Current session hours: {elapsedHours.toFixed(2)}
                        </p>
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="time_out">End Time (auto-set to current time)</Label>
                            <Input
                                id="time_out"
                                type="time"
                                value={data?.time_out || ''}
                                onChange={e => setData?.('time_out', e.target.value)}
                                className={errors.time_out ? 'border-red-500' : ''}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Automatically set to current time. You can adjust if needed.
                            </p>
                            {errors.time_out && <p className="text-sm text-red-600 mt-1">{errors.time_out}</p>}
                        </div>

                        <div>
                            <Label htmlFor="lessons_learned">What did you learn? (Optional)</Label>
                            <Textarea
                                id="lessons_learned"
                                value={data?.lessons_learned || ''}
                                onChange={e => setData?.('lessons_learned', e.target.value)}
                                placeholder="Reflect on your experience and key takeaways..."
                                rows={3}
                                className={errors.lessons_learned ? 'border-red-500' : ''}
                            />
                            {errors.lessons_learned && <p className="text-sm text-red-600 mt-1">{errors.lessons_learned}</p>}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? 'Completing...' : 'Complete Session'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}