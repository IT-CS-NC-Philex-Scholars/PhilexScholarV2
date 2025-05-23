import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications, NotificationProvider } from '@/hooks/use-notifications';
import { useEcho } from '@laravel/echo-react';
import { router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';

function TestNotificationsContent() {
  const { notifications, unreadCount } = useNotifications();
  const [loading, setLoading] = useState(false);
  const echo = useEcho();

  const sendTestNotification = () => {
    setLoading(true);
    router.post('/test-notification', {
      title: '🎉 Frontend Test',
      message: `Test notification sent at ${new Date().toLocaleTimeString()}`,
      type: 'success'
    }, {
      onFinish: () => setLoading(false),
      onError: (error) => console.error('Failed to send test notification:', error)
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Notification System Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={sendTestNotification} 
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Test Notification'}
              </Button>
              <Badge variant="secondary">
                Unread: {unreadCount}
              </Badge>
            </div>
            
            <div className="grid gap-2">
              <h3 className="font-medium">Echo Status:</h3>
              <p className="text-sm text-muted-foreground">
                Echo instance: {echo ? '✅ Connected' : '❌ Not connected'}
              </p>
              <p className="text-sm text-muted-foreground">
                Echo connector: {echo?.connector?.name || 'Unknown'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications ({notifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-muted-foreground">No notifications yet</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notification) => (
                  <div 
                    key={notification.id} 
                    className="border rounded p-3 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.read_at && (
                        <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Test Commands</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              php artisan notification:test --title="Test" --message="Hello World"
            </div>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              php artisan broadcast:test --message="Direct broadcast test"
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestNotifications() {
  return (
    <NotificationProvider>
      <TestNotificationsContent />
      <Toaster position="top-right" richColors closeButton />
    </NotificationProvider>
  );
}