import { CheckCircleIcon } from "lucide-react";

export function EligibilitySection() {
  return (
    <div className="bg-muted/50 py-16 md:py-24" id="eligibility">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Eligibility Requirements</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our scholarships are designed to support students who demonstrate academic excellence and commitment to community service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* College Scholarship Requirements */}
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                <CheckCircleIcon className="h-5 w-5" />
              </span>
              College Scholarship
            </h3>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Minimum GPA of 85% or equivalent</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Enrolled in at least 15 units per semester</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Currently enrolled in an accredited college or university</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Commitment to complete 6 days of community service</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Submission of all required documentation</span>
              </li>
            </ul>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-2">Required Documents:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Proof of Enrollment</li>
                <li>• Grade Transcript</li>
                <li>• Government ID</li>
              </ul>
            </div>
          </div>
          
          {/* High School Scholarship Requirements */}
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <span className="bg-primary/10 text-primary p-2 rounded-full mr-3">
                <CheckCircleIcon className="h-5 w-5" />
              </span>
              High School Scholarship
            </h3>
            
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Minimum GPA of 80% or equivalent</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Currently enrolled in an accredited high school</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Demonstrated leadership potential</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Commitment to complete 4 days of community service</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                <span>Submission of all required documentation</span>
              </li>
            </ul>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-2">Required Documents:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• School ID</li>
                <li>• Report Card</li>
                <li>• Parent/Guardian Authorization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
