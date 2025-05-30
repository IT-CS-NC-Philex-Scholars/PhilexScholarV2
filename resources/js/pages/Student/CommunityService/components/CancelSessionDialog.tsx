import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Timer } from 'lucide-react';
import React from 'react';

interface CancelSessionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    activeEntry?: any;
    elapsedTime?: {
        hours: number;
        minutes: number;
        seconds: number;
    };
}

export default function CancelSessionDialog({
    open,
    onOpenChange,
    onConfirm,
    activeEntry,
    elapsedTime
}: CancelSessionDialogProps) {
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