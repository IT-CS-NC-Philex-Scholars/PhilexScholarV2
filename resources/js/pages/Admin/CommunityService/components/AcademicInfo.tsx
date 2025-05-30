import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GraduationCap, Building, Award } from 'lucide-react';
import React from 'react';

interface AcademicInfoProps {
  schoolName: string;
  schoolLevel: string;
  schoolType: string;
  gpa?: number;
}

export default function AcademicInfo({ schoolName, schoolLevel, schoolType, gpa }: AcademicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Academic Information
        </CardTitle>
        <CardDescription>Educational background and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <div className="bg-purple-100 rounded-full p-2">
              <Building className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium">{schoolName}</p>
              <p className="text-sm text-muted-foreground">School Name</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="font-medium">{schoolLevel}</p>
              <p className="text-sm text-muted-foreground">Level</p>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="font-medium capitalize">{schoolType}</p>
              <p className="text-sm text-muted-foreground">Type</p>
            </div>
          </div>
          {gpa && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-green-600" />
                <span className="font-bold text-green-600">{gpa}%</span>
                <span className="text-sm text-green-700">GPA</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 