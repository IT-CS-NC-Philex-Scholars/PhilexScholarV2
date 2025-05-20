import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

interface CompleteProfileModalProps {
  hasProfile: boolean;
}

export function CompleteProfileModal({ hasProfile }: CompleteProfileModalProps) {
  const [open, setOpen] = useState(false);

  // Show modal if profile is not complete
  useEffect(() => {
    if (!hasProfile) {
      setOpen(true);
    }
  }, [hasProfile]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
          <DialogDescription>
            You need to complete your profile before you can apply for scholarships.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Your profile helps us determine which scholarship programs you are eligible for.
            Please provide your educational information and contact details.
          </p>
        </div>
        <DialogFooter>
          <Button asChild className="w-full" id="complete-profile-button">
            <Link href={route('student.profile.edit')}>Complete Profile Now</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}