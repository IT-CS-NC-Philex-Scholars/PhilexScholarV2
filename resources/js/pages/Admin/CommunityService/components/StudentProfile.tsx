import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, User } from 'lucide-react';
import React from 'react';

interface StudentProfileProps {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export default function StudentProfile({ name, email, phone, address, city, state, zip }: StudentProfileProps) {
  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          Student Profile
        </CardTitle>
        <CardDescription>Personal and contact information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-purple-200/50">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-full">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100">{name}</h3>
                <p className="text-purple-700 dark:text-purple-300">Scholarship Recipient</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/50">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Email</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{email}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/50">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-xl">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">Phone</p>
                  <p className="text-sm text-green-700 dark:text-green-300">{phone}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200/50">
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/50 p-2 rounded-xl">
                <MapPin className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Address</p>
                <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                  {address}<br />
                  {city}, {state} {zip}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 