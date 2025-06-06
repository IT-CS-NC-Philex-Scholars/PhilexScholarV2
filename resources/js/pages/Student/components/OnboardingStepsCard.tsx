import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import {
  UserCircle2, // For Profile
  MailCheck,   // For Email Verification
  FileUp,      // For Document Upload
  Send as SendIcon, // For Submit Application (renamed to avoid conflict if Send is used elsewhere)
  CheckCircle2, // Completed
  ArrowRight,   // CTA
  ListChecks,   // Card Title Icon
  ThumbsUp      // All completed icon
} from 'lucide-react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  isCompleted: boolean;
  ctaLink?: string;
  ctaText?: string;
  action?: () => void; // For actions that don't navigate
}

interface OnboardingStepsCardProps {
  steps: OnboardingStep[];
  isLoaded: boolean;
}

const OnboardingStepsCard: React.FC<OnboardingStepsCardProps> = ({ steps, isLoaded }) => {
  const completedSteps = steps.filter(step => step.isCompleted).length;
  const totalSteps = steps.length;
  const onboardingProgress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <Card className={cn("transition-all duration-500 ease-out w-full", isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          Your Onboarding Checklist
        </CardTitle>
        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{completedSteps}/{totalSteps} Steps Completed</span>
          </div>
          <Progress value={onboardingProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {steps.map((step, index) => (
            <li
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg border transition-all duration-300",
                step.isCompleted ? "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700" : "bg-accent/50 dark:bg-accent/20",
                isLoaded ? `opacity-100 translate-x-0 transition-delay-${index * 100}` : "opacity-0 -translate-x-4"
              )}
            >
              <div className={cn("flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center", step.isCompleted ? "bg-green-500 text-white" : "bg-primary text-primary-foreground")}>
                {step.isCompleted ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-md">{step.title}</h4>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {!step.isCompleted && step.ctaLink && (
                <Button asChild variant="ghost" size="sm" className="ml-auto self-center text-primary hover:bg-primary/10">
                  <Link href={step.ctaLink}>
                    {step.ctaText || 'Proceed'} <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              )}
              {!step.isCompleted && !step.ctaLink && step.action && (
                 <Button variant="ghost" size="sm" onClick={step.action} className="ml-auto self-center text-primary hover:bg-primary/10">
                    {step.ctaText || 'Proceed'} <ArrowRight className="h-4 w-4 ml-1" />
                 </Button>
              )}
              {step.isCompleted && (
                <CheckCircle2 size={20} className="ml-auto self-center text-green-500 flex-shrink-0" />
              )}
            </li>
          ))}
        </ul>
        {completedSteps === totalSteps && (
          <div className="mt-6 text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
            <ThumbsUp className="h-10 w-10 text-green-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">All Set!</h3>
            <p className="text-sm text-muted-foreground">You've completed all onboarding steps. You're ready to make the most of your scholarship journey!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingStepsCard;
