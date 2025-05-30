import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Activity, Calendar, Clock, Timer, Camera, MoreVertical, ThumbsUp, ThumbsDown, Star, ImageIcon, ExternalLink, AlertTriangle } from 'lucide-react';
import React from 'react';

interface CommunityServiceEntry {
  id: number;
  service_date: string;
  time_in: string;
  time_out?: string;
  hours_completed: number;
  task_description: string;
  lessons_learned?: string;
  photos?: string[];
  status: string;
  admin_notes?: string;
  created_at: string;
}

interface SessionsListProps {
  entries: CommunityServiceEntry[];
  onEntryReview: (entry: CommunityServiceEntry, action: 'approve' | 'reject') => void;
  formatDate: (date: string) => string;
  formatTime: (time: string) => string;
  formatStatus: (status: string) => string;
}

export default function SessionsList({ entries, onEntryReview, formatDate, formatTime, formatStatus }: SessionsListProps) {
  return (
    <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Service Sessions ({entries.length})
            </CardTitle>
            <CardDescription>Review and approve individual community service sessions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <Card key={entry.id} className={`transition-all duration-200 hover:shadow-lg ${
                entry.status === 'approved' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50' :
                entry.status === 'rejected' ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50' :
                'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:from-amber-100 hover:to-orange-100'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-700' :
                        entry.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="font-semibold">{formatDate(entry.service_date)}</span>
                          </div>
                          <Badge variant={entry.status === 'approved' ? 'default' : 
                            entry.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {formatStatus(entry.status)}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(entry.time_in)}</span>
                            {entry.time_out && (
                              <>
                                <span>→</span>
                                <span>{formatTime(entry.time_out)}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-1 font-medium">
                            <Timer className="h-4 w-4" />
                            <span>{entry.hours_completed}h</span>
                          </div>
                          {entry.photos && entry.photos.length > 0 && (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Camera className="h-4 w-4" />
                              <span>{entry.photos.length} photo{entry.photos.length !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {entry.status === 'pending_review' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEntryReview(entry, 'approve')} className="text-green-600">
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEntryReview(entry, 'reject')} className="text-red-600">
                            <ThumbsDown className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <div className="bg-white/80 dark:bg-gray-700/80 rounded-xl p-4 border">
                    <h4 className="font-medium mb-2">Task Description</h4>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      {entry.task_description}
                    </p>
                    {entry.lessons_learned && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Lessons Learned
                        </h4>
                        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                          {entry.lessons_learned}
                        </p>
                      </div>
                    )}
                    {entry.photos && entry.photos.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-blue-500" />
                          Photos ({entry.photos.length})
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {entry.photos.map((photo, photoIndex) => (
                            <div key={photoIndex} className="relative group">
                              <img 
                                src={photo} 
                                alt={`Service photo ${photoIndex + 1}`}
                                className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                                <ExternalLink className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {entry.admin_notes && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <h4 className="font-medium mb-2 text-red-600 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Admin Notes
                        </h4>
                        <p className="text-sm leading-relaxed text-red-700 dark:text-red-300">
                          {entry.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No service sessions found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              This report doesn't contain any individual service sessions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 