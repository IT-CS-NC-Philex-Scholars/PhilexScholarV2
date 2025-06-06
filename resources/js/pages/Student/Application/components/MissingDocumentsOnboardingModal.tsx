import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, UploadCloud, ArrowRight, ClipboardCheck, Info } from 'lucide-react';
import { DocumentRequirement, DocumentUpload } from '@/types';

interface DocumentUploadItem {
  requirement: DocumentRequirement;
  upload: DocumentUpload | null;
}

interface MissingDocumentsOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentUploadItem[];
  onGoToDocuments: () => void; // Callback to navigate to the documents tab/section
  applicationStatus: string;
}

const MissingDocumentsOnboardingModal: React.FC<MissingDocumentsOnboardingModalProps> = ({
  isOpen,
  onClose,
  documents,
  onGoToDocuments,
  applicationStatus
}) => {
  const missingOrRejectedDocuments = documents.filter(
    item => !item.upload || item.upload.status === 'rejected' || item.upload.status === 'missing'
  );

  if (!isOpen || missingOrRejectedDocuments.length === 0) {
    return null;
  }

  const isDraft = applicationStatus === 'draft';
  const hasRejections = missingOrRejectedDocuments.some(doc => doc.upload?.status === 'rejected');

  let title = "Your Scholarship Checklist Awaits!";
  let description = "You're just a few steps away! Uploading these documents is key to moving your scholarship application forward. Let's get them in!";
  let icon = ClipboardCheck;
  let iconColor = "text-primary"; // Assuming primary is a friendly color like blue or purple
  let iconBg = "bg-primary/10";

  if (hasRejections && !isDraft) {
    title = "Let's Polish Your Application!";
    description = "A few of your documents need a quick update. Reviewing and re-uploading them will make sure your application shines!";
    icon = AlertTriangle;
    iconColor = "text-amber-600";
    iconBg = "bg-amber-100";
  } else if (!isDraft && missingOrRejectedDocuments.length > 0) {
    title = "A Few More Details Needed";
    description = "Please provide the following additional documents to keep your application moving smoothly.";
    icon = Info;
    iconColor = "text-blue-600";
    iconBg = "bg-blue-100";
  } else if (isDraft && hasRejections) {
    // Specific case for draft status with rejections
    title = "Time for a Quick Document Review!";
    description = "Looks like some documents need another look. Let's update them to complete your submission.";
    icon = ClipboardCheck; // Or AlertTriangle if we want to emphasize rejection more
    iconColor = "text-amber-600";
    iconBg = "bg-amber-100";
  }


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${iconBg}`}>
            {React.createElement(icon, { className: `h-7 w-7 ${iconColor}` })}
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-base text-muted-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="my-6 space-y-3">
          <h4 className="text-base font-semibold text-foreground pt-2">Here's what we need:</h4>
          <ul className="space-y-3 max-h-60 overflow-y-auto rounded-lg border bg-muted/30 p-4">
            {missingOrRejectedDocuments.map(({ requirement, upload }) => (
              <li key={requirement.id} className={`flex items-center justify-between p-3 rounded-lg ${upload?.status === 'rejected' ? 'bg-destructive/10 border border-destructive/20' : 'bg-background hover:bg-muted/50'}`}>
                <div className="flex items-center gap-2">
                  {upload?.status === 'rejected' ? 
                    <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mr-1" /> : 
                    <FileText className="h-6 w-6 text-muted-foreground flex-shrink-0 mr-1" />
                  }
                  <span className="text-sm font-medium text-foreground flex-grow">{requirement.name}</span>
                </div>
                {upload?.status === 'rejected' && (
                  <Badge variant="destructive" className="text-xs">Needs Update</Badge>
                )}
                {!upload && (
                  <Badge variant="outline" className="text-xs border-amber-500 text-amber-600">Missing</Badge>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto text-muted-foreground hover:text-foreground">
            I'll Do It Later
          </Button>
          <Button onClick={() => { onGoToDocuments(); onClose(); }} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3 px-6 font-semibold">
            Let's Go! <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MissingDocumentsOnboardingModal;
